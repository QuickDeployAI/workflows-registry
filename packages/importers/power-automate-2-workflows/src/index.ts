import {
  POWER_AUTOMATE_PACK,
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
  type SideEffect,
} from "@quickdeployai/workflow-ir";
import { z } from "zod";

export const ENGINE = "power-automate-2-workflows";

// ---------------------------------------------------------------------------
// Model — Power Automate / Logic Apps WDL subset: definition.actions keyed by
// action name, chained via runAfter.
// ---------------------------------------------------------------------------

const ActionSchema = z.object({
  type: z.string().min(1),
  inputs: z.record(z.string(), z.unknown()).default({}),
  runAfter: z.record(z.string(), z.array(z.string())).default({}),
});

const FlowSchema = z.object({
  definition: z.object({
    actions: z.record(z.string(), ActionSchema),
    triggers: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type PowerAutomateFlow = z.infer<typeof FlowSchema>;
type Action = z.infer<typeof ActionSchema>;

/** ".../apis/shared_office365" + "SendEmailV2" → "shared_office365/SendEmailV2". */
function mappingKeyOf(action: Action): string | undefined {
  const host = action.inputs.host as
    | { operationId?: unknown; apiId?: unknown }
    | undefined;
  if (typeof host?.operationId !== "string" || typeof host.apiId !== "string") return undefined;
  const apiSegment = host.apiId.split("/").filter(Boolean).at(-1);
  if (!apiSegment) return undefined;
  return `${apiSegment}/${host.operationId}`;
}

// WDL expressions ("@{triggerBody()...}", "@variables('x')") are not lowered;
// when execution-relevant they block compilation.
function lowerValue(value: unknown, fidelity: FidelityCollector, path: string): Expression {
  if (typeof value === "string") {
    if (value.includes("@{") || value.startsWith("@")) {
      fidelity.unsupported(
        "wdl-expression",
        `"${value}" uses a WDL expression outside the supported subset.`,
        path,
      );
      return { kind: "literal", value: "" };
    }
    return { kind: "literal", value };
  }
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

function effectOfMethod(method: string): SideEffect {
  const upper = method.toUpperCase();
  return upper === "GET" ? "read" : upper === "DELETE" ? "destructive" : "mutation";
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const powerAutomateImporter: WorkflowImporter<PowerAutomateFlow> = {
  id: ENGINE,
  supportedVersions: ["2016-06-01"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as {
        definition?: { actions?: unknown; $schema?: unknown };
      } | null;
      const actions = raw?.definition?.actions;
      if (actions !== null && typeof actions === "object" && !Array.isArray(actions)) {
        const values = Object.values(actions as Record<string, unknown>);
        const wdlLike =
          (typeof raw?.definition?.$schema === "string" &&
            /workflowdefinition/i.test(raw.definition.$schema)) ||
          values.some(
            (action) => action !== null && typeof action === "object" && "runAfter" in action,
          );
        if (wdlLike) {
          return { detected: true, confidence: "exact" as const, formatVersion: "2016-06-01" };
        }
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<PowerAutomateFlow>> {
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
    // host.connection names, connectionReferences, and authentication blocks
    // never reach the model.
    const sanitized = stripCredentialMetadata(raw, ["connectionReferences", "connectionName"]);
    const parsed = FlowSchema.safeParse(sanitized);
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
    const names = new Set(Object.keys(model.definition.actions));
    for (const [name, action] of Object.entries(model.definition.actions)) {
      for (const dependency of Object.keys(action.runAfter)) {
        if (!names.has(dependency)) {
          diagnostics.push(
            errorDiagnostic(
              "unknown-run-after",
              `Action "${name}" runs after unknown action "${dependency}".`,
              name,
            ),
          );
        }
      }
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodesOut: PlanNode[] = [];
    const hosts = new Set<string>();

    if (model.definition.triggers && Object.keys(model.definition.triggers).length > 0) {
      fidelity.approximated("trigger", "The flow trigger becomes the run input.");
    }

    // runAfter forms a DAG; lower it to a topological chain. Fan-out/fan-in
    // is flattened sequentially (approximated).
    const actions = Object.entries(model.definition.actions);
    const placed: Array<[string, Action]> = [];
    const placedNames = new Set<string>();
    const remaining = new Map(actions);
    while (remaining.size > 0) {
      let progressed = false;
      for (const [name, action] of remaining) {
        if (Object.keys(action.runAfter).every((dependency) => placedNames.has(dependency))) {
          placed.push([name, action]);
          placedNames.add(name);
          remaining.delete(name);
          progressed = true;
          break;
        }
      }
      if (!progressed) {
        fidelity.unsupported(
          "run-after-cycle",
          `Actions ${[...remaining.keys()].join(", ")} form a runAfter cycle.`,
        );
        break;
      }
    }
    const fanOut = placed.some(([, action]) => Object.keys(action.runAfter).length > 1);
    if (fanOut) {
      fidelity.approximated("run-after", "Parallel runAfter branches were flattened into a chain.");
    }
    for (const [name, action] of placed) {
      const statuses = Object.values(action.runAfter).flat();
      if (statuses.some((status) => status !== "Succeeded")) {
        fidelity.approximated(
          "run-after-status",
          `Action "${name}" runs on non-Succeeded statuses; only the success path is compiled.`,
          name,
        );
      }
    }

    for (const [index, [name, action]] of placed.entries()) {
      const nextEntry = placed[index + 1];
      const nextId = nextEntry === undefined ? "__succeed" : nextEntry[0];

      if (action.type === "Http") {
        const urlRaw = typeof action.inputs.uri === "string" ? action.inputs.uri : "";
        const method =
          typeof action.inputs.method === "string" ? action.inputs.method.toUpperCase() : "GET";
        const effect = effectOfMethod(method);
        let host: string | undefined;
        let operation = `${method} *`;
        try {
          const url = new URL(urlRaw);
          host = url.host;
          operation = `${method} ${url.pathname}`;
          hosts.add(host);
        } catch {
          fidelity.approximated("http-uri", `"${urlRaw}" is not an absolute URL.`, name);
        }
        requirements.push({
          id: name,
          protocol: "http",
          ...(host === undefined ? {} : { provider: host }),
          operation,
          requiredScopes: [],
          effect,
        });
        const entries: Record<string, Expression> = {
          method: { kind: "literal", value: method },
          url: lowerValue(urlRaw, fidelity, `${name}.uri`),
        };
        if (action.inputs.body !== undefined) {
          entries.body = lowerValue(action.inputs.body, fidelity, `${name}.body`);
        }
        nodesOut.push({
          id: name,
          kind: "invoke",
          binding: name,
          input: { kind: "object", entries },
          effect,
          approval: "none",
          ...(effect === "read"
            ? {}
            : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${name}` } }),
          next: nextId,
        });
        fidelity.exact("http-action", name);
        continue;
      }

      if (action.type === "OpenApiConnection") {
        const key = mappingKeyOf(action);
        const mapping = key === undefined ? undefined : resolveMapping(POWER_AUTOMATE_PACK, key);
        if (!mapping) {
          fidelity.blocked(
            "unmapped-connector",
            `No connector mapping for "${key ?? "<missing host.apiId/operationId>"}".`,
            name,
          );
          continue;
        }
        requirements.push(toCapabilityRequirement(name, mapping));
        nodesOut.push({
          id: name,
          kind: "invoke",
          binding: name,
          input: {
            kind: "object",
            entries: {
              body: lowerValue(action.inputs.parameters ?? {}, fidelity, `${name}.parameters`),
            },
          },
          effect: mapping.effect,
          approval: "none",
          ...(mapping.effect === "read"
            ? {}
            : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${name}` } }),
          next: nextId,
        });
        fidelity.exact("mapped-connector", name);
        continue;
      }

      fidelity.blocked("unmapped-connector", `Action type "${action.type}" is not supported.`, name);
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
        formatVersion: "2016-06-01",
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId: placed[0]?.[0] ?? "__succeed",
      nodes: nodesOut,
      capabilityRequirements: requirements,
      outboundHosts: [...hosts].sort(),
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

export default powerAutomateImporter;
