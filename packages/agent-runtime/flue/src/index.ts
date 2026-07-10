import type {
  AgentRuntime,
  AgentSessionConfig,
  AgentSessionRef,
  AgentTurnContext,
  AgentTurnResult,
} from "@quickdeployai/agent-runtime";

/**
 * Flue durable-agents adapter. Flue's own workflow model does not checkpoint
 * arbitrary TS execution — the plan interpreter owns the durable control
 * graph; Flue executes individual agent TURNS and keeps session state, which
 * is exactly the AgentRuntime seam.
 *
 * FAIL CLOSED: without a configured Flue endpoint this adapter refuses to
 * construct. There is no degraded local mode — the scripted double in
 * @quickdeployai/agent-runtime is the explicit CI substitute.
 */
export interface FlueAgentRuntimeConfig {
  /** Defaults to FLUE_BASE_URL. */
  baseUrl?: string;
  /** Env var NAME holding the API token (never the value). Defaults to FLUE_API_TOKEN. */
  tokenEnv?: string;
  fetchImpl?: typeof fetch;
}

export class FlueUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlueUnavailableError";
  }
}

export function createFlueAgentRuntime(config: FlueAgentRuntimeConfig = {}): AgentRuntime {
  const baseUrl = config.baseUrl ?? process.env.FLUE_BASE_URL;
  const tokenEnv = config.tokenEnv ?? "FLUE_API_TOKEN";
  const token = process.env[tokenEnv];
  if (!baseUrl || !token) {
    throw new FlueUnavailableError(
      `Flue runtime is not configured (need FLUE_BASE_URL and ${tokenEnv}); refusing to run agent turns without it. ` +
        "Use the scripted AgentRuntime double for tests.",
    );
  }
  const fetchImpl = config.fetchImpl ?? fetch;

  const call = async <T>(path: string, body: unknown): Promise<T> => {
    const response = await fetchImpl(new URL(path, baseUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new FlueUnavailableError(`Flue ${path} responded ${response.status}.`);
    }
    return (await response.json()) as T;
  };

  return {
    async createSession(sessionConfig: AgentSessionConfig): Promise<AgentSessionRef> {
      // Durable session keyed by our stable execution identity: Flue reopens
      // the existing session for a repeated key instead of spawning anew.
      return call<AgentSessionRef>("/v1/agent-sessions", {
        agent: sessionConfig.agent,
        task: sessionConfig.task,
        idempotencyKey: sessionConfig.sessionKey,
      });
    },
    async nextTurn(session: AgentSessionRef, context: AgentTurnContext): Promise<AgentTurnResult> {
      return call<AgentTurnResult>(`/v1/agent-sessions/${session.sessionId}/turns`, context);
    },
    async appendToolResult(session: AgentSessionRef, result: unknown): Promise<void> {
      await call(`/v1/agent-sessions/${session.sessionId}/tool-results`, { result });
    },
    async cancel(session: AgentSessionRef): Promise<void> {
      await call(`/v1/agent-sessions/${session.sessionId}/cancel`, {});
    },
  };
}
