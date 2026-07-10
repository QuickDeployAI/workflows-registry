import { buildPlan, computePlanDigest } from "@quickdeployai/workflow-ir";
import { literal } from "@quickdeployai/workflow-expressions";
import { describe, expect, it } from "vitest";
import {
  computeEffectivePolicy,
  createPolicyEngine,
  denyAllPolicyEngine,
  derivePolicyIntent,
  evaluateRuntimeDecision,
  type CapabilityAction,
} from "./policy.js";

const plan = buildPlan({
  id: "p",
  name: "p",
  source: { format: "test", artifactDigest: "sha256:0", entrypoint: "-" },
  compiler: { name: "t", version: "0" },
  entryNodeId: "read",
  outboundHosts: ["api.example.com"],
  capabilityRequirements: [
    { id: "get", protocol: "http", operation: "GET /x", requiredScopes: [], effect: "read" },
    { id: "post", protocol: "http", operation: "POST /x", requiredScopes: [], effect: "mutation" },
  ],
  credentialRequirements: [{ id: "c", env: "API_TOKEN" }],
  nodes: [
    { id: "read", kind: "invoke", binding: "get", input: literal({}), effect: "read", approval: "none", next: "write" },
    {
      id: "write",
      kind: "invoke",
      binding: "post",
      input: literal({}),
      effect: "mutation",
      idempotency: { kind: "deduplication-record", namespace: "x" },
      approval: "none",
      next: "end",
    },
    { id: "end", kind: "succeed" },
  ],
});
const digest = computePlanDigest(plan);
const intent = derivePolicyIntent(plan, digest);

function action(overrides: Partial<CapabilityAction> = {}): CapabilityAction {
  return {
    subject: "workflow",
    requirementId: "get",
    protocol: "http",
    operation: "GET /x",
    effect: "read",
    argumentsDigest: "sha256:a",
    planDigest: digest,
    runId: "run_1",
    host: "api.example.com",
    ...overrides,
  };
}

describe("three-stage policy", () => {
  it("derives intent from the plan", () => {
    expect(intent.outboundHosts).toEqual(["api.example.com"]);
    expect(intent.credentialHandles).toEqual(["API_TOKEN"]);
    expect(intent.effects.mutation).toBe(1);
  });

  it("effective policy is the reduce-only intersection", () => {
    const effective = computeEffectivePolicy(
      intent,
      {
        allowedHosts: ["api.example.com", "extra.example.com"],
        allowedCredentials: ["API_TOKEN"],
        allowedEffects: ["read", "mutation"],
        approvalRequiredEffects: ["destructive"],
        maxAgentSessions: 10,
        maxChildWorkflows: 10,
        writablePaths: ["/tmp"],
      },
      {
        allowedHosts: ["api.example.com"],
        allowedCredentials: [],
        allowedEffects: ["read"],
        approvalRequiredEffects: ["destructive"],
        maxAgentSessions: 1,
        maxChildWorkflows: 2,
        writablePaths: [],
      },
    );
    // Never wider than the intent, never wider than any grant layer.
    expect(effective.allowedHosts).toEqual(["api.example.com"]);
    expect(effective.allowedCredentials).toEqual([]);
    expect(effective.allowedEffects).toEqual(["read"]);
    expect(effective.maxChildWorkflows).toBe(2);
  });

  it("runtime decisions default-deny", () => {
    expect(denyAllPolicyEngine().evaluate(action()).decision).toBe("deny");

    const effective = computeEffectivePolicy(intent, {
      allowedHosts: ["api.example.com"],
      allowedCredentials: ["API_TOKEN"],
      allowedEffects: ["read", "mutation"],
      approvalRequiredEffects: ["mutation"],
      maxAgentSessions: 1,
      maxChildWorkflows: 1,
      writablePaths: [],
    });
    const engine = createPolicyEngine(effective);

    expect(engine.evaluate(action()).decision).toBe("allow");
    expect(engine.evaluate(action({ host: "evil.example.com" })).decision).toBe("deny");
    expect(engine.evaluate(action({ effect: "destructive" })).decision).toBe("deny");
    expect(
      engine.evaluate(action({ effect: "mutation", requirementId: "post" })).decision,
    ).toBe("approval-required");
    expect(
      evaluateRuntimeDecision(effective, action({ planDigest: "sha256:other" })).decision,
    ).toBe("deny");
    expect(
      engine.evaluate(action({ credentialHandle: "OTHER_TOKEN" })).decision,
    ).toBe("deny");
  });
});
