import { FatalError } from "workflow";
import { contentDigest, redactSecrets, redactSecretsDeep } from "@quickdeployai/workflow-core";
import type { CapabilityRequirement } from "@quickdeployai/workflow-ir";
import type { CapabilityBinding } from "@quickdeployai/workflow-capabilities";
import type { CapabilityAction, RuntimeDecision } from "@quickdeployai/workflow-policy";
import { getKernelServices } from "../src/services.js";
import type { AuditEvent } from "../src/audit.js";

/**
 * The static durable executor surface. This registry is CLOSED: imported
 * plans supply data to these steps; they never generate executable code.
 * Every effectful dispatch is policy-mediated and audited.
 */

export interface HttpArgs {
  path?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface DispatchRequest {
  runId: string;
  planDigest: string;
  /** Digest governed by the effective policy (root installation plan). */
  policyDigest: string;
  nodeId: string;
  attempt: number;
  /** Loop/forEach iteration path — part of the stable execution identity. */
  iterationKey: string;
  subject: string;
  requirement: CapabilityRequirement;
  binding: CapabilityBinding;
  args: unknown;
  idempotency?:
    | { kind: "provider-key"; keyValue: string }
    | { kind: "lookup-before-create"; lookupRequirement: CapabilityRequirement; lookupBinding: CapabilityBinding }
    | { kind: "deduplication-record"; namespace: string }
    | { kind: "reconciliation"; verifyRequirement: CapabilityRequirement; verifyBinding: CapabilityBinding }
    | { kind: "not-idempotent" };
  /** Digest the approver saw; dispatch re-derives and compares (TOCTOU-safe). */
  approvedArgumentsDigest?: string;
}

export async function computeActionDigest(value: unknown): Promise<string> {
  "use step";
  return contentDigest(value);
}
computeActionDigest.maxRetries = 3;

export async function recordAuditEvent(event: Omit<AuditEvent, "at">): Promise<void> {
  "use step";
  const services = getKernelServices();
  await services.auditSink.append({ ...event, at: new Date().toISOString() });
}
recordAuditEvent.maxRetries = 3;

export async function evaluateRuntimePolicy(
  action: Omit<CapabilityAction, "argumentsDigest"> & { args: unknown },
): Promise<RuntimeDecision & { argumentsDigest: string }> {
  "use step";
  const services = getKernelServices();
  const { args, ...rest } = action;
  const argumentsDigest = contentDigest(args);
  const decision = services.policyEngine.evaluate({ ...rest, argumentsDigest });
  await services.auditSink.append({
    at: new Date().toISOString(),
    runId: action.runId,
    planDigest: action.planDigest,
    type: "policy-decision",
    nodeId: action.requirementId,
    detail: { decision: decision.decision, reason: decision.reason, argumentsDigest, operation: action.operation },
  });
  return { ...decision, argumentsDigest };
}
evaluateRuntimePolicy.maxRetries = 3;

export async function readArtifact(ref: string): Promise<string | undefined> {
  "use step";
  const bytes = await getKernelServices().artifactStore.get(ref);
  return bytes === undefined ? undefined : new TextDecoder().decode(bytes);
}
readArtifact.maxRetries = 3;

export async function writeArtifact(content: string): Promise<{ ref: string }> {
  "use step";
  return getKernelServices().artifactStore.put(content);
}
writeArtifact.maxRetries = 3;

/**
 * The single mediated dispatch path for every capability effect.
 * maxRetries = 0: the interpreter owns retries per the node's RetryPolicy,
 * so retry counting stays deterministic and idempotency-aware.
 */
export async function dispatchCapability(request: DispatchRequest): Promise<unknown> {
  "use step";
  const services = getKernelServices();
  const executionKey = `${request.runId}:${request.nodeId}:${request.iterationKey}`;

  const argumentsDigest = contentDigest(request.args);
  const action: CapabilityAction = {
    subject: request.subject,
    requirementId: request.requirement.id,
    protocol: request.requirement.protocol,
    operation: request.requirement.operation,
    effect: request.requirement.effect,
    argumentsDigest,
    planDigest: request.policyDigest,
    runId: request.runId,
    ...(hostOf(request.binding.endpoint) === undefined ? {} : { host: hostOf(request.binding.endpoint) as string }),
    ...(request.binding.credentialHandle === undefined
      ? {}
      : { credentialHandle: request.binding.credentialHandle }),
  };

  const decision = services.policyEngine.evaluate(action);
  await audit(services, request, "policy-decision", {
    decision: decision.decision,
    reason: decision.reason,
    argumentsDigest,
  });

  if (decision.decision === "deny") {
    throw new FatalError(`Policy denied ${request.requirement.operation}: ${decision.reason}`);
  }
  if (decision.decision === "approval-required") {
    // TOCTOU protection: the approval is only valid for EXACTLY these
    // arguments — recomputed here from what will actually execute.
    if (request.approvedArgumentsDigest !== argumentsDigest) {
      throw new FatalError(
        `Approval missing or stale for ${request.requirement.operation}: approved digest ${request.approvedArgumentsDigest ?? "<none>"} != actual ${argumentsDigest}.`,
      );
    }
  }

  // Idempotency for at-least-once dispatch.
  const idempotency = request.idempotency;
  if (idempotency?.kind === "deduplication-record") {
    const existing = await services.artifactStore.getRecord(idempotency.namespace, executionKey);
    if (existing !== undefined) {
      await audit(services, request, "capability-call", { deduplicated: true });
      return (existing as { result: unknown }).result;
    }
  }
  if (idempotency?.kind === "lookup-before-create") {
    const found = await executeProtocol(
      services,
      idempotency.lookupRequirement,
      idempotency.lookupBinding,
      request.args,
      undefined,
    );
    if (found !== null && found !== undefined && !(typeof found === "object" && emptyish(found))) {
      await audit(services, request, "capability-call", { lookupHit: true });
      return found;
    }
  }

  const result = await executeProtocol(
    services,
    request.requirement,
    request.binding,
    request.args,
    idempotency?.kind === "provider-key" ? idempotency.keyValue : undefined,
  );

  if (idempotency?.kind === "deduplication-record") {
    await services.artifactStore.putRecord(idempotency.namespace, executionKey, { result });
  }
  if (idempotency?.kind === "reconciliation") {
    await executeProtocol(
      services,
      idempotency.verifyRequirement,
      idempotency.verifyBinding,
      request.args,
      undefined,
    );
  }

  await audit(services, request, "capability-call", {
    operation: request.requirement.operation,
    effect: request.requirement.effect,
    argumentsDigest,
  });

  // Test-only fault injection point: simulates a crash AFTER the external
  // effect (and dedup record) landed but before the step returned.
  services.faultInjector?.({ nodeId: request.nodeId, attempt: request.attempt, phase: "post-effect" });

  return redactSecretsDeep(result, services.secretValues);
}
dispatchCapability.maxRetries = 0;

function emptyish(value: object): boolean {
  return Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0;
}

function hostOf(endpoint: string | undefined): string | undefined {
  if (!endpoint) return undefined;
  try {
    return new URL(endpoint).host;
  } catch {
    return undefined;
  }
}

async function audit(
  services: ReturnType<typeof getKernelServices>,
  request: DispatchRequest,
  type: AuditEvent["type"],
  detail: Record<string, unknown>,
): Promise<void> {
  await services.auditSink.append({
    at: new Date().toISOString(),
    runId: request.runId,
    planDigest: request.planDigest,
    type,
    nodeId: request.nodeId,
    attempt: request.attempt,
    detail,
  });
}

async function executeProtocol(
  services: ReturnType<typeof getKernelServices>,
  requirement: CapabilityRequirement,
  binding: CapabilityBinding,
  args: unknown,
  providerIdempotencyKey: string | undefined,
): Promise<unknown> {
  switch (requirement.protocol) {
    case "http":
    case "openapi": {
      if (!binding.endpoint) {
        throw new FatalError(`Binding for ${requirement.id} has no endpoint.`);
      }
      const httpArgs = (args ?? {}) as HttpArgs;
      const [method = "GET", operationPath = "/"] = requirement.operation.split(" ");
      const url = new URL(httpArgs.path ?? operationPath, binding.endpoint);
      for (const [key, value] of Object.entries(httpArgs.query ?? {})) {
        url.searchParams.set(key, value);
      }
      const headers: Record<string, string> = { ...httpArgs.headers };
      if (providerIdempotencyKey) headers["Idempotency-Key"] = providerIdempotencyKey;
      if (binding.credentialHandle) {
        const secret = services.resolveCredential?.(binding.credentialHandle);
        if (!secret) {
          throw new FatalError(`Credential handle ${binding.credentialHandle} is not resolvable.`);
        }
        headers.Authorization = `Bearer ${secret}`;
      }
      const hasBody = httpArgs.body !== undefined;
      if (hasBody) headers["content-type"] = "application/json";
      const response = await services.fetchImpl(url, {
        method,
        headers,
        ...(hasBody ? { body: JSON.stringify(httpArgs.body) } : {}),
      });
      const text = await response.text();
      if (!response.ok) {
        const safe = redactSecrets(text.slice(0, 500), services.secretValues);
        throw new Error(`HTTP ${response.status} for ${requirement.operation}: ${safe}`);
      }
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return text;
      }
    }
    case "mcp": {
      if (!services.mcpClient) throw new FatalError("No MCP client configured.");
      if (!binding.toolName) throw new FatalError(`MCP binding ${requirement.id} has no toolName.`);
      return services.mcpClient.callTool(binding.implementationId, binding.toolName, args);
    }
    case "artifact": {
      const store = services.artifactStore;
      if (requirement.operation === "write") {
        return store.put(typeof args === "string" ? args : JSON.stringify(args));
      }
      const bytes = await store.get(String((args as { ref?: string })?.ref ?? args));
      return bytes === undefined ? undefined : new TextDecoder().decode(bytes);
    }
    case "sandbox": {
      if (!services.sandboxBackend) throw new FatalError("No sandbox backend configured.");
      const lease = await services.sandboxBackend.createLease({});
      try {
        const commandArgs = args as { command: string; args?: string[] };
        return await services.sandboxBackend.execute(lease, commandArgs);
      } finally {
        await services.sandboxBackend.destroy(lease);
      }
    }
    case "agent":
      throw new FatalError(
        "Agent turns are dispatched through the mediated agent-turn loop, not raw invoke.",
      );
    default:
      throw new FatalError(`Unknown capability protocol ${requirement.protocol as string}.`);
  }
}
