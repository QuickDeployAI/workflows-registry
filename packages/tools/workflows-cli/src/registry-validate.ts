import { access } from "node:fs/promises";
import { join } from "node:path";
import {
  WORKFLOW_NAME_PATTERN,
  getWorkflowImporterConfigSchema,
} from "@quickdeployai/workflow-registry-schemas";
import { discoverRegistrySources } from "./registry-discovery.js";

export type RegistryViolationCode =
  | "invalid-manifest"
  | "invalid-name-format"
  | "name-namespace-mismatch"
  | "duplicate-name"
  | "unknown-importer-engine"
  | "missing-source-file"
  | "provider-directory-mismatch";

export interface RegistryValidationViolation {
  code: RegistryViolationCode;
  path: string;
  message: string;
}

export interface RegistryValidationResult {
  ok: boolean;
  entryCount: number;
  violations: RegistryValidationViolation[];
}

/**
 * Collect-all registry validation: every violation across every source is
 * reported in one pass (never fail-fast). Schema-level rules (digest pinning,
 * exact versions, env-name secrets) are enforced by WorkflowManifestSchema
 * during discovery and surface as `invalid-manifest`.
 */
export async function validateRegistryEntries(options: {
  rootDir: string;
}): Promise<RegistryValidationResult> {
  const { sources, problems } = await discoverRegistrySources(options.rootDir);
  const violations: RegistryValidationViolation[] = problems.map((problem) => ({
    code: "invalid-manifest",
    path: problem.path,
    message: problem.message,
  }));

  const seenNames = new Map<string, string>();

  for (const source of sources) {
    const manifest = source.manifest;
    const name = manifest.metadata.name;

    if (!WORKFLOW_NAME_PATTERN.test(name)) {
      violations.push({
        code: "invalid-name-format",
        path: source.path,
        message: `"${name}" must match ${WORKFLOW_NAME_PATTERN}.`,
      });
    }

    if (!name.startsWith("ai.quickdeploy/")) {
      violations.push({
        code: "name-namespace-mismatch",
        path: source.path,
        message: `Manifest entries must use the ai.quickdeploy/ namespace (got "${name}").`,
      });
    }

    const previous = seenNames.get(name);
    if (previous) {
      violations.push({
        code: "duplicate-name",
        path: source.path,
        message: `"${name}" is already declared by ${previous}.`,
      });
    } else {
      seenNames.set(name, source.path);
    }

    const engine = manifest.spec.importer.engine;
    if (!getWorkflowImporterConfigSchema(engine)) {
      violations.push({
        code: "unknown-importer-engine",
        path: source.path,
        message: `No importer engine "${engine}" is registered.`,
      });
    }

    if (manifest.spec.source.type === "file") {
      const sourcePath = join(options.rootDir, manifest.spec.source.uri);
      const exists = await access(sourcePath).then(
        () => true,
        () => false,
      );
      if (!exists) {
        violations.push({
          code: "missing-source-file",
          path: source.path,
          message: `file source "${manifest.spec.source.uri}" does not exist in the repository.`,
        });
      }
    }

    const provider = source.path.split("/")[1] ?? "";
    const shortName = name.split("/")[1] ?? "";
    if (provider !== "quickdeploy" && !shortName.startsWith(provider)) {
      // Providers other than the first-party namespace should name entries
      // after their directory to keep the catalog navigable.
      violations.push({
        code: "provider-directory-mismatch",
        path: source.path,
        message: `Entry "${name}" lives under registry/${provider}/ but is not named for it.`,
      });
    }
  }

  return { ok: violations.length === 0, entryCount: sources.length, violations };
}

export function formatRegistryValidationViolations(
  violations: readonly RegistryValidationViolation[],
): string {
  if (violations.length === 0) return "";
  return `${violations
    .map((violation) => `${violation.code} ${violation.path}: ${violation.message}`)
    .join("\n")}\n`;
}
