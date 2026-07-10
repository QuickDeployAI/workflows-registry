import { describe, expect, it } from "vitest";
import { createLocalSandboxDouble } from "./index.js";

function memoryStore() {
  const map = new Map<string, Uint8Array>();
  return {
    async put(bytes: Uint8Array | string) {
      const buffer = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
      const ref = `ref_${map.size + 1}`;
      map.set(ref, buffer);
      return { ref };
    },
    async get(ref: string) {
      return map.get(ref);
    },
  };
}

describe("local sandbox double", () => {
  it("leases are ephemeral: snapshot → destroy → restore preserves the workspace", async () => {
    const backend = createLocalSandboxDouble(memoryStore());
    const lease = await backend.createLease({});
    await backend.execute(lease, { command: "write", args: ["notes.md", "hello sandbox"] });
    const snapshot = await backend.snapshot(lease);
    await backend.destroy(lease);

    await expect(backend.execute(lease, { command: "ls" })).rejects.toThrow(/not active/);

    const restored = await backend.restore(snapshot);
    const read = await backend.execute(restored, { command: "read", args: ["notes.md"] });
    expect(read).toEqual({ exitCode: 0, stdout: "hello sandbox", stderr: "" });
  });

  it("unknown commands and missing files fail without throwing", async () => {
    const backend = createLocalSandboxDouble(memoryStore());
    const lease = await backend.createLease({});
    expect((await backend.execute(lease, { command: "read", args: ["nope"] })).exitCode).toBe(1);
    expect((await backend.execute(lease, { command: "rm -rf" })).exitCode).toBe(127);
  });
});
