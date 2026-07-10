import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { pipedreamImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "workflow.json", text: JSON.stringify(value) }], {
    entrypoint: "workflow.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await pipedreamImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return pipedreamImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "workflow.json",
    resolver,
  });
}

const HAPPY_FIXTURE = {
  name: "Lead to Slack",
  steps: [
    {
      namespace: "create_contact",
      action: { key: "hubspot-create-contact" },
      params: { email: "lead@example.com" },
      props: { hubspot: { authProvisionId: "apn_secret_42" } },
    },
    {
      namespace: "send_message",
      action: { key: "slack-send-message" },
      params: {
        channel: "C123",
        text: "Contact {{steps.create_contact.$return_value.id}} created",
      },
      props: { slack: { authProvisionId: "apn_secret_77" } },
    },
  ],
};

describe("pipedream-2-workflows", () => {
  it("detects Pipedream workflow exports and rejects other formats", async () => {
    expect((await pipedreamImporter.detect(artifactOf(HAPPY_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({ zap: { title: "x", steps: [{ id: 1, app: "a", action: "b" }] } });
    expect((await pipedreamImporter.detect(other)).detected).toBe(false);
  });

  it("compiles mapped action steps with $return_value tokens", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("create_contact");
    expect(plan.nodes.create_contact?.kind).toBe("invoke");
    expect(plan.nodes.send_message?.kind).toBe("invoke");

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("create_contact")?.operation).toBe("POST /crm/v3/objects/contacts");
    expect(byId.get("create_contact")?.effect).toBe("mutation");
    expect(byId.get("send_message")?.effect).toBe("send");

    const send = plan.nodes.send_message;
    if (send?.kind === "invoke") {
      expect(send.next).toBe("__succeed");
      const input = send.input;
      if (input.kind === "object" && input.entries.body?.kind === "object") {
        expect(input.entries.body.entries.text).toEqual({
          kind: "interpolate",
          parts: [
            { kind: "literal", value: "Contact " },
            { kind: "nodeOutput", nodeId: "create_contact", path: ["id"] },
            { kind: "literal", value: " created" },
          ],
        });
      } else {
        throw new Error("expected object input with body");
      }
    }
    expect(result.fidelity.findings.some((f) => f.status === "blocked")).toBe(false);
  });

  it("blocks compilation on code steps", async () => {
    const result = await compileFixture({
      name: "with code",
      steps: [
        {
          namespace: "transform",
          code: "export default defineComponent({ run() { return 1; } });",
        },
      ],
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking" && d.severity === "error")).toBe(true);
    expect(result.fidelity.findings.some((f) => f.feature === "code-node" && f.status === "blocked")).toBe(true);
  });

  it("blocks compilation on unmapped action keys", async () => {
    const result = await compileFixture({
      name: "unmapped",
      steps: [{ namespace: "mystery", action: { key: "notion-create-page" }, params: {} }],
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking")).toBe(true);
    expect(
      result.fidelity.findings.some(
        (f) => f.feature === "unmapped-connector" && f.status === "blocked",
      ),
    ).toBe(true);
  });

  it("never leaks auth provision ids into the compile result", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("apn_secret_42");
    expect(text).not.toContain("apn_secret_77");
    expect(text).not.toContain("authProvisionId");
  });
});
