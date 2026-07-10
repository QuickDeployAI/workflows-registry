import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import {
  WorkflowManifestSchema,
  type WorkflowManifest,
} from "@quickdeployai/workflow-registry-schemas";

export interface DiscoveredWorkflowManifest {
  kind: "workflow-manifest";
  path: string;
  manifest: WorkflowManifest;
}

export interface DiscoveryProblem {
  path: string;
  message: string;
}

export interface RegistryDiscoveryResult {
  sources: DiscoveredWorkflowManifest[];
  problems: DiscoveryProblem[];
}

export function isWorkflowManifestFileName(name: string): boolean {
  return name.endsWith(".workflow.json");
}

export function normalizePath(path: string): string {
  return path.split(sep).join("/");
}

function isProviderRegistryPath(path: string): boolean {
  const parts = path.split("/");
  return parts[0] === "registry" && Boolean(parts[1]) && parts.length >= 3;
}

/**
 * Discover authored registry sources under `registry/<provider>/`:
 * `*.workflow.json` (WorkflowManifest). Parse failures are collected as
 * problems rather than thrown so callers can report every bad source at once.
 */
export async function discoverRegistrySources(rootDir: string): Promise<RegistryDiscoveryResult> {
  const problems: DiscoveryProblem[] = [];
  const sources: DiscoveredWorkflowManifest[] = [];
  const files = await findFiles(join(rootDir, "registry"), isWorkflowManifestFileName);

  for (const file of files) {
    const relativePath = normalizePath(relative(rootDir, file));
    if (!isProviderRegistryPath(relativePath)) {
      problems.push({
        path: relativePath,
        message: "Registry sources must live under registry/<provider>/.",
      });
      continue;
    }

    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      problems.push({
        path: relativePath,
        message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }

    const parsed = WorkflowManifestSchema.safeParse(raw);
    if (!parsed.success) {
      problems.push({
        path: relativePath,
        message: parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
          .join("; "),
      });
      continue;
    }
    sources.push({ kind: "workflow-manifest", path: relativePath, manifest: parsed.data });
  }

  return { sources, problems };
}

async function findFiles(dir: string, predicate: (name: string) => boolean): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    },
  );
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return findFiles(path, predicate);
      if (entry.isFile() && predicate(entry.name)) return [path];
      return [];
    }),
  );
  return files.flat().sort((left, right) => normalizePath(left).localeCompare(normalizePath(right)));
}
