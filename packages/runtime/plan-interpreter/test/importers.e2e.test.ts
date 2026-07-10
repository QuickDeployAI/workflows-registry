import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { start } from "workflow/api";
import { arazzoImporter } from "@quickdeployai/arazzo-2-workflows";
import { serverlessWorkflowImporter } from "@quickdeployai/serverless-workflow-2-workflows";
import {
  createPinnedResolver,
  ingestSourceFiles,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { computePlanDigest, type ExecutionPlanV1 } from "@quickdeployai/workflow-ir";
import type { BindingLock } from "@quickdeployai/workflow-capabilities";
import { configureKernel, resetKernel } from "../src/services.js";
import { createMemoryArtifactStore } from "../src/artifact-store.js";
import { runExecutionPlan } from "../workflows/run-execution-plan.js";
import {
  SECRET,
  createMemoryAuditSink,
  permissivePolicy,
  startTestApi,
  type TestApi,
} from "./helpers.js";

const SOURCES = join(import.meta.dirname, "../../../../sources/quickdeploy");

let api: TestApi;
let audit: ReturnType<typeof createMemoryAuditSink>;

beforeAll(async () => {
  api = await startTestApi();
});

afterAll(async () => {
  await api.close();
  resetKernel();
});

beforeEach(() => {
  api.reset();
  audit = createMemoryAuditSink();
});

async function compileFixture(
  importer: WorkflowImporter<unknown>,
  files: string[],
  entrypoint: string,
  config: Record<string, unknown> = {},
): Promise<ExecutionPlanV1> {
  const loaded = await Promise.all(
    files.map(async (name) => ({ path: name, text: await readFile(join(SOURCES, name), "utf8") })),
  );
  const artifact = ingestSourceFiles(loaded, { entrypoint });
  const resolver = createPinnedResolver({ files: loaded });
  const parsed = await importer.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error("fixture parse failed");
  const validation = await importer.validate(parsed.model, { resolver });
  if (!validation.valid) throw new Error("fixture validation failed");
  const compiled = await importer.compile(parsed.model, {
    planId: entrypoint.replace(/\..*$/, ""),
    planName: entrypoint,
    artifactDigest: artifact.digest,
    entrypoint,
    config,
    resolver,
  });
  if (!compiled.plan) throw new Error("fixture compile failed");
  return compiled.plan;
}

function lockFor(plan: ExecutionPlanV1, planDigest: string, endpoint: string): BindingLock {
  return {
    planDigest,
    bindings: plan.capabilityRequirements.map((requirement) => ({
      requirementId: requirement.id,
      implementationId: "local-test-api",
      implementationVersion: "1.0.0",
      endpoint,
    })),
  };
}

describe("wave-1 importers execute durably on the Local World (conformance level 4)", () => {
  it("arazzo: the petstore checkout fixture places a real order", async () => {
    const plan = await compileFixture(
      arazzoImporter as WorkflowImporter<unknown>,
      ["petstore-checkout.arazzo.yaml", "petstore-openapi.yaml"],
      "petstore-checkout.arazzo.yaml",
      { workflowId: "checkout" },
    );
    const planDigest = computePlanDigest(plan);
    configureKernel({
      policyEngine: permissivePolicy(plan, planDigest, {}, [api.host]),
      artifactStore: createMemoryArtifactStore(),
      auditSink: audit,
      secretValues: [SECRET],
    });

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: lockFor(plan, planDigest, api.baseUrl), input: { petId: "p-42" } },
    ]);
    const output = (await run.returnValue) as { orderId: string };
    expect(output.orderId).toBe("order-1");
    // The order body was built from the LIVE response of the first call.
    expect(api.orders).toEqual([{ petId: "p-42", idempotencyKey: "p-42" }]);
    const types = (await audit.read(run.runId)).map((event) => event.type);
    expect(types).toContain("capability-call");
  });

  it("serverless workflow: choice, retry, wait, and confirm paths execute", async () => {
    const plan = await compileFixture(
      serverlessWorkflowImporter as WorkflowImporter<unknown>,
      ["order-fulfillment.serverless.yaml"],
      "order-fulfillment.serverless.yaml",
    );
    const planDigest = computePlanDigest(plan);
    configureKernel({
      policyEngine: permissivePolicy(plan, planDigest, {}, [api.host]),
      artifactStore: createMemoryArtifactStore(),
      auditSink: audit,
      secretValues: [SECRET],
    });

    const express = await start(runExecutionPlan, [
      {
        plan,
        planDigest,
        bindings: lockFor(plan, planDigest, api.baseUrl),
        input: { orderId: "o-1", priority: "express" },
      },
    ]);
    await express.returnValue;
    const expressPaths = api.requests.map((request) => request.path);
    expect(expressPaths).toContain("/inventory/o-1");
    expect(expressPaths).toContain("/couriers/reservations");
    expect(expressPaths).not.toContain("/shipments");
    expect(expressPaths).toContain("/orders/o-1/confirm");

    api.reset();
    const standard = await start(runExecutionPlan, [
      {
        plan,
        planDigest,
        bindings: lockFor(plan, planDigest, api.baseUrl),
        input: { orderId: "o-2", priority: "standard" },
      },
    ]);
    await standard.returnValue;
    const standardPaths = api.requests.map((request) => request.path);
    expect(standardPaths).toContain("/shipments");
    expect(standardPaths).not.toContain("/couriers/reservations");
  });
});
