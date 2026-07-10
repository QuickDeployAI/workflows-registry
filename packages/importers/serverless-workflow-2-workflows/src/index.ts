import { errorDiagnostic, type Diagnostic } from "@quickdeployai/workflow-core";
import type { Expression } from "@quickdeployai/workflow-expressions";
import {
  buildPlan,
  validatePlan,
  type CapabilityRequirement,
  type PlanNode,
  type RetryPolicy,
  type SideEffect,
} from "@quickdeployai/workflow-ir";
import {
  FidelityCollector,
  entrypointFile,
  parseYamlSafe,
  type CompileResult,
  type ParseOutcome,
  type SourceArtifact,
  type ValidationReport,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { z } from "zod";

export const ENGINE = "serverless-workflow-2-workflows";

// ---------------------------------------------------------------------------
// Model — the Serverless Workflow DSL 1.0 subset this importer understands.
// Also accepts the QuickDeploy monorepo's oneclick.workflow.package.v1
// wrapper by unwrapping canonicalSpec.
// ---------------------------------------------------------------------------

const HttpCallSchema = z.object({
  call: z.literal("http"),
  with: z.object({
    method: z.string(),
    endpoint: z.string(),
    body: z.unknown().optional(),
  }),
  retry: z
    .object({ limit: z.object({ attempt: z.object({ count: z.number().int().positive() }) }) })
    .optional(),
  then: z.string().optional(),
});

const SwitchCaseSchema = z.object({
  when: z.string().optional(),
  then: z.string(),
});

const TaskSchema = z.union([
  HttpCallSchema,
  z.object({ switch: z.array(z.record(z.string(), SwitchCaseSchema)), then: z.string().optional() }),
  z.object({ wait: z.object({ seconds: z.number().positive() }), then: z.string().optional() }),
  z.object({ set: z.record(z.string(), z.unknown()), then: z.string().optional() }),
  z.object({ raise: z.object({ error: z.string().optional() }).passthrough(), then: z.string().optional() }),
]);

const ServerlessDocumentSchema = z.object({
  document: z.object({
    dsl: z.string().regex(/^1\./, "Only DSL 1.x is supported."),
    namespace: z.string(),
    name: z.string(),
    version: z.string(),
  }),
  input: z.unknown().optional(),
  do: z.array(z.record(z.string(), TaskSchema)).min(1),
  timeout: z.unknown().optional(),
});

export type ServerlessDocument = z.infer<typeof ServerlessDocumentSchema>;

function unwrapOneclickPackage(raw: unknown): unknown {
  if (raw !== null && typeof raw === "object" && "canonicalSpec" in (raw as Record<string, unknown>)) {
    const wrapper = raw as { schema?: string; canonicalSpec?: Record<string, unknown> };
    if (wrapper.schema?.startsWith("oneclick.workflow.package") && wrapper.canonicalSpec) {
      // canonicalSpec either IS the workflow document or nests it alongside `do`.
      const spec = wrapper.canonicalSpec;
      if ("do" in spec) return spec;
      if ("document" in spec && typeof spec.document === "object") return spec.document;
    }
  }
  return raw;
}

// ---------------------------------------------------------------------------
// jq-subset lowering: `${ .path }`, `${ .a == "b" }`, `${ .a != "b" }`.
// Task-flow data is approximated to the run input (documented in fidelity).
// ---------------------------------------------------------------------------

function lowerJqExpression(
  raw: string,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  const trimmed = raw.trim();
  const wrapped = /^\$\{(.+)\}$/.exec(trimmed);
  if (!wrapped) return { kind: "literal", value: raw };
  const inner = (wrapped[1] as string).trim();

  const comparison = /^\.([A-Za-z0-9_.]+)\s*(==|!=)\s*"([^"]*)"$/.exec(inner);
  if (comparison) {
    fidelity.approximated("jq-expression", `"${inner}" lowered against the run input.`, path);
    return {
      kind: "compare",
      operator: comparison[2] === "==" ? "eq" : "ne",
      left: { kind: "input", path: (comparison[1] as string).split(".") },
      right: { kind: "literal", value: comparison[3] },
    };
  }
  const pathOnly = /^\.([A-Za-z0-9_.]+)$/.exec(inner);
  if (pathOnly) {
    fidelity.approximated("jq-expression", `".${pathOnly[1]}" lowered against the run input.`, path);
    return { kind: "input", path: (pathOnly[1] as string).split(".") };
  }
  fidelity.unsupported("jq-expression", `"${inner}" is outside the supported subset.`, path);
  return undefined;
}

function lowerTemplateValue(
  value: unknown,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  if (typeof value === "string") return lowerJqExpression(value, fidelity, path);
  if (Array.isArray(value)) {
    const items: Expression[] = [];
    for (const [index, item] of value.entries()) {
      const lowered = lowerTemplateValue(item, fidelity, `${path}[${index}]`);
      if (!lowered) return undefined;
      items.push(lowered);
    }
    return { kind: "array", items };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const lowered = lowerTemplateValue(item, fidelity, `${path}.${key}`);
      if (!lowered) return undefined;
      entries[key] = lowered;
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

/** `https://host/a/{var}/b` → { host, pathExpression } with {var} → input.var. */
function lowerEndpoint(
  endpoint: string,
  fidelity: FidelityCollector,
  path: string,
): { host?: string; pathExpression: Expression } {
  let host: string | undefined;
  let pathname = endpoint;
  try {
    const url = new URL(endpoint.replace(/\{[^}]+\}/g, "_"));
    host = url.host;
    pathname = endpoint.slice(endpoint.indexOf(url.host) + url.host.length);
  } catch {
    fidelity.approximated("endpoint", `"${endpoint}" is not an absolute URL; used verbatim.`, path);
  }
  const parts: Expression[] = [];
  const pattern = /\{([A-Za-z0-9_.]+)\}/g;
  let cursor = 0;
  for (let match = pattern.exec(pathname); match; match = pattern.exec(pathname)) {
    parts.push({ kind: "literal", value: pathname.slice(cursor, match.index) });
    parts.push({ kind: "input", path: (match[1] as string).split(".") });
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

export const serverlessWorkflowImporter: WorkflowImporter<ServerlessDocument> = {
  id: ENGINE,
  supportedVersions: ["1.0"],
  declaredConformance: 4,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = unwrapOneclickPackage(parseYamlSafe(entrypointFile(artifact).text));
      const doc = raw as { document?: { dsl?: string } } | null;
      if (doc?.document?.dsl) {
        return { detected: true, confidence: "exact" as const, formatVersion: doc.document.dsl };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<ServerlessDocument>> {
    let raw: unknown;
    try {
      raw = unwrapOneclickPackage(parseYamlSafe(entrypointFile(artifact).text));
    } catch (error) {
      return {
        ok: false,
        diagnostics: [errorDiagnostic("parse-failed", error instanceof Error ? error.message : String(error))],
      };
    }
    const parsed = ServerlessDocumentSchema.safeParse(raw);
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
    const taskNames = new Set(model.do.map((entry) => Object.keys(entry)[0] as string));
    for (const entry of model.do) {
      const [name, task] = Object.entries(entry)[0] as [string, z.infer<typeof TaskSchema>];
      const targets: string[] = [];
      if ("then" in task && task.then) targets.push(task.then);
      if ("switch" in task) {
        for (const switchCase of task.switch) {
          const body = Object.values(switchCase)[0] as z.infer<typeof SwitchCaseSchema>;
          targets.push(body.then);
        }
      }
      for (const target of targets) {
        if (target !== "end" && target !== "exit" && !taskNames.has(target)) {
          diagnostics.push(
            errorDiagnostic("unknown-then-target", `Task "${name}" routes to unknown task "${target}".`, name),
          );
        }
      }
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodes: PlanNode[] = [];
    const hosts = new Set<string>();
    const order = model.do.map((entry) => Object.keys(entry)[0] as string);
    const nextOf = (index: number, explicit?: string): string => {
      if (explicit === "end" || explicit === "exit") return "__succeed";
      if (explicit) return explicit;
      return order[index + 1] ?? "__succeed";
    };

    if (model.timeout !== undefined) {
      fidelity.approximated("workflow-timeout", "Plan-level timeouts are not enforced by the kernel yet.");
    }
    if (model.input !== undefined) {
      fidelity.approximated("input-schema", "Input schemas are not re-validated at run start.");
    }

    for (const [index, entry] of model.do.entries()) {
      const [name, task] = Object.entries(entry)[0] as [string, z.infer<typeof TaskSchema>];

      if ("call" in task) {
        const { host, pathExpression } = lowerEndpoint(task.with.endpoint, fidelity, name);
        if (host) hosts.add(host);
        const method = task.with.method.toUpperCase();
        const effect: SideEffect = method === "GET" ? "read" : method === "DELETE" ? "destructive" : "mutation";
        requirements.push({
          id: name,
          protocol: "http",
          ...(host === undefined ? {} : { provider: host }),
          operation: `${method} ${task.with.endpoint.replace(/^https?:\/\/[^/]+/, "")}`,
          requiredScopes: [],
          effect,
        });
        const argsEntries: Record<string, Expression> = { path: pathExpression };
        if (task.with.body !== undefined) {
          const body = lowerTemplateValue(task.with.body, fidelity, `${name}.body`);
          if (body) argsEntries.body = body;
        }
        const retry: RetryPolicy | undefined = task.retry
          ? { maxAttempts: task.retry.limit.attempt.count, backoffSeconds: 0 }
          : undefined;
        nodes.push({
          id: name,
          kind: "invoke",
          binding: name,
          input: { kind: "object", entries: argsEntries },
          effect,
          approval: "none",
          ...(retry ? { retry } : {}),
          ...(effect === "read"
            ? {}
            : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${name}` } }),
          next: nextOf(index, task.then),
        });
        fidelity.exact("http-call", name);
        continue;
      }

      if ("switch" in task) {
        const choices: Array<{ when: Expression; then: string }> = [];
        let otherwise: string | undefined;
        for (const switchCase of task.switch) {
          const [caseName, body] = Object.entries(switchCase)[0] as [string, z.infer<typeof SwitchCaseSchema>];
          const target = body.then === "end" || body.then === "exit" ? "__succeed" : body.then;
          if (body.when) {
            const when = lowerJqExpression(body.when, fidelity, `${name}.${caseName}`);
            if (when) choices.push({ when, then: target });
          } else {
            otherwise = target;
          }
        }
        nodes.push({
          id: name,
          kind: "choice",
          choices,
          ...(otherwise === undefined ? { otherwise: nextOf(index, task.then) } : { otherwise }),
        });
        fidelity.exact("switch", name);
        continue;
      }

      if ("wait" in task) {
        nodes.push({ id: name, kind: "wait", seconds: task.wait.seconds, next: nextOf(index, task.then) });
        fidelity.exact("wait", name);
        continue;
      }

      if ("set" in task) {
        fidelity.approximated("set", `Task "${name}" only records literals; context mutation is not modeled.`, name);
        nodes.push({ id: name, kind: "wait", seconds: 0.001, next: nextOf(index, task.then) });
        continue;
      }

      if ("raise" in task) {
        nodes.push({
          id: name,
          kind: "fail",
          error: task.raise.error ?? "raised",
        });
        fidelity.exact("raise", name);
        continue;
      }
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
        formatVersion: model.document.dsl,
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId: order[0] ?? "__succeed",
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

export default serverlessWorkflowImporter;
