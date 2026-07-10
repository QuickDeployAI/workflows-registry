/**
 * The AgentRuntime contract for the mediated agent-turn loop. Agents never
 * execute tools themselves: each turn either finishes or PROPOSES capability
 * actions, which the plan interpreter policy-checks, (optionally) routes
 * through digest-bound approvals, executes as durable capability steps, and
 * appends back into the session.
 */

export interface AgentSessionRef {
  sessionId: string;
}

export interface AgentSessionConfig {
  agent: string;
  task: string;
  /**
   * Stable identity: runId + planDigest + nodeId + iteration. Creating a
   * session with a key that already exists RESUMES that session — retries
   * reconnect instead of spawning an unrelated agent.
   */
  sessionKey: string;
}

export interface ProposedAction {
  /** Must reference a capability requirement DECLARED by the plan. */
  requirementId: string;
  operation: string;
  input: unknown;
}

export type AgentTurnResult =
  | { kind: "final"; output: unknown }
  | { kind: "actions"; actions: ProposedAction[] }
  | {
      kind: "propose-subplan";
      proposal: {
        format: string;
        files: Array<{ path: string; text: string }>;
        entrypoint: string;
        config?: Record<string, unknown>;
      };
    };

export interface AgentTurnContext {
  task: string;
  turn: number;
  toolResults: unknown[];
}

export interface AgentRuntime {
  createSession(config: AgentSessionConfig): Promise<AgentSessionRef>;
  nextTurn(session: AgentSessionRef, context: AgentTurnContext): Promise<AgentTurnResult>;
  appendToolResult(session: AgentSessionRef, result: unknown): Promise<void>;
  cancel(session: AgentSessionRef): Promise<void>;
}

// ---------------------------------------------------------------------------
// Deterministic scripted double (the v0.1 CI agent; Flue is the real adapter)
// ---------------------------------------------------------------------------

export interface ScriptedSession {
  sessionId: string;
  sessionKey: string;
  agent: string;
  turnsTaken: number;
  toolResults: unknown[];
  cancelled: boolean;
}

export interface ScriptedAgentRuntime extends AgentRuntime {
  /** Introspection for tests: sessions by key (stable identity proof). */
  sessions: Map<string, ScriptedSession>;
  createSessionCalls: number;
}

/**
 * Turns are scripted per agent name; the same script replays deterministically.
 * `turns[i]` answers the session's i-th turn; scripts shorter than the turn
 * count answer `final` with the last tool results (so loops terminate).
 */
export function createScriptedAgentRuntime(
  scripts: Record<string, AgentTurnResult[]>,
): ScriptedAgentRuntime {
  const sessions = new Map<string, ScriptedSession>();
  let counter = 0;

  const runtime: ScriptedAgentRuntime = {
    sessions,
    createSessionCalls: 0,
    async createSession(config) {
      runtime.createSessionCalls += 1;
      const existing = sessions.get(config.sessionKey);
      if (existing) {
        // Stable identity: same key → same session (retry reconnection).
        return { sessionId: existing.sessionId };
      }
      counter += 1;
      const session: ScriptedSession = {
        sessionId: `sess_${counter}`,
        sessionKey: config.sessionKey,
        agent: config.agent,
        turnsTaken: 0,
        toolResults: [],
        cancelled: false,
      };
      sessions.set(config.sessionKey, session);
      return { sessionId: session.sessionId };
    },
    async nextTurn(ref, context) {
      const session = [...sessions.values()].find((candidate) => candidate.sessionId === ref.sessionId);
      if (!session) throw new Error(`Unknown agent session ${ref.sessionId}.`);
      const script = scripts[session.agent] ?? [];
      const turn = script[session.turnsTaken];
      session.turnsTaken += 1;
      if (!turn) {
        return { kind: "final", output: { agent: session.agent, task: context.task, toolResults: session.toolResults } };
      }
      return turn;
    },
    async appendToolResult(ref, result) {
      const session = [...sessions.values()].find((candidate) => candidate.sessionId === ref.sessionId);
      if (!session) throw new Error(`Unknown agent session ${ref.sessionId}.`);
      session.toolResults.push(result);
    },
    async cancel(ref) {
      const session = [...sessions.values()].find((candidate) => candidate.sessionId === ref.sessionId);
      if (session) session.cancelled = true;
    },
  };
  return runtime;
}
