import { spawnSync } from "node:child_process";
import { stringify as toYaml } from "yaml";
import type { EffectivePolicy } from "@quickdeployai/workflow-policy";
import type {
  SandboxAction,
  SandboxBackend,
  SandboxLease,
  SandboxRequest,
  SandboxResult,
  WorkspaceArtifactRef,
} from "@quickdeployai/workflow-sandbox";

/**
 * Product split: MXC is the sandbox/container substrate; OpenShell is the
 * policy/governance layer. Because current OpenShell functionality spans
 * both, this package exposes capability-based adapters:
 *  - renderOpenShellPolicy: effective policy → OpenShell declarative policy
 *  - createMxcSandboxBackend: SandboxBackend over `openshell mxc` isolation
 *
 * FAIL CLOSED: governed execution refuses to run when the runtime is absent
 * (mirrors MCP-Registry codegen's `openshell-mxc-only` / `fail-closed`).
 */

export function renderOpenShellPolicy(policy: EffectivePolicy): string {
  return toYaml({
    apiVersion: "openshell.nvidia.com/v1",
    kind: "Policy",
    metadata: {
      name: `workflow-${policy.planDigest.replace(/^sha256:/, "").slice(0, 12)}`,
      labels: { "ai.quickdeploy.workflows/plan-digest": policy.planDigest },
    },
    spec: {
      defaultAction: "deny",
      network: {
        outbound:
          policy.allowedHosts.length === 0
            ? { action: "deny" }
            : { action: "allowlist", hosts: policy.allowedHosts },
      },
      filesystem: {
        mode: "read-only",
        writablePaths: policy.writablePaths,
      },
      credentials: {
        rawAccess: "deny",
        handles: policy.allowedCredentials,
      },
      processes: {
        agentSessions: { max: policy.maxAgentSessions },
        childWorkflows: { max: policy.maxChildWorkflows },
      },
      effects: {
        allowed: policy.allowedEffects,
        approvalRequired: policy.approvalRequiredEffects,
      },
    },
  });
}

export class OpenShellUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenShellUnavailableError";
  }
}

export interface MxcSandboxConfig {
  /** Path to the openshell binary; defaults to OPENSHELL_BIN. */
  binary?: string;
  /** Rendered policy applied to every lease. */
  policyYaml: string;
}

/** Probe for the OpenShell/MXC runtime; adapters refuse to start without it. */
export function assertOpenShellAvailable(binary: string | undefined): string {
  const bin = binary ?? process.env.OPENSHELL_BIN;
  if (!bin) {
    throw new OpenShellUnavailableError(
      "OpenShell/MXC runtime is not configured (OPENSHELL_BIN unset); governed execution fails closed. " +
        "Use the local sandbox double only for trusted test fixtures.",
    );
  }
  const probe = spawnSync(bin, ["--version"], { encoding: "utf8" });
  if (probe.error || probe.status !== 0) {
    throw new OpenShellUnavailableError(
      `OpenShell binary "${bin}" is not runnable; refusing ungoverned execution (fail closed).`,
    );
  }
  return bin;
}

export function createMxcSandboxBackend(config: MxcSandboxConfig): SandboxBackend {
  const bin = assertOpenShellAvailable(config.binary);
  let counter = 0;

  const invoke = (args: string[], input?: string): SandboxResult => {
    const result = spawnSync(bin, args, { encoding: "utf8", ...(input ? { input } : {}) });
    return {
      exitCode: result.status ?? 1,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    };
  };

  return {
    async createLease(request: SandboxRequest): Promise<SandboxLease> {
      counter += 1;
      const leaseId = `mxc_${counter}`;
      const created = invoke(
        [
          "mxc",
          "create",
          "--lease",
          leaseId,
          ...(request.image ? ["--image", request.image] : []),
          ...(request.snapshot ? ["--restore", request.snapshot] : []),
          "--policy",
          "-",
        ],
        config.policyYaml,
      );
      if (created.exitCode !== 0) {
        throw new OpenShellUnavailableError(`mxc create failed: ${created.stderr}`);
      }
      return { leaseId };
    },
    async execute(lease: SandboxLease, action: SandboxAction): Promise<SandboxResult> {
      return invoke(["mxc", "exec", "--lease", lease.leaseId, "--", action.command, ...(action.args ?? [])]);
    },
    async snapshot(lease: SandboxLease): Promise<WorkspaceArtifactRef> {
      const result = invoke(["mxc", "snapshot", "--lease", lease.leaseId]);
      if (result.exitCode !== 0) {
        throw new OpenShellUnavailableError(`mxc snapshot failed: ${result.stderr}`);
      }
      return { artifactRef: result.stdout.trim() };
    },
    async restore(snapshot: WorkspaceArtifactRef): Promise<SandboxLease> {
      return this.createLease({ snapshot: snapshot.artifactRef });
    },
    async destroy(lease: SandboxLease): Promise<void> {
      invoke(["mxc", "destroy", "--lease", lease.leaseId]);
    },
  };
}
