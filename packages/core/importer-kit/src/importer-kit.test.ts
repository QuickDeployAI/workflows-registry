import { describe, expect, it } from "vitest";
import type { SourceArtifact, WorkflowImporter } from "./contract.js";
import { FidelityCollector } from "./fidelity.js";
import { detectFormat, ingestSourceFiles, parseJsonSafe, parseYamlSafe } from "./ingest.js";
import { createPinnedResolver, normalizeRelative } from "./resolver.js";

describe("ingestSourceFiles", () => {
  it("sanitizes paths and digests deterministically", () => {
    const a = ingestSourceFiles([{ path: "./b.yaml", text: "b" }, { path: "a.yaml", text: "a" }]);
    const b = ingestSourceFiles([{ path: "a.yaml", text: "a" }, { path: "b.yaml", text: "b" }]);
    expect(a.digest).toBe(b.digest);
  });

  it("rejects traversal, absolute paths, and oversized artifacts", () => {
    expect(() => ingestSourceFiles([{ path: "../etc/passwd", text: "x" }])).toThrow(/traversal/);
    expect(() => ingestSourceFiles([{ path: "/abs", text: "x" }])).toThrow(/Absolute/);
    expect(() => ingestSourceFiles([{ path: "big", text: "x".repeat(64) }], { maxBytes: 16 })).toThrow(
      /ingestion limit/,
    );
  });
});

describe("safe parsing", () => {
  it("rejects YAML alias bombs", () => {
    const bomb = `a: &a ["x","x","x","x","x","x","x","x","x"]\nb: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\nc: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\nd: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\ne: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\nf: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\ng: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\nh: [*a,*a,*a,*a,*a,*a,*a,*a,*a]\ni: [*a,*a,*a,*a,*a,*a,*a,*a,*a]`;
    expect(() => parseYamlSafe(bomb, { maxAliasCount: 8 })).toThrow();
  });

  it("rejects overly deep JSON", () => {
    const deep = `${"[".repeat(80)}1${"]".repeat(80)}`;
    expect(() => parseJsonSafe(deep, { maxDepth: 16 })).toThrow(/depth/);
  });
});

describe("createPinnedResolver", () => {
  const resolver = createPinnedResolver({
    files: [{ path: "openapi.yaml", text: "openapi: 3.1.0" }],
    allowedHosts: ["specs.example.com"],
    fetchText: async () => "remote-doc",
  });

  it("resolves relative refs inside the artifact only", async () => {
    const pinned = await resolver.resolve({ ref: "./openapi.yaml" });
    expect(pinned.text).toContain("openapi");
    await expect(resolver.resolve({ ref: "missing.yaml" })).rejects.toThrow(/does not exist/);
    await expect(resolver.resolve({ ref: "../outside.yaml" })).rejects.toThrow(/traversal/);
  });

  it("requires allowlisted host + digest for remote refs, refuses http", async () => {
    await expect(resolver.resolve({ ref: "https://evil.example.com/x" })).rejects.toThrow(/allowlist/);
    await expect(resolver.resolve({ ref: "https://specs.example.com/x" })).rejects.toThrow(/digest/);
    await expect(resolver.resolve({ ref: "http://specs.example.com/x" })).rejects.toThrow(/plaintext/);
    const pinned = await resolver.resolve({
      ref: "https://specs.example.com/x",
      digest: `sha256:${"0".repeat(64)}`,
    });
    expect(pinned.text).toBe("remote-doc");
  });

  it("normalizeRelative keeps clean nested paths", () => {
    expect(normalizeRelative("./refs/openapi/petstore.yaml")).toBe("refs/openapi/petstore.yaml");
  });
});

describe("detectFormat", () => {
  const importer = (id: string, confidence: "exact" | "probable" | "none"): WorkflowImporter<unknown> => ({
    id,
    supportedVersions: ["1"],
    declaredConformance: 0,
    detect: async () => ({ detected: confidence !== "none", confidence }),
    parse: async () => ({ ok: false, diagnostics: [] }),
    validate: async () => ({ valid: false, diagnostics: [] }),
    compile: async () => ({ diagnostics: [], fidelity: { findings: [] }, requirements: [] }),
  });
  const artifact: SourceArtifact = { digest: "sha256:x", files: [{ path: "a", text: "a" }] };

  it("errors on ambiguous exact matches without a declared format", async () => {
    await expect(
      detectFormat(artifact, [importer("a-2-workflows", "exact"), importer("b-2-workflows", "exact")]),
    ).rejects.toThrow(/Ambiguous/);
  });

  it("honors the declared format", async () => {
    const detections = await detectFormat(
      { ...artifact, declaredFormat: "a-2-workflows" },
      [importer("a-2-workflows", "exact"), importer("b-2-workflows", "exact")],
    );
    expect(detections.map((detection) => detection.importerId)).toEqual(["a-2-workflows"]);
  });
});

describe("FidelityCollector", () => {
  it("flags blocking findings", () => {
    const collector = new FidelityCollector();
    collector.exact("http-call");
    collector.approximated("jq-expression", "lowered to input path");
    expect(collector.hasBlocking()).toBe(false);
    collector.unsupported("custom-function", "no AST lowering");
    expect(collector.hasBlocking()).toBe(true);
    expect(collector.report().findings).toHaveLength(3);
  });
});
