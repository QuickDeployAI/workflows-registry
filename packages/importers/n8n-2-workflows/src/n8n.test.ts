import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { n8nImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "workflow.json", text: JSON.stringify(value) }], {
    entrypoint: "workflow.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await n8nImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return n8nImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "workflow.json",
    resolver,
  });
}

const LINEAR_FIXTURE = {
  name: "Lead intake",
  nodes: [
    { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", parameters: {} },
    {
      name: "Create Contact",
      type: "n8n-nodes-base.hubspot",
      parameters: { resource: "contact", operation: "create", email: "={{ $json.email }}" },
      credentials: { hubspotApi: { id: "cred-hubspot-42", name: "HubSpot prod key" } },
    },
    {
      name: "Notify",
      type: "n8n-nodes-base.slack",
      parameters: {
        resource: "message",
        operation: "post",
        channel: "#leads",
        text: "=New lead {{ $json.email }} arrived",
      },
      credentials: { slackApi: { id: "cred-slack-77" } },
    },
    { name: "Docs", type: "n8n-nodes-base.stickyNote", parameters: { content: "how it works" } },
  ],
  connections: {
    "Manual Trigger": { main: [[{ node: "Create Contact", type: "main", index: 0 }]] },
    "Create Contact": { main: [[{ node: "Notify", type: "main", index: 0 }]] },
  },
};

const IF_FIXTURE = {
  name: "Branching",
  nodes: [
    { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", parameters: {} },
    {
      name: "Check Tier",
      type: "n8n-nodes-base.if",
      parameters: {
        conditions: {
          string: [{ value1: "={{ $json.tier }}", operation: "equals", value2: "gold" }],
        },
      },
    },
    {
      name: "Fast Path",
      type: "n8n-nodes-base.httpRequest",
      parameters: { url: "https://api.example.com/fast", method: "POST" },
    },
    {
      name: "Slow Path",
      type: "n8n-nodes-base.httpRequest",
      parameters: { url: "https://api.example.com/slow", method: "POST" },
    },
    {
      name: "Notify",
      type: "n8n-nodes-base.slack",
      parameters: { resource: "message", operation: "post", channel: "#ops", text: "done" },
    },
  ],
  connections: {
    "Manual Trigger": { main: [[{ node: "Check Tier", type: "main", index: 0 }]] },
    "Check Tier": {
      main: [
        [{ node: "Fast Path", type: "main", index: 0 }],
        [{ node: "Slow Path", type: "main", index: 0 }],
      ],
    },
    "Fast Path": { main: [[{ node: "Notify", type: "main", index: 0 }]] },
    "Slow Path": { main: [[{ node: "Notify", type: "main", index: 0 }]] },
  },
};

describe("n8n-2-workflows", () => {
  it("detects n8n exports and rejects other formats", async () => {
    expect((await n8nImporter.detect(artifactOf(LINEAR_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({ name: "x", flow: [{ id: 1, module: "slack:CreateMessage" }] });
    expect((await n8nImporter.detect(other)).detected).toBe(false);
  });

  it("compiles a linear chain into a valid plan with mapped requirements", async () => {
    const result = await compileFixture(LINEAR_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("Create Contact");
    expect(plan.nodes["Create Contact"]?.kind).toBe("invoke");
    expect(plan.nodes["Notify"]?.kind).toBe("invoke");
    expect(plan.nodes["__succeed"]?.kind).toBe("succeed");

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("Create Contact")?.operation).toBe("POST /crm/v3/objects/contacts");
    expect(byId.get("Create Contact")?.effect).toBe("mutation");
    expect(byId.get("Notify")?.operation).toBe("POST /chat.postMessage");
    expect(byId.get("Notify")?.effect).toBe("send");

    const create = plan.nodes["Create Contact"];
    if (create?.kind === "invoke") {
      expect(create.idempotency).toEqual({
        kind: "deduplication-record",
        namespace: "plan-1:Create Contact",
      });
      expect(create.next).toBe("Notify");
    }

    // sticky note skipped, trigger approximated, nothing blocked
    const statuses = result.fidelity.findings;
    expect(statuses.some((f) => f.feature === "cosmetic-node" && f.status === "approximated")).toBe(true);
    expect(statuses.some((f) => f.feature === "trigger" && f.status === "approximated")).toBe(true);
    expect(statuses.some((f) => f.status === "blocked" || f.status === "unsupported")).toBe(false);
  });

  it("compiles the IF node into a choice with rejoining branches", async () => {
    const result = await compileFixture(IF_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("Check Tier");

    const choice = plan.nodes["Check Tier"];
    expect(choice?.kind).toBe("choice");
    if (choice?.kind === "choice") {
      expect(choice.choices[0]?.then).toBe("Fast Path");
      expect(choice.otherwise).toBe("Slow Path");
      expect(choice.choices[0]?.when).toEqual({
        kind: "compare",
        operator: "eq",
        left: { kind: "input", path: ["tier"] },
        right: { kind: "literal", value: "gold" },
      });
    }

    // both branches rejoin at the Notify node
    const fast = plan.nodes["Fast Path"];
    const slow = plan.nodes["Slow Path"];
    expect(fast?.kind).toBe("invoke");
    expect(slow?.kind).toBe("invoke");
    if (fast?.kind === "invoke" && slow?.kind === "invoke") {
      expect(fast.next).toBe("Notify");
      expect(slow.next).toBe("Notify");
      expect(fast.effect).toBe("mutation");
    }
    expect(plan.effects.outboundHosts).toContain("api.example.com");
    expect(result.fidelity.findings.some((f) => f.status === "blocked")).toBe(false);
  });

  it("blocks compilation on Code nodes — no JS execution ever", async () => {
    const result = await compileFixture({
      name: "with code",
      nodes: [
        { name: "Trigger", type: "n8n-nodes-base.manualTrigger", parameters: {} },
        { name: "Munge", type: "n8n-nodes-base.code", parameters: { jsCode: "return items;" } },
      ],
      connections: { Trigger: { main: [[{ node: "Munge", type: "main", index: 0 }]] } },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking" && d.severity === "error")).toBe(true);
    expect(
      result.fidelity.findings.some((f) => f.feature === "code-node" && f.status === "blocked"),
    ).toBe(true);
  });

  it("blocks compilation on unmapped connector types", async () => {
    const result = await compileFixture({
      name: "unmapped",
      nodes: [
        { name: "Trigger", type: "n8n-nodes-base.manualTrigger", parameters: {} },
        { name: "Mystery", type: "n8n-nodes-base.airtable", parameters: { operation: "append" } },
      ],
      connections: { Trigger: { main: [[{ node: "Mystery", type: "main", index: 0 }]] } },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking")).toBe(true);
    expect(
      result.fidelity.findings.some(
        (f) => f.feature === "unmapped-connector" && f.status === "blocked",
      ),
    ).toBe(true);
  });

  it("blocks $node[...] expressions in execution-relevant positions", async () => {
    const result = await compileFixture({
      name: "bad expr",
      nodes: [
        { name: "Trigger", type: "n8n-nodes-base.manualTrigger", parameters: {} },
        {
          name: "Fetch",
          type: "n8n-nodes-base.httpRequest",
          parameters: { url: '={{ $node["Trigger"].json.url }}', method: "GET" },
        },
      ],
      connections: { Trigger: { main: [[{ node: "Fetch", type: "main", index: 0 }]] } },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking")).toBe(true);
  });

  it("never leaks credential metadata into the compile result", async () => {
    const result = await compileFixture(LINEAR_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("cred-hubspot-42");
    expect(text).not.toContain("cred-slack-77");
    expect(text).not.toContain("HubSpot prod key");
    expect(text).not.toContain("credentials");
  });
});
