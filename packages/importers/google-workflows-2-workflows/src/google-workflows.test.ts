import { createPinnedResolver, ingestSourceFiles } from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { googleWorkflowsImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

const FIXTURE = `
main:
  params: [args]
  steps:
    - fetchOrder:
        call: http.get
        args:
          url: https://api.example.com/orders/\${args.orderId}
        result: order
    - checkStatus:
        switch:
          - condition: \${order.status == "ready"}
            next: shipOrder
        next: waitABit
    - waitABit:
        call: sys.sleep
        args:
          seconds: 10
        next: recordNote
    - recordNote:
        assign:
          - note: pending
        next: finish
    - shipOrder:
        call: http.post
        args:
          url: https://api.example.com/ship
          body:
            id: \${order.body.id}
        next: finish
    - finish:
        return: \${order}
helper:
  steps:
    - noop:
        return: 1
`;

const BLOCKING_FIXTURE = `
main:
  steps:
    - stamp:
        call: sys.now
        result: now
    - finish:
        return: \${now}
`;

function artifactOf(text: string, path = "workflow.yaml") {
  return ingestSourceFiles([{ path, text }], { entrypoint: path });
}

describe("google-workflows-2-workflows", () => {
  it("level 0: detects main.steps documents and rejects garbage", async () => {
    const detection = await googleWorkflowsImporter.detect(artifactOf(FIXTURE));
    expect(detection.detected).toBe(true);
    expect(detection.confidence).toBe("exact");

    expect((await googleWorkflowsImporter.detect(artifactOf("just: text"))).detected).toBe(false);
    expect((await googleWorkflowsImporter.detect(artifactOf("main: 42"))).detected).toBe(false);
  });

  it("level 1: parses and validates next routing", async () => {
    const parsed = await googleWorkflowsImporter.parse(artifactOf(FIXTURE), { resolver });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const report = await googleWorkflowsImporter.validate(parsed.model, { resolver });
    expect(report.valid).toBe(true);

    const broken = FIXTURE.replace("next: waitABit", "next: nowhere");
    const brokenParsed = await googleWorkflowsImporter.parse(artifactOf(broken), { resolver });
    expect(brokenParsed.ok).toBe(true);
    if (!brokenParsed.ok) return;
    const brokenReport = await googleWorkflowsImporter.validate(brokenParsed.model, { resolver });
    expect(brokenReport.valid).toBe(false);
    expect(brokenReport.diagnostics.map((diagnostic) => diagnostic.code)).toContain("unknown-next-target");
  });

  it("level 2: compiles call/switch/sleep/assign/return into a valid plan", async () => {
    const artifact = artifactOf(FIXTURE);
    const parsed = await googleWorkflowsImporter.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await googleWorkflowsImporter.compile(parsed.model, {
      planId: "order-shipper",
      planName: "Order shipper",
      artifactDigest: artifact.digest,
      resolver,
    });

    expect(result.plan).toBeDefined();
    const plan = result.plan;
    if (!plan) return;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("fetchOrder");

    const fetch = plan.nodes.fetchOrder;
    expect(fetch?.kind).toBe("invoke");
    if (fetch?.kind === "invoke") {
      expect(fetch.effect).toBe("read");
      expect(fetch.idempotency).toBeUndefined();
      expect(fetch.next).toBe("checkStatus");
      expect(fetch.input).toEqual({
        kind: "object",
        entries: {
          path: {
            kind: "interpolate",
            parts: [
              { kind: "literal", value: "/orders/" },
              { kind: "input", path: ["orderId"] },
              { kind: "literal", value: "" },
            ],
          },
        },
      });
    }

    const check = plan.nodes.checkStatus;
    expect(check?.kind).toBe("choice");
    if (check?.kind === "choice") {
      expect(check.choices[0]?.when).toEqual({
        kind: "compare",
        operator: "eq",
        left: { kind: "nodeOutput", nodeId: "fetchOrder", path: ["status"] },
        right: { kind: "literal", value: "ready" },
      });
      expect(check.choices[0]?.then).toBe("shipOrder");
      expect(check.otherwise).toBe("waitABit");
    }

    const wait = plan.nodes.waitABit;
    expect(wait?.kind).toBe("wait");
    if (wait?.kind === "wait") {
      expect(wait.seconds).toBe(10);
      expect(wait.next).toBe("recordNote");
    }
    expect(plan.nodes.recordNote?.kind).toBe("wait");

    const ship = plan.nodes.shipOrder;
    expect(ship?.kind).toBe("invoke");
    if (ship?.kind === "invoke") {
      expect(ship.effect).toBe("mutation");
      expect(ship.idempotency).toEqual({
        kind: "deduplication-record",
        namespace: "order-shipper:shipOrder",
      });
      expect(ship.next).toBe("finish");
      expect(ship.input).toMatchObject({
        entries: {
          body: {
            kind: "object",
            entries: { id: { kind: "nodeOutput", nodeId: "fetchOrder", path: ["id"] } },
          },
        },
      });
    }

    const finish = plan.nodes.finish;
    expect(finish?.kind).toBe("succeed");
    if (finish?.kind === "succeed") {
      expect(finish.output).toEqual({ kind: "nodeOutput", nodeId: "fetchOrder", path: [] });
    }

    expect(result.requirements.map((requirement) => requirement.id).sort()).toEqual([
      "fetchOrder",
      "shipOrder",
    ]);
    const fetchRequirement = result.requirements.find((requirement) => requirement.id === "fetchOrder");
    expect(fetchRequirement?.effect).toBe("read");
    expect(fetchRequirement?.provider).toBe("api.example.com");
    expect(fetchRequirement?.operation).toBe("GET /orders/${args.orderId}");
    expect(plan.effects.outboundHosts).toEqual(["api.example.com"]);

    expect(result.fidelity.findings.some((finding) => finding.status === "blocked")).toBe(false);
    expect(result.fidelity.findings.some((finding) => finding.status === "unsupported")).toBe(false);
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "subworkflow" && finding.status === "approximated",
      ),
    ).toBe(true);
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "assign" && finding.status === "approximated",
      ),
    ).toBe(true);
  });

  it("level 2: a sys.now call blocks compilation with fidelity-blocking", async () => {
    const parsed = await googleWorkflowsImporter.parse(artifactOf(BLOCKING_FIXTURE), { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await googleWorkflowsImporter.compile(parsed.model, {
      planId: "stamper",
      planName: "Stamper",
      resolver,
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.code).toBe("fidelity-blocking");
    expect(result.diagnostics[0]?.severity).toBe("error");
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "call" && finding.status === "unsupported",
      ),
    ).toBe(true);
  });
});
