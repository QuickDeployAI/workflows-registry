import type { PolicyEngine } from "@quickdeployai/workflow-policy";
import { denyAllPolicyEngine } from "@quickdeployai/workflow-policy";
import { createFileArtifactStore, type ArtifactStore } from "./artifact-store.js";
import { createFileAuditSink, type AuditSink } from "./audit.js";

/**
 * Runtime services consumed by the static step executors. Steps run with
 * full Node access in the step runtime; tests and hosts configure these
 * before starting runs. Defaults FAIL CLOSED: deny-all policy, no MCP
 * client, no agent runtime, no sandbox.
 */
export interface McpToolClient {
  callTool(implementationId: string, toolName: string, args: unknown): Promise<unknown>;
}

export interface AgentTurnResult {
  kind: "final" | "actions";
  output?: unknown;
  actions?: Array<{ requirementId: string; operation: string; input: unknown }>;
}

export interface AgentRuntime {
  createSession(config: { agent: string; task: string; sessionKey: string }): Promise<{ sessionId: string }>;
  nextTurn(session: { sessionId: string }, context: unknown): Promise<AgentTurnResult>;
  appendToolResult(session: { sessionId: string }, result: unknown): Promise<void>;
  cancel(session: { sessionId: string }): Promise<void>;
}

export interface SandboxLease {
  leaseId: string;
}

export interface SandboxBackend {
  createLease(request: { image?: string; snapshot?: string }): Promise<SandboxLease>;
  execute(
    lease: SandboxLease,
    action: { command: string; args?: string[] },
  ): Promise<{ exitCode: number; stdout: string; stderr: string }>;
  snapshot(lease: SandboxLease): Promise<{ artifactRef: string }>;
  restore(snapshot: { artifactRef: string }): Promise<SandboxLease>;
  destroy(lease: SandboxLease): Promise<void>;
}

export interface KernelServices {
  fetchImpl: typeof fetch;
  policyEngine: PolicyEngine;
  artifactStore: ArtifactStore;
  auditSink: AuditSink;
  mcpClient?: McpToolClient;
  agentRuntime?: AgentRuntime;
  sandboxBackend?: SandboxBackend;
  /** Values redacted from every plan/log/audit/error boundary. */
  secretValues: string[];
  /** Resolves credential handles (env names) to header values — never logged. */
  resolveCredential?: (handle: string) => string | undefined;
  /** Test-only crash injection (e.g. after an external effect landed). */
  faultInjector?: (context: { nodeId: string; attempt: number; phase: string }) => void;
}

// Steps execute from a separately bundled module graph (the step bundle
// inlines this file), so module-level state would NOT be shared with test
// or host code. The registry therefore lives on globalThis, which is shared
// across bundles within one process.
const REGISTRY_KEY = Symbol.for("ai.quickdeploy.workflows/kernel-services");

type GlobalWithRegistry = typeof globalThis & {
  [REGISTRY_KEY]?: KernelServices;
};

export function configureKernel(overrides: Partial<KernelServices>): KernelServices {
  const dataDir = process.env.QD_KERNEL_DATA_DIR ?? ".workflow-data";
  const services: KernelServices = {
    fetchImpl: fetch,
    policyEngine: denyAllPolicyEngine(),
    artifactStore: createFileArtifactStore(`${dataDir}/artifacts`),
    auditSink: createFileAuditSink(`${dataDir}/audit`),
    secretValues: [],
    ...overrides,
  };
  (globalThis as GlobalWithRegistry)[REGISTRY_KEY] = services;
  return services;
}

export function getKernelServices(): KernelServices {
  return (globalThis as GlobalWithRegistry)[REGISTRY_KEY] ?? configureKernel({});
}

export function resetKernel(): void {
  delete (globalThis as GlobalWithRegistry)[REGISTRY_KEY];
}
