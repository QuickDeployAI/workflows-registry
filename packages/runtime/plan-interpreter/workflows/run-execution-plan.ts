import { FatalError, createHook, getWorkflowMetadata, sleep } from "workflow";
import {
  evaluateExpression,
  type EvaluationContext,
  type Expression,
} from "@quickdeployai/workflow-expressions";
import type {
  ChildWorkflowNode,
  ExecutionPlanV1,
  InvokeNode,
  PlanNode,
} from "@quickdeployai/workflow-ir";
import type { BindingLock, CapabilityBinding } from "@quickdeployai/workflow-capabilities";
import {
  computeActionDigest,
  dispatchCapability,
  evaluateRuntimePolicy,
  recordAuditEvent,
  type DispatchRequest,
} from "../steps/executors.js";
import {
  agentAppendToolResult,
  agentCreateSession,
  agentNextTurn,
  compileSubplanProposal,
} from "../steps/agent.js";

export interface RunExecutionPlanInput {
  plan: ExecutionPlanV1;
  /** Verified against the lock; identity of the immutable plan. */
  planDigest: string;
  bindings: BindingLock;
  input: unknown;
}

interface InterpreterState {
  runId: string;
  planDigest: string;
  /**
   * The digest the effective policy governs — the root installation's plan.
   * Inline child plans keep their own planDigest for audit identity but are
   * governed by the installation policy unless separately installed.
   */
  policyDigest: string;
  plan: ExecutionPlanV1;
  bindings: Map<string, CapabilityBinding>;
  outputs: Record<string, unknown>;
  depth: number;
}

class PlanFailure extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PlanFailure";
  }
}

/**
 * The generic, precompiled plan interpreter: ONE statically-compiled
 * workflow function that interprets any immutable ExecutionPlanV1.
 * Control flow runs in the deterministic workflow sandbox; every effect
 * dispatches through the closed static executor surface; approvals and
 * signals suspend on real Workflow SDK hooks; parallel branches and child
 * plans use real SDK concurrency.
 */
export async function runExecutionPlan(request: RunExecutionPlanInput): Promise<unknown> {
  "use workflow";

  const metadata = getWorkflowMetadata();
  const runId = metadata.workflowRunId;

  if (request.bindings.planDigest !== request.planDigest) {
    throw new FatalError(
      `Binding lock targets ${request.bindings.planDigest}, not plan ${request.planDigest}.`,
    );
  }

  const state: InterpreterState = {
    runId,
    planDigest: request.planDigest,
    policyDigest: request.planDigest,
    plan: request.plan,
    bindings: new Map(request.bindings.bindings.map((binding) => [binding.requirementId, binding])),
    outputs: {},
    depth: 0,
  };

  await recordAuditEvent({
    runId,
    planDigest: request.planDigest,
    type: "run-started",
    detail: { planId: request.plan.id, name: request.plan.name },
  });

  try {
    const result = await interpretGraph(state, request.plan.entryNodeId, request.input);
    await recordAuditEvent({
      runId,
      planDigest: request.planDigest,
      type: "run-completed",
      detail: {},
    });
    return result;
  } catch (error) {
    await recordAuditEvent({
      runId,
      planDigest: request.planDigest,
      type: "run-failed",
      detail: { message: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

/** Walk a node chain until a terminator; returns the last produced output. */
async function interpretGraph(
  state: InterpreterState,
  entryNodeId: string,
  input: unknown,
): Promise<unknown> {
  let nodeId: string | undefined = entryNodeId;
  let lastOutput: unknown;

  while (nodeId !== undefined) {
    const node: PlanNode | undefined = state.plan.nodes[nodeId];
    if (!node) throw new FatalError(`Plan references missing node "${nodeId}".`);
    const context: EvaluationContext = { input, nodeOutputs: state.outputs };

    switch (node.kind) {
      case "succeed":
        return node.output ? evaluateExpression(node.output, context) : lastOutput;

      case "fail":
        throw new FatalError(`${node.error}${node.message ? `: ${node.message}` : ""}`);

      case "choice": {
        let target: string | undefined;
        for (const choice of node.choices) {
          if (evaluateExpression(choice.when, context) === true) {
            target = choice.then;
            break;
          }
        }
        target ??= node.otherwise;
        if (target === undefined) {
          throw new FatalError(`Choice "${node.id}" matched no branch and has no otherwise.`);
        }
        nodeId = target;
        continue;
      }

      case "wait":
        await sleep(`${node.seconds}s`);
        state.outputs[node.id] = { waitedSeconds: node.seconds };
        break;

      case "signal": {
        const hook = createHook<unknown>({ token: `signal:${state.runId}:${node.signalName}` });
        const payload = await hook;
        state.outputs[node.id] = payload;
        break;
      }

      case "approval": {
        const subject = evaluateExpression(node.subject, context);
        state.outputs[node.id] = await runApproval(state, node.id, node.plane, subject, node.expiresSeconds);
        break;
      }

      case "parallel": {
        const results = await Promise.all(
          node.branches.map((branch) => interpretGraph(state, branch.entryNodeId, input)),
        );
        state.outputs[node.id] = results;
        break;
      }

      case "forEach": {
        const items = evaluateExpression(node.items, context);
        if (!Array.isArray(items)) {
          throw new FatalError(`forEach "${node.id}" items did not evaluate to an array.`);
        }
        const concurrency = Math.min(node.maxConcurrency, state.plan.budgets.maxParallelism);
        const results: unknown[] = [];
        for (let offset = 0; offset < items.length; offset += concurrency) {
          const chunk = items.slice(offset, offset + concurrency);
          const chunkResults = await Promise.all(
            chunk.map((item, index) =>
              interpretIteration(state, node.bodyEntryNodeId, input, node.id, {
                item,
                index: offset + index,
              }),
            ),
          );
          results.push(...chunkResults);
        }
        state.outputs[node.id] = results;
        break;
      }

      case "loop": {
        const maxIterations = Math.min(node.maxIterations, state.plan.budgets.maxIterations);
        const results: unknown[] = [];
        for (let iteration = 0; iteration < maxIterations; iteration += 1) {
          if (node.continueWhile) {
            const proceed = evaluateExpression(node.continueWhile, {
              input,
              nodeOutputs: { ...state.outputs, [node.id]: { iteration, results } },
            });
            if (proceed !== true) break;
          }
          results.push(
            await interpretIteration(state, node.bodyEntryNodeId, input, node.id, {
              iteration,
              results,
            }),
          );
        }
        state.outputs[node.id] = results;
        break;
      }

      case "childWorkflow": {
        state.outputs[node.id] = await runChildPlan(state, node, context);
        break;
      }

      case "invoke": {
        state.outputs[node.id] = await runInvoke(state, node, context);
        break;
      }
    }

    lastOutput = state.outputs[(node as { id: string }).id];
    nodeId = "next" in node ? node.next : undefined;
  }

  return lastOutput;
}

/** Iterations get an outputs overlay so concurrent bodies don't collide. */
async function interpretIteration(
  state: InterpreterState,
  bodyEntryNodeId: string,
  input: unknown,
  slotNodeId: string,
  slotValue: unknown,
): Promise<unknown> {
  const iterationState: InterpreterState = {
    ...state,
    outputs: { ...state.outputs, [slotNodeId]: slotValue },
  };
  return interpretGraph(iterationState, bodyEntryNodeId, input);
}

async function runInvoke(
  state: InterpreterState,
  node: InvokeNode,
  context: EvaluationContext,
): Promise<unknown> {
  const requirement = state.plan.capabilityRequirements.find((req) => req.id === node.binding);
  if (!requirement) throw new FatalError(`Invoke "${node.id}" has no requirement "${node.binding}".`);
  const binding = state.bindings.get(node.binding);
  if (!binding) throw new FatalError(`No binding locked for requirement "${node.binding}".`);

  const args = evaluateExpression(node.input, context);
  const iterationKey = iterationKeyOf(context);

  if (requirement.protocol === "agent") {
    // Agents never hide tool effects inside a step: the mediated turn loop
    // policy-checks, approves, and durably dispatches every proposed action.
    return runAgentLoop(state, node, requirement, binding, args, iterationKey);
  }

  // Pre-flight policy: determines whether a digest-bound approval is needed
  // before dispatch (dispatch re-evaluates — defense in depth).
  const preflight = await evaluateRuntimePolicy({
    subject: "workflow",
    requirementId: requirement.id,
    protocol: requirement.protocol,
    operation: requirement.operation,
    effect: requirement.effect,
    planDigest: state.policyDigest,
    runId: state.runId,
    ...(binding.endpoint === undefined ? {} : { host: hostOf(binding.endpoint) }),
    ...(binding.credentialHandle === undefined ? {} : { credentialHandle: binding.credentialHandle }),
    args,
  } as Parameters<typeof evaluateRuntimePolicy>[0]);

  if (preflight.decision === "deny") {
    if (node.onError) return routeError(state, node, context, `policy denied: ${preflight.reason}`);
    throw new FatalError(`Policy denied ${requirement.operation}: ${preflight.reason}`);
  }

  let approvedArgumentsDigest: string | undefined;
  if (preflight.decision === "approval-required" || node.approval === "business-effect") {
    // The approval binds to EXACTLY the arguments that will dispatch —
    // dispatch recomputes the digest over the same value (TOCTOU-safe).
    const approval = await runApproval(state, node.id, "business-effect", args, undefined);
    approvedArgumentsDigest = approval.argumentsDigest;
  }

  const maxAttempts = node.retry?.maxAttempts ?? 1;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const request: DispatchRequest = {
        runId: state.runId,
        planDigest: state.planDigest,
        policyDigest: state.policyDigest,
        nodeId: node.id,
        attempt,
        iterationKey,
        subject: "workflow",
        requirement,
        binding,
        args,
        ...(approvedArgumentsDigest === undefined ? {} : { approvedArgumentsDigest }),
        ...(await serializeIdempotency(state, node, context)),
      };
      return await dispatchCapability(request);
    } catch (error) {
      lastError = error;
      if (error instanceof FatalError || isFatalName(error)) break;
      if (attempt < maxAttempts && (node.retry?.backoffSeconds ?? 0) > 0) {
        await sleep(`${node.retry?.backoffSeconds ?? 0}s`);
      }
    }
  }

  if (node.onError) {
    return routeError(
      state,
      node,
      context,
      lastError instanceof Error ? lastError.message : String(lastError),
    );
  }
  throw lastError instanceof Error ? lastError : new FatalError(String(lastError));
}

/**
 * The mediated agent-turn loop (bounded by budgets.maxIterations):
 *   turn → final | proposed actions | proposed subplan
 *   every action: declared-requirement check → policy → (approval) → durable
 *   dispatch → result appended to the session
 *   every subplan: validate → compile → digest → bounded child interpretation
 * Session identity is stable (runId+planDigest+nodeId+iteration) so retried
 * turns reconnect to the SAME agent session.
 */
async function runAgentLoop(
  state: InterpreterState,
  node: InvokeNode,
  requirement: { id: string; operation: string },
  _binding: CapabilityBinding,
  args: unknown,
  iterationKey: string,
): Promise<unknown> {
  const task = String((args as { task?: unknown } | null)?.task ?? "");
  const agent = requirement.operation;
  const sessionKey = `${state.runId}:${state.planDigest}:${node.id}:${iterationKey}`;
  const identity = { runId: state.runId, planDigest: state.planDigest, nodeId: node.id };

  const session = await agentCreateSession({ ...identity, agent, task, sessionKey });
  const toolResults: unknown[] = [];

  const maxTurns = state.plan.budgets.maxIterations;
  for (let turn = 0; turn < maxTurns; turn += 1) {
    const result = await agentNextTurn({
      ...identity,
      sessionId: session.sessionId,
      context: { task, turn, toolResults },
    });

    if (result.kind === "final") {
      return result.output;
    }

    if (result.kind === "propose-subplan") {
      if (state.depth + 1 >= state.plan.budgets.maxDepth) {
        throw new FatalError(`Agent subplan at "${node.id}" exceeds the depth budget.`);
      }
      const compiled = await compileSubplanProposal({
        ...identity,
        proposal: result.proposal,
        parentBudgets: state.plan.budgets,
      });
      const childState: InterpreterState = {
        runId: state.runId,
        planDigest: compiled.childPlanDigest,
        policyDigest: state.policyDigest,
        plan: compiled.plan,
        bindings: state.bindings,
        outputs: {},
        depth: state.depth + 1,
      };
      const childResult = await interpretGraph(childState, compiled.plan.entryNodeId, toolResults);
      await agentAppendToolResult({ sessionId: session.sessionId, result: childResult });
      toolResults.push(childResult);
      continue;
    }

    for (const [actionIndex, action] of result.actions.entries()) {
      const actionRequirement = state.plan.capabilityRequirements.find(
        (candidate) => candidate.id === action.requirementId,
      );
      if (!actionRequirement) {
        // "Add unknown tools and execute immediately" is in the not-allowed
        // list: proposals must reference DECLARED capability requirements.
        throw new FatalError(
          `Agent at "${node.id}" proposed undeclared capability "${action.requirementId}".`,
        );
      }
      const actionBinding = state.bindings.get(action.requirementId);
      if (!actionBinding) {
        throw new FatalError(
          `Agent capability "${action.requirementId}" is not bound by the installation lock.`,
        );
      }

      const preflight = await evaluateRuntimePolicy({
        subject: `agent:${agent}`,
        requirementId: actionRequirement.id,
        protocol: actionRequirement.protocol,
        operation: actionRequirement.operation,
        effect: actionRequirement.effect,
        planDigest: state.policyDigest,
        runId: state.runId,
        ...(actionBinding.endpoint === undefined ? {} : { host: hostOf(actionBinding.endpoint) }),
        ...(actionBinding.credentialHandle === undefined
          ? {}
          : { credentialHandle: actionBinding.credentialHandle }),
        args: action.input,
      } as Parameters<typeof evaluateRuntimePolicy>[0]);
      if (preflight.decision === "deny") {
        throw new FatalError(
          `Policy denied agent action ${actionRequirement.operation}: ${preflight.reason}`,
        );
      }
      let approvedArgumentsDigest: string | undefined;
      if (preflight.decision === "approval-required") {
        const approval = await runApproval(
          state,
          `${node.id}:t${turn}a${actionIndex}`,
          "business-effect",
          action.input,
          undefined,
        );
        approvedArgumentsDigest = approval.argumentsDigest;
      }

      const value = await dispatchCapability({
        runId: state.runId,
        planDigest: state.planDigest,
        policyDigest: state.policyDigest,
        nodeId: node.id,
        attempt: 1,
        iterationKey: `${iterationKey}|t${turn}a${actionIndex}`,
        subject: `agent:${agent}`,
        requirement: actionRequirement,
        binding: actionBinding,
        args: action.input,
        ...(approvedArgumentsDigest === undefined ? {} : { approvedArgumentsDigest }),
        ...(actionRequirement.effect === "read"
          ? {}
          : {
              idempotency: {
                kind: "deduplication-record" as const,
                namespace: `${state.plan.id}:agent-actions`,
              },
            }),
      });
      await agentAppendToolResult({ sessionId: session.sessionId, result: value });
      toolResults.push(value);
    }
  }

  throw new FatalError(
    `Agent loop "${node.id}" exhausted its ${maxTurns}-turn budget without a final answer.`,
  );
}

async function serializeIdempotency(
  state: InterpreterState,
  node: InvokeNode,
  context: EvaluationContext,
): Promise<Pick<DispatchRequest, "idempotency">> {
  const policy = node.idempotency;
  if (!policy) return {};
  switch (policy.kind) {
    case "provider-key":
      return {
        idempotency: {
          kind: "provider-key",
          keyValue: String(evaluateExpression(policy.key as Expression, context)),
        },
      };
    case "deduplication-record":
      return { idempotency: { kind: "deduplication-record", namespace: policy.namespace } };
    case "lookup-before-create": {
      const { requirement, binding } = resolveBinding(state, policy.lookupBinding);
      return {
        idempotency: { kind: "lookup-before-create", lookupRequirement: requirement, lookupBinding: binding },
      };
    }
    case "reconciliation": {
      const { requirement, binding } = resolveBinding(state, policy.verifyBinding);
      return {
        idempotency: { kind: "reconciliation", verifyRequirement: requirement, verifyBinding: binding },
      };
    }
    case "not-idempotent":
      return { idempotency: { kind: "not-idempotent" } };
  }
}

function resolveBinding(state: InterpreterState, requirementId: string) {
  const requirement = state.plan.capabilityRequirements.find((req) => req.id === requirementId);
  const binding = state.bindings.get(requirementId);
  if (!requirement || !binding) {
    throw new FatalError(`Idempotency helper requirement "${requirementId}" is not bound.`);
  }
  return { requirement, binding };
}

async function routeError(
  state: InterpreterState,
  node: InvokeNode,
  context: EvaluationContext,
  message: string,
): Promise<unknown> {
  state.outputs[node.id] = { error: message };
  return interpretGraph(state, node.onError as string, context.input);
}

/**
 * Digest-bound approval: the hook token embeds plan digest + node + the
 * exact argument digest. Approving a different digest, or after expiry,
 * never releases the effect. Two planes: business-effect and
 * policy-expansion.
 */
async function runApproval(
  state: InterpreterState,
  nodeId: string,
  plane: "business-effect" | "policy-expansion",
  subject: unknown,
  expiresSeconds: number | undefined,
): Promise<{ approved: true; argumentsDigest: string }> {
  const argumentsDigest = await computeActionDigest(subject);
  const token = `approval:${state.runId}:${state.planDigest}:${nodeId}:${argumentsDigest}`;

  await recordAuditEvent({
    runId: state.runId,
    planDigest: state.planDigest,
    type: "approval-requested",
    nodeId,
    detail: { plane, token, argumentsDigest },
  });

  const hook = createHook<{ approved: boolean; argumentsDigest: string }>({ token });
  let decision: { approved: boolean; argumentsDigest: string };
  if (expiresSeconds !== undefined) {
    const expiry = sleep(`${expiresSeconds}s`).then(() => "expired" as const);
    const raced = await Promise.race([hook, expiry]);
    if (raced === "expired") {
      throw new FatalError(`Approval for node "${nodeId}" expired after ${expiresSeconds}s.`);
    }
    decision = raced;
  } else {
    decision = await hook;
  }

  const resolvedDetail = {
    plane,
    approved: decision.approved,
    presented: decision.argumentsDigest,
    expected: argumentsDigest,
  };
  await recordAuditEvent({
    runId: state.runId,
    planDigest: state.planDigest,
    type: "approval-resolved",
    nodeId,
    detail: resolvedDetail,
  });

  if (!decision.approved) {
    throw new FatalError(`Approval for node "${nodeId}" was rejected.`);
  }
  if (decision.argumentsDigest !== argumentsDigest) {
    throw new FatalError(
      `Approval for node "${nodeId}" is bound to digest ${decision.argumentsDigest}, not ${argumentsDigest} — parameters changed after approval.`,
    );
  }
  return { approved: true, argumentsDigest };
}

/** Child plans run flattened with their own digest, budgets, and audit identity. */
async function runChildPlan(
  state: InterpreterState,
  node: ChildWorkflowNode,
  context: EvaluationContext,
): Promise<unknown> {
  if (state.depth + 1 >= state.plan.budgets.maxDepth) {
    throw new FatalError(`Child workflow "${node.id}" exceeds the depth budget.`);
  }
  const childDigest = await computeActionDigest(node.plan);
  await recordAuditEvent({
    runId: state.runId,
    planDigest: state.planDigest,
    type: "child-workflow",
    nodeId: node.id,
    detail: { childPlanDigest: childDigest, childPlanId: node.plan.id },
  });

  const childInput = evaluateExpression(node.input, context);
  const childState: InterpreterState = {
    runId: state.runId,
    planDigest: childDigest,
    policyDigest: state.policyDigest,
    plan: node.plan,
    bindings: state.bindings,
    outputs: {},
    depth: state.depth + 1,
  };
  return interpretGraph(childState, node.plan.entryNodeId, childInput);
}

function iterationKeyOf(context: EvaluationContext): string {
  // Iteration slots are injected into nodeOutputs overlays; derive a stable
  // key from any iteration/index markers present.
  const markers: string[] = [];
  for (const [key, value] of Object.entries(context.nodeOutputs)) {
    if (value !== null && typeof value === "object") {
      const slot = value as { iteration?: number; index?: number };
      if (typeof slot.iteration === "number") markers.push(`${key}=${slot.iteration}`);
      else if (typeof slot.index === "number") markers.push(`${key}#${slot.index}`);
    }
  }
  return markers.length === 0 ? "0" : markers.sort().join("|");
}

function hostOf(endpoint: string): string {
  return new URL(endpoint).host;
}

function isFatalName(error: unknown): boolean {
  return error instanceof Error && (error.name === "FatalError" || error.name === "PlanFailure");
}

export type { PlanFailure };
