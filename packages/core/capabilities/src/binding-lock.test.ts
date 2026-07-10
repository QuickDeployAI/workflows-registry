import { buildPlan, computePlanDigest, type ExecutionPlanV1 } from "@quickdeployai/workflow-ir";
import { literal } from "@quickdeployai/workflow-expressions";
import { describe, expect, it } from "vitest";
import { validateBindingLock, type BindingLock } from "./binding-lock.js";

function plan(): ExecutionPlanV1 {
  return buildPlan({
    id: "p",
    name: "p",
    source: { format: "test", artifactDigest: "sha256:0", entrypoint: "-" },
    compiler: { name: "t", version: "0" },
    entryNodeId: "n",
    capabilityRequirements: [
      { id: "api", protocol: "http", operation: "POST /x", requiredScopes: [], effect: "mutation" },
      { id: "tool", protocol: "mcp", operation: "create", requiredScopes: [], effect: "mutation" },
    ],
    nodes: [
      {
        id: "n",
        kind: "invoke",
        binding: "api",
        input: literal({}),
        effect: "mutation",
        idempotency: { kind: "deduplication-record", namespace: "x" },
        approval: "none",
      },
    ],
  });
}

describe("validateBindingLock", () => {
  it("accepts a complete, digest-matching lock", () => {
    const p = plan();
    const digest = computePlanDigest(p);
    const lock: BindingLock = {
      planDigest: digest,
      bindings: [
        { requirementId: "api", implementationId: "svc", implementationVersion: "1.0.0", endpoint: "http://localhost:1" },
        { requirementId: "tool", implementationId: "mcp-x", implementationVersion: "1.0.0", toolName: "create" },
      ],
    };
    expect(validateBindingLock(p, digest, lock)).toEqual([]);
  });

  it("collects digest mismatch, unbound requirements, and unknown bindings", () => {
    const p = plan();
    const digest = computePlanDigest(p);
    const lock: BindingLock = {
      planDigest: "sha256:other",
      bindings: [
        { requirementId: "ghost", implementationId: "x", implementationVersion: "1" },
        { requirementId: "api", implementationId: "svc", implementationVersion: "1" },
      ],
    };
    const codes = validateBindingLock(p, digest, lock).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("binding-plan-digest-mismatch");
    expect(codes).toContain("unbound-requirement");
    expect(codes).toContain("unknown-requirement-binding");
    expect(codes).toContain("binding-missing-endpoint");
  });
});
