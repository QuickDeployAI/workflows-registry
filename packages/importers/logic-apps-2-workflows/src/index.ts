import { errorDiagnostic, type Diagnostic } from "@quickdeployai/workflow-core";
import type { Expression } from "@quickdeployai/workflow-expressions";
import {
  buildPlan,
  validatePlan,
  type CapabilityRequirement,
  type PlanNode,
  type SideEffect,
} from "@quickdeployai/workflow-ir";
import {
  FidelityCollector,
  entrypointFile,
  parseJsonSafe,
  type CompileContext,
  type CompileResult,
  type ParseOutcome,
  type SourceArtifact,
  type ValidationReport,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { z } from "zod";

export const ENGINE = "logic-apps-2-workflows";

// ---------------------------------------------------------------------------
// Model — the Workflow Definition Language subset this importer understands.
// Accepts `{ definition: {...} }` wrappers or a bare definition object.
// ---------------------------------------------------------------------------

export interface LogicAppsAction {
  type: string;
  inputs?: unknown;
  runAfter?: Record<string, string[]> | undefined;
  expression?: unknown;
  actions?: Record<string, LogicAppsAction> | undefined;
  else?: { actions?: Record<string, LogicAppsAction> | undefined } | undefined;
}

const ActionSchema: z.ZodType<LogicAppsAction> = z.lazy(() =>
  z
    .object({
      type: z.string(),
      inputs: z.unknown().optional(),
      runAfter: z.record(z.string(), z.array(z.string())).optional(),
      expression: z.unknown().optional(),
      actions: z.record(z.string(), ActionSchema).optional(),
      else: z.object({ actions: z.record(z.string(), ActionSchema).optional() }).optional(),
    })
    .passthrough(),
) as z.ZodType<LogicAppsAction>;

const DefinitionSchema = z.object({
  $schema: z.string().optional(),
  contentVersion: z.string().optional(),
  triggers: z.record(z.string(), z.unknown()).optional(),
  actions: z.record(z.string(), ActionSchema),
});
export type LogicAppsDefinition = z.infer<typeof DefinitionSchema>;

const HttpInputsSchema = z
  .object({
    method: z.string(),
    uri: z.string(),
    body: z.unknown().optional(),
    headers: z.record(z.string(), z.unknown()).optional(),
    queries: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const WaitInputsSchema = z
  .object({ interval: z.object({ count: z.number(), unit: z.string() }) })
  .passthrough();

const TerminateInputsSchema = z
  .object({
    runStatus: z.string(),
    runError: z.object({ code: z.string().optional(), message: z.string().optional() }).optional(),
  })
  .passthrough();

function unwrapDefinition(raw: unknown): unknown {
  if (raw !== null && typeof raw === "object" && "definition" in (raw as Record<string, unknown>)) {
    return (raw as { definition: unknown }).definition;
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Expression lowering: the `@{triggerBody()?['x']}` / `@{body('Action')?['y']}`
// token subset lowers to input/nodeOutput references; full-string
// `@equals(a, b)` lowers to a compare. Everything else with a leading `@` or
// an embedded token lands in the fidelity report as unsupported.
// ---------------------------------------------------------------------------

const TRIGGER_BODY_PATTERN = /^triggerBody\(\)((?:\?\['[^']+'\])*)$/;
const BODY_REF_PATTERN = /^body\('([^']+)'\)((?:\?\['[^']+'\])*)$/;

function chainSegments(chain: string): string[] {
  const segments: string[] = [];
  const pattern = /\?\['([^']+)'\]/g;
  for (let match = pattern.exec(chain); match; match = pattern.exec(chain)) {
    segments.push(match[1] as string);
  }
  return segments;
}

function lowerToken(raw: string, fidelity: FidelityCollector, path: string): Expression | undefined {
  const expr = raw.trim();
  const trigger = TRIGGER_BODY_PATTERN.exec(expr);
  if (trigger) return { kind: "input", path: chainSegments(trigger[1] as string) };
  const bodyRef = BODY_REF_PATTERN.exec(expr);
  if (bodyRef) {
    return {
      kind: "nodeOutput",
      nodeId: (bodyRef[1] as string).replace(/\s+/g, "_"),
      path: chainSegments(bodyRef[2] as string),
    };
  }
  fidelity.unsupported("workflow-expression", `"${raw}" is outside the supported expression subset.`, path);
  return undefined;
}

function lowerEqualsArgument(raw: string, fidelity: FidelityCollector, path: string): Expression | undefined {
  const trimmed = raw.trim();
  const quoted = /^'(.*)'$/.exec(trimmed);
  if (quoted) return { kind: "literal", value: quoted[1] };
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return { kind: "literal", value: Number(trimmed) };
  if (trimmed === "true" || trimmed === "false") return { kind: "literal", value: trimmed === "true" };
  return lowerToken(trimmed, fidelity, path);
}

function lowerString(value: string, fidelity: FidelityCollector, path: string): Expression | undefined {
  if (value.startsWith("@") && !value.startsWith("@{")) {
    const equals = /^@equals\((.+),(.+)\)$/.exec(value.trim());
    if (equals) {
      const left = lowerEqualsArgument(equals[1] as string, fidelity, path);
      const right = lowerEqualsArgument(equals[2] as string, fidelity, path);
      if (!left || !right) return undefined;
      return { kind: "compare", operator: "eq", left, right };
    }
    return lowerToken(value.slice(1), fidelity, path);
  }
  if (!value.includes("@{")) return { kind: "literal", value };

  const parts: Expression[] = [];
  const pattern = /@\{([^}]+)\}/g;
  let cursor = 0;
  for (let match = pattern.exec(value); match; match = pattern.exec(value)) {
    if (match.index > cursor) parts.push({ kind: "literal", value: value.slice(cursor, match.index) });
    const token = lowerToken(match[1] as string, fidelity, path);
    if (!token) return undefined;
    parts.push(token);
    cursor = match.index + match[0].length;
  }
  if (cursor < value.length) parts.push({ kind: "literal", value: value.slice(cursor) });
  if (parts.length === 1 && parts[0] !== undefined) return parts[0];
  return { kind: "interpolate", parts };
}

function lowerValue(value: unknown, fidelity: FidelityCollector, path: string): Expression | undefined {
  if (typeof value === "string") return lowerString(value, fidelity, path);
  if (Array.isArray(value)) {
    const items: Expression[] = [];
    for (const [index, item] of value.entries()) {
      const lowered = lowerValue(item, fidelity, `${path}[${index}]`);
      if (!lowered) return undefined;
      items.push(lowered);
    }
    return { kind: "array", items };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const lowered = lowerValue(item, fidelity, `${path}.${key}`);
      if (!lowered) return undefined;
      entries[key] = lowered;
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

/** `https://host/a/@{token}` → { host, pathExpression } (tokens lowered). */
function lowerUri(
  uri: string,
  fidelity: FidelityCollector,
  path: string,
): { host?: string; pathExpression: Expression } {
  let host: string | undefined;
  let pathname = uri;
  try {
    const url = new URL(uri.replace(/@\{[^}]*\}/g, "_"));
    const index = uri.indexOf(url.host);
    if (index >= 0) {
      host = url.host;
      pathname = uri.slice(index + url.host.length);
    }
  } catch {
    fidelity.approximated("uri", `"${uri}" is not an absolute URL; used verbatim.`, path);
  }
  const parts: Expression[] = [];
  const pattern = /@\{([^}]+)\}/g;
  let cursor = 0;
  for (let match = pattern.exec(pathname); match; match = pattern.exec(pathname)) {
    parts.push({ kind: "literal", value: pathname.slice(cursor, match.index) });
    const token = lowerToken(match[1] as string, fidelity, path);
    parts.push(token ?? { kind: "literal", value: match[0] });
    cursor = match.index + match[0].length;
  }
  parts.push({ kind: "literal", value: pathname.slice(cursor) });
  return {
    ...(host === undefined ? {} : { host }),
    pathExpression: { kind: "interpolate", parts },
  };
}

// ---------------------------------------------------------------------------
// runAfter ordering: single-predecessor chains, topologically sorted with the
// declaration order as tie-break. Extra dependencies are approximated.
// ---------------------------------------------------------------------------

function orderActions(
  actions: Record<string, LogicAppsAction>,
  fidelity: FidelityCollector,
  scope: string,
): string[] {
  const names = Object.keys(actions);
  const dependencyOf = new Map<string, string | undefined>();
  for (const name of names) {
    const action = actions[name] as LogicAppsAction;
    const runAfter = action.runAfter ?? {};
    const dependencies = Object.keys(runAfter);
    const where = `${scope}${name}`;
    if (dependencies.length > 1) {
      fidelity.approximated(
        "run-after",
        `Action "${where}" declares ${dependencies.length} runAfter dependencies; ordered by "${dependencies[0]}".`,
        where,
      );
    }
    if (Object.values(runAfter).flat().some((status) => status !== "Succeeded")) {
      fidelity.approximated(
        "run-after-status",
        `Non-Succeeded runAfter statuses on "${where}" are treated as Succeeded.`,
        where,
      );
    }
    dependencyOf.set(name, dependencies.find((dependency) => names.includes(dependency)));
  }

  const placed = new Set<string>();
  const order: string[] = [];
  while (order.length < names.length) {
    const candidate = names.find((name) => {
      if (placed.has(name)) return false;
      const dependency = dependencyOf.get(name);
      return dependency === undefined || placed.has(dependency);
    });
    if (candidate === undefined) {
      const remaining = names.filter((name) => !placed.has(name));
      fidelity.approximated(
        "run-after-cycle",
        `Actions ${remaining.join(", ")} form a runAfter cycle; declaration order used.`,
        scope === "" ? undefined : scope,
      );
      for (const name of remaining) {
        placed.add(name);
        order.push(name);
      }
      break;
    }
    placed.add(candidate);
    order.push(candidate);
  }
  return order;
}

// ---------------------------------------------------------------------------
// Action compilation. If-branch subgraphs compile into the same node map with
// `${actionName}.` / `${actionName}.else.` prefixes and rejoin after the If.
// ---------------------------------------------------------------------------

interface ActionCompilation {
  nodes: PlanNode[];
  requirements: CapabilityRequirement[];
  hosts: Set<string>;
  fidelity: FidelityCollector;
  planId: string;
}

function compileScope(
  actions: Record<string, LogicAppsAction>,
  prefix: string,
  terminal: string,
  compilation: ActionCompilation,
): string {
  const { fidelity } = compilation;
  const order = orderActions(actions, fidelity, prefix);

  for (const [index, name] of order.entries()) {
    const action = actions[name] as LogicAppsAction;
    const id = `${prefix}${name}`;
    const following = order[index + 1];
    const nextId = following === undefined ? terminal : `${prefix}${following}`;
    const type = action.type.toLowerCase();

    switch (type) {
      case "http": {
        const inputs = HttpInputsSchema.safeParse(action.inputs);
        if (!inputs.success) {
          fidelity.unsupported("http-action", `Action "${id}" has an unsupported Http inputs shape.`, id);
          continue;
        }
        const method = inputs.data.method.toUpperCase();
        const effect: SideEffect =
          method === "GET" ? "read" : method === "DELETE" ? "destructive" : "mutation";
        const { host, pathExpression } = lowerUri(inputs.data.uri, fidelity, id);
        if (host !== undefined) compilation.hosts.add(host);
        compilation.requirements.push({
          id,
          protocol: "http",
          ...(host === undefined ? {} : { provider: host }),
          operation: `${method} ${inputs.data.uri.replace(/^https?:\/\/[^/]+/, "")}`,
          requiredScopes: [],
          effect,
        });
        const entries: Record<string, Expression> = { path: pathExpression };
        if (inputs.data.body !== undefined) {
          const body = lowerValue(inputs.data.body, fidelity, `${id}.body`);
          if (body) entries.body = body;
        }
        if (inputs.data.headers !== undefined) {
          const headers = lowerValue(inputs.data.headers, fidelity, `${id}.headers`);
          if (headers) entries.headers = headers;
        }
        if (inputs.data.queries !== undefined) {
          const query = lowerValue(inputs.data.queries, fidelity, `${id}.queries`);
          if (query) entries.query = query;
        }
        compilation.nodes.push({
          id,
          kind: "invoke",
          binding: id,
          input: { kind: "object", entries },
          effect,
          approval: "none",
          ...(effect === "read"
            ? {}
            : { idempotency: { kind: "deduplication-record", namespace: `${compilation.planId}:${id}` } }),
          next: nextId,
        });
        fidelity.exact("http-action", id);
        continue;
      }

      case "if": {
        let when: Expression | undefined;
        if (typeof action.expression === "string") {
          const lowered = lowerString(action.expression, fidelity, id);
          if (lowered?.kind === "compare") {
            when = lowered;
          } else if (lowered) {
            fidelity.unsupported("if-expression", `Condition on "${id}" is not a supported comparison.`, id);
          }
        } else {
          fidelity.unsupported("if-expression", `Condition on "${id}" must be an @equals(...) string.`, id);
        }
        const thenEntry = compileScope(action.actions ?? {}, `${id}.`, nextId, compilation);
        const elseEntry = compileScope(action.else?.actions ?? {}, `${id}.else.`, nextId, compilation);
        compilation.nodes.push({
          id,
          kind: "choice",
          choices: [{ when: when ?? { kind: "literal", value: true }, then: thenEntry }],
          otherwise: elseEntry,
        });
        fidelity.exact("if-action", id);
        continue;
      }

      case "wait":
      case "delay": {
        const inputs = WaitInputsSchema.safeParse(action.inputs);
        if (!inputs.success) {
          fidelity.unsupported("wait-action", `Action "${id}" has an unsupported Wait inputs shape.`, id);
          continue;
        }
        const unit = inputs.data.interval.unit.toLowerCase();
        const factor = unit === "second" || unit === "seconds" ? 1 : unit === "minute" || unit === "minutes" ? 60 : undefined;
        if (factor === undefined) {
          fidelity.unsupported("wait-action", `Interval unit "${inputs.data.interval.unit}" on "${id}" is not supported.`, id);
          continue;
        }
        const seconds = inputs.data.interval.count * factor;
        compilation.nodes.push({ id, kind: "wait", seconds: seconds > 0 ? seconds : 0.001, next: nextId });
        fidelity.exact("wait-action", id);
        continue;
      }

      case "terminate": {
        const inputs = TerminateInputsSchema.safeParse(action.inputs);
        if (!inputs.success) {
          fidelity.unsupported("terminate-action", `Action "${id}" has an unsupported Terminate inputs shape.`, id);
          continue;
        }
        const status = inputs.data.runStatus.toLowerCase();
        if (status === "succeeded") {
          compilation.nodes.push({ id, kind: "succeed" });
          fidelity.exact("terminate-action", id);
          continue;
        }
        if (status !== "failed") {
          fidelity.approximated(
            "terminate-action",
            `Run status "${inputs.data.runStatus}" on "${id}" is modeled as a failure.`,
            id,
          );
        }
        const message = inputs.data.runError?.message;
        compilation.nodes.push({
          id,
          kind: "fail",
          error: inputs.data.runError?.code ?? inputs.data.runStatus,
          ...(message === undefined ? {} : { message }),
        });
        if (status === "failed") fidelity.exact("terminate-action", id);
        continue;
      }

      default: {
        fidelity.blocked(
          "connector-action",
          `Action "${id}" of type "${action.type}" is a connector action and requires a mapping pack.`,
          id,
        );
        continue;
      }
    }
  }

  const first = order[0];
  return first === undefined ? terminal : `${prefix}${first}`;
}

function checkScope(
  actions: Record<string, LogicAppsAction>,
  scope: string,
  diagnostics: Diagnostic[],
): void {
  const names = new Set(Object.keys(actions));
  for (const [name, action] of Object.entries(actions)) {
    const where = `${scope}${name}`;
    for (const dependency of Object.keys(action.runAfter ?? {})) {
      if (!names.has(dependency)) {
        diagnostics.push(
          errorDiagnostic(
            "unknown-run-after",
            `Action "${where}" runs after unknown action "${dependency}".`,
            where,
          ),
        );
      }
    }
    if (action.actions) checkScope(action.actions, `${where}.`, diagnostics);
    if (action.else?.actions) checkScope(action.else.actions, `${where}.else.`, diagnostics);
  }
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const logicAppsImporter: WorkflowImporter<LogicAppsDefinition> = {
  id: ENGINE,
  supportedVersions: ["2016-06-01"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text);
      if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
        const wrapper = raw as { definition?: unknown; actions?: unknown };
        const definition = wrapper.definition as
          | { $schema?: unknown; actions?: unknown }
          | undefined;
        if (
          typeof definition?.$schema === "string" &&
          definition.$schema.toLowerCase().includes("workflowdefinition")
        ) {
          return { detected: true, confidence: "exact" as const };
        }
        const actions = definition?.actions ?? wrapper.actions;
        if (actions !== null && typeof actions === "object" && !Array.isArray(actions)) {
          return { detected: true, confidence: "exact" as const };
        }
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<LogicAppsDefinition>> {
    let raw: unknown;
    try {
      raw = unwrapDefinition(parseJsonSafe(entrypointFile(artifact).text));
    } catch (error) {
      return {
        ok: false,
        diagnostics: [
          errorDiagnostic("parse-failed", error instanceof Error ? error.message : String(error)),
        ],
      };
    }
    const parsed = DefinitionSchema.safeParse(raw);
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
    checkScope(model.actions, "", diagnostics);
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context: CompileContext): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const compilation: ActionCompilation = {
      nodes: [],
      requirements: [],
      hosts: new Set(),
      fidelity,
      planId: context.planId,
    };
    if (model.triggers !== undefined && Object.keys(model.triggers).length > 0) {
      fidelity.approximated("triggers", "Triggers are not compiled; the run input is the trigger body.");
    }
    const entryNodeId = compileScope(model.actions, "", "__succeed", compilation);
    compilation.nodes.push({ id: "__succeed", kind: "succeed" });

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
        requirements: compilation.requirements,
      };
    }

    const plan = buildPlan({
      id: context.planId,
      name: context.planName,
      source: {
        format: ENGINE,
        ...(model.contentVersion === undefined ? {} : { formatVersion: model.contentVersion }),
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId,
      nodes: compilation.nodes,
      capabilityRequirements: compilation.requirements,
      outboundHosts: [...compilation.hosts].sort(),
      fidelity: fidelity.report(),
      ...(context.budgets ? { budgets: context.budgets } : {}),
    });

    const planDiagnostics = validatePlan(plan).map((diagnostic) => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
      ...(diagnostic.path === undefined ? {} : { path: diagnostic.path }),
    }));

    return {
      plan,
      diagnostics: planDiagnostics,
      fidelity: fidelity.report(),
      requirements: compilation.requirements,
    };
  },
};

export default logicAppsImporter;
