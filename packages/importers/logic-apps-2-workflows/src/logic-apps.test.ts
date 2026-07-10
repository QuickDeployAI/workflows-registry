import { createPinnedResolver, ingestSourceFiles } from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { logicAppsImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

const FIXTURE = JSON.stringify({
  definition: {
    $schema:
      "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    contentVersion: "1.0.0.0",
    triggers: {
      manual: { type: "Request", kind: "Http" },
    },
    actions: {
      Fetch_Order: {
        type: "Http",
        runAfter: {},
        inputs: {
          method: "GET",
          uri: "https://api.example.com/orders/@{triggerBody()?['orderId']}",
        },
      },
      Check_Priority: {
        type: "If",
        runAfter: { Fetch_Order: ["Succeeded"] },
        expression: "@equals(triggerBody()?['priority'], 'high')",
        actions: {
          Notify_Ops: {
            type: "Http",
            runAfter: {},
            inputs: {
              method: "POST",
              uri: "https://hooks.example.com/notify",
              body: { order: "@{body('Fetch_Order')?['id']}" },
            },
          },
        },
        else: { actions: {} },
      },
      Cool_Down: {
        type: "Wait",
        runAfter: { Check_Priority: ["Succeeded"] },
        inputs: { interval: { count: 2, unit: "Minute" } },
      },
      Finish: {
        type: "Terminate",
        runAfter: { Cool_Down: ["Succeeded"] },
        inputs: { runStatus: "Succeeded" },
      },
    },
  },
});

const BLOCKING_FIXTURE = JSON.stringify({
  definition: {
    $schema:
      "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    actions: {
      Send_Email: {
        type: "ApiConnection",
        runAfter: {},
        inputs: { host: { connection: { name: "office365" } }, method: "post" },
      },
    },
  },
});

function artifactOf(text: string, path = "workflow.logicapp.json") {
  return ingestSourceFiles([{ path, text }], { entrypoint: path });
}

describe("logic-apps-2-workflows", () => {
  it("level 0: detects workflowdefinition documents (wrapped or bare) and rejects garbage", async () => {
    const detection = await logicAppsImporter.detect(artifactOf(FIXTURE));
    expect(detection.detected).toBe(true);
    expect(detection.confidence).toBe("exact");

    const bare = JSON.stringify({
      actions: { Ping: { type: "Http", runAfter: {}, inputs: { method: "GET", uri: "https://a.example/z" } } },
    });
    expect((await logicAppsImporter.detect(artifactOf(bare))).detected).toBe(true);

    expect((await logicAppsImporter.detect(artifactOf('{"StartAt": "x", "States": {}}'))).detected).toBe(false);
    expect((await logicAppsImporter.detect(artifactOf("garbage"))).detected).toBe(false);
  });

  it("level 1: parses and validates runAfter references", async () => {
    const parsed = await logicAppsImporter.parse(artifactOf(FIXTURE), { resolver });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const report = await logicAppsImporter.validate(parsed.model, { resolver });
    expect(report.valid).toBe(true);

    const broken = JSON.parse(FIXTURE) as {
      definition: { actions: Record<string, { runAfter?: Record<string, string[]> }> };
    };
    (broken.definition.actions.Cool_Down as { runAfter?: Record<string, string[]> }).runAfter = {
      Missing_Action: ["Succeeded"],
    };
    const brokenParsed = await logicAppsImporter.parse(
      artifactOf(JSON.stringify(broken)),
      { resolver },
    );
    expect(brokenParsed.ok).toBe(true);
    if (!brokenParsed.ok) return;
    const brokenReport = await logicAppsImporter.validate(brokenParsed.model, { resolver });
    expect(brokenReport.valid).toBe(false);
    expect(brokenReport.diagnostics.map((diagnostic) => diagnostic.code)).toContain("unknown-run-after");
  });

  it("level 2: compiles Http/If/Wait/Terminate with runAfter ordering into a valid plan", async () => {
    const artifact = artifactOf(FIXTURE);
    const parsed = await logicAppsImporter.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await logicAppsImporter.compile(parsed.model, {
      planId: "order-notify",
      planName: "Order notify",
      artifactDigest: artifact.digest,
      resolver,
    });

    expect(result.plan).toBeDefined();
    const plan = result.plan;
    if (!plan) return;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("Fetch_Order");

    const fetch = plan.nodes.Fetch_Order;
    expect(fetch?.kind).toBe("invoke");
    if (fetch?.kind === "invoke") {
      expect(fetch.effect).toBe("read");
      expect(fetch.idempotency).toBeUndefined();
      expect(fetch.next).toBe("Check_Priority");
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

    const check = plan.nodes.Check_Priority;
    expect(check?.kind).toBe("choice");
    if (check?.kind === "choice") {
      expect(check.choices[0]?.when).toEqual({
        kind: "compare",
        operator: "eq",
        left: { kind: "input", path: ["priority"] },
        right: { kind: "literal", value: "high" },
      });
      expect(check.choices[0]?.then).toBe("Check_Priority.Notify_Ops");
      expect(check.otherwise).toBe("Cool_Down");
    }

    const notify = plan.nodes["Check_Priority.Notify_Ops"];
    expect(notify?.kind).toBe("invoke");
    if (notify?.kind === "invoke") {
      expect(notify.effect).toBe("mutation");
      expect(notify.idempotency).toEqual({
        kind: "deduplication-record",
        namespace: "order-notify:Check_Priority.Notify_Ops",
      });
      expect(notify.next).toBe("Cool_Down");
      expect(notify.input).toMatchObject({
        entries: {
          body: {
            kind: "object",
            entries: { order: { kind: "nodeOutput", nodeId: "Fetch_Order", path: ["id"] } },
          },
        },
      });
    }

    const cool = plan.nodes.Cool_Down;
    expect(cool?.kind).toBe("wait");
    if (cool?.kind === "wait") {
      expect(cool.seconds).toBe(120);
      expect(cool.next).toBe("Finish");
    }
    expect(plan.nodes.Finish?.kind).toBe("succeed");

    expect(result.requirements.map((requirement) => requirement.id).sort()).toEqual([
      "Check_Priority.Notify_Ops",
      "Fetch_Order",
    ]);
    const fetchRequirement = result.requirements.find((requirement) => requirement.id === "Fetch_Order");
    expect(fetchRequirement?.effect).toBe("read");
    expect(fetchRequirement?.provider).toBe("api.example.com");
    expect(plan.effects.outboundHosts).toEqual(["api.example.com", "hooks.example.com"]);

    expect(result.fidelity.findings.some((finding) => finding.status === "blocked")).toBe(false);
    expect(result.fidelity.findings.some((finding) => finding.status === "unsupported")).toBe(false);
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "triggers" && finding.status === "approximated",
      ),
    ).toBe(true);
  });

  it("level 2: a connector action blocks compilation with fidelity-blocking", async () => {
    const parsed = await logicAppsImporter.parse(artifactOf(BLOCKING_FIXTURE), { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await logicAppsImporter.compile(parsed.model, {
      planId: "mailer",
      planName: "Mailer",
      resolver,
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.code).toBe("fidelity-blocking");
    expect(result.diagnostics[0]?.severity).toBe("error");
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "connector-action" && finding.status === "blocked",
      ),
    ).toBe(true);
  });
});
