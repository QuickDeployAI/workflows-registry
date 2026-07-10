import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { sha256Hex, stableJson } from "@quickdeployai/workflow-core";
import {
  QUICKDEPLOY_REGISTRY_CURATION_META_KEY,
  QUICKDEPLOY_REGISTRY_IMPORT_META_KEY,
  WORKFLOWS_JSON_SCHEMA_URI,
  WorkflowsJsonEnvelopeSchema,
  type WorkflowEntry,
  type WorkflowsJsonEnvelope,
} from "@quickdeployai/workflow-registry-schemas";
import {
  discoverRegistrySources,
  type DiscoveredWorkflowManifest,
} from "./registry-discovery.js";

export interface RegistryBuildOptions {
  rootDir: string;
}

export interface RegistryBuildArtifacts {
  workflowsJson: WorkflowsJsonEnvelope;
  files: Record<string, string>;
  generatedFiles: Record<string, string>;
}

export async function buildRegistryArtifacts(
  options: RegistryBuildOptions,
): Promise<RegistryBuildArtifacts> {
  const { sources, problems } = await discoverRegistrySources(options.rootDir);
  if (problems.length > 0) {
    const details = problems.map((problem) => `- ${problem.path}: ${problem.message}`).join("\n");
    throw new Error(`Registry sources failed to parse:\n${details}`);
  }

  const workflows: WorkflowEntry[] = [];
  for (const source of sources) {
    workflows.push(await compileWorkflowEntry(options.rootDir, source));
  }
  workflows.sort((left, right) => left.name.localeCompare(right.name));

  const parsed = WorkflowsJsonEnvelopeSchema.parse({
    $schema: WORKFLOWS_JSON_SCHEMA_URI,
    workflows,
    _meta: {
      "ai.quickdeploy.registry/generatedBy": "@quickdeployai/workflows-cli",
      "ai.quickdeploy.registry/sourceCount": workflows.length,
    },
  });

  return {
    workflowsJson: parsed,
    files: {
      "workflows.json": stableJson(parsed),
    },
    generatedFiles: {
      "registry/index.json": stableJson({
        sources: sources.map((source) => ({
          path: source.path,
          kind: source.kind,
          name: source.manifest.metadata.name,
        })),
      }),
    },
  };
}

/**
 * Conformance proven by the kernel harness, not just declared by importers.
 * Static registry builds prove detection + schema validation (level 1); the
 * engines listed here have registry fixtures compiled AND executed end-to-end
 * on the Workflow SDK Local World in packages/runtime/plan-interpreter tests
 * (importers.e2e.test.ts, agents.e2e.test.ts), which is level 4.
 */
const PROVEN_ENGINE_CONFORMANCE: Record<string, number> = {
  "arazzo-2-workflows": 4,
  "serverless-workflow-2-workflows": 4,
  "pi-agents-2-workflows": 4,
};

async function compileWorkflowEntry(
  rootDir: string,
  source: DiscoveredWorkflowManifest,
): Promise<WorkflowEntry> {
  const manifest = source.manifest;
  const engine = manifest.spec.importer.engine;

  // contentHash covers the authored manifest bytes (the registry artifact),
  // matching the siblings' hash-the-primary-file semantics.
  const manifestBytes = await readFile(join(rootDir, source.path));

  const entry: WorkflowEntry = {
    name: manifest.metadata.name,
    version: manifest.metadata.version,
    manifestPath: source.path,
    contentHash: sha256Hex(manifestBytes),
    _meta: {
      [QUICKDEPLOY_REGISTRY_CURATION_META_KEY]: {
        verifiedStatus: "review",
        category: engine,
        isOfficial: true,
        tags: ["manifest-backed", ...manifest.metadata.labels],
      },
      [QUICKDEPLOY_REGISTRY_IMPORT_META_KEY]: {
        engine,
        conformanceLevel: PROVEN_ENGINE_CONFORMANCE[engine] ?? 1,
      },
    },
  };
  if (manifest.metadata.description !== undefined) {
    entry.description = manifest.metadata.description;
  }
  if (manifest.metadata.labels.length > 0) {
    entry.labels = manifest.metadata.labels;
  }
  return entry;
}

export async function writeRegistryArtifacts(
  options: RegistryBuildOptions,
  artifacts?: RegistryBuildArtifacts,
): Promise<void> {
  const artifactsToWrite = artifacts ?? (await buildRegistryArtifacts(options));
  for (const [path, contents] of Object.entries({
    ...artifactsToWrite.files,
    ...artifactsToWrite.generatedFiles,
  })) {
    const target = join(options.rootDir, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  }
}

export async function checkGeneratedRegistryArtifacts(options: RegistryBuildOptions): Promise<{
  ok: boolean;
  changed: string[];
}> {
  const artifacts = await buildRegistryArtifacts(options);
  const changed: string[] = [];

  for (const [path, expected] of Object.entries(artifacts.files)) {
    const actual = await readFile(join(options.rootDir, path), "utf8").catch(() => "");
    if (actual !== expected) changed.push(path);
  }

  return { ok: changed.length === 0, changed };
}
