import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { workatoImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "recipe.json", text: JSON.stringify(value) }], {
    entrypoint: "recipe.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await workatoImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return workatoImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "recipe.json",
    resolver,
  });
}

const HAPPY_FIXTURE = {
  name: "Lead sync",
  recipe: {
    trigger: { provider: "salesforce", name: "new_lead" },
    connections: [{ provider: "salesforce", account_id: "workato-acct-31" }],
    actions: [
      {
        name: "create_record",
        provider: "salesforce",
        action: "create_record",
        input: { object: "Lead", email: "#{_('data.trigger.email')}" },
      },
      {
        name: "post_message",
        provider: "slack",
        action: "post_message",
        input: { channel: "#sales", text: "Lead #{_('data.create_record.id')} created" },
      },
    ],
  },
};

describe("workato-2-workflows", () => {
  it("detects Workato recipe exports and rejects other formats", async () => {
    expect((await workatoImporter.detect(artifactOf(HAPPY_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({ applet: { name: "x", trigger: { service: "s" }, actions: [] } });
    expect((await workatoImporter.detect(other)).detected).toBe(false);
  });

  it("compiles sequential actions with datapill lowering", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("create_record");
    expect(plan.nodes.create_record?.kind).toBe("invoke");
    expect(plan.nodes.post_message?.kind).toBe("invoke");

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("create_record")?.provider).toBe("salesforce");
    expect(byId.get("create_record")?.effect).toBe("mutation");
    expect(byId.get("post_message")?.operation).toBe("POST /chat.postMessage");
    expect(byId.get("post_message")?.effect).toBe("send");

    const create = plan.nodes.create_record;
    if (create?.kind === "invoke") {
      const input = create.input;
      if (input.kind === "object" && input.entries.body?.kind === "object") {
        // "data.trigger.email" falls back to the run input.
        expect(input.entries.body.entries.email).toEqual({ kind: "input", path: ["email"] });
      } else {
        throw new Error("expected object input with body");
      }
    }
    const post = plan.nodes.post_message;
    if (post?.kind === "invoke") {
      const input = post.input;
      if (input.kind === "object" && input.entries.body?.kind === "object") {
        expect(input.entries.body.entries.text).toEqual({
          kind: "interpolate",
          parts: [
            { kind: "literal", value: "Lead " },
            { kind: "nodeOutput", nodeId: "create_record", path: ["id"] },
            { kind: "literal", value: " created" },
          ],
        });
      } else {
        throw new Error("expected object input with body");
      }
    }

    // datapill lowering is approximated, never blocked
    expect(result.fidelity.findings.some((f) => f.feature === "datapill" && f.status === "approximated")).toBe(true);
    expect(result.fidelity.findings.some((f) => f.status === "blocked")).toBe(false);
  });

  it("blocks compilation on unmapped provider actions", async () => {
    const result = await compileFixture({
      name: "unmapped",
      recipe: {
        actions: [{ name: "add_record", provider: "netsuite", action: "add_record", input: {} }],
      },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking" && d.severity === "error")).toBe(true);
    expect(
      result.fidelity.findings.some(
        (f) => f.feature === "unmapped-connector" && f.status === "blocked",
      ),
    ).toBe(true);
  });

  it("never leaks connection account ids into the compile result", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("workato-acct-31");
    expect(text).not.toContain("account_id");
    expect(text).not.toContain("connections");
  });
});
