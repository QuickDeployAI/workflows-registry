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
  parseYamlSafe,
  type CompileContext,
  type CompileResult,
  type ParseOutcome,
  type SourceArtifact,
  type ValidationReport,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { z } from "zod";

export const ENGINE = "google-workflows-2-workflows";

// ---------------------------------------------------------------------------
// Model — the Google Cloud Workflows subset this importer understands.
// Steps stay loose at parse time; per-step shapes are checked at compile so
// unknown constructs land in the fidelity report instead of parse errors.
// ---------------------------------------------------------------------------

const StepEntrySchema = z.record(z.string(), z.unknown());

const MainSchema = z.object({
  params: z.array(z.unknown()).optional(),
  steps: z.array(StepEntrySchema).min(1),
});

const GoogleWorkflowSchema = z
  .object({ main: MainSchema })
  .passthrough();
export type GoogleWorkflowDocument = z.infer<typeof GoogleWorkflowSchema>;

const CallStepSchema = z
  .object({
    call: z.string(),
    args: z.record(z.string(), z.unknown()).optional(),
    result: z.string().optional(),
    next: z.string().optional(),
  })
  .passthrough();

const HttpArgsSchema = z
  .object({
    url: z.string(),
    body: z.unknown().optional(),
    query: z.record(z.string(), z.unknown()).optional(),
    headers: z.record(z.string(), z.unknown()).optional(),
    auth: z.unknown().optional(),
    timeout: z.unknown().optional(),
  })
  .passthrough();

const SwitchStepSchema = z
  .object({
    switch: z
      .array(z.object({ condition: z.string(), next: z.string().optional() }).passthrough())
      .min(1),
    next: z.string().optional(),
  })
  .passthrough();

const AssignStepSchema = z
  .object({ assign: z.array(z.record(z.string(), z.unknown())), next: z.string().optional() })
  .passthrough();

const HTTP_METHODS: Record<string, string> = {
  "http.get": "GET",
  "http.post": "POST",
  "http.put": "PUT",
  "http.delete": "DELETE",
};

interface NamedStep {
  name: string;
  body: unknown;
}

function namedSteps(main: z.infer<typeof MainSchema>): NamedStep[] {
  const steps: NamedStep[] = [];
  for (const entry of main.steps) {
    const name = Object.keys(entry)[0];
    if (name !== undefined) steps.push({ name, body: entry[name] });
  }
  return steps;
}

function paramNames(main: z.infer<typeof MainSchema>): Set<string> {
  const names = new Set<string>();
  for (const param of main.params ?? []) {
    if (typeof param === "string") names.add(param);
    else if (param !== null && typeof param === "object") {
      const key = Object.keys(param as Record<string, unknown>)[0];
      if (key !== undefined) names.add(key);
    }
  }
  return names;
}

// ---------------------------------------------------------------------------
// `${...}` lowering. Variables recorded via `result:` resolve to the producing
// step's output (our http executor returns the parsed body directly, so a
// leading `.body` segment is stripped). Declared params resolve to the run
// input; other names are approximated against the run input.
// ---------------------------------------------------------------------------

interface LoweringContext {
  fidelity: FidelityCollector;
  /** result variable name → producing step (node) id */
  results: Map<string, string>;
  params: Set<string>;
}

function lowerVariablePath(raw: string, context: LoweringContext, path: string): Expression | undefined {
  const trimmed = raw.trim();
  if (trimmed.includes("(")) {
    context.fidelity.unsupported(
      "expression",
      `"${trimmed}" calls a function; expression calls are not supported.`,
      path,
    );
    return undefined;
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(trimmed)) {
    context.fidelity.unsupported("expression", `"${trimmed}" is outside the supported expression subset.`, path);
    return undefined;
  }
  const segments = trimmed.split(".");
  const head = segments[0] as string;
  const rest = segments.slice(1);
  if (head === "sys") {
    context.fidelity.unsupported("sys-variable", `"${trimmed}" reads the sys namespace.`, path);
    return undefined;
  }
  const producer = context.results.get(head);
  if (producer !== undefined) {
    return { kind: "nodeOutput", nodeId: producer, path: rest[0] === "body" ? rest.slice(1) : rest };
  }
  if (context.params.has(head)) {
    return { kind: "input", path: rest };
  }
  context.fidelity.approximated(
    "variable",
    `"${trimmed}" is not a recorded call result; resolved against the run input.`,
    path,
  );
  return { kind: "input", path: segments };
}

function lowerOperand(raw: string, context: LoweringContext, path: string): Expression | undefined {
  const trimmed = raw.trim();
  const quoted = /^"([^"]*)"$/.exec(trimmed) ?? /^'([^']*)'$/.exec(trimmed);
  if (quoted) return { kind: "literal", value: quoted[1] };
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return { kind: "literal", value: Number(trimmed) };
  if (trimmed === "true" || trimmed === "false") return { kind: "literal", value: trimmed === "true" };
  return lowerVariablePath(trimmed, context, path);
}

function lowerInnerExpression(inner: string, context: LoweringContext, path: string): Expression | undefined {
  const comparison = /^(.+?)\s*(==|!=)\s*(.+)$/.exec(inner.trim());
  if (comparison) {
    const left = lowerOperand(comparison[1] as string, context, path);
    const right = lowerOperand(comparison[3] as string, context, path);
    if (!left || !right) return undefined;
    return { kind: "compare", operator: comparison[2] === "==" ? "eq" : "ne", left, right };
  }
  return lowerVariablePath(inner, context, path);
}

function lowerTemplateString(value: string, context: LoweringContext, path: string): Expression | undefined {
  if (!value.includes("${")) return { kind: "literal", value };
  const whole = /^\$\{([^}]+)\}$/.exec(value.trim());
  if (whole) return lowerInnerExpression(whole[1] as string, context, path);

  const parts: Expression[] = [];
  const pattern = /\$\{([^}]+)\}/g;
  let cursor = 0;
  for (let match = pattern.exec(value); match; match = pattern.exec(value)) {
    if (match.index > cursor) parts.push({ kind: "literal", value: value.slice(cursor, match.index) });
    const lowered = lowerInnerExpression(match[1] as string, context, path);
    if (!lowered) return undefined;
    parts.push(lowered);
    cursor = match.index + match[0].length;
  }
  if (cursor < value.length) parts.push({ kind: "literal", value: value.slice(cursor) });
  return { kind: "interpolate", parts };
}

function lowerTemplateValue(value: unknown, context: LoweringContext, path: string): Expression | undefined {
  if (typeof value === "string") return lowerTemplateString(value, context, path);
  if (Array.isArray(value)) {
    const items: Expression[] = [];
    for (const [index, item] of value.entries()) {
      const lowered = lowerTemplateValue(item, context, `${path}[${index}]`);
      if (!lowered) return undefined;
      items.push(lowered);
    }
    return { kind: "array", items };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const lowered = lowerTemplateValue(item, context, `${path}.${key}`);
      if (!lowered) return undefined;
      entries[key] = lowered;
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

/** `https://host/a/${var}` → { host, pathExpression } (tokens lowered). */
function lowerUrl(
  url: string,
  context: LoweringContext,
  path: string,
): { host?: string; pathExpression: Expression } {
  let host: string | undefined;
  let pathname = url;
  try {
    const parsed = new URL(url.replace(/\$\{[^}]*\}/g, "_"));
    const index = url.indexOf(parsed.host);
    if (index >= 0) {
      host = parsed.host;
      pathname = url.slice(index + parsed.host.length);
    }
  } catch {
    context.fidelity.approximated("url", `"${url}" is not an absolute URL; used verbatim.`, path);
  }
  const parts: Expression[] = [];
  const pattern = /\$\{([^}]+)\}/g;
  let cursor = 0;
  for (let match = pattern.exec(pathname); match; match = pattern.exec(pathname)) {
    parts.push({ kind: "literal", value: pathname.slice(cursor, match.index) });
    const lowered = lowerInnerExpression(match[1] as string, context, path);
    parts.push(lowered ?? { kind: "literal", value: match[0] });
    cursor = match.index + match[0].length;
  }
  parts.push({ kind: "literal", value: pathname.slice(cursor) });
  return {
    ...(host === undefined ? {} : { host }),
    pathExpression: { kind: "interpolate", parts },
  };
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const googleWorkflowsImporter: WorkflowImporter<GoogleWorkflowDocument> = {
  id: ENGINE,
  supportedVersions: ["v1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseYamlSafe(entrypointFile(artifact).text);
      if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
        const main = (raw as { main?: unknown }).main as { steps?: unknown } | undefined;
        if (main !== null && typeof main === "object" && Array.isArray(main?.steps)) {
          return { detected: true, confidence: "exact" as const };
        }
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<GoogleWorkflowDocument>> {
    let raw: unknown;
    try {
      raw = parseYamlSafe(entrypointFile(artifact).text);
    } catch (error) {
      return {
        ok: false,
        diagnostics: [
          errorDiagnostic("parse-failed", error instanceof Error ? error.message : String(error)),
        ],
      };
    }
    const parsed = GoogleWorkflowSchema.safeParse(raw);
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
    const steps = namedSteps(model.main);
    const names = new Set(steps.map((step) => step.name));
    const checkTarget = (target: unknown, from: string): void => {
      if (typeof target === "string" && target !== "end" && !names.has(target)) {
        diagnostics.push(
          errorDiagnostic("unknown-next-target", `Step "${from}" routes to unknown step "${target}".`, from),
        );
      }
    };
    for (const [index, entry] of model.main.steps.entries()) {
      if (Object.keys(entry).length !== 1) {
        diagnostics.push(
          errorDiagnostic("invalid-step", `Step ${index} must be a single-key map.`, `main.steps[${index}]`),
        );
        continue;
      }
      const name = Object.keys(entry)[0] as string;
      const body = entry[name];
      if (body === null || typeof body !== "object") {
        diagnostics.push(errorDiagnostic("invalid-step", `Step "${name}" has no body.`, name));
        continue;
      }
      const record = body as Record<string, unknown>;
      checkTarget(record.next, name);
      if (Array.isArray(record.switch)) {
        for (const item of record.switch) {
          if (item !== null && typeof item === "object") {
            checkTarget((item as Record<string, unknown>).next, name);
          }
        }
      }
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context: CompileContext): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodes: PlanNode[] = [];
    const hosts = new Set<string>();
    const steps = namedSteps(model.main);

    for (const key of Object.keys(model)) {
      if (key !== "main") {
        fidelity.approximated("subworkflow", `Subworkflow "${key}" is not imported.`, key);
      }
    }

    const results = new Map<string, string>();
    for (const step of steps) {
      if (step.body !== null && typeof step.body === "object") {
        const result = (step.body as Record<string, unknown>).result;
        if (typeof result === "string") results.set(result, step.name);
      }
    }
    const lowering: LoweringContext = { fidelity, results, params: paramNames(model.main) };

    const nextOf = (index: number, explicit: string | undefined): string => {
      if (explicit === "end") return "__succeed";
      if (explicit !== undefined) return explicit;
      return steps[index + 1]?.name ?? "__succeed";
    };

    for (const [index, step] of steps.entries()) {
      const { name } = step;
      if (step.body === null || typeof step.body !== "object") {
        fidelity.unsupported("step", `Step "${name}" has no body.`, name);
        continue;
      }
      const body = step.body as Record<string, unknown>;

      if ("call" in body) {
        const parsed = CallStepSchema.safeParse(body);
        if (!parsed.success) {
          fidelity.unsupported("call", `Step "${name}" has an unsupported call shape.`, name);
          continue;
        }
        const call = parsed.data.call;
        const next = nextOf(index, parsed.data.next);

        if (call === "sys.sleep") {
          const seconds = parsed.data.args?.seconds;
          if (typeof seconds !== "number" || seconds < 0) {
            fidelity.unsupported("sys-sleep", `sys.sleep on "${name}" needs a literal non-negative seconds.`, name);
            continue;
          }
          nodes.push({ id: name, kind: "wait", seconds: seconds > 0 ? seconds : 0.001, next });
          fidelity.exact("sys-sleep", name);
          continue;
        }

        const method = HTTP_METHODS[call];
        if (method === undefined) {
          fidelity.unsupported(
            "call",
            `Call "${call}" on "${name}" is not supported; only http.get/post/put/delete and sys.sleep lower.`,
            name,
          );
          continue;
        }
        const args = HttpArgsSchema.safeParse(parsed.data.args ?? {});
        if (!args.success) {
          fidelity.unsupported("http-call", `Step "${name}" has an unsupported http args shape.`, name);
          continue;
        }
        if (args.data.auth !== undefined) {
          fidelity.approximated("http-auth", `Auth on "${name}" must be re-bound at install time.`, name);
        }
        const effect: SideEffect =
          method === "GET" ? "read" : method === "DELETE" ? "destructive" : "mutation";
        const { host, pathExpression } = lowerUrl(args.data.url, lowering, name);
        if (host !== undefined) hosts.add(host);
        requirements.push({
          id: name,
          protocol: "http",
          ...(host === undefined ? {} : { provider: host }),
          operation: `${method} ${args.data.url.replace(/^https?:\/\/[^/]+/, "")}`,
          requiredScopes: [],
          effect,
        });
        const entries: Record<string, Expression> = { path: pathExpression };
        if (args.data.body !== undefined) {
          const lowered = lowerTemplateValue(args.data.body, lowering, `${name}.body`);
          if (lowered) entries.body = lowered;
        }
        if (args.data.query !== undefined) {
          const lowered = lowerTemplateValue(args.data.query, lowering, `${name}.query`);
          if (lowered) entries.query = lowered;
        }
        if (args.data.headers !== undefined) {
          const lowered = lowerTemplateValue(args.data.headers, lowering, `${name}.headers`);
          if (lowered) entries.headers = lowered;
        }
        nodes.push({
          id: name,
          kind: "invoke",
          binding: name,
          input: { kind: "object", entries },
          effect,
          approval: "none",
          ...(effect === "read"
            ? {}
            : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${name}` } }),
          next,
        });
        fidelity.exact("http-call", name);
        continue;
      }

      if ("switch" in body) {
        const parsed = SwitchStepSchema.safeParse(body);
        if (!parsed.success) {
          fidelity.unsupported("switch", `Step "${name}" has an unsupported switch shape.`, name);
          continue;
        }
        const otherwise = nextOf(index, parsed.data.next);
        const choices: Array<{ when: Expression; then: string }> = [];
        for (const [caseIndex, switchCase] of parsed.data.switch.entries()) {
          const casePath = `${name}.switch[${caseIndex}]`;
          if (switchCase.next === undefined) {
            fidelity.approximated("switch-case", `Case at ${casePath} has no next target; it is skipped.`, casePath);
            continue;
          }
          const whole = /^\$\{(.+)\}$/.exec(switchCase.condition.trim());
          if (!whole) {
            fidelity.approximated(
              "switch-case",
              `Condition "${switchCase.condition}" at ${casePath} is not a \${...} expression; it is skipped.`,
              casePath,
            );
            continue;
          }
          const when = lowerInnerExpression(whole[1] as string, lowering, casePath);
          if (!when) continue;
          if (when.kind !== "compare") {
            fidelity.approximated(
              "switch-case",
              `Condition at ${casePath} is not an ==/!= comparison; it is skipped.`,
              casePath,
            );
            continue;
          }
          choices.push({ when, then: switchCase.next === "end" ? "__succeed" : switchCase.next });
        }
        if (choices.length === 0) {
          fidelity.unsupported("switch", `No case of "${name}" lowers to a supported comparison.`, name);
          continue;
        }
        nodes.push({ id: name, kind: "choice", choices, otherwise });
        fidelity.exact("switch", name);
        continue;
      }

      if ("assign" in body) {
        const parsed = AssignStepSchema.safeParse(body);
        fidelity.approximated("assign", `Step "${name}" only orders execution; variable mutation is not modeled.`, name);
        nodes.push({
          id: name,
          kind: "wait",
          seconds: 0.001,
          next: nextOf(index, parsed.success ? parsed.data.next : undefined),
        });
        continue;
      }

      if ("return" in body) {
        const output = lowerTemplateValue(body.return, lowering, `${name}.return`);
        nodes.push({ id: name, kind: "succeed", ...(output === undefined ? {} : { output }) });
        fidelity.exact("return", name);
        continue;
      }

      if ("raise" in body) {
        const raised = body.raise;
        const message =
          raised !== null && typeof raised === "object"
            ? (raised as { message?: unknown }).message
            : undefined;
        nodes.push({
          id: name,
          kind: "fail",
          error: typeof raised === "string" ? raised : "raised",
          ...(typeof message === "string" ? { message } : {}),
        });
        fidelity.exact("raise", name);
        continue;
      }

      fidelity.unsupported("step", `Step "${name}" uses an unsupported step type (${Object.keys(body).join(", ")}).`, name);
    }

    nodes.push({ id: "__succeed", kind: "succeed" });

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
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId: steps[0]?.name ?? "__succeed",
      nodes,
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

export default googleWorkflowsImporter;
