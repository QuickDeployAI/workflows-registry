import { sha256Hex } from "@quickdeployai/workflow-core";

/**
 * Sandbox leases decouple durable-run lifetime from container lifetime: a
 * run may sleep for days, so sandboxes are ephemeral — create a lease for a
 * bounded task, snapshot the workspace as a content-addressed artifact,
 * destroy the lease, and restore from the artifact for the next turn.
 *
 * Flue's virtual/local sandbox modes are NOT a security boundary for
 * untrusted multi-tenant tasks; real isolation is the MXC/OpenShell backend.
 */
export interface SandboxLease {
  leaseId: string;
}

export interface SandboxRequest {
  image?: string;
  snapshot?: string;
}

export interface SandboxAction {
  command: string;
  args?: string[];
}

export interface SandboxResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface WorkspaceArtifactRef {
  artifactRef: string;
}

export interface SandboxArtifactStore {
  put(bytes: Uint8Array | string): Promise<{ ref: string }>;
  get(ref: string): Promise<Uint8Array | undefined>;
}

export interface SandboxBackend {
  createLease(request: SandboxRequest): Promise<SandboxLease>;
  execute(lease: SandboxLease, action: SandboxAction): Promise<SandboxResult>;
  snapshot(lease: SandboxLease): Promise<WorkspaceArtifactRef>;
  restore(snapshot: WorkspaceArtifactRef): Promise<SandboxLease>;
  destroy(lease: SandboxLease): Promise<void>;
}

// ---------------------------------------------------------------------------
// Deterministic local double: an in-memory workspace with three commands
// (write/read/ls). Snapshots serialize the workspace into the artifact store.
// ---------------------------------------------------------------------------

interface Workspace {
  files: Map<string, string>;
  destroyed: boolean;
}

export interface LocalSandboxDouble extends SandboxBackend {
  leases: Map<string, Workspace>;
}

export function createLocalSandboxDouble(store: SandboxArtifactStore): LocalSandboxDouble {
  const leases = new Map<string, Workspace>();
  let counter = 0;

  const workspaceOf = (lease: SandboxLease): Workspace => {
    const workspace = leases.get(lease.leaseId);
    if (!workspace || workspace.destroyed) {
      throw new Error(`Sandbox lease ${lease.leaseId} is not active.`);
    }
    return workspace;
  };

  return {
    leases,
    async createLease(request) {
      counter += 1;
      const leaseId = `lease_${counter}_${sha256Hex(JSON.stringify(request)).slice(0, 8)}`;
      let files = new Map<string, string>();
      if (request.snapshot) {
        const bytes = await store.get(request.snapshot);
        if (!bytes) throw new Error(`Snapshot ${request.snapshot} not found.`);
        files = new Map(Object.entries(JSON.parse(new TextDecoder().decode(bytes)) as Record<string, string>));
      }
      leases.set(leaseId, { files, destroyed: false });
      return { leaseId };
    },
    async execute(lease, action) {
      const workspace = workspaceOf(lease);
      const [path = "", ...rest] = action.args ?? [];
      switch (action.command) {
        case "write":
          workspace.files.set(path, rest.join(" "));
          return { exitCode: 0, stdout: "", stderr: "" };
        case "read": {
          const content = workspace.files.get(path);
          return content === undefined
            ? { exitCode: 1, stdout: "", stderr: `no such file: ${path}` }
            : { exitCode: 0, stdout: content, stderr: "" };
        }
        case "ls":
          return { exitCode: 0, stdout: [...workspace.files.keys()].sort().join("\n"), stderr: "" };
        default:
          return { exitCode: 127, stdout: "", stderr: `unknown command: ${action.command}` };
      }
    },
    async snapshot(lease) {
      const workspace = workspaceOf(lease);
      const { ref } = await store.put(JSON.stringify(Object.fromEntries(workspace.files)));
      return { artifactRef: ref };
    },
    async restore(snapshot) {
      return this.createLease({ snapshot: snapshot.artifactRef });
    },
    async destroy(lease) {
      const workspace = leases.get(lease.leaseId);
      if (workspace) workspace.destroyed = true;
    },
  };
}
