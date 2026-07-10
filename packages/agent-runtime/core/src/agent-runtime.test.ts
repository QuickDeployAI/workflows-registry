import { describe, expect, it } from "vitest";
import { createScriptedAgentRuntime } from "./index.js";

describe("scripted agent runtime", () => {
  it("replays scripts deterministically and finishes when the script ends", async () => {
    const runtime = createScriptedAgentRuntime({
      writer: [
        { kind: "actions", actions: [{ requirementId: "api", operation: "POST /x", input: { a: 1 } }] },
        { kind: "final", output: "done" },
      ],
    });
    const session = await runtime.createSession({ agent: "writer", task: "t", sessionKey: "k1" });
    const first = await runtime.nextTurn(session, { task: "t", turn: 0, toolResults: [] });
    expect(first.kind).toBe("actions");
    await runtime.appendToolResult(session, { ok: true });
    const second = await runtime.nextTurn(session, { task: "t", turn: 1, toolResults: [] });
    expect(second).toEqual({ kind: "final", output: "done" });
  });

  it("reuses sessions by stable sessionKey (retry reconnection)", async () => {
    const runtime = createScriptedAgentRuntime({ a: [] });
    const one = await runtime.createSession({ agent: "a", task: "t", sessionKey: "run:plan:node:0" });
    const two = await runtime.createSession({ agent: "a", task: "t", sessionKey: "run:plan:node:0" });
    expect(two.sessionId).toBe(one.sessionId);
    expect(runtime.createSessionCalls).toBe(2);
    expect(runtime.sessions.size).toBe(1);
  });
});
