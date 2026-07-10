import { errorDiagnostic, type Diagnostic } from "@quickdeployai/workflow-core";
import {
  buildPlan,
  validatePlan,
  type CapabilityRequirement,
  type PlanNode,
} from "@quickdeployai/workflow-ir";
import {
  FidelityCollector,
  entrypointFile,
  parseJsonSafe,
  type CompileResult,
  type ParseOutcome,
  type SourceArtifact,
  type ValidationReport,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { z } from "zod";

export const ENGINE = "pi-agents-2-workflows";

// ---------------------------------------------------------------------------
// Model — Pi Agents canonical workflow JSON (spawn/sequence/fork/join/loop
// with explicit budgets). Agent-specific structures compile to GENERIC
// primitives: spawn → invoke through an `agent` capability requirement,
// fork/join → parallel, bounded loop → loop.
// ---------------------------------------------------------------------------

interface PiNode {
  type: "sequence" | "spawn" | "fork" | "loop";
  id?: string;
  agent?: string;
  task?: string;
  children?: PiNode[];
  join?: { id: string };
  body?: PiNode;
  maxIterations?: number;
  until?: string;
}

const PiNodeSchema: z.ZodType<PiNode> = z.lazy(() =>
  z.object({
    type: z.enum(["sequence", "spawn", "fork", "loop"]),
    id: z.string().optional(),
    agent: z.string().optional(),
    task: z.string().optional(),
    children: z.array(PiNodeSchema).optional(),
    join: z.object({ id: z.string() }).optional(),
    body: PiNodeSchema.optional(),
    maxIterations: z.number().int().positive().optional(),
    until: z.string().optional(),
  }),
) as z.ZodType<PiNode>;

const PiWorkflowSchema = z.object({
  piAgentsWorkflow: z.string(),
  name: z.string(),
  budgets: z.object({
    maxIterations: z.number().int().positive(),
    maxParallelism: z.number().int().positive(),
    maxDepth: z.number().int().positive(),
    maxChildren: z.number().int().positive(),
  }),
  root: PiNodeSchema,
});

export type PiWorkflow = z.infer<typeof PiWorkflowSchema>;

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------


/** Deterministically assign ids to unnamed container nodes (pre-order). */
function withIds(root: PiNode): PiNode {
  let counter = 0;
  const clone = (node: PiNode): PiNode => ({
    ...node,
    id: node.id ?? `__pi${(counter += 1)}`,
    ...(node.children ? { children: node.children.map(clone) } : {}),
    ...(node.body ? { body: clone(node.body) } : {}),
  });
  return clone(root);
}

export const piAgentsImporter: WorkflowImporter<PiWorkflow> = {
  id: ENGINE,
  supportedVersions: ["1.0"],
  declaredConformance: 4,

  async detect(artifact: SourceArtifact) {
    try {
      const doc = parseJsonSafe(entrypointFile(artifact).text) as Record<string, unknown> | null;
      if (doc && typeof doc.piAgentsWorkflow === "string") {
        return { detected: true, confidence: "exact" as const, formatVersion: doc.piAgentsWorkflow };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<PiWorkflow>> {
    let raw: unknown;
    try {
      raw = parseJsonSafe(entrypointFile(artifact).text);
    } catch (error) {
      return {
        ok: false,
        diagnostics: [errorDiagnostic("parse-failed", error instanceof Error ? error.message : String(error))],
      };
    }
    const parsed = PiWorkflowSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        diagnostics: parsed.error.issues.map((issue) =>
          errorDiagnostic("schema-violation", issue.message, issue.path.join(".")),
        ),
      };
    }
    return { ok: true, model: parsed.data, diagnostics: [] };
  },

  async validate(model, _context): Promise<ValidationReport> {
    const diagnostics: Diagnostic[] = [];
    const seen = new Set<string>();

    const walk = (node: PiNode, depth: number): void => {
      const nodeId = node.id as string;
      if (seen.has(nodeId)) {
        diagnostics.push(errorDiagnostic("duplicate-node-id", `Node id "${nodeId}" is reused.`, nodeId));
      }
      seen.add(nodeId);
      if (depth > model.budgets.maxDepth) {
        diagnostics.push(
          errorDiagnostic("depth-budget-exceeded", `Node "${nodeId}" nests deeper than maxDepth.`, nodeId),
        );
      }
      if (node.type === "spawn" && (!node.agent || !node.task)) {
        diagnostics.push(
          errorDiagnostic("invalid-spawn", `Spawn "${nodeId}" must declare agent and task.`, nodeId),
        );
      }
      if (node.type === "loop") {
        if (!node.body) {
          diagnostics.push(errorDiagnostic("invalid-loop", `Loop "${nodeId}" has no body.`, nodeId));
        }
        if (!node.maxIterations) {
          // Unbounded loops are compile ERRORS, not runtime surprises.
          diagnostics.push(
            errorDiagnostic("unbounded-loop", `Loop "${nodeId}" must declare maxIterations.`, nodeId),
          );
        } else if (node.maxIterations > model.budgets.maxIterations) {
          diagnostics.push(
            errorDiagnostic(
              "iteration-budget-exceeded",
              `Loop "${nodeId}" exceeds budgets.maxIterations.`,
              nodeId,
            ),
          );
        }
      }
      if (node.type === "fork") {
        if ((node.children?.length ?? 0) > model.budgets.maxParallelism) {
          diagnostics.push(
            errorDiagnostic(
              "parallelism-budget-exceeded",
              `Fork "${nodeId}" exceeds budgets.maxParallelism.`,
              nodeId,
            ),
          );
        }
      }
      for (const child of node.children ?? []) walk(child, depth + 1);
      if (node.body) walk(node.body, depth + 1);
    };
    walk(withIds(model.root), 1);
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements = new Map<string, CapabilityRequirement>();
    const nodes: PlanNode[] = [];

    const agentRequirement = (agent: string): string => {
      const id = `agent:${agent}`;
      if (!requirements.has(id)) {
        requirements.set(id, {
          id,
          protocol: "agent",
          provider: "agent-runtime",
          operation: agent,
          requiredScopes: [],
          effect: "send",
        });
      }
      return id;
    };

    /** Compile a Pi node into a subgraph; returns its entry node id. */
    const compileNode = (node: PiNode, next: string | undefined): string => {
      const nodeId = node.id as string;
      switch (node.type) {
        case "spawn": {
          nodes.push({
            id: nodeId,
            kind: "invoke",
            binding: agentRequirement(node.agent as string),
            input: {
              kind: "object",
              entries: {
                agent: { kind: "literal", value: node.agent },
                task: { kind: "literal", value: node.task },
              },
            },
            effect: "send",
            approval: "none",
            idempotency: { kind: "deduplication-record", namespace: `${context.planId}:agent-sessions` },
            ...(next === undefined ? {} : { next }),
          });
          fidelity.exact("spawn", nodeId);
          return nodeId;
        }
        case "sequence": {
          const children = node.children ?? [];
          let downstream = next;
          let entry = next ?? "__succeed";
          for (let index = children.length - 1; index >= 0; index -= 1) {
            entry = compileNode(children[index] as PiNode, downstream);
            downstream = entry;
          }
          fidelity.exact("sequence", nodeId);
          return entry;
        }
        case "fork": {
          const branchEntries = (node.children ?? []).map((child) => ({
            entryNodeId: compileNode(child, undefined),
          }));
          nodes.push({
            id: nodeId,
            kind: "parallel",
            branches: branchEntries,
            ...(next === undefined ? {} : { next }),
          });
          fidelity.exact("fork-join", node.join ? `${nodeId}→${node.join.id}` : nodeId);
          return nodeId;
        }
        case "loop": {
          const bodyEntry = compileNode(node.body as PiNode, undefined);
          if (node.until) {
            fidelity.approximated(
              "loop-until",
              `Until-condition "${node.until}" is agent-evaluated; the loop runs its bounded iterations.`,
              nodeId,
            );
          }
          nodes.push({
            id: nodeId,
            kind: "loop",
            bodyEntryNodeId: bodyEntry,
            maxIterations: node.maxIterations as number,
            ...(next === undefined ? {} : { next }),
          });
          fidelity.exact("bounded-loop", nodeId);
          return nodeId;
        }
      }
    };

    const entry = compileNode(withIds(model.root), "__succeed");
    nodes.push({ id: "__succeed", kind: "succeed" });

    if (fidelity.hasBlocking()) {
      return {
        diagnostics: [
          {
            severity: "error",
            code: "fidelity-blocking",
            message: "Unsupported constructs affect execution; see the fidelity report.",
          },
        ],
        fidelity: fidelity.report(),
        requirements: [...requirements.values()],
      };
    }

    const plan = buildPlan({
      id: context.planId,
      name: context.planName,
      source: {
        format: ENGINE,
        formatVersion: model.piAgentsWorkflow,
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId: entry,
      nodes,
      capabilityRequirements: [...requirements.values()],
      budgets: { ...model.budgets, ...context.budgets },
      fidelity: fidelity.report(),
    });

    const planDiagnostics = validatePlan(plan).map((diagnostic) => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
      ...(diagnostic.path === undefined ? {} : { path: diagnostic.path }),
    }));

    return {
      plan,
      diagnostics: planDiagnostics,
      fidelity: fidelity.report(),
      requirements: [...requirements.values()],
    };
  },
};

export default piAgentsImporter;
