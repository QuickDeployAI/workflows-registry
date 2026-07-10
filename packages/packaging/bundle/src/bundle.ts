import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import {
  errorDiagnostic,
  sha256Hex,
  stableJson,
  type Diagnostic,
} from "@quickdeployai/workflow-core";
import type { PolicyIntent } from "@quickdeployai/workflow-policy";
import { z } from "zod";

/**
 * Shareable workflows are packaged as content-addressed bundles, not a new
 * workflow DSL. The SOURCE artifact stays canonical; compiled plans are a
 * cache keyed by (source digest, importer version, compiler version, target
 * runtime profile) and are never treated as portable across compilers.
 *
 * Layout (OCI-artifact-friendly; every file digested in MANIFEST.json):
 *   source/**            the source workflow + referenced documents
 *   policy/intent.json   the plan-derived policy intent
 *   metadata.json        publisher/license/importer/compiler compatibility
 *   provenance.json      source retrieval + build provenance + plan cache
 *   sbom.json            file inventory (SPDX-lite)
 *   tests/**             optional fixtures
 *   MANIFEST.json        path → sha256 map + the bundle digest
 */
export const WORKFLOW_BUNDLE_MEDIA_TYPE = "application/vnd.oneclick.workflow.bundle.v1";

export const BundleMetadataSchema = z.object({
  mediaType: z.literal(WORKFLOW_BUNDLE_MEDIA_TYPE),
  name: z.string().min(1),
  version: z.string().min(1),
  publisher: z.string().min(1),
  license: z.string().min(1),
  importer: z.object({ engine: z.string(), versionRange: z.string() }),
  compiler: z.object({ name: z.string(), version: z.string() }),
});
export type BundleMetadata = z.infer<typeof BundleMetadataSchema>;

export const BundleProvenanceSchema = z.object({
  sourceDigest: z.string().min(1),
  builder: z.string().min(1),
  builtWith: z.string().min(1),
  /** Compiled-plan cache entries keyed by the full compatibility tuple. */
  planCache: z
    .array(
      z.object({
        sourceDigest: z.string(),
        importerVersion: z.string(),
        compilerVersion: z.string(),
        runtimeProfile: z.string(),
        planDigest: z.string(),
      }),
    )
    .default([]),
});
export type BundleProvenance = z.infer<typeof BundleProvenanceSchema>;

export interface BundleFile {
  path: string;
  content: string;
}

export interface PackedBundle {
  files: BundleFile[];
  bundleDigest: string;
}

export interface PackBundleOptions {
  metadata: BundleMetadata;
  provenance: Omit<BundleProvenance, "planCache"> & Partial<Pick<BundleProvenance, "planCache">>;
  policyIntent: PolicyIntent;
  sourceFiles: BundleFile[];
  referenceFiles?: BundleFile[];
  testFiles?: BundleFile[];
}

const REQUIRED_PATHS = ["metadata.json", "provenance.json", "policy/intent.json", "sbom.json"];

export function packBundle(options: PackBundleOptions): PackedBundle {
  const files: BundleFile[] = [
    ...options.sourceFiles.map((file) => ({ path: `source/${file.path}`, content: file.content })),
    ...(options.referenceFiles ?? []).map((file) => ({
      path: `references/${file.path}`,
      content: file.content,
    })),
    ...(options.testFiles ?? []).map((file) => ({ path: `tests/${file.path}`, content: file.content })),
    { path: "metadata.json", content: stableJson(BundleMetadataSchema.parse(options.metadata)) },
    {
      path: "provenance.json",
      content: stableJson(BundleProvenanceSchema.parse({ planCache: [], ...options.provenance })),
    },
    { path: "policy/intent.json", content: stableJson(options.policyIntent) },
  ];

  files.push({
    path: "sbom.json",
    content: stableJson({
      spdxVersion: "SPDX-lite",
      name: options.metadata.name,
      files: files
        .map((file) => ({ path: file.path, sha256: sha256Hex(file.content) }))
        .sort((left, right) => left.path.localeCompare(right.path)),
    }),
  });

  const manifestEntries = Object.fromEntries(
    files
      .map((file) => [file.path, sha256Hex(file.content)] as const)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  const bundleDigest = `sha256:${sha256Hex(JSON.stringify(manifestEntries))}`;
  files.push({
    path: "MANIFEST.json",
    content: stableJson({ mediaType: WORKFLOW_BUNDLE_MEDIA_TYPE, files: manifestEntries, bundleDigest }),
  });

  return { files, bundleDigest };
}

/** Recompute every digest; any drift, missing required file, or manifest mismatch fails. */
export function verifyBundle(files: BundleFile[]): { valid: boolean; bundleDigest?: string; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const byPath = new Map(files.map((file) => [file.path, file.content]));

  const manifestRaw = byPath.get("MANIFEST.json");
  if (!manifestRaw) {
    return { valid: false, diagnostics: [errorDiagnostic("missing-manifest", "MANIFEST.json is absent.")] };
  }
  let manifest: { files: Record<string, string>; bundleDigest: string; mediaType?: string };
  try {
    manifest = JSON.parse(manifestRaw) as typeof manifest;
  } catch {
    return { valid: false, diagnostics: [errorDiagnostic("invalid-manifest", "MANIFEST.json is not JSON.")] };
  }
  if (manifest.mediaType !== WORKFLOW_BUNDLE_MEDIA_TYPE) {
    diagnostics.push(errorDiagnostic("wrong-media-type", `Media type ${manifest.mediaType ?? "<none>"}.`));
  }

  for (const required of REQUIRED_PATHS) {
    if (!byPath.has(required)) {
      diagnostics.push(errorDiagnostic("missing-required-file", `${required} is absent.`, required));
    }
  }

  for (const [path, expected] of Object.entries(manifest.files)) {
    const content = byPath.get(path);
    if (content === undefined) {
      diagnostics.push(errorDiagnostic("missing-file", `${path} is listed but absent.`, path));
      continue;
    }
    const actual = sha256Hex(content);
    if (actual !== expected) {
      diagnostics.push(errorDiagnostic("digest-mismatch", `${path} hashes to ${actual}, manifest says ${expected}.`, path));
    }
  }
  for (const file of files) {
    if (file.path !== "MANIFEST.json" && !(file.path in manifest.files)) {
      diagnostics.push(errorDiagnostic("unlisted-file", `${file.path} is not in the manifest.`, file.path));
    }
  }

  const recomputed = `sha256:${sha256Hex(
    JSON.stringify(
      Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b))),
    ),
  )}`;
  if (recomputed !== manifest.bundleDigest) {
    diagnostics.push(
      errorDiagnostic("bundle-digest-mismatch", `Recomputed ${recomputed}, manifest says ${manifest.bundleDigest}.`),
    );
  }

  const metadataRaw = byPath.get("metadata.json");
  if (metadataRaw) {
    const parsed = BundleMetadataSchema.safeParse(JSON.parse(metadataRaw));
    if (!parsed.success) {
      diagnostics.push(errorDiagnostic("invalid-metadata", parsed.error.issues.map((issue) => issue.message).join("; ")));
    }
  }
  const provenanceRaw = byPath.get("provenance.json");
  if (provenanceRaw) {
    const parsed = BundleProvenanceSchema.safeParse(JSON.parse(provenanceRaw));
    if (!parsed.success) {
      diagnostics.push(errorDiagnostic("invalid-provenance", parsed.error.issues.map((issue) => issue.message).join("; ")));
    }
  }

  return {
    valid: diagnostics.length === 0,
    ...(diagnostics.length === 0 ? { bundleDigest: manifest.bundleDigest } : {}),
    diagnostics,
  };
}

export async function writeBundleDir(bundle: PackedBundle, dir: string): Promise<void> {
  for (const file of bundle.files) {
    const target = join(dir, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }
}

export async function readBundleDir(dir: string): Promise<BundleFile[]> {
  const files: BundleFile[] = [];
  const walk = async (current: string): Promise<void> => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else files.push({ path: relative(dir, path).split("\\").join("/"), content: await readFile(path, "utf8") });
    }
  };
  await walk(dir);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}
