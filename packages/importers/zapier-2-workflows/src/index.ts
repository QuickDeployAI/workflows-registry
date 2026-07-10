import {
  ZAPIER_PACK,
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

export const ENGINE = "zapier-2-workflows";

// ---------------------------------------------------------------------------
// Model — Zapier zap export subset: sequential steps of app+action.
// ---------------------------------------------------------------------------

const StepSchema = z.object({
  id: z.union([z.number().int(), z.string().min(1)]),
  app: z.string().min(1),
  action: z.string().min(1),
  params: z.record(z.string(), z.unknown()).default({}),
});

const ZapSchema = z.object({
  zap: z.object({
    title: z.string().min(1),
    steps: z.array(StepSchema).min(1),
  }),
});

export type ZapExport = z.infer<typeof ZapSchema>;

const stepNodeId = (id: number | string): string => `step-${id}`;

// ---------------------------------------------------------------------------
// Param token lowering: "{{<StepId>__<field>}}" → nodeOutput(step-<id>, [field]);
// everything else is a literal.
// ---------------------------------------------------------------------------

function lowerToken(
  inner: string,
  knownSteps: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  const ref = /^([A-Za-z0-9-]+)__([A-Za-z0-9_.]+)$/.exec(inner);
  if (ref && knownSteps.has(ref[1] as string)) {
    return {
      kind: "nodeOutput",
      nodeId: stepNodeId(ref[1] as string),
      path: (ref[2] as string).split("."),
    };
  }
  fidelity.unsupported(
    "zapier-token",
    `"{{${inner}}}" does not reference a known step ("<stepId>__<field>").`,
    path,
  );
  return { kind: "literal", value: "" };
}

export function lowerZapierString(
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
  if (typeof value === "string") return lowerZapierString(value, knownSteps, fidelity, path);
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

export const zapierImporter: WorkflowImporter<ZapExport> = {
  id: ENGINE,
  supportedVersions: ["1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as {
        zap?: { steps?: unknown };
      } | null;
      const steps = raw?.zap?.steps;
      if (
        Array.isArray(steps) &&
        steps.length > 0 &&
        steps.every(
          (step) =>
            typeof (step as { app?: unknown }).app === "string" &&
            typeof (step as { action?: unknown }).action === "string",
        )
      ) {
        return { detected: true, confidence: "exact" as const, formatVersion: "1" };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<ZapExport>> {
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
    // Authentication/account references on steps never reach the model.
    const sanitized = stripCredentialMetadata(raw);
    const parsed = ZapSchema.safeParse(sanitized);
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
    for (const step of model.zap.steps) {
      const key = String(step.id);
      if (seen.has(key)) {
        diagnostics.push(errorDiagnostic("duplicate-step-id", `Step id ${key} appears more than once.`));
      }
      seen.add(key);
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodesOut: PlanNode[] = [];
    const knownSteps = new Set(model.zap.steps.map((step) => String(step.id)));

    for (const [index, step] of model.zap.steps.entries()) {
      const nodeId = stepNodeId(step.id);
      const nextStep = model.zap.steps[index + 1];
      const nextId = nextStep === undefined ? "__succeed" : stepNodeId(nextStep.id);

      if (/code/i.test(step.app)) {
        fidelity.blocked(
          "code-node",
          `Step ${nodeId} uses the "${step.app}" app; code is never executed.`,
          nodeId,
        );
        continue;
      }

      const key = `${step.app}:${step.action}`;
      const mapping = resolveMapping(ZAPIER_PACK, key);
      if (!mapping || isHttpPassthrough(mapping)) {
        // HTTP passthrough zaps carry free-form request definitions we do not
        // model yet; treat them as unmapped alongside unknown apps.
        fidelity.blocked("unmapped-connector", `No connector mapping for "${key}".`, nodeId);
        continue;
      }

      requirements.push(toCapabilityRequirement(nodeId, mapping));
      nodesOut.push({
        id: nodeId,
        kind: "invoke",
        binding: nodeId,
        input: {
          kind: "object",
          entries: { body: lowerValue(step.params, knownSteps, fidelity, `${nodeId}.params`) },
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

    const first = model.zap.steps[0];
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
      entryNodeId: first === undefined ? "__succeed" : stepNodeId(first.id),
      nodes: nodesOut,
      capabilityRequirements: requirements,
      // Mapped app operations carry provider-relative paths, not literal
      // URLs — no outbound hosts are recorded.
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

export default zapierImporter;
