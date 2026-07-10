import type { Diagnostic } from "@quickdeployai/workflow-core";
import type {
  CapabilityRequirement,
  CompileDiagnostic,
  ExecutionBudget,
  ExecutionPlanV1,
  FidelityReport,
} from "@quickdeployai/workflow-ir";
import type { ReferenceResolver } from "./resolver.js";

export interface ArtifactFile {
  /** Repo-style relative path, already sanitized (no traversal, no absolute). */
  path: string;
  text: string;
}

export interface SourceArtifact {
  /** sha256: digest over the canonical file map. */
  digest: string;
  files: ArtifactFile[];
  entrypoint?: string;
  declaredFormat?: string;
}

export interface DetectionResult {
  detected: boolean;
  confidence: "exact" | "probable" | "none";
  formatVersion?: string;
  reason?: string;
}

export interface ParseContext {
  config?: Record<string, unknown>;
  resolver: ReferenceResolver;
}

export interface ValidationReport {
  valid: boolean;
  diagnostics: Diagnostic[];
}

export interface CompileContext {
  planId: string;
  planName: string;
  /** Digest of the ingested SourceArtifact — recorded in plan.source. */
  artifactDigest?: string;
  entrypoint?: string;
  budgets?: Partial<ExecutionBudget>;
  config?: Record<string, unknown>;
  resolver: ReferenceResolver;
}

export interface CompileResult {
  plan?: ExecutionPlanV1;
  diagnostics: CompileDiagnostic[];
  fidelity: FidelityReport;
  requirements: CapabilityRequirement[];
}

/**
 * Conformance level the importer has PROVEN (enforced by the conformance
 * harness — a declared level above what tests demonstrate fails CI):
 * 0 detect · 1 official/schema validation · 2 compile + fidelity ·
 * 3 requirements bindable · 4 supported subset executes durably ·
 * 5 parity vs the source platform.
 */
export type ConformanceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface WorkflowImporter<TModel> {
  readonly id: string;
  readonly supportedVersions: string[];
  readonly declaredConformance: ConformanceLevel;

  detect(artifact: SourceArtifact): Promise<DetectionResult>;
  parse(artifact: SourceArtifact, context: ParseContext): Promise<ParseOutcome<TModel>>;
  validate(model: TModel, context: ParseContext): Promise<ValidationReport>;
  compile(model: TModel, context: CompileContext): Promise<CompileResult>;
}

/** Phases collect diagnostics rather than discarding partial results. */
export type ParseOutcome<TModel> =
  | { ok: true; model: TModel; diagnostics: Diagnostic[] }
  | { ok: false; diagnostics: Diagnostic[] };

export function entrypointFile(artifact: SourceArtifact): ArtifactFile {
  const path = artifact.entrypoint ?? artifact.files[0]?.path;
  const file = artifact.files.find((candidate) => candidate.path === path);
  if (!file) {
    throw new Error(`Source artifact has no entrypoint file (looked for "${path ?? "<none>"}").`);
  }
  return file;
}
