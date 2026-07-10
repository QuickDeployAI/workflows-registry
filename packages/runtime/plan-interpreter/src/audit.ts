import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { redactSecrets } from "@quickdeployai/workflow-core";

/**
 * One correlated audit stream per run: workflow, node, agent session,
 * sandbox lease, policy decision, approval, and capability call all share
 * `runId + planDigest + nodeId (+ attempt/iteration)` correlation keys.
 */
export interface AuditEvent {
  at: string;
  runId: string;
  planDigest: string;
  type:
    | "run-started"
    | "run-completed"
    | "run-failed"
    | "node-entered"
    | "node-completed"
    | "policy-decision"
    | "approval-requested"
    | "approval-resolved"
    | "capability-call"
    | "agent-turn"
    | "sandbox-lease"
    | "child-workflow";
  nodeId?: string;
  attempt?: number;
  detail?: Record<string, unknown>;
  agentSessionId?: string;
  sandboxLeaseId?: string;
}

export interface AuditSink {
  append(event: AuditEvent): Promise<void>;
  read(runId: string): Promise<AuditEvent[]>;
}

export function createFileAuditSink(rootDir: string, secretValues: () => string[] = () => []): AuditSink {
  const pathFor = (runId: string): string => join(rootDir, `${runId.replace(/[^a-z0-9_-]/gi, "_")}.jsonl`);
  return {
    async append(event) {
      await mkdir(rootDir, { recursive: true });
      const line = redactSecrets(JSON.stringify(event), secretValues());
      await appendFile(pathFor(event.runId), `${line}\n`, "utf8");
    },
    async read(runId) {
      try {
        const raw = await readFile(pathFor(runId), "utf8");
        return raw
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line) as AuditEvent);
      } catch {
        return [];
      }
    },
  };
}
