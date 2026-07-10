import {
  PIPEDREAM_PACK,
  isHttpPassthrough,
  resolveMapping,
  stripCredentialMetadata,
  toCapabilityRequirement,
} from "@quickdeployai/connector-mappings";
import { errorDiagnostic, type Diagnostic } from "@quickdeployai/workflow-core";
import type { Expression } from "@quickdeployai/workflow-expressions";
import {
  FidelityCollector,
  entrypointFile,
  parseJsonSafe,
  type CompileResult,
  type ParseOutcome,
  type SourceArtifact,
  type ValidationReport,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import {
  buildPlan,
  validatePlan,
  type CapabilityRequirement,
  type PlanNode,
} from "@quickdeployai/workflow-ir";
import { z } from "zod";

export const ENGINE = "pipedream-2-workflows";

// ---------------------------------------------------------------------------
// Model — Pipedream workflow export subset: sequential steps, each either a
// registry action (action.key) or inline code (never executed → blocked).
// ---------------------------------------------------------------------------

const StepSchema = z.object({
  namespace: z.string().min(1),
  action: z.object({ key: z.string().min(1) }).optional(),
  code: z.string().optional(),
  params: z.record(z.string(), z.unknown()).default({}),
  props: z.record(z.string(), z.unknown()).default({}),
});

const PipedreamWorkflowSchema = z.object({
  name: z.string().min(1),
  steps: z.array(StepSchema).min(1),
});

export type PipedreamWorkflow = z.infer<typeof PipedreamWorkflowSchema>;

// ---------------------------------------------------------------------------
// Token lowering: "{{steps.<ns>.$return_value.<path>}}" → nodeOutput(<ns>, path).
// ---------------------------------------------------------------------------

function lowerToken(
  inner: string,
  knownSteps: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  const ref = /^steps\.([A-Za-z0-9_]+)\.\$return_value\.([A-Za-z0-9_.]+)$/.exec(inner);
  if (ref && knownSteps.has(ref[1] as string)) {
    return {
      kind: "nodeOutput",
      nodeId: ref[1] as string,
      path: (ref[2] as string).split("."),
    };
  }
  fidelity.unsupported(
    "pipedream-token",
    `"{{${inner}}}" is outside the supported subset (steps.<ns>.$return_value.<path>).`,
    path,
  );
  return { kind: "literal", value: "" };
}

export function lowerPipedreamString(
  raw: string,
  knownSteps: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (!raw.includes("{{")) return { kind: "literal", value: raw };
  const full = /^\{\{\s*(.+?)\s*\}\}$/.exec(raw.trim());
  if (full) return lowerToken(full[1] as string, knownSteps, fidelity, path);

  const parts: Expression[] = [];
  const pattern = /\{\{\s*(.*?)\s*\}\}/g;
  let cursor = 0;
  for (let match = pattern.exec(raw); match; match = pattern.exec(raw)) {
    if (match.index > cursor) parts.push({ kind: "literal", value: raw.slice(cursor, match.index) });
    parts.push(lowerToken(match[1] as string, knownSteps, fidelity, path));
    cursor = match.index + match[0].length;
  }
  if (cursor < raw.length) parts.push({ kind: "literal", value: raw.slice(cursor) });
  return { kind: "interpolate", parts };
}

function lowerValue(
  value: unknown,
  knownSteps: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (typeof value === "string") return lowerPipedreamString(value, knownSteps, fidelity, path);
  if (Array.isArray(value)) {
    return {
      kind: "array",
      items: value.map((item, index) => lowerValue(item, knownSteps, fidelity, `${path}[${index}]`)),
    };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      entries[key] = lowerValue(item, knownSteps, fidelity, `${path}.${key}`);
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const pipedreamImporter: WorkflowImporter<PipedreamWorkflow> = {
  id: ENGINE,
  supportedVersions: ["1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as { steps?: unknown } | null;
      const steps = raw?.steps;
      if (
        Array.isArray(steps) &&
        steps.length > 0 &&
        steps.every(
          (step) => typeof (step as { namespace?: unknown }).namespace === "string",
        ) &&
        steps.some((step) => {
          const candidate = step as { action?: { key?: unknown }; code?: unknown };
          return typeof candidate.action?.key === "string" || typeof candidate.code === "string";
        })
      ) {
        return { detected: true, confidence: "exact" as const, formatVersion: "1" };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<PipedreamWorkflow>> {
    let raw: unknown;
    try {
      raw = parseJsonSafe(entrypointFile(artifact).text);
    } catch (error) {
      return {
        ok: false,
        diagnostics: [
          errorDiagnostic("parse-failed", error instanceof Error ? error.message : String(error)),
        ],
      };
    }
    // Connected-account provision ids never reach the model.
    const sanitized = stripCredentialMetadata(raw, ["authProvisionId"]);
    const parsed = PipedreamWorkflowSchema.safeParse(sanitized);
    if (!parsed.success) {
      return {
        ok: false,
        diagnostics: parsed.error.issues.map((issue) =>
          errorDiagnostic("schema-violation", issue.message, issue.path.join(".")),
        ),
      };
    }
    return { ok: true, model: parsed.data, diagnostics: [] };
  },

  async validate(model, _context): Promise<ValidationReport> {
    const diagnostics: Diagnostic[] = [];
    const seen = new Set<string>();
    for (const step of model.steps) {
      if (seen.has(step.namespace)) {
        diagnostics.push(
          errorDiagnostic(
            "duplicate-namespace",
            `Step namespace "${step.namespace}" appears more than once.`,
          ),
        );
      }
      seen.add(step.namespace);
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodesOut: PlanNode[] = [];
    const knownSteps = new Set(model.steps.map((step) => step.namespace));

    for (const [index, step] of model.steps.entries()) {
      const nodeId = step.namespace;
      const nextStep = model.steps[index + 1];
      const nextId = nextStep === undefined ? "__succeed" : nextStep.namespace;

      if (step.code !== undefined) {
        fidelity.blocked(
          "code-node",
          `Step "${nodeId}" contains inline code; code is never executed.`,
          nodeId,
        );
        continue;
      }

      if (!step.action) {
        fidelity.blocked(
          "unmapped-connector",
          `Step "${nodeId}" has neither an action key nor code.`,
          nodeId,
        );
        continue;
      }

      const mapping = resolveMapping(PIPEDREAM_PACK, step.action.key);
      if (!mapping || isHttpPassthrough(mapping)) {
        // Free-form HTTP steps carry request definitions we do not model yet.
        fidelity.blocked(
          "unmapped-connector",
          `No connector mapping for "${step.action.key}".`,
          nodeId,
        );
        continue;
      }

      requirements.push(toCapabilityRequirement(nodeId, mapping));
      const body = { ...step.props, ...step.params };
      nodesOut.push({
        id: nodeId,
        kind: "invoke",
        binding: nodeId,
        input: {
          kind: "object",
          entries: { body: lowerValue(body, knownSteps, fidelity, `${nodeId}.params`) },
        },
        effect: mapping.effect,
        approval: "none",
        ...(mapping.effect === "read"
          ? {}
          : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${nodeId}` } }),
        next: nextId,
      });
      fidelity.exact("mapped-connector", nodeId);
    }

    nodesOut.push({ id: "__succeed", kind: "succeed" });

    if (fidelity.hasBlocking()) {
      return {
        diagnostics: [
          {
            severity: "error",
            code: "fidelity-blocking",
            message: "Unsupported constructs affect execution; see the fidelity report.",
          },
        ],
        fidelity: fidelity.report(),
        requirements,
      };
    }

    const plan = buildPlan({
      id: context.planId,
      name: context.planName,
      source: {
        format: ENGINE,
        formatVersion: "1",
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId: model.steps[0]?.namespace ?? "__succeed",
      nodes: nodesOut,
      capabilityRequirements: requirements,
      // Mapped registry actions carry provider-relative operations, not
      // literal URLs — no outbound hosts are recorded.
      outboundHosts: [],
      fidelity: fidelity.report(),
      ...(context.budgets ? { budgets: context.budgets } : {}),
    });

    const planDiagnostics = validatePlan(plan).map((diagnostic) => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
      ...(diagnostic.path === undefined ? {} : { path: diagnostic.path }),
    }));

    return { plan, diagnostics: planDiagnostics, fidelity: fidelity.report(), requirements };
  },
};

export default pipedreamImporter;
