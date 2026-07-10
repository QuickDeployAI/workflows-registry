import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contentDigest, canonicalJson, sha256Hex } from "./hash.js";
import { redactSecrets, redactSecretsDeep } from "./redact.js";
import { fetchBytesSource, fetchTextSource } from "./source-fetcher.js";
import { stableJson } from "./stable-json.js";

describe("hash", () => {
  it("canonicalJson is insertion-order independent", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
  });

  it("contentDigest changes iff content changes", () => {
    const digest = contentDigest({ a: 1 });
    expect(digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(contentDigest({ a: 1 })).toBe(digest);
    expect(contentDigest({ a: 2 })).not.toBe(digest);
  });
});

describe("stableJson", () => {
  it("is byte-stable and compacts short string arrays", () => {
    const value = { labels: ["a", "b"], nested: { key: "value" } };
    const first = stableJson(value);
    expect(first).toBe(stableJson(value));
    expect(first).toContain('"labels": ["a", "b"]');
    expect(first.endsWith("\n")).toBe(true);
  });
});

describe("source-fetcher", () => {
  it("verifies digests on local files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wfcore-"));
    const file = join(dir, "doc.txt");
    await writeFile(file, "hello", "utf8");
    const digest = `sha256:${sha256Hex("hello")}`;

    await expect(fetchTextSource(file, { digest })).resolves.toBe("hello");
    await expect(
      fetchBytesSource(file, { digest: `sha256:${"0".repeat(64)}` }),
    ).rejects.toThrow(/Digest mismatch/);
  });

  it("enforces the size cap", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wfcore-"));
    const file = join(dir, "big.txt");
    await writeFile(file, "x".repeat(64), "utf8");
    await expect(fetchBytesSource(file, { maxBytes: 16 })).rejects.toThrow(/byte limit/);
  });
});

describe("redact", () => {
  it("redacts secrets in strings and deep values", () => {
    expect(redactSecrets("token=super-secret-value ok", ["super-secret-value"])).toBe(
      "token=[REDACTED] ok",
    );
    const value = { err: "auth super-secret-value failed", nested: { x: "super-secret-value" } };
    const redacted = redactSecretsDeep(value, ["super-secret-value"]);
    expect(JSON.stringify(redacted)).not.toContain("super-secret-value");
  });

  it("never redacts trivially short values", () => {
    expect(redactSecrets("a=1", ["1"])).toBe("a=1");
  });
});
