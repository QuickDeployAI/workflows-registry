import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { stableJson } from "@quickdeployai/workflow-core";

export interface ScaffoldWorkflowOptions {
  rootDir: string;
  provider: string;
  workflowName: string;
  description: string;
  importer?: string;
  force?: boolean;
}

export interface ScaffoldWorkflowResult {
  manifestPath: string;
  sourcePath: string;
}

const DEFAULT_IMPORTER = "serverless-workflow-2-workflows";

export async function scaffoldWorkflow(
  options: ScaffoldWorkflowOptions,
): Promise<ScaffoldWorkflowResult> {
  const importer = options.importer ?? DEFAULT_IMPORTER;
  const manifestPath = join(
    "registry",
    options.provider,
    `${options.workflowName}.workflow.json`,
  );
  const sourcePath = join(
    "sources",
    options.provider,
    `${options.workflowName}.serverless.json`,
  );

  for (const path of [manifestPath, sourcePath]) {
    if (!options.force && existsSync(join(options.rootDir, path))) {
      throw new Error(`${path} already exists; pass --force to overwrite.`);
    }
  }

  const manifest = {
    apiVersion: "quickdeploy.ai/v1",
    kind: "WorkflowManifest",
    metadata: {
      name: `ai.quickdeploy/${options.workflowName}`,
      version: "0.1.0",
      description: options.description.slice(0, 100),
      labels: [],
    },
    spec: {
      importer: { engine: importer, versionRange: "*" },
      source: { type: "file", uri: sourcePath.split("\\").join("/") },
    },
  };

  const sourceStub = {
    document: {
      dsl: "1.0.0",
      namespace: "quickdeploy",
      name: options.workflowName,
      version: "0.1.0",
    },
    do: [
      {
        start: {
          set: { message: "Replace this stub with real workflow steps." },
        },
      },
    ],
  };

  for (const [path, contents] of [
    [manifestPath, stableJson(manifest)],
    [sourcePath, stableJson(sourceStub)],
  ] as const) {
    const target = join(options.rootDir, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  }

  return { manifestPath, sourcePath };
}
