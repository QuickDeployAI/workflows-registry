import type { ExecutionPlanV1, SideEffect } from "@quickdeployai/workflow-ir";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Stage 1: Policy intent — derived from the compiled plan. This is what the
// workflow REQUESTS; it never becomes permission by itself.
// ---------------------------------------------------------------------------

export interface PolicyIntent {
  planDigest: string;
  outboundHosts: string[];
  credentialHandles: string[];
  effects: Record<SideEffect, number>;
  maxAgentSessions: number;
  maxChildWorkflows: number;
  /** Always requested read-only unless a sandbox requirement widens it. */
  writablePaths: string[];
}

export function derivePolicyIntent(plan: ExecutionPlanV1, planDigest: string): PolicyIntent {
  const agentInvokes = Object.values(plan.nodes).filter(
    (node) => node.kind === "invoke" && lookupProtocol(plan, node.binding) === "agent",
  ).length;

  return {
    planDigest,
    outboundHosts: [...plan.effects.outboundHosts].sort(),
    credentialHandles: plan.credentialRequirements.map((requirement) => requirement.env).sort(),
    effects: {
      read: plan.effects.reads,
      mutation: plan.effects.mutations,
      send: plan.effects.sends,
      destructive: plan.effects.destructive,
    },
    maxAgentSessions: Math.min(agentInvokes || plan.budgets.maxChildren, plan.budgets.maxChildren),
    maxChildWorkflows: plan.budgets.maxChildren,
    writablePaths: plan.sandboxRequirements.flatMap((requirement) => requirement.writablePaths).sort(),
  };
}

function lookupProtocol(plan: ExecutionPlanV1, requirementId: string): string | undefined {
  return plan.capabilityRequirements.find((requirement) => requirement.id === requirementId)
    ?.protocol;
}

// ---------------------------------------------------------------------------
// Stage 2: Effective policy — intersection of intent with org policy, user
// grants, and runtime capabilities. May only REDUCE privileges relative to
// the intent; expansions require an explicit policy-expansion approval.
// ---------------------------------------------------------------------------

export const PolicyGrantsSchema = z.object({
  allowedHosts: z.array(z.string()).default([]),
  allowedCredentials: z.array(z.string()).default([]),
  allowedEffects: z.array(z.enum(["read", "mutation", "send", "destructive"])).default(["read"]),
  /** Effects in this list execute only behind a business-effect approval. */
  approvalRequiredEffects: z
    .array(z.enum(["mutation", "send", "destructive"]))
    .default(["destructive"]),
  maxAgentSessions: z.number().int().nonnegative().default(0),
  maxChildWorkflows: z.number().int().nonnegative().default(0),
  writablePaths: z.array(z.string()).default([]),
});
export type PolicyGrants = z.infer<typeof PolicyGrantsSchema>;

export interface EffectivePolicy {
  planDigest: string;
  allowedHosts: string[];
  allowedCredentials: string[];
  allowedEffects: SideEffect[];
  approvalRequiredEffects: SideEffect[];
  maxAgentSessions: number;
  maxChildWorkflows: number;
  writablePaths: string[];
}

/** Intersect intent with every grant layer — the result can only shrink. */
export function computeEffectivePolicy(
  intent: PolicyIntent,
  ...grantLayers: PolicyGrants[]
): EffectivePolicy {
  let hosts = new Set(intent.outboundHosts);
  let credentials = new Set(intent.credentialHandles);
  let effects = new Set<SideEffect>(
    (Object.entries(intent.effects) as [SideEffect, number][])
      .filter(([, count]) => count > 0)
      .map(([effect]) => effect),
  );
  let writable = new Set(intent.writablePaths);
  let maxAgentSessions = intent.maxAgentSessions;
  let maxChildWorkflows = intent.maxChildWorkflows;
  const approvalRequired = new Set<SideEffect>();

  for (const layer of grantLayers) {
    hosts = intersect(hosts, new Set(layer.allowedHosts));
    credentials = intersect(credentials, new Set(layer.allowedCredentials));
    effects = new Set(
      [...effects].filter(
        (effect) => layer.allowedEffects.includes(effect) || layer.allowedEffects.includes("*" as SideEffect),
      ),
    );
    writable = intersect(writable, new Set(layer.writablePaths));
    maxAgentSessions = Math.min(maxAgentSessions, layer.maxAgentSessions);
    maxChildWorkflows = Math.min(maxChildWorkflows, layer.maxChildWorkflows);
    for (const effect of layer.approvalRequiredEffects) approvalRequired.add(effect as SideEffect);
  }

  return {
    planDigest: intent.planDigest,
    allowedHosts: [...hosts].sort(),
    allowedCredentials: [...credentials].sort(),
    allowedEffects: [...effects].sort(),
    approvalRequiredEffects: [...approvalRequired].sort(),
    maxAgentSessions,
    maxChildWorkflows,
    writablePaths: [...writable].sort(),
  };
}

function intersect(left: Set<string>, right: Set<string>): Set<string> {
  return new Set([...left].filter((value) => right.has(value) || right.has("*")));
}

// ---------------------------------------------------------------------------
// Stage 3: Runtime decision — one concrete action against the effective
// policy. Default-deny: anything not explicitly allowed is denied.
// ---------------------------------------------------------------------------

export interface CapabilityAction {
  subject: string;
  requirementId: string;
  protocol: string;
  operation: string;
  effect: SideEffect;
  argumentsDigest: string;
  planDigest: string;
  runId: string;
  host?: string;
  credentialHandle?: string;
}

export interface RuntimeDecision {
  decision: "allow" | "deny" | "approval-required";
  reason: string;
}

export function evaluateRuntimeDecision(
  policy: EffectivePolicy,
  action: CapabilityAction,
): RuntimeDecision {
  if (action.planDigest !== policy.planDigest) {
    return { decision: "deny", reason: `Plan digest ${action.planDigest} is not governed by this policy.` };
  }
  if (!policy.allowedEffects.includes(action.effect)) {
    return { decision: "deny", reason: `Effect "${action.effect}" is not granted.` };
  }
  if (action.host && !policy.allowedHosts.includes(action.host)) {
    return { decision: "deny", reason: `Outbound host "${action.host}" is not granted.` };
  }
  if (action.credentialHandle && !policy.allowedCredentials.includes(action.credentialHandle)) {
    return { decision: "deny", reason: `Credential handle "${action.credentialHandle}" is not granted.` };
  }
  if (action.effect !== "read" && policy.approvalRequiredEffects.includes(action.effect)) {
    return { decision: "approval-required", reason: `Effect "${action.effect}" requires approval.` };
  }
  return { decision: "allow", reason: "Allowed by effective policy." };
}

export interface PolicyEngine {
  evaluate(action: CapabilityAction): RuntimeDecision;
}

export function createPolicyEngine(policy: EffectivePolicy): PolicyEngine {
  return { evaluate: (action) => evaluateRuntimeDecision(policy, action) };
}

/** Fail-closed engine used when no policy has been configured. */
export function denyAllPolicyEngine(reason = "No effective policy configured."): PolicyEngine {
  return { evaluate: () => ({ decision: "deny", reason }) };
}
