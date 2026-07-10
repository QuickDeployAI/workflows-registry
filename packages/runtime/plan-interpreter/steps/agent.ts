import { FatalError } from "workflow";
import type { AgentTurnContext, AgentTurnResult } from "@quickdeployai/agent-runtime";
import {
  createPinnedResolver,
  ingestSourceFiles,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import {
  ExecutionPlanV1Schema,
  computePlanDigest,
  validatePlan,
  type ExecutionBudget,
  type ExecutionPlanV1,
} from "@quickdeployai/workflow-ir";
import { arazzoImporter } from "@quickdeployai/arazzo-2-workflows";
import { piAgentsImporter } from "@quickdeployai/pi-agents-2-workflows";
import { serverlessWorkflowImporter } from "@quickdeployai/serverless-workflow-2-workflows";
import { getKernelServices } from "../src/services.js";

/**
 * Agent steps for the mediated turn loop. Agents run OUTSIDE the durability
 * boundary of tools: each turn is one durable step, and every proposed tool
 * action is separately policy-checked, approved, and dispatched by the
 * interpreter — never executed inside an opaque agent step.
 */

export interface AgentStepIdentity {
  runId: string;
  planDigest: string;
  nodeId: string;
}

export async function agentCreateSession(
  request: AgentStepIdentity & { agent: string; task: string; sessionKey: string },
): Promise<{ sessionId: string }> {
  "use step";
  const services = getKernelServices();
  if (!services.agentRuntime) {
    throw new FatalError("No AgentRuntime configured; agent plans fail closed.");
  }
  const session = await services.agentRuntime.createSession({
    agent: request.agent,
    task: request.task,
    sessionKey: request.sessionKey,
  });
  await services.auditSink.append({
    at: new Date().toISOString(),
    runId: request.runId,
    planDigest: request.planDigest,
    type: "agent-turn",
    nodeId: request.nodeId,
    agentSessionId: session.sessionId,
    detail: { phase: "session-created", agent: request.agent, sessionKey: request.sessionKey },
  });
  return session;
}
agentCreateSession.maxRetries = 3;

export async function agentNextTurn(
  request: AgentStepIdentity & { sessionId: string; context: AgentTurnContext },
): Promise<AgentTurnResult> {
  "use step";
  const services = getKernelServices();
  if (!services.agentRuntime) {
    throw new FatalError("No AgentRuntime configured; agent plans fail closed.");
  }
  const result = await services.agentRuntime.nextTurn(
    { sessionId: request.sessionId },
    request.context,
  );
  await services.auditSink.append({
    at: new Date().toISOString(),
    runId: request.runId,
    planDigest: request.planDigest,
    type: "agent-turn",
    nodeId: request.nodeId,
    agentSessionId: request.sessionId,
    detail: {
      phase: "turn",
      turn: request.context.turn,
      kind: result.kind,
      ...(result.kind === "actions" ? { proposedActions: result.actions.length } : {}),
    },
  });
  return result;
}
agentNextTurn.maxRetries = 3;

export async function agentAppendToolResult(request: {
  sessionId: string;
  result: unknown;
}): Promise<void> {
  "use step";
  const services = getKernelServices();
  if (!services.agentRuntime) {
    throw new FatalError("No AgentRuntime configured; agent plans fail closed.");
  }
  await services.agentRuntime.appendToolResult({ sessionId: request.sessionId }, request.result);
}
agentAppendToolResult.maxRetries = 3;

const SUBPLAN_IMPORTERS: ReadonlyArray<WorkflowImporter<unknown>> = [
  arazzoImporter as WorkflowImporter<unknown>,
  serverlessWorkflowImporter as WorkflowImporter<unknown>,
  piAgentsImporter as WorkflowImporter<unknown>,
];

/**
 * Bounded dynamic subplans: an agent may PROPOSE a subplan in a supported
 * source format; it never mutates the executing graph. The proposal goes
 * through the full pipeline — validate → compile → structural checks →
 * digest — and the child executes under the parent's installation policy
 * with strictly smaller budgets.
 */
export async function compileSubplanProposal(
  request: AgentStepIdentity & {
    proposal: {
      format: string;
      files: Array<{ path: string; text: string }>;
      entrypoint: string;
      config?: Record<string, unknown>;
    };
    parentBudgets: ExecutionBudget;
  },
): Promise<{ plan: ExecutionPlanV1; childPlanDigest: string }> {
  "use step";
  const importer = SUBPLAN_IMPORTERS.find((candidate) => candidate.id === request.proposal.format);
  if (!importer) {
    throw new FatalError(
      `Proposed subplan format "${request.proposal.format}" is not a supported source format.`,
    );
  }
  const artifact = ingestSourceFiles(request.proposal.files, {
    entrypoint: request.proposal.entrypoint,
    declaredFormat: request.proposal.format,
  });
  const resolver = createPinnedResolver({ files: request.proposal.files });
  const parsed = await importer.parse(artifact, { resolver, config: request.proposal.config ?? {} });
  if (!parsed.ok) {
    throw new FatalError(
      `Proposed subplan failed to parse: ${parsed.diagnostics.map((d) => d.message).join("; ")}`,
    );
  }
  const validation = await importer.validate(parsed.model, {
    resolver,
    config: request.proposal.config ?? {},
  });
  if (!validation.valid) {
    throw new FatalError(
      `Proposed subplan failed validation: ${validation.diagnostics.map((d) => d.message).join("; ")}`,
    );
  }
  const parent = request.parentBudgets;
  const compiled = await importer.compile(parsed.model, {
    planId: `${request.nodeId}:subplan`,
    planName: `${request.nodeId} dynamic subplan`,
    artifactDigest: artifact.digest,
    entrypoint: request.proposal.entrypoint,
    config: request.proposal.config ?? {},
    // Children always shrink the budgets — no unbounded child workflows.
    budgets: {
      maxIterations: Math.max(1, Math.min(parent.maxIterations - 1, parent.maxIterations)),
      maxParallelism: parent.maxParallelism,
      maxDepth: Math.max(1, parent.maxDepth - 1),
      maxChildren: Math.max(1, parent.maxChildren - 1),
    },
    resolver,
  });
  if (!compiled.plan) {
    throw new FatalError(
      `Proposed subplan failed to compile: ${compiled.diagnostics.map((d) => d.message).join("; ")}`,
    );
  }
  const plan = ExecutionPlanV1Schema.parse(compiled.plan);
  const structural = validatePlan(plan);
  if (structural.length > 0) {
    throw new FatalError(
      `Proposed subplan is structurally invalid: ${structural.map((d) => d.message).join("; ")}`,
    );
  }
  const services = getKernelServices();
  const childPlanDigest = computePlanDigest(plan);
  await services.auditSink.append({
    at: new Date().toISOString(),
    runId: request.runId,
    planDigest: request.planDigest,
    type: "child-workflow",
    nodeId: request.nodeId,
    detail: { phase: "subplan-compiled", childPlanDigest, format: request.proposal.format },
  });
  return { plan, childPlanDigest };
}
compileSubplanProposal.maxRetries = 0;
