import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { zapierImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "zap.json", text: JSON.stringify(value) }], {
    entrypoint: "zap.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await zapierImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return zapierImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "zap.json",
    resolver,
  });
}

const HAPPY_FIXTURE = {
  zap: {
    title: "New lead to Slack",
    steps: [
      {
        id: 1,
        app: "HubSpotCRM",
        action: "create_contact",
        params: { email: "lead@example.com", firstname: "Ada" },
        authentication: { id: "auth-secret-55", label: "HubSpot login" },
      },
      {
        id: 2,
        app: "SlackV2",
        action: "send_channel_message",
        params: { channel: "#leads", text: "Created contact {{1__email}}" },
        account: "zapier-account-91",
      },
    ],
  },
};

describe("zapier-2-workflows", () => {
  it("detects zap exports and rejects other formats", async () => {
    expect((await zapierImporter.detect(artifactOf(HAPPY_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({ name: "x", flow: [{ id: 1, module: "slack:CreateMessage" }] });
    expect((await zapierImporter.detect(other)).detected).toBe(false);
  });

  it("compiles sequential steps with nodeOutput tokens", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("step-1");
    expect(plan.nodes["step-1"]?.kind).toBe("invoke");
    expect(plan.nodes["step-2"]?.kind).toBe("invoke");
    expect(plan.nodes["__succeed"]?.kind).toBe("succeed");

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("step-1")?.operation).toBe("POST /crm/v3/objects/contacts");
    expect(byId.get("step-1")?.effect).toBe("mutation");
    expect(byId.get("step-2")?.effect).toBe("send");

    const notify = plan.nodes["step-2"];
    if (notify?.kind === "invoke") {
      const input = notify.input;
      if (input.kind === "object" && input.entries.body?.kind === "object") {
        expect(input.entries.body.entries.text).toEqual({
          kind: "interpolate",
          parts: [
            { kind: "literal", value: "Created contact " },
            { kind: "nodeOutput", nodeId: "step-1", path: ["email"] },
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
      zap: {
        title: "with code",
        steps: [{ id: 1, app: "CodeByZapier", action: "run_python", params: { code: "print(1)" } }],
      },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking" && d.severity === "error")).toBe(true);
    expect(result.fidelity.findings.some((f) => f.feature === "code-node" && f.status === "blocked")).toBe(true);
  });

  it("blocks compilation on unmapped apps", async () => {
    const result = await compileFixture({
      zap: {
        title: "unmapped",
        steps: [{ id: 1, app: "Airtable", action: "create_record", params: {} }],
      },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking")).toBe(true);
    expect(
      result.fidelity.findings.some(
        (f) => f.feature === "unmapped-connector" && f.status === "blocked",
      ),
    ).toBe(true);
  });

  it("never leaks authentication metadata into the compile result", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("auth-secret-55");
    expect(text).not.toContain("HubSpot login");
    expect(text).not.toContain("zapier-account-91");
    expect(text).not.toContain("authentication");
  });
});
