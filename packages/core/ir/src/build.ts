import type {
  CapabilityRequirement,
  CompileDiagnostic,
  ExecutionBudget,
  ExecutionPlanV1,
  PlanNode,
} from "./plan.js";
import { summarizeEffects } from "./validate.js";

export const DEFAULT_BUDGETS: ExecutionBudget = {
  maxIterations: 16,
  maxParallelism: 8,
  maxDepth: 4,
  maxChildren: 16,
};

export interface BuildPlanOptions {
  id: string;
  name: string;
  source: ExecutionPlanV1["source"];
  compiler: ExecutionPlanV1["compiler"];
  entryNodeId: string;
  nodes: PlanNode[];
  capabilityRequirements?: CapabilityRequirement[];
  credentialRequirements?: ExecutionPlanV1["credentialRequirements"];
  sandboxRequirements?: ExecutionPlanV1["sandboxRequirements"];
  budgets?: Partial<ExecutionBudget>;
  outboundHosts?: string[];
  fidelity?: ExecutionPlanV1["fidelity"];
  diagnostics?: CompileDiagnostic[];
}

/** Assemble an ExecutionPlanV1 with derived effect summary and defaults. */
export function buildPlan(options: BuildPlanOptions): ExecutionPlanV1 {
  const nodes = Object.fromEntries(options.nodes.map((node) => [node.id, node]));
  const effects = summarizeEffects(nodes);
  return {
    irVersion: "1",
    id: options.id,
    name: options.name,
    source: options.source,
    compiler: options.compiler,
    entryNodeId: options.entryNodeId,
    nodes,
    capabilityRequirements: options.capabilityRequirements ?? [],
    credentialRequirements: options.credentialRequirements ?? [],
    sandboxRequirements: options.sandboxRequirements ?? [],
    budgets: { ...DEFAULT_BUDGETS, ...options.budgets },
    effects: {
      reads: effects.reads,
      mutations: effects.mutations,
      sends: effects.sends,
      destructive: effects.destructive,
      outboundHosts: options.outboundHosts ?? [],
    },
    fidelity: options.fidelity ?? { findings: [] },
    diagnostics: options.diagnostics ?? [],
  };
}
