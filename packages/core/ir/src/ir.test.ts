import { literal, inputRef } from "@quickdeployai/workflow-expressions";
import { describe, expect, it } from "vitest";
import { buildPlan } from "./build.js";
import { computePlanDigest } from "./digest.js";
import { ExecutionPlanV1Schema, type ExecutionPlanV1 } from "./plan.js";
import { validatePlan } from "./validate.js";

const HTTP_REQ = {
  id: "http-get",
  protocol: "http" as const,
  operation: "GET /pets/{petId}",
  requiredScopes: [],
  effect: "read" as const,
};

function fixturePlan(): ExecutionPlanV1 {
  return buildPlan({
    id: "fixture",
    name: "fixture",
    source: { format: "test", artifactDigest: "sha256:0", entrypoint: "-" },
    compiler: { name: "test", version: "0" },
    entryNodeId: "get",
    capabilityRequirements: [
      HTTP_REQ,
      { ...HTTP_REQ, id: "http-post", operation: "POST /orders", effect: "mutation" },
    ],
    nodes: [
      {
        id: "get",
        kind: "invoke",
        binding: "http-get",
        input: inputRef("petId"),
        effect: "read",
        approval: "none",
        next: "post",
      },
      {
        id: "post",
        kind: "invoke",
        binding: "http-post",
        input: literal({}),
        effect: "mutation",
        idempotency: { kind: "deduplication-record", namespace: "orders" },
        approval: "none",
        next: "done",
      },
      { id: "done", kind: "succeed", output: literal("ok") },
    ],
  });
}

describe("ExecutionPlanV1", () => {
  it("round-trips through the schema", () => {
    const plan = fixturePlan();
    const parsed = ExecutionPlanV1Schema.parse(JSON.parse(JSON.stringify(plan)));
    expect(parsed.entryNodeId).toBe("get");
    expect(validatePlan(parsed)).toEqual([]);
  });

  it("computes stable digests independent of diagnostics", () => {
    const plan = fixturePlan();
    const digest = computePlanDigest(plan);
    expect(digest).toMatch(/^sha256:/);
    expect(computePlanDigest({ ...plan, diagnostics: [{ severity: "info", code: "x", message: "y" }] })).toBe(
      digest,
    );
    const mutated = fixturePlan();
    mutated.entryNodeId = "post";
    expect(computePlanDigest(mutated)).not.toBe(digest);
  });

  it("rejects dangling node references", () => {
    const plan = fixturePlan();
    (plan.nodes.get as { next?: string }).next = "missing";
    const codes = validatePlan(plan).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("unknown-node-ref");
  });

  it("requires idempotency on mutations", () => {
    const plan = fixturePlan();
    delete (plan.nodes.post as { idempotency?: unknown }).idempotency;
    const codes = validatePlan(plan).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("missing-idempotency-policy");
  });

  it("requires approval on not-idempotent effects", () => {
    const plan = fixturePlan();
    (plan.nodes.post as { idempotency: unknown }).idempotency = {
      kind: "not-idempotent",
      approvalRequired: true,
    };
    const codes = validatePlan(plan).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("not-idempotent-requires-approval");
  });

  it("enforces loop and parallel budgets", () => {
    const plan = fixturePlan();
    plan.nodes.spin = {
      id: "spin",
      kind: "loop",
      bodyEntryNodeId: "get",
      maxIterations: 999,
    };
    const codes = validatePlan(plan).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("iteration-budget-exceeded");
  });

  it("requires child plans to shrink the depth budget", () => {
    const plan = fixturePlan();
    plan.nodes.child = {
      id: "child",
      kind: "childWorkflow",
      plan: fixturePlan(),
      input: literal({}),
    };
    const codes = validatePlan(plan).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("depth-budget-exceeded");
  });
});
