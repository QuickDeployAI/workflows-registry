import { ExpressionSchema, type Expression } from "@quickdeployai/workflow-expressions";
import { z } from "zod";

export const IR_VERSION = "1" as const;

/** Effect classes drive idempotency + policy requirements. */
export const SideEffectSchema = z.enum(["read", "mutation", "send", "destructive"]);
export type SideEffect = z.infer<typeof SideEffectSchema>;

export const CapabilityProtocolSchema = z.enum([
  "mcp",
  "openapi",
  "http",
  "agent",
  "sandbox",
  "artifact",
]);
export type CapabilityProtocol = z.infer<typeof CapabilityProtocolSchema>;

/** What the plan needs; a BindingLock supplies who implements it at install. */
export const CapabilityRequirementSchema = z.object({
  id: z.string().min(1),
  protocol: CapabilityProtocolSchema,
  provider: z.string().optional(),
  operation: z.string().min(1),
  inputSchemaDigest: z.string().optional(),
  outputSchemaDigest: z.string().optional(),
  requiredScopes: z.array(z.string()).default([]),
  effect: SideEffectSchema,
});
export type CapabilityRequirement = z.infer<typeof CapabilityRequirementSchema>;

export const CredentialRequirementSchema = z.object({
  id: z.string().min(1),
  /** Env-var NAME or broker handle — never a value. */
  env: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
  description: z.string().optional(),
});
export type CredentialRequirement = z.infer<typeof CredentialRequirementSchema>;

export const SandboxRequirementSchema = z.object({
  id: z.string().min(1),
  image: z.string().optional(),
  network: z.enum(["none", "allowlist"]).default("none"),
  allowedHosts: z.array(z.string()).default([]),
  writablePaths: z.array(z.string()).default([]),
});
export type SandboxRequirement = z.infer<typeof SandboxRequirementSchema>;

export const ExecutionBudgetSchema = z.object({
  maxIterations: z.number().int().positive(),
  maxParallelism: z.number().int().positive(),
  maxDepth: z.number().int().positive(),
  maxChildren: z.number().int().positive(),
});
export type ExecutionBudget = z.infer<typeof ExecutionBudgetSchema>;

export const RetryPolicySchema = z.object({
  maxAttempts: z.number().int().min(1).max(10).default(3),
  backoffSeconds: z.number().nonnegative().default(0),
});
export type RetryPolicy = z.infer<typeof RetryPolicySchema>;

/**
 * Durable retries are at-least-once; every non-read invoke declares how it
 * avoids duplicated external effects.
 */
export const IdempotencyPolicySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("provider-key"), key: ExpressionSchema }),
  z.object({ kind: z.literal("lookup-before-create"), lookupBinding: z.string().min(1) }),
  z.object({ kind: z.literal("deduplication-record"), namespace: z.string().min(1) }),
  z.object({ kind: z.literal("reconciliation"), verifyBinding: z.string().min(1) }),
  z.object({ kind: z.literal("not-idempotent"), approvalRequired: z.literal(true) }),
]);
export type IdempotencyPolicy = z.infer<typeof IdempotencyPolicySchema>;

export const FidelityStatusSchema = z.enum(["exact", "approximated", "unsupported", "blocked"]);
export type FidelityStatus = z.infer<typeof FidelityStatusSchema>;

export const FidelityFindingSchema = z.object({
  feature: z.string().min(1),
  status: FidelityStatusSchema,
  detail: z.string().optional(),
  path: z.string().optional(),
});
export type FidelityFinding = z.infer<typeof FidelityFindingSchema>;

export const FidelityReportSchema = z.object({
  findings: z.array(FidelityFindingSchema).default([]),
});
export type FidelityReport = z.infer<typeof FidelityReportSchema>;

export const CompileDiagnosticSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().optional(),
});
export type CompileDiagnostic = z.infer<typeof CompileDiagnosticSchema>;

export const EffectSummarySchema = z.object({
  reads: z.number().int().nonnegative().default(0),
  mutations: z.number().int().nonnegative().default(0),
  sends: z.number().int().nonnegative().default(0),
  destructive: z.number().int().nonnegative().default(0),
  outboundHosts: z.array(z.string()).default([]),
});
export type EffectSummary = z.infer<typeof EffectSummarySchema>;

// ---------------------------------------------------------------------------
// Plan nodes. InvokeNode describes the EFFECT (via a capability binding ref),
// never the source ecosystem — there is no ArazzoStep/PiAgentStep here.
// ---------------------------------------------------------------------------

const NodeBase = {
  id: z.string().min(1),
  /** Next node in sequence; omitted = branch/plan terminates successfully. */
  next: z.string().optional(),
};

export const InvokeNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("invoke"),
  /** CapabilityRequirement id this invoke dispatches through. */
  binding: z.string().min(1),
  input: ExpressionSchema,
  retry: RetryPolicySchema.optional(),
  timeoutSeconds: z.number().positive().optional(),
  effect: SideEffectSchema,
  idempotency: IdempotencyPolicySchema.optional(),
  /** Require a digest-bound approval before this effect executes. */
  approval: z.enum(["none", "business-effect"]).default("none"),
  onError: z.string().optional(),
});
export type InvokeNode = z.infer<typeof InvokeNodeSchema>;

export const ChoiceNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("choice"),
  choices: z
    .array(z.object({ when: ExpressionSchema, then: z.string().min(1) }))
    .min(1),
  otherwise: z.string().optional(),
});
export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>;

export const ParallelNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("parallel"),
  /** Each branch is a subgraph entry; all branches must complete (join=all). */
  branches: z.array(z.object({ entryNodeId: z.string().min(1) })).min(1),
});
export type ParallelNode = z.infer<typeof ParallelNodeSchema>;

export const ForEachNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("forEach"),
  items: ExpressionSchema,
  /** Subgraph entry executed per item; item exposed as this node's output slot `item`. */
  bodyEntryNodeId: z.string().min(1),
  maxConcurrency: z.number().int().positive().default(1),
});
export type ForEachNode = z.infer<typeof ForEachNodeSchema>;

export const LoopNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("loop"),
  bodyEntryNodeId: z.string().min(1),
  /** Loop continues while this evaluates true; iterations bounded by budgets. */
  continueWhile: ExpressionSchema.optional(),
  maxIterations: z.number().int().positive(),
});
export type LoopNode = z.infer<typeof LoopNodeSchema>;

export const WaitNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("wait"),
  seconds: z.number().positive(),
});
export type WaitNode = z.infer<typeof WaitNodeSchema>;

export const SignalNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("signal"),
  /** Stable suffix; runtime scopes the hook token to the run. */
  signalName: z.string().min(1),
});
export type SignalNode = z.infer<typeof SignalNodeSchema>;

export const ApprovalNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("approval"),
  plane: z.enum(["business-effect", "policy-expansion"]),
  /** What is being approved — digest-bound at runtime. */
  subject: ExpressionSchema,
  expiresSeconds: z.number().positive().optional(),
});
export type ApprovalNode = z.infer<typeof ApprovalNodeSchema>;

export const ChildWorkflowNodeSchema = z.object({
  ...NodeBase,
  kind: z.literal("childWorkflow"),
  /** Inline, already-compiled subplan (its own digest/budgets/audit identity). */
  plan: z.lazy(() => ExecutionPlanV1Schema),
  input: ExpressionSchema,
});
export type ChildWorkflowNode = z.infer<typeof ChildWorkflowNodeSchema>;

export const SucceedNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("succeed"),
  output: ExpressionSchema.optional(),
});
export type SucceedNode = z.infer<typeof SucceedNodeSchema>;

export const FailNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("fail"),
  error: z.string().min(1),
  message: z.string().optional(),
});
export type FailNode = z.infer<typeof FailNodeSchema>;

export const PlanNodeSchema: z.ZodType<PlanNode> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    InvokeNodeSchema,
    ChoiceNodeSchema,
    ParallelNodeSchema,
    ForEachNodeSchema,
    LoopNodeSchema,
    WaitNodeSchema,
    SignalNodeSchema,
    ApprovalNodeSchema,
    ChildWorkflowNodeSchema,
    SucceedNodeSchema,
    FailNodeSchema,
  ]),
) as z.ZodType<PlanNode>;

export type PlanNode =
  | InvokeNode
  | ChoiceNode
  | ParallelNode
  | ForEachNode
  | LoopNode
  | WaitNode
  | SignalNode
  | ApprovalNode
  | ChildWorkflowNode
  | SucceedNode
  | FailNode;

export interface ExecutionPlanV1 {
  irVersion: typeof IR_VERSION;
  id: string;
  name: string;
  source: {
    format: string;
    formatVersion?: string;
    artifactDigest: string;
    entrypoint: string;
  };
  compiler: {
    name: string;
    version: string;
  };
  entryNodeId: string;
  nodes: Record<string, PlanNode>;
  capabilityRequirements: CapabilityRequirement[];
  credentialRequirements: CredentialRequirement[];
  sandboxRequirements: SandboxRequirement[];
  budgets: ExecutionBudget;
  effects: EffectSummary;
  fidelity: FidelityReport;
  diagnostics: CompileDiagnostic[];
}

export const ExecutionPlanV1Schema: z.ZodType<ExecutionPlanV1> = z.lazy(() =>
  z.object({
    irVersion: z.literal(IR_VERSION),
    id: z.string().min(1),
    name: z.string().min(1),
    source: z.object({
      format: z.string().min(1),
      formatVersion: z.string().optional(),
      artifactDigest: z.string().min(1),
      entrypoint: z.string().min(1),
    }),
    compiler: z.object({
      name: z.string().min(1),
      version: z.string().min(1),
    }),
    entryNodeId: z.string().min(1),
    nodes: z.record(z.string(), PlanNodeSchema),
    capabilityRequirements: z.array(CapabilityRequirementSchema).default([]),
    credentialRequirements: z.array(CredentialRequirementSchema).default([]),
    sandboxRequirements: z.array(SandboxRequirementSchema).default([]),
    budgets: ExecutionBudgetSchema,
    effects: EffectSummarySchema,
    fidelity: FidelityReportSchema,
    diagnostics: z.array(CompileDiagnosticSchema).default([]),
  }),
) as z.ZodType<ExecutionPlanV1>;

export type { Expression };
