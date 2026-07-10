import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { powerAutomateImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "flow.json", text: JSON.stringify(value) }], {
    entrypoint: "flow.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await powerAutomateImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return powerAutomateImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "flow.json",
    resolver,
  });
}

const HAPPY_FIXTURE = {
  definition: {
    $schema:
      "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    triggers: { manual: { type: "Request", kind: "Button" } },
    actions: {
      Get_report: {
        type: "Http",
        inputs: { method: "GET", uri: "https://api.example.com/report" },
        runAfter: {},
      },
      Send_an_email: {
        type: "OpenApiConnection",
        inputs: {
          host: {
            connection: { name: "shared_office365_conn_abc123" },
            operationId: "SendEmailV2",
            apiId: "/providers/Microsoft.PowerApps/apis/shared_office365",
          },
          parameters: {
            "emailMessage/To": "ops@example.com",
            "emailMessage/Subject": "Report ready",
          },
        },
        runAfter: { Get_report: ["Succeeded"] },
      },
    },
  },
  connectionReferences: {
    shared_office365: { connectionName: "shared_office365_conn_abc123", id: "conn-id-777" },
  },
};

describe("power-automate-2-workflows", () => {
  it("detects WDL flow definitions and rejects other formats", async () => {
    expect((await powerAutomateImporter.detect(artifactOf(HAPPY_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({ zap: { title: "x", steps: [] } });
    expect((await powerAutomateImporter.detect(other)).detected).toBe(false);
  });

  it("compiles a runAfter chain into a valid plan", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("Get_report");
    expect(plan.nodes.Get_report?.kind).toBe("invoke");
    expect(plan.nodes.Send_an_email?.kind).toBe("invoke");

    const get = plan.nodes.Get_report;
    if (get?.kind === "invoke") {
      expect(get.effect).toBe("read");
      expect(get.next).toBe("Send_an_email");
    }
    const send = plan.nodes.Send_an_email;
    if (send?.kind === "invoke") {
      expect(send.effect).toBe("send");
      expect(send.idempotency).toEqual({
        kind: "deduplication-record",
        namespace: "plan-1:Send_an_email",
      });
      expect(send.next).toBe("__succeed");
    }

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("Send_an_email")?.provider).toBe("office365");
    expect(byId.get("Send_an_email")?.operation).toBe("POST /v2/me/sendMail");
    expect(byId.get("Get_report")?.operation).toBe("GET /report");
    expect(plan.effects.outboundHosts).toContain("api.example.com");
    expect(result.fidelity.findings.some((f) => f.status === "blocked")).toBe(false);
  });

  it("blocks compilation on unmapped connections", async () => {
    const result = await compileFixture({
      definition: {
        actions: {
          Do_thing: {
            type: "OpenApiConnection",
            inputs: {
              host: {
                operationId: "DoThing",
                apiId: "/providers/Microsoft.PowerApps/apis/shared_foobar",
              },
              parameters: {},
            },
            runAfter: {},
          },
        },
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

  it("never leaks connection metadata into the compile result", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("shared_office365_conn_abc123");
    expect(text).not.toContain("conn-id-777");
    expect(text).not.toContain("connectionReferences");
  });
});
