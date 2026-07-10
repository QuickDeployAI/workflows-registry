import {
  errorDiagnostic,
  type Diagnostic,
} from "@quickdeployai/workflow-core";
import type { ExecutionPlanV1, PlanNode } from "./plan.js";

/**
 * Structural/semantic plan validation beyond the Zod shape:
 * - every node reference (next/then/onError/body/branch) resolves;
 * - the entry node exists;
 * - invoke bindings resolve to declared capability requirements;
 * - non-read invokes declare an idempotency policy;
 * - `not-idempotent` invokes require a digest-bound approval;
 * - loops/forEach respect the plan budgets.
 */
export function validatePlan(plan: ExecutionPlanV1): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const nodeIds = new Set(Object.keys(plan.nodes));
  const requirementIds = new Set(plan.capabilityRequirements.map((req) => req.id));

  const requireNode = (ref: string | undefined, from: string, field: string): void => {
    if (ref !== undefined && !nodeIds.has(ref)) {
      diagnostics.push(
        errorDiagnostic(
          "unknown-node-ref",
          `Node "${from}" ${field} references missing node "${ref}".`,
          from,
        ),
      );
    }
  };

  if (!nodeIds.has(plan.entryNodeId)) {
    diagnostics.push(
      errorDiagnostic("unknown-entry-node", `entryNodeId "${plan.entryNodeId}" does not exist.`),
    );
  }

  for (const [id, node] of Object.entries(plan.nodes)) {
    if (node.id !== id) {
      diagnostics.push(
        errorDiagnostic("node-id-mismatch", `Node keyed "${id}" declares id "${node.id}".`, id),
      );
    }
    if (node.kind !== "succeed" && node.kind !== "fail") {
      requireNode(node.next, id, "next");
    }

    switch (node.kind) {
      case "invoke": {
        requireNode(node.onError, id, "onError");
        if (!requirementIds.has(node.binding)) {
          diagnostics.push(
            errorDiagnostic(
              "unknown-capability-binding",
              `Invoke "${id}" binds "${node.binding}" which is not a declared capability requirement.`,
              id,
            ),
          );
        }
        if (node.effect !== "read" && !node.idempotency) {
          diagnostics.push(
            errorDiagnostic(
              "missing-idempotency-policy",
              `Invoke "${id}" has effect "${node.effect}" but no idempotency policy — durable retries are at-least-once.`,
              id,
            ),
          );
        }
        if (node.idempotency?.kind === "not-idempotent" && node.approval !== "business-effect") {
          diagnostics.push(
            errorDiagnostic(
              "not-idempotent-requires-approval",
              `Invoke "${id}" is not idempotent; it must set approval: "business-effect".`,
              id,
            ),
          );
        }
        if (node.retry && node.retry.maxAttempts > 1 && node.idempotency?.kind === "not-idempotent") {
          diagnostics.push(
            errorDiagnostic(
              "retry-on-not-idempotent",
              `Invoke "${id}" declares retries but is not idempotent.`,
              id,
            ),
          );
        }
        break;
      }
      case "choice": {
        for (const choice of node.choices) requireNode(choice.then, id, "choices.then");
        requireNode(node.otherwise, id, "otherwise");
        break;
      }
      case "parallel": {
        for (const branch of node.branches) requireNode(branch.entryNodeId, id, "branches.entry");
        if (node.branches.length > plan.budgets.maxParallelism) {
          diagnostics.push(
            errorDiagnostic(
              "parallelism-budget-exceeded",
              `Parallel "${id}" declares ${node.branches.length} branches; budget allows ${plan.budgets.maxParallelism}.`,
              id,
            ),
          );
        }
        break;
      }
      case "forEach": {
        requireNode(node.bodyEntryNodeId, id, "bodyEntryNodeId");
        if (node.maxConcurrency > plan.budgets.maxParallelism) {
          diagnostics.push(
            errorDiagnostic(
              "parallelism-budget-exceeded",
              `forEach "${id}" concurrency ${node.maxConcurrency} exceeds budget ${plan.budgets.maxParallelism}.`,
              id,
            ),
          );
        }
        break;
      }
      case "loop": {
        requireNode(node.bodyEntryNodeId, id, "bodyEntryNodeId");
        if (node.maxIterations > plan.budgets.maxIterations) {
          diagnostics.push(
            errorDiagnostic(
              "iteration-budget-exceeded",
              `Loop "${id}" allows ${node.maxIterations} iterations; budget allows ${plan.budgets.maxIterations}.`,
              id,
            ),
          );
        }
        break;
      }
      case "childWorkflow": {
        const childDiagnostics = validatePlan(node.plan);
        for (const diagnostic of childDiagnostics) {
          diagnostics.push({ ...diagnostic, path: `${id}.plan${diagnostic.path ? `.${diagnostic.path}` : ""}` });
        }
        if (node.plan.budgets.maxDepth >= plan.budgets.maxDepth) {
          diagnostics.push(
            errorDiagnostic(
              "depth-budget-exceeded",
              `Child plan of "${id}" must have a strictly smaller maxDepth than its parent.`,
              id,
            ),
          );
        }
        break;
      }
      default:
        break;
    }
  }

  return diagnostics;
}

/**
 * Count effect classes across invoke nodes (for EffectSummary), including
 * embedded child plans — inline children execute under the parent
 * installation, so their effects are part of the parent's requested intent.
 */
export function summarizeEffects(nodes: Record<string, PlanNode>): {
  reads: number;
  mutations: number;
  sends: number;
  destructive: number;
} {
  const summary = { reads: 0, mutations: 0, sends: 0, destructive: 0 };
  for (const node of Object.values(nodes)) {
    if (node.kind === "childWorkflow") {
      const child = summarizeEffects(node.plan.nodes);
      summary.reads += child.reads;
      summary.mutations += child.mutations;
      summary.sends += child.sends;
      summary.destructive += child.destructive;
      continue;
    }
    if (node.kind !== "invoke") continue;
    if (node.effect === "read") summary.reads += 1;
    else if (node.effect === "mutation") summary.mutations += 1;
    else if (node.effect === "send") summary.sends += 1;
    else summary.destructive += 1;
  }
  return summary;
}
