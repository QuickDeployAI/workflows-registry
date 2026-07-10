import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildRegistryArtifacts,
  checkGeneratedRegistryArtifacts,
  writeRegistryArtifacts,
} from "../src/registry-build.js";
import { validateRegistryEntries } from "../src/registry-validate.js";
import { scaffoldWorkflow } from "../src/scaffold.js";

const WORKSPACE_ROOT = join(import.meta.dirname, "../../../..");

describe("registry build (real workspace)", () => {
  it("builds workflows.json from the committed registry sources", async () => {
    const artifacts = await buildRegistryArtifacts({ rootDir: WORKSPACE_ROOT });
    expect(artifacts.workflowsJson.workflows.length).toBeGreaterThanOrEqual(3);
    const names = artifacts.workflowsJson.workflows.map((entry) => entry.name);
    expect(names).toContain("ai.quickdeploy/petstore-checkout");
    expect(names).toEqual([...names].sort());
    for (const entry of artifacts.workflowsJson.workflows) {
      expect(entry.contentHash).toMatch(/^[0-9a-f]{64}$/);
      expect(entry._meta?.["ai.quickdeploy.registry/curation"]).toBeDefined();
    }
  });

  it("drift gate agrees with the committed workflows.json", async () => {
    const result = await checkGeneratedRegistryArtifacts({ rootDir: WORKSPACE_ROOT });
    expect(result.changed).toEqual([]);
  });

  it("validates the committed registry sources cleanly", async () => {
    const result = await validateRegistryEntries({ rootDir: WORKSPACE_ROOT });
    expect(result.violations).toEqual([]);
    expect(result.entryCount).toBeGreaterThanOrEqual(3);
  });
});

describe("registry validation (synthetic violations)", () => {
  async function makeRoot(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), "wfreg-"));
    await mkdir(join(root, "registry/acme"), { recursive: true });
    await writeFile(join(root, "pnpm-workspace.yaml"), "packages: []\n");
    return root;
  }

  it("collects duplicate names and unknown engines in one pass", async () => {
    const root = await makeRoot();
    const manifest = {
      apiVersion: "quickdeploy.ai/v1",
      kind: "WorkflowManifest",
      metadata: { name: "ai.quickdeploy/acme-x", version: "1.0.0", labels: [] },
      spec: {
        importer: { engine: "unknown-2-workflows", versionRange: "*" },
        source: { type: "file", uri: "sources/acme/missing.yaml" },
      },
    };
    await writeFile(join(root, "registry/acme/a.workflow.json"), JSON.stringify(manifest));
    await writeFile(join(root, "registry/acme/b.workflow.json"), JSON.stringify(manifest));

    const result = await validateRegistryEntries({ rootDir: root });
    const codes = result.violations.map((violation) => violation.code);
    expect(codes).toContain("duplicate-name");
    expect(codes).toContain("unknown-importer-engine");
    expect(codes).toContain("missing-source-file");
    expect(result.ok).toBe(false);
  });

  it("reports stale generated artifacts", async () => {
    const root = await makeRoot();
    await writeFile(
      join(root, "registry/acme/acme-thing.workflow.json"),
      JSON.stringify({
        apiVersion: "quickdeploy.ai/v1",
        kind: "WorkflowManifest",
        metadata: { name: "ai.quickdeploy/acme-thing", version: "1.0.0", labels: [] },
        spec: {
          importer: { engine: "serverless-workflow-2-workflows", versionRange: "*" },
          source: { type: "file", uri: "registry/acme/acme-thing.workflow.json" },
        },
      }),
    );

    const stale = await checkGeneratedRegistryArtifacts({ rootDir: root });
    expect(stale.ok).toBe(false);
    await writeRegistryArtifacts({ rootDir: root });
    const fresh = await checkGeneratedRegistryArtifacts({ rootDir: root });
    expect(fresh.ok).toBe(true);
    const written = await readFile(join(root, "workflows.json"), "utf8");
    expect(written).toContain("ai.quickdeploy/acme-thing");
  });
});

describe("scaffold", () => {
  it("creates a manifest + source stub and refuses overwrite without --force", async () => {
    const root = await mkdtemp(join(tmpdir(), "wfscaffold-"));
    await writeFile(join(root, "pnpm-workspace.yaml"), "packages: []\n");
    const result = await scaffoldWorkflow({
      rootDir: root,
      provider: "acme",
      workflowName: "acme-sync",
      description: "Sync things.",
    });
    expect(result.manifestPath).toBe("registry/acme/acme-sync.workflow.json");
    await expect(
      scaffoldWorkflow({
        rootDir: root,
        provider: "acme",
        workflowName: "acme-sync",
        description: "Sync things.",
      }),
    ).rejects.toThrow(/--force/);
  });
});
