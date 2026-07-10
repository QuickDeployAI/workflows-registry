import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  WorkflowManifestSchema,
  getWorkflowImporterConfigSchema,
} from "./workflow-manifest.js";

const SCHEMAS_DIR = join(import.meta.dirname, "../../../../schemas");

function baseManifest(): Record<string, unknown> {
  return {
    apiVersion: "quickdeploy.ai/v1",
    kind: "WorkflowManifest",
    metadata: {
      name: "ai.quickdeploy/petstore-checkout",
      version: "0.1.0",
      description: "Multi-call petstore checkout via Arazzo.",
      labels: ["arazzo", "demo"],
    },
    spec: {
      importer: { engine: "arazzo-2-workflows", versionRange: "*" },
      source: { type: "file", uri: "sources/quickdeploy/petstore-checkout.arazzo.yaml" },
    },
  };
}

describe("WorkflowManifestSchema", () => {
  it("accepts a valid file-sourced manifest", () => {
    expect(WorkflowManifestSchema.safeParse(baseManifest()).success).toBe(true);
  });

  it("rejects names outside the ai.quickdeploy namespace", () => {
    const manifest = baseManifest();
    (manifest.metadata as Record<string, unknown>).name = "com.example/thing";
    expect(WorkflowManifestSchema.safeParse(manifest).success).toBe(false);
  });

  it("rejects version ranges", () => {
    const manifest = baseManifest();
    (manifest.metadata as Record<string, unknown>).version = "^1.0.0";
    expect(WorkflowManifestSchema.safeParse(manifest).success).toBe(false);
  });

  it("requires a digest on http sources", () => {
    const manifest = baseManifest();
    (manifest.spec as Record<string, unknown>).source = {
      type: "http",
      uri: "https://example.com/workflow.yaml",
    };
    const result = WorkflowManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("accepts digest-pinned http sources", () => {
    const manifest = baseManifest();
    (manifest.spec as Record<string, unknown>).source = {
      type: "http",
      uri: "https://example.com/workflow.yaml",
      digest: `sha256:${"a".repeat(64)}`,
    };
    expect(WorkflowManifestSchema.safeParse(manifest).success).toBe(true);
  });

  it("requires an immutable ref or digest on git sources", () => {
    const manifest = baseManifest();
    const spec = manifest.spec as Record<string, unknown>;
    spec.source = { type: "git", uri: "https://github.com/x/y.git", ref: "main" };
    expect(WorkflowManifestSchema.safeParse(manifest).success).toBe(false);
    spec.source = { type: "git", uri: "https://github.com/x/y.git", ref: "b".repeat(40) };
    expect(WorkflowManifestSchema.safeParse(manifest).success).toBe(true);
  });

  it("rejects lowercase env requirement names", () => {
    const manifest = baseManifest();
    (manifest.spec as Record<string, unknown>).requirements = {
      env: [{ name: "api_key" }],
    };
    expect(WorkflowManifestSchema.safeParse(manifest).success).toBe(false);
  });

  it("registers config schemas for every wave-1 engine", () => {
    for (const engine of [
      "arazzo-2-workflows",
      "serverless-workflow-2-workflows",
      "pi-agents-2-workflows",
    ]) {
      expect(getWorkflowImporterConfigSchema(engine)).toBeDefined();
    }
    expect(getWorkflowImporterConfigSchema("unknown-2-workflows")).toBeUndefined();
  });
});

describe("published JSON Schema parity", () => {
  it("agrees with Zod on valid and invalid manifests", async () => {
    const raw = await readFile(join(SCHEMAS_DIR, "workflow-manifest.v1.schema.json"), "utf8");
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(JSON.parse(raw));

    const valid = baseManifest();
    expect(validate(valid)).toBe(true);
    expect(WorkflowManifestSchema.safeParse(valid).success).toBe(true);

    const missingDigest = baseManifest();
    (missingDigest.spec as Record<string, unknown>).source = {
      type: "http",
      uri: "https://example.com/w.yaml",
    };
    expect(validate(missingDigest)).toBe(false);
    expect(WorkflowManifestSchema.safeParse(missingDigest).success).toBe(false);
  });
});
