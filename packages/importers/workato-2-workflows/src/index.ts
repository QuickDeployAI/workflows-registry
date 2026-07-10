import {
  WORKATO_PACK,
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

export const ENGINE = "workato-2-workflows";

// ---------------------------------------------------------------------------
// Model — Workato recipe export subset: a trigger plus sequential actions.
// ---------------------------------------------------------------------------

const ActionSchema = z.object({
  name: z.string().min(1),
  provider: z.string().min(1),
  action: z.string().min(1),
  input: z.record(z.string(), z.unknown()).default({}),
});

const WorkatoRecipeSchema = z.object({
  name: z.string().min(1),
  recipe: z.object({
    trigger: z.record(z.string(), z.unknown()).optional(),
    actions: z.array(ActionSchema).min(1),
  }),
});

export type WorkatoRecipe = z.infer<typeof WorkatoRecipeSchema>;

// ---------------------------------------------------------------------------
// Datapill lowering: "#{_('data.<step>.<field>')}". A step matching an action
// name lowers to that node's output; anything else falls back to the run
// input. Both are approximated — Workato datapills carry richer semantics
// (list handling, formulas) than the lowered paths.
// ---------------------------------------------------------------------------

const DATAPILL = /#\{_\('data\.([A-Za-z0-9_]+)\.([A-Za-z0-9_.]+)'\)\}/g;

function lowerDatapill(
  step: string,
  field: string,
  knownActions: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  const fieldPath = field.split(".");
  if (knownActions.has(step)) {
    fidelity.approximated(
      "datapill",
      `data.${step}.${field} lowered to the "${step}" node's output.`,
      path,
    );
    return { kind: "nodeOutput", nodeId: step, path: fieldPath };
  }
  fidelity.approximated(
    "datapill",
    `data.${step}.${field} does not match an action; lowered against the run input.`,
    path,
  );
  return {
    kind: "input",
    path: step === "trigger" ? fieldPath : [step, ...fieldPath],
  };
}

export function lowerWorkatoString(
  raw: string,
  knownActions: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (!raw.includes("#{")) return { kind: "literal", value: raw };

  const parts: Expression[] = [];
  let cursor = 0;
  DATAPILL.lastIndex = 0;
  for (let match = DATAPILL.exec(raw); match; match = DATAPILL.exec(raw)) {
    if (match.index > cursor) parts.push({ kind: "literal", value: raw.slice(cursor, match.index) });
    parts.push(lowerDatapill(match[1] as string, match[2] as string, knownActions, fidelity, path));
    cursor = match.index + match[0].length;
  }
  if (cursor === 0) {
    // "#{...}" present but not a data datapill — formulas are unsupported.
    fidelity.unsupported("workato-formula", `"${raw}" is outside the supported datapill subset.`, path);
    return { kind: "literal", value: "" };
  }
  if (cursor < raw.length) parts.push({ kind: "literal", value: raw.slice(cursor) });
  const first = parts[0];
  return parts.length === 1 && first !== undefined ? first : { kind: "interpolate", parts };
}

function lowerValue(
  value: unknown,
  knownActions: Set<string>,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (typeof value === "string") return lowerWorkatoString(value, knownActions, fidelity, path);
  if (Array.isArray(value)) {
    return {
      kind: "array",
      items: value.map((item, index) => lowerValue(item, knownActions, fidelity, `${path}[${index}]`)),
    };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      entries[key] = lowerValue(item, knownActions, fidelity, `${path}.${key}`);
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const workatoImporter: WorkflowImporter<WorkatoRecipe> = {
  id: ENGINE,
  supportedVersions: ["1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as {
        recipe?: { actions?: unknown };
      } | null;
      const actions = raw?.recipe?.actions;
      if (
        Array.isArray(actions) &&
        actions.length > 0 &&
        actions.every(
          (action) =>
            typeof (action as { provider?: unknown }).provider === "string" &&
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

  async parse(artifact, _context): Promise<ParseOutcome<WorkatoRecipe>> {
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
    // Recipe connection/account metadata never reaches the model.
    const sanitized = stripCredentialMetadata(raw, ["account_id"]);
    const parsed = WorkatoRecipeSchema.safeParse(sanitized);
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
    for (const action of model.recipe.actions) {
      if (seen.has(action.name)) {
        diagnostics.push(
          errorDiagnostic("duplicate-action-name", `Action name "${action.name}" appears more than once.`),
        );
      }
      seen.add(action.name);
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodesOut: PlanNode[] = [];
    const knownActions = new Set(model.recipe.actions.map((action) => action.name));

    if (model.recipe.trigger !== undefined) {
      fidelity.approximated("trigger", "The recipe trigger becomes the run input.");
    }

    for (const [index, action] of model.recipe.actions.entries()) {
      const nodeId = action.name;
      const nextAction = model.recipe.actions[index + 1];
      const nextId = nextAction === undefined ? "__succeed" : nextAction.name;

      const key = `${action.provider}:${action.action}`;
      const mapping = resolveMapping(WORKATO_PACK, key);
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
          entries: { body: lowerValue(action.input, knownActions, fidelity, `${nodeId}.input`) },
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
      entryNodeId: model.recipe.actions[0]?.name ?? "__succeed",
      nodes: nodesOut,
      capabilityRequirements: requirements,
      // Mapped recipe actions carry provider-relative operations, not literal
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

export default workatoImporter;
