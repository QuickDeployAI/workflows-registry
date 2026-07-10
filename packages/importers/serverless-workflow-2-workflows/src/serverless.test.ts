import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { serverlessWorkflowImporter } from "./index.js";

const SOURCES = join(import.meta.dirname, "../../../../sources/quickdeploy");
const resolver = createPinnedResolver({ files: [] });

async function fixtureArtifact() {
  const text = await readFile(join(SOURCES, "order-fulfillment.serverless.yaml"), "utf8");
  return ingestSourceFiles([{ path: "order-fulfillment.serverless.yaml", text }], {
    entrypoint: "order-fulfillment.serverless.yaml",
  });
}

describe("serverless-workflow-2-workflows", () => {
  it("level 0: detects DSL 1.x documents and oneclick.workflow.package.v1 wrappers", async () => {
    const artifact = await fixtureArtifact();
    expect((await serverlessWorkflowImporter.detect(artifact)).confidence).toBe("exact");

    const wrapped = ingestSourceFiles([
      {
        path: "pkg.json",
        text: JSON.stringify({
          schema: "oneclick.workflow.package.v1",
          specVersion: "serverless-workflow/v1",
          canonicalSpec: {
            document: { dsl: "1.0.0", namespace: "q", name: "n", version: "0.1.0" },
            do: [{ start: { wait: { seconds: 1 } } }],
          },
        }),
      },
    ]);
    const detection = await serverlessWorkflowImporter.detect(wrapped);
    expect(detection.detected).toBe(true);
  });

  it("level 1: validates then-routing", async () => {
    const artifact = await fixtureArtifact();
    const parsed = await serverlessWorkflowImporter.parse(artifact, { resolver });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const report = await serverlessWorkflowImporter.validate(parsed.model, { resolver });
    expect(report.valid).toBe(true);

    const broken = JSON.parse(JSON.stringify(parsed.model)) as typeof parsed.model;
    (broken.do[1] as Record<string, { switch: Array<Record<string, { then: string }>> }>)
      .routeByPriority!.switch[0]!.express!.then = "missing-task";
    const brokenReport = await serverlessWorkflowImporter.validate(broken, { resolver });
    expect(brokenReport.valid).toBe(false);
    expect(brokenReport.diagnostics.map((d) => d.code)).toContain("unknown-then-target");
  });

  it("level 2+3: compiles choice/retry/wait/failure paths into a valid plan", async () => {
    const artifact = await fixtureArtifact();
    const parsed = await serverlessWorkflowImporter.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await serverlessWorkflowImporter.compile(parsed.model, {
      planId: "order-fulfillment",
      planName: "Order fulfillment",
      artifactDigest: artifact.digest,
      resolver,
    });

    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("checkInventory");

    const route = plan.nodes.routeByPriority;
    expect(route?.kind).toBe("choice");
    if (route?.kind === "choice") {
      expect(route.choices[0]?.then).toBe("reserveCourier");
      expect(route.otherwise).toBe("queueShipment");
    }

    const check = plan.nodes.checkInventory;
    if (check?.kind === "invoke") {
      expect(check.retry?.maxAttempts).toBe(3);
      expect(check.effect).toBe("read");
    }

    expect(plan.nodes.awaitPickup?.kind).toBe("wait");
    expect(plan.effects.outboundHosts).toContain("fulfillment.example.com");
    expect(result.requirements.map((requirement) => requirement.id)).toContain("reserveCourier");
    expect(result.fidelity.findings.some((finding) => finding.status === "blocked")).toBe(false);
  });
});
