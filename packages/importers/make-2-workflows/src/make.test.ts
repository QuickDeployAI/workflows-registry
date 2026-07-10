import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { makeImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "scenario.json", text: JSON.stringify(value) }], {
    entrypoint: "scenario.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await makeImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return makeImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "scenario.json",
    resolver,
  });
}

const HAPPY_FIXTURE = {
  name: "Order notifier",
  flow: [
    {
      id: 1,
      module: "http:ActionSendData",
      mapper: { url: "https://api.example.com/orders/latest", method: "get" },
      parameters: { __IMTCONN__: 998877 },
    },
    {
      id: 2,
      module: "slack:CreateMessage",
      mapper: { channel: "C123", text: "Order {{1.orderId}} is ready" },
      parameters: { __IMTCONN__: 445566 },
    },
  ],
};

describe("make-2-workflows", () => {
  it("detects Make scenario blueprints and rejects other formats", async () => {
    expect((await makeImporter.detect(artifactOf(HAPPY_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({
      name: "x",
      nodes: [{ name: "a", type: "n8n-nodes-base.set" }],
      connections: {},
    });
    expect((await makeImporter.detect(other)).detected).toBe(false);
  });

  it("compiles a sequential flow with lowered mapper tokens", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("m1");
    expect(plan.nodes.m1?.kind).toBe("invoke");
    expect(plan.nodes.m2?.kind).toBe("invoke");
    expect(plan.nodes.__succeed?.kind).toBe("succeed");

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("m1")?.effect).toBe("read");
    expect(byId.get("m1")?.operation).toBe("GET /orders/latest");
    expect(byId.get("m2")?.operation).toBe("POST /chat.postMessage");
    expect(byId.get("m2")?.effect).toBe("send");
    expect(plan.effects.outboundHosts).toContain("api.example.com");

    const notify = plan.nodes.m2;
    if (notify?.kind === "invoke") {
      expect(notify.next).toBe("__succeed");
      expect(notify.idempotency).toEqual({
        kind: "deduplication-record",
        namespace: "plan-1:m2",
      });
      const input = notify.input;
      if (input.kind === "object" && input.entries.body?.kind === "object") {
        expect(input.entries.body.entries.text).toEqual({
          kind: "interpolate",
          parts: [
            { kind: "literal", value: "Order " },
            { kind: "nodeOutput", nodeId: "m1", path: ["orderId"] },
            { kind: "literal", value: " is ready" },
          ],
        });
      } else {
        throw new Error("expected object input with body");
      }
    }
    expect(result.fidelity.findings.some((f) => f.status === "blocked")).toBe(false);
  });

  it("blocks compilation on unmapped modules", async () => {
    const result = await compileFixture({
      name: "unmapped",
      flow: [{ id: 1, module: "salesforce:UnknownThing", mapper: {} }],
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking" && d.severity === "error")).toBe(true);
    expect(
      result.fidelity.findings.some(
        (f) => f.feature === "unmapped-connector" && f.status === "blocked",
      ),
    ).toBe(true);
  });

  it("blocks multi-route routers and flattens single-route routers", async () => {
    const multi = await compileFixture({
      name: "router",
      flow: [
        {
          id: 1,
          module: "builtin:BasicRouter",
          routes: [
            { flow: [{ id: 2, module: "slack:CreateMessage", mapper: { text: "a" } }] },
            { flow: [{ id: 3, module: "slack:CreateMessage", mapper: { text: "b" } }] },
          ],
        },
      ],
    });
    expect(multi.plan).toBeUndefined();
    expect(multi.fidelity.findings.some((f) => f.feature === "router" && f.status === "blocked")).toBe(true);

    const single = await compileFixture({
      name: "router",
      flow: [
        {
          id: 1,
          module: "builtin:BasicRouter",
          routes: [{ flow: [{ id: 2, module: "slack:CreateMessage", mapper: { text: "a" } }] }],
        },
      ],
    });
    expect(single.plan).toBeDefined();
    expect(single.plan!.entryNodeId).toBe("m2");
    expect(
      single.fidelity.findings.some((f) => f.feature === "router" && f.status === "approximated"),
    ).toBe(true);
  });

  it("never leaks connection ids into the compile result", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("998877");
    expect(text).not.toContain("445566");
    expect(text).not.toContain("__IMTCONN__");
  });
});
