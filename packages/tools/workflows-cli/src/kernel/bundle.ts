import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { formatDiagnostics } from "@quickdeployai/workflow-core";
import {
  WORKFLOW_BUNDLE_MEDIA_TYPE,
  packBundle,
  readBundleDir,
  verifyBundle,
  writeBundleDir,
} from "@quickdeployai/workflow-bundle";
import { derivePolicyIntent } from "@quickdeployai/workflow-policy";
import { ExecutionPlanV1Schema, computePlanDigest } from "@quickdeployai/workflow-ir";
import { WorkflowManifestSchema } from "@quickdeployai/workflow-registry-schemas";
import type { KernelCommandContext } from "../kernel-commands.js";

export async function runBundleCli(context: KernelCommandContext): Promise<number> {
  const [subcommand] = context.positionals;
  switch (subcommand) {
    case "pack":
      return runPack(context);
    case "verify":
      return runVerify(context);
    default:
      process.stderr.write("Usage: workflows-cli bundle pack --manifest <path> --plan <path> [--out <dir>]\n");
      process.stderr.write("       workflows-cli bundle verify --dir <dir>\n");
      return 1;
  }
}

function stringFlag(context: KernelCommandContext, name: string): string | undefined {
  const value = context.flags.get(name);
  return typeof value === "string" ? value : undefined;
}

async function runPack(context: KernelCommandContext): Promise<number> {
  const manifestPath = stringFlag(context, "manifest");
  const planPath = stringFlag(context, "plan");
  if (!manifestPath || !planPath) {
    process.stderr.write("bundle pack requires --manifest <workflow.json> and --plan <compiled plan json>.\n");
    return 1;
  }
  const manifest = WorkflowManifestSchema.parse(
    JSON.parse(await readFile(resolve(context.rootDir, manifestPath), "utf8")),
  );
  const planRaw = JSON.parse(await readFile(resolve(context.rootDir, planPath), "utf8")) as {
    plan?: unknown;
  };
  const plan = ExecutionPlanV1Schema.parse(planRaw.plan ?? planRaw);
  const planDigest = computePlanDigest(plan);

  if (manifest.spec.source.type !== "file") {
    process.stderr.write("bundle pack currently packs file sources.\n");
    return 1;
  }
  const sourceDir = dirname(resolve(context.rootDir, manifest.spec.source.uri));
  const names = await readdir(sourceDir);
  const sourceFiles = await Promise.all(
    names.map(async (name) => ({
      path: relative(sourceDir, join(sourceDir, name)).split("\\").join("/"),
      content: await readFile(join(sourceDir, name), "utf8").catch(() => ""),
    })),
  );

  const bundle = packBundle({
    metadata: {
      mediaType: WORKFLOW_BUNDLE_MEDIA_TYPE,
      name: manifest.metadata.name,
      version: manifest.metadata.version,
      publisher: manifest.metadata.name.split("/")[0] ?? "unknown",
      license: "MIT",
      importer: manifest.spec.importer,
      compiler: plan.compiler,
    },
    provenance: {
      sourceDigest: plan.source.artifactDigest,
      builder: "@quickdeployai/workflows-cli",
      builtWith: `${plan.compiler.name}@${plan.compiler.version}`,
      planCache: [
        {
          sourceDigest: plan.source.artifactDigest,
          importerVersion: manifest.spec.importer.versionRange,
          compilerVersion: plan.compiler.version,
          runtimeProfile: "local-world",
          planDigest,
        },
      ],
    },
    policyIntent: derivePolicyIntent(plan, planDigest),
    sourceFiles: sourceFiles.filter((file) => file.content.length > 0),
  });

  const outDir = resolve(
    context.rootDir,
    stringFlag(context, "out") ?? join(".generated/bundles", manifest.metadata.name.split("/")[1] ?? "bundle"),
  );
  await writeBundleDir(bundle, outDir);
  process.stdout.write(
    `Packed ${manifest.metadata.name} → ${relative(context.rootDir, outDir)}\nbundleDigest: ${bundle.bundleDigest}\n`,
  );
  return 0;
}

async function runVerify(context: KernelCommandContext): Promise<number> {
  const dir = stringFlag(context, "dir");
  if (!dir) {
    process.stderr.write("bundle verify requires --dir <bundle dir>.\n");
    return 1;
  }
  const files = await readBundleDir(resolve(context.rootDir, dir));
  const result = verifyBundle(files);
  if (!result.valid) {
    process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    return 1;
  }
  process.stdout.write(`Bundle verified. bundleDigest: ${result.bundleDigest}\n`);
  return 0;
}
