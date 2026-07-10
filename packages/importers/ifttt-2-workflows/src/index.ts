import {
  IFTTT_PACK,
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

export const ENGINE = "ifttt-2-workflows";

// ---------------------------------------------------------------------------
// Model — IFTTT applet subset: one trigger, sequential actions.
// ---------------------------------------------------------------------------

const AppletActionSchema = z.object({
  service: z.string().min(1),
  action: z.string().min(1),
  fields: z.record(z.string(), z.unknown()).default({}),
});

const AppletSchema = z.object({
  applet: z.object({
    name: z.string().min(1),
    trigger: z.object({ service: z.string().min(1), event: z.string().min(1) }),
    actions: z.array(AppletActionSchema).min(1),
  }),
});

export type IftttApplet = z.infer<typeof AppletSchema>;

// ---------------------------------------------------------------------------
// Ingredient lowering: "{{IngredientName}}" → input path [ingredientName]
// (approximated — the run input is the trigger payload).
// ---------------------------------------------------------------------------

const lowerFirst = (value: string): string => value.charAt(0).toLowerCase() + value.slice(1);

function lowerIngredient(inner: string, fidelity: FidelityCollector, path: string): Expression {
  const ingredient = /^[A-Za-z][A-Za-z0-9_]*$/.exec(inner);
  if (ingredient) {
    fidelity.approximated(
      "ingredient",
      `Ingredient "{{${inner}}}" lowered to the run input path "${lowerFirst(inner)}".`,
      path,
    );
    return { kind: "input", path: [lowerFirst(inner)] };
  }
  fidelity.unsupported("ingredient", `"{{${inner}}}" is not a plain ingredient name.`, path);
  return { kind: "literal", value: "" };
}

export function lowerIftttString(
  raw: string,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (!raw.includes("{{")) return { kind: "literal", value: raw };
  const full = /^\{\{\s*(.+?)\s*\}\}$/.exec(raw.trim());
  if (full) return lowerIngredient(full[1] as string, fidelity, path);

  const parts: Expression[] = [];
  const pattern = /\{\{\s*(.*?)\s*\}\}/g;
  let cursor = 0;
  for (let match = pattern.exec(raw); match; match = pattern.exec(raw)) {
    if (match.index > cursor) parts.push({ kind: "literal", value: raw.slice(cursor, match.index) });
    parts.push(lowerIngredient(match[1] as string, fidelity, path));
    cursor = match.index + match[0].length;
  }
  if (cursor < raw.length) parts.push({ kind: "literal", value: raw.slice(cursor) });
  return { kind: "interpolate", parts };
}

function lowerValue(value: unknown, fidelity: FidelityCollector, path: string): Expression {
  if (typeof value === "string") return lowerIftttString(value, fidelity, path);
  if (Array.isArray(value)) {
    return {
      kind: "array",
      items: value.map((item, index) => lowerValue(item, fidelity, `${path}[${index}]`)),
    };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      entries[key] = lowerValue(item, fidelity, `${path}.${key}`);
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const iftttImporter: WorkflowImporter<IftttApplet> = {
  id: ENGINE,
  supportedVersions: ["1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as {
        applet?: { trigger?: { service?: unknown }; actions?: unknown };
      } | null;
      if (
        typeof raw?.applet?.trigger?.service === "string" &&
        Array.isArray(raw.applet.actions) &&
        raw.applet.actions.every(
          (action) =>
            typeof (action as { service?: unknown }).service === "string" &&
            typeof (action as { action?: unknown }).action === "string",
        )
      ) {
        return { detected: true, confidence: "exact" as const, formatVersion: "1" };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<IftttApplet>> {
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
    // Service account/auth metadata never reaches the model.
    const sanitized = stripCredentialMetadata(raw);
    const parsed = AppletSchema.safeParse(sanitized);
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
    if (model.applet.actions.length === 0) {
      diagnostics.push(errorDiagnostic("no-actions", "Applet declares no actions."));
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodesOut: PlanNode[] = [];

    const trigger = model.applet.trigger;
    fidelity.approximated(
      "trigger",
      `Trigger ${trigger.service}:${trigger.event} becomes the run input (its ingredients are input paths).`,
    );

    const nodeIds = model.applet.actions.map((action, index) => {
      const base = `${action.service}-${action.action}`;
      return model.applet.actions.findIndex(
        (other) => `${other.service}-${other.action}` === base,
      ) === index
        ? base
        : `${base}-${index + 1}`;
    });

    for (const [index, action] of model.applet.actions.entries()) {
      const nodeId = nodeIds[index] as string;
      const nextId = nodeIds[index + 1] ?? "__succeed";

      const key = `${action.service}:${action.action}`;
      const mapping = resolveMapping(IFTTT_PACK, key);
      if (!mapping) {
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
          entries: { body: lowerValue(action.fields, fidelity, `${nodeId}.fields`) },
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
      entryNodeId: nodeIds[0] ?? "__succeed",
      nodes: nodesOut,
      capabilityRequirements: requirements,
      // Mapped service actions carry provider-relative operations, not
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

export default iftttImporter;
