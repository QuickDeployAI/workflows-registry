import { errorDiagnostic, type Diagnostic } from "@quickdeployai/workflow-core";
import type { CompareOperator, Expression } from "@quickdeployai/workflow-expressions";
import {
  buildPlan,
  validatePlan,
  type CapabilityRequirement,
  type PlanNode,
  type RetryPolicy,
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

export const ENGINE = "asl-2-workflows";

// ---------------------------------------------------------------------------
// Model — the Amazon States Language subset this importer understands.
// States are kept loose at parse time; per-Type shapes are checked at compile
// so unknown constructs land in the fidelity report instead of parse errors.
// ---------------------------------------------------------------------------

const RawStateSchema = z.object({ Type: z.string() }).passthrough();

const StateMachineSchema = z.object({
  StartAt: z.string(),
  States: z.record(z.string(), RawStateSchema),
});
type AslStateMachine = z.infer<typeof StateMachineSchema>;

const AslDocumentSchema = StateMachineSchema.extend({
  Comment: z.string().optional(),
  Version: z.string().optional(),
  TimeoutSeconds: z.number().optional(),
});
export type AslDocument = z.infer<typeof AslDocumentSchema>;

const TaskStateSchema = z
  .object({
    Type: z.literal("Task"),
    Resource: z.string(),
    Parameters: z.record(z.string(), z.unknown()).optional(),
    Retry: z
      .array(z.object({ MaxAttempts: z.number().int().min(1).max(10).optional() }).passthrough())
      .optional(),
    Catch: z.array(z.object({ Next: z.string() }).passthrough()).optional(),
    InputPath: z.string().nullable().optional(),
    OutputPath: z.string().nullable().optional(),
    ResultPath: z.string().nullable().optional(),
    ResultSelector: z.record(z.string(), z.unknown()).optional(),
    Next: z.string().optional(),
    End: z.boolean().optional(),
  })
  .passthrough();

const ChoiceRuleSchema = z
  .object({
    Variable: z.string().optional(),
    StringEquals: z.string().optional(),
    NumericEquals: z.number().optional(),
    BooleanEquals: z.boolean().optional(),
    NumericLessThan: z.number().optional(),
    NumericGreaterThan: z.number().optional(),
    Not: z.unknown().optional(),
    And: z.unknown().optional(),
    Or: z.unknown().optional(),
    Next: z.string(),
  })
  .passthrough();

const ChoiceStateSchema = z
  .object({
    Type: z.literal("Choice"),
    Choices: z.array(ChoiceRuleSchema).min(1),
    Default: z.string().optional(),
  })
  .passthrough();

const WaitStateSchema = z
  .object({
    Type: z.literal("Wait"),
    Seconds: z.number().optional(),
    SecondsPath: z.string().optional(),
    Timestamp: z.string().optional(),
    TimestampPath: z.string().optional(),
    Next: z.string().optional(),
    End: z.boolean().optional(),
  })
  .passthrough();

const ParallelStateSchema = z
  .object({
    Type: z.literal("Parallel"),
    Branches: z.array(StateMachineSchema).min(1),
    Next: z.string().optional(),
    End: z.boolean().optional(),
  })
  .passthrough();

const MapStateSchema = z
  .object({
    Type: z.literal("Map"),
    ItemsPath: z.string().optional(),
    MaxConcurrency: z.number().int().nonnegative().optional(),
    ItemProcessor: StateMachineSchema.optional(),
    Iterator: StateMachineSchema.optional(),
    Next: z.string().optional(),
    End: z.boolean().optional(),
  })
  .passthrough();

const PassStateSchema = z
  .object({
    Type: z.literal("Pass"),
    Next: z.string().optional(),
    End: z.boolean().optional(),
  })
  .passthrough();

const FailStateSchema = z
  .object({
    Type: z.literal("Fail"),
    Error: z.string().optional(),
    Cause: z.string().optional(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// JSONPath lowering: `$.a.b` → input reference. Context-object paths (`$$.`)
// and intrinsic functions (`States.*`) never lower — they block compilation.
// ---------------------------------------------------------------------------

function lowerJsonPath(raw: string, fidelity: FidelityCollector, path: string): Expression | undefined {
  const trimmed = raw.trim();
  if (trimmed === "$") return { kind: "input", path: [] };
  if (trimmed.startsWith("$$")) {
    fidelity.unsupported("context-object", `"${raw}" reads the States context object.`, path);
    return undefined;
  }
  if (trimmed.startsWith("States.")) {
    fidelity.unsupported("intrinsic-function", `"${raw}" uses an ASL intrinsic function.`, path);
    return undefined;
  }
  const match = /^\$\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)$/.exec(trimmed);
  if (match) return { kind: "input", path: (match[1] as string).split(".") };
  fidelity.unsupported("json-path", `"${raw}" is outside the supported JSONPath subset.`, path);
  return undefined;
}

function lowerParameterValue(
  value: unknown,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  if (Array.isArray(value)) {
    const items: Expression[] = [];
    for (const [index, item] of value.entries()) {
      const lowered = lowerParameterValue(item, fidelity, `${path}[${index}]`);
      if (!lowered) return undefined;
      items.push(lowered);
    }
    return { kind: "array", items };
  }
  if (value !== null && typeof value === "object") {
    return lowerParameters(value as Record<string, unknown>, fidelity, path);
  }
  return { kind: "literal", value };
}

function lowerParameters(
  params: Record<string, unknown>,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  const entries: Record<string, Expression> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.endsWith(".$")) {
      const target = key.slice(0, -2);
      if (typeof value !== "string") {
        fidelity.unsupported("parameters", `Path binding "${key}" at ${path} must be a string.`, path);
        return undefined;
      }
      const lowered = lowerJsonPath(value, fidelity, `${path}.${key}`);
      if (!lowered) return undefined;
      entries[target] = lowered;
      continue;
    }
    const lowered = lowerParameterValue(value, fidelity, `${path}.${key}`);
    if (!lowered) return undefined;
    entries[key] = lowered;
  }
  return { kind: "object", entries };
}

function lowerChoiceRule(
  rule: z.infer<typeof ChoiceRuleSchema>,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  if (rule.Not !== undefined || rule.And !== undefined || rule.Or !== undefined) {
    fidelity.approximated("choice-rule", `Composite (Not/And/Or) rule at ${path} is skipped.`, path);
    return undefined;
  }
  if (rule.Variable === undefined) {
    fidelity.approximated("choice-rule", `Rule at ${path} has no Variable; it is skipped.`, path);
    return undefined;
  }
  const variable = /^\$\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)$/.exec(rule.Variable.trim());
  if (!variable) {
    fidelity.approximated(
      "choice-rule",
      `Variable "${rule.Variable}" at ${path} does not lower; the rule is skipped.`,
      path,
    );
    return undefined;
  }
  const left: Expression = { kind: "input", path: (variable[1] as string).split(".") };
  const comparisons: Array<[unknown, CompareOperator]> = [
    [rule.StringEquals, "eq"],
    [rule.NumericEquals, "eq"],
    [rule.BooleanEquals, "eq"],
    [rule.NumericLessThan, "lt"],
    [rule.NumericGreaterThan, "gt"],
  ];
  const found = comparisons.find(([value]) => value !== undefined);
  if (!found) {
    fidelity.approximated("choice-rule", `Rule at ${path} uses an unsupported comparison; it is skipped.`, path);
    return undefined;
  }
  return { kind: "compare", operator: found[1], left, right: { kind: "literal", value: found[0] } };
}

// ---------------------------------------------------------------------------
// State-machine compilation. Parallel-branch and Map-iterator subgraphs
// compile into the same node map with `${stateName}.`-prefixed ids.
// ---------------------------------------------------------------------------

interface MachineCompilation {
  nodes: PlanNode[];
  nodeIds: Set<string>;
  requirements: CapabilityRequirement[];
  hosts: Set<string>;
  fidelity: FidelityCollector;
  planId: string;
}

function compileMachine(
  machine: AslStateMachine,
  prefix: string,
  terminal: string | undefined,
  compilation: MachineCompilation,
): string {
  const { fidelity } = compilation;
  const push = (node: PlanNode): void => {
    compilation.nodes.push(node);
    compilation.nodeIds.add(node.id);
  };

  for (const [stateName, raw] of Object.entries(machine.States)) {
    const id = `${prefix}${stateName}`;
    if (compilation.nodeIds.has(id)) {
      fidelity.unsupported("duplicate-state", `State id "${id}" collides with another compiled state.`, id);
      continue;
    }
    const flowOf = (nextName: string | undefined): { next?: string } => {
      const target = nextName !== undefined ? `${prefix}${nextName}` : terminal;
      return target === undefined ? {} : { next: target };
    };

    switch (raw.Type) {
      case "Task": {
        const parsed = TaskStateSchema.safeParse(raw);
        if (!parsed.success) {
          fidelity.unsupported("task", `State "${id}" has an unsupported Task shape.`, id);
          continue;
        }
        const task = parsed.data;
        let provider: string | undefined;
        let operation: string;
        if (task.Resource.startsWith("https://")) {
          const url = new URL(task.Resource);
          provider = url.host;
          compilation.hosts.add(url.host);
          operation = `POST ${url.pathname}${url.search}`;
        } else if (task.Resource.startsWith("arn:")) {
          const service = task.Resource.split(":")[2];
          if (service !== undefined && service.length > 0) provider = service;
          operation = `POST ${task.Resource}`;
        } else {
          fidelity.unsupported(
            "task-resource",
            `Resource "${task.Resource}" is neither an https URL nor an ARN.`,
            id,
          );
          continue;
        }
        const args = task.Parameters
          ? lowerParameters(task.Parameters, fidelity, `${id}.Parameters`)
          : ({ kind: "object", entries: {} } as Expression);
        if (!args) continue;

        let retry: RetryPolicy | undefined;
        const firstRetrier = task.Retry?.[0];
        if (firstRetrier) {
          retry = { maxAttempts: firstRetrier.MaxAttempts ?? 3, backoffSeconds: 0 };
          if ((task.Retry?.length ?? 0) > 1) {
            fidelity.approximated("task-retry", `Only the first retrier of "${id}" is honored.`, id);
          }
        }
        let onError: string | undefined;
        const firstCatcher = task.Catch?.[0];
        if (firstCatcher) {
          onError = `${prefix}${firstCatcher.Next}`;
          if ((task.Catch?.length ?? 0) > 1) {
            fidelity.approximated("task-catch", `Only the first catcher of "${id}" is honored.`, id);
          }
        }
        const ioFields = (["InputPath", "OutputPath", "ResultPath", "ResultSelector"] as const).filter(
          (field) => task[field] !== undefined,
        );
        if (ioFields.length > 0) {
          fidelity.approximated(
            "state-io",
            `${ioFields.join("/")} on "${id}" are not modeled; the full state input flows through.`,
            id,
          );
        }
        compilation.requirements.push({
          id,
          protocol: "http",
          ...(provider === undefined ? {} : { provider }),
          operation,
          requiredScopes: [],
          effect: "mutation",
        });
        push({
          id,
          kind: "invoke",
          binding: id,
          input: args,
          effect: "mutation",
          approval: "none",
          idempotency: { kind: "deduplication-record", namespace: `${compilation.planId}:${id}` },
          ...(retry === undefined ? {} : { retry }),
          ...(onError === undefined ? {} : { onError }),
          ...flowOf(task.Next),
        });
        fidelity.exact("task", id);
        continue;
      }

      case "Choice": {
        const parsed = ChoiceStateSchema.safeParse(raw);
        if (!parsed.success) {
          fidelity.unsupported("choice", `State "${id}" has an unsupported Choice shape.`, id);
          continue;
        }
        const choices: Array<{ when: Expression; then: string }> = [];
        for (const [ruleIndex, rule] of parsed.data.Choices.entries()) {
          const when = lowerChoiceRule(rule, fidelity, `${id}.Choices[${ruleIndex}]`);
          if (when) choices.push({ when, then: `${prefix}${rule.Next}` });
        }
        const defaultTarget =
          parsed.data.Default === undefined ? undefined : `${prefix}${parsed.data.Default}`;
        if (choices.length === 0) {
          if (defaultTarget === undefined) {
            fidelity.unsupported("choice", `No rule of "${id}" lowers and there is no Default.`, id);
            continue;
          }
          fidelity.approximated("choice", `No rule of "${id}" lowers; routing to Default.`, id);
          push({ id, kind: "wait", seconds: 0.001, next: defaultTarget });
          continue;
        }
        push({
          id,
          kind: "choice",
          choices,
          ...(defaultTarget === undefined ? {} : { otherwise: defaultTarget }),
        });
        fidelity.exact("choice", id);
        continue;
      }

      case "Wait": {
        const parsed = WaitStateSchema.safeParse(raw);
        if (!parsed.success || parsed.data.Seconds === undefined) {
          fidelity.unsupported(
            "wait",
            `Wait "${id}" uses SecondsPath/Timestamp; only a literal Seconds is supported.`,
            id,
          );
          continue;
        }
        push({
          id,
          kind: "wait",
          seconds: parsed.data.Seconds > 0 ? parsed.data.Seconds : 0.001,
          ...flowOf(parsed.data.Next),
        });
        fidelity.exact("wait", id);
        continue;
      }

      case "Parallel": {
        const parsed = ParallelStateSchema.safeParse(raw);
        if (!parsed.success) {
          fidelity.unsupported("parallel", `State "${id}" has an unsupported Parallel shape.`, id);
          continue;
        }
        const branches = parsed.data.Branches.map((branch) => ({
          entryNodeId: compileMachine(branch, `${id}.`, undefined, compilation),
        }));
        push({ id, kind: "parallel", branches, ...flowOf(parsed.data.Next) });
        fidelity.exact("parallel", id);
        continue;
      }

      case "Map": {
        const parsed = MapStateSchema.safeParse(raw);
        const body = parsed.success ? (parsed.data.ItemProcessor ?? parsed.data.Iterator) : undefined;
        if (!parsed.success || body === undefined) {
          fidelity.unsupported("map", `Map "${id}" has no ItemProcessor/Iterator subgraph.`, id);
          continue;
        }
        const items = lowerJsonPath(parsed.data.ItemsPath ?? "$", fidelity, `${id}.ItemsPath`);
        if (!items) continue;
        if (parsed.data.MaxConcurrency === 0) {
          fidelity.approximated("map-concurrency", `MaxConcurrency 0 (unbounded) on "${id}" is clamped to 1.`, id);
        }
        const maxConcurrency =
          parsed.data.MaxConcurrency !== undefined && parsed.data.MaxConcurrency > 0
            ? parsed.data.MaxConcurrency
            : 1;
        push({
          id,
          kind: "forEach",
          items,
          bodyEntryNodeId: compileMachine(body, `${id}.`, undefined, compilation),
          maxConcurrency,
          ...flowOf(parsed.data.Next),
        });
        fidelity.exact("map", id);
        continue;
      }

      case "Pass": {
        const parsed = PassStateSchema.safeParse(raw);
        fidelity.approximated("pass", `Pass "${id}" is a no-op; Result/Parameters injection is not modeled.`, id);
        push({ id, kind: "wait", seconds: 0.001, ...flowOf(parsed.success ? parsed.data.Next : undefined) });
        continue;
      }

      case "Succeed": {
        push({ id, kind: "succeed" });
        fidelity.exact("succeed", id);
        continue;
      }

      case "Fail": {
        const parsed = FailStateSchema.safeParse(raw);
        const error = parsed.success ? (parsed.data.Error ?? "States.Fail") : "States.Fail";
        const cause = parsed.success ? parsed.data.Cause : undefined;
        push({ id, kind: "fail", error, ...(cause === undefined ? {} : { message: cause }) });
        fidelity.exact("fail", id);
        continue;
      }

      default:
        fidelity.unsupported("state-type", `State type "${raw.Type}" on "${id}" is not supported.`, id);
        continue;
    }
  }

  return `${prefix}${machine.StartAt}`;
}

function checkMachine(
  machine: { StartAt: string; States: Record<string, Record<string, unknown>> },
  path: string,
  diagnostics: Diagnostic[],
): void {
  const names = new Set(Object.keys(machine.States));
  if (!names.has(machine.StartAt)) {
    diagnostics.push(
      errorDiagnostic(
        "unknown-start-at",
        `StartAt "${machine.StartAt}" is not a state.`,
        path === "" ? undefined : path,
      ),
    );
  }
  for (const [name, state] of Object.entries(machine.States)) {
    const where = `${path}${name}`;
    const targets: unknown[] = [state.Next, state.Default];
    for (const key of ["Choices", "Catch"]) {
      const rules = state[key];
      if (Array.isArray(rules)) {
        for (const rule of rules) {
          if (rule !== null && typeof rule === "object") {
            targets.push((rule as Record<string, unknown>).Next);
          }
        }
      }
    }
    for (const target of targets) {
      if (typeof target === "string" && !names.has(target)) {
        diagnostics.push(
          errorDiagnostic("unknown-next-target", `State "${where}" routes to unknown state "${target}".`, where),
        );
      }
    }
    const submachines: unknown[] = Array.isArray(state.Branches) ? [...state.Branches] : [];
    submachines.push(state.ItemProcessor, state.Iterator);
    for (const candidate of submachines) {
      const parsed = StateMachineSchema.safeParse(candidate);
      if (parsed.success) checkMachine(parsed.data, `${where}.`, diagnostics);
    }
  }
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const aslImporter: WorkflowImporter<AslDocument> = {
  id: ENGINE,
  supportedVersions: ["1.0"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text);
      if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
        const doc = raw as { StartAt?: unknown; States?: unknown };
        if (
          typeof doc.StartAt === "string" &&
          doc.States !== null &&
          typeof doc.States === "object" &&
          !Array.isArray(doc.States)
        ) {
          return { detected: true, confidence: "exact" as const };
        }
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<AslDocument>> {
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
    const parsed = AslDocumentSchema.safeParse(raw);
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
    checkMachine(model, "", diagnostics);
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context: CompileContext): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const compilation: MachineCompilation = {
      nodes: [],
      nodeIds: new Set(),
      requirements: [],
      hosts: new Set(),
      fidelity,
      planId: context.planId,
    };
    if (model.TimeoutSeconds !== undefined) {
      fidelity.approximated("workflow-timeout", "Plan-level timeouts are not enforced by the kernel yet.");
    }
    const entryNodeId = compileMachine(model, "", "__succeed", compilation);
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

export default aslImporter;
