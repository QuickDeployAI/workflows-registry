import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { formatDiagnostics, stableJson } from "@quickdeployai/workflow-core";
import {
  createPinnedResolver,
  detectFormat,
  ingestSourceFiles,
  summarizeFidelity,
} from "@quickdeployai/workflow-importer-kit";
import { computePlanDigest, validatePlan } from "@quickdeployai/workflow-ir";
import { WorkflowManifestSchema } from "@quickdeployai/workflow-registry-schemas";
import type { KernelCommandContext } from "../kernel-commands.js";
import { IMPORTERS, importerFor } from "./importers.js";

/** detect/compile land with M3; bind/policy/run/inspect/approve land with M4. */
export async function runKernelCli(command: string, context: KernelCommandContext): Promise<number> {
  switch (command) {
    case "detect":
      return runDetect(context);
    case "compile":
      return runCompile(context);
    default: {
      const { runGovernanceCli } = await import("./governance.js");
      return runGovernanceCli(command, context);
    }
  }
}

function stringFlag(context: KernelCommandContext, name: string): string | undefined {
  const value = context.flags.get(name);
  return typeof value === "string" ? value : undefined;
}

/** Ingest a source file plus its sibling files (for relative references). */
async function ingestFromPath(rootDir: string, sourcePath: string) {
  const absolute = resolve(rootDir, sourcePath);
  const dir = dirname(absolute);
  const names = await readdir(dir);
  const files = await Promise.all(
    names.map(async (name) => ({
      path: name,
      text: await readFile(join(dir, name), "utf8").catch(() => ""),
    })),
  );
  const nonEmpty = files.filter((file) => file.text.length > 0);
  return {
    artifact: ingestSourceFiles(nonEmpty, { entrypoint: relative(dir, absolute) }),
    files: nonEmpty,
  };
}

async function runDetect(context: KernelCommandContext): Promise<number> {
  const source = stringFlag(context, "source");
  if (!source) {
    process.stderr.write("detect requires --source <path>.\n");
    return 1;
  }
  const { artifact } = await ingestFromPath(context.rootDir, source);
  const detections = await detectFormat(artifact, IMPORTERS);
  if (detections.length === 0) {
    process.stdout.write("No importer recognizes this source.\n");
    return 1;
  }
  for (const detection of detections) {
    process.stdout.write(
      `${detection.importerId} (${detection.result.confidence}${detection.result.formatVersion ? `, version ${detection.result.formatVersion}` : ""})\n`,
    );
  }
  return 0;
}

async function runCompile(context: KernelCommandContext): Promise<number> {
  const manifestPath = stringFlag(context, "manifest");
  if (!manifestPath) {
    process.stderr.write("compile requires --manifest <registry/...workflow.json>.\n");
    return 1;
  }
  const manifestRaw = JSON.parse(await readFile(resolve(context.rootDir, manifestPath), "utf8"));
  const manifest = WorkflowManifestSchema.parse(manifestRaw);
  if (manifest.spec.source.type !== "file") {
    process.stderr.write(
      `compile currently supports file sources; "${manifest.spec.source.type}" sources are fetched via digest-pinned ingestion in a later milestone.\n`,
    );
    return 1;
  }

  const importer = importerFor(manifest.spec.importer.engine);
  if (!importer) {
    process.stderr.write(`No importer registered for engine "${manifest.spec.importer.engine}".\n`);
    return 1;
  }

  const { artifact, files } = await ingestFromPath(context.rootDir, manifest.spec.source.uri);
  const resolver = createPinnedResolver({ files });

  const parsed = await importer.parse(artifact, { resolver, config: manifest.spec.config ?? {} });
  if (!parsed.ok) {
    process.stderr.write(`${formatDiagnostics(parsed.diagnostics)}\n`);
    return 1;
  }
  const validation = await importer.validate(parsed.model, {
    resolver,
    config: manifest.spec.config ?? {},
  });
  if (!validation.valid) {
    process.stderr.write(`${formatDiagnostics(validation.diagnostics)}\n`);
    return 1;
  }

  const compiled = await importer.compile(parsed.model, {
    planId: manifest.metadata.name,
    planName: manifest.metadata.title ?? manifest.metadata.name,
    artifactDigest: artifact.digest,
    entrypoint: artifact.entrypoint ?? "-",
    config: manifest.spec.config ?? {},
    ...(manifest.spec.budgets ? { budgets: manifest.spec.budgets } : {}),
    resolver,
  });

  const fidelity = summarizeFidelity(compiled.fidelity);
  if (!compiled.plan) {
    process.stderr.write(
      `Compilation blocked (fidelity: ${JSON.stringify(fidelity)}).\n${compiled.diagnostics
        .map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)
        .join("\n")}\n`,
    );
    return 1;
  }
  const structural = validatePlan(compiled.plan);
  if (structural.length > 0) {
    process.stderr.write(`${formatDiagnostics(structural)}\n`);
    return 1;
  }

  const digest = computePlanDigest(compiled.plan);
  const outPath = resolve(
    context.rootDir,
    stringFlag(context, "out") ??
      join(".generated/plans", `${manifest.metadata.name.split("/")[1] ?? "plan"}.plan.json`),
  );
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, stableJson({ planDigest: digest, plan: compiled.plan }), "utf8");
  process.stdout.write(
    `Compiled ${manifest.metadata.name} → ${relative(context.rootDir, outPath)}\nplanDigest: ${digest}\nfidelity: exact=${fidelity.exact} approximated=${fidelity.approximated} unsupported=${fidelity.unsupported} blocked=${fidelity.blocked}\nrequirements: ${compiled.requirements.map((requirement) => requirement.id).join(", ")}\n`,
  );
  return 0;
}
