import { afterEach, describe, expect, it } from "vitest";
import { FlueUnavailableError, createFlueAgentRuntime } from "./index.js";

const saved = { ...process.env };

afterEach(() => {
  process.env.FLUE_BASE_URL = saved.FLUE_BASE_URL;
  process.env.FLUE_API_TOKEN = saved.FLUE_API_TOKEN;
});

describe("Flue adapter", () => {
  it("fails closed when the runtime is not configured", () => {
    delete process.env.FLUE_BASE_URL;
    delete process.env.FLUE_API_TOKEN;
    expect(() => createFlueAgentRuntime()).toThrow(FlueUnavailableError);
  });

  it("reuses the stable session key as the durable idempotency key", async () => {
    process.env.FLUE_BASE_URL = "https://flue.example.com";
    process.env.FLUE_API_TOKEN = "test-token";
    const calls: Array<{ url: string; body: unknown }> = [];
    const runtime = createFlueAgentRuntime({
      fetchImpl: (async (url: URL | string, init?: RequestInit) => {
        calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return new Response(JSON.stringify({ sessionId: "flue-1" }), {
          headers: { "content-type": "application/json" },
        });
      }) as typeof fetch,
    });
    await runtime.createSession({ agent: "reviewer", task: "t", sessionKey: "run:plan:node:2" });
    expect(calls[0]?.url).toContain("/v1/agent-sessions");
    expect(calls[0]?.body).toMatchObject({ idempotencyKey: "run:plan:node:2" });
  });
});
