import type { Diagnostic } from "@quickdeployai/workflow-core";
import { errorDiagnostic } from "@quickdeployai/workflow-core";
import type { Expression } from "@quickdeployai/workflow-expressions";
import {
  buildPlan,
  validatePlan,
  type CapabilityRequirement,
  type InvokeNode,
  type PlanNode,
  type SideEffect,
} from "@quickdeployai/workflow-ir";
import {
  FidelityCollector,
  entrypointFile,
  parseYamlSafe,
  type CompileContext,
  type CompileResult,
  type ParseContext,
  type ParseOutcome,
  type SourceArtifact,
  type ValidationReport,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { z } from "zod";

export const ENGINE = "arazzo-2-workflows";

// ---------------------------------------------------------------------------
// Model (the Arazzo 1.x subset this importer understands)
// ---------------------------------------------------------------------------

const ParameterSchema = z.object({
  name: z.string(),
  in: z.enum(["path", "query", "header"]).default("query"),
  value: z.unknown(),
});

const StepSchema = z.object({
  stepId: z.string(),
  operationId: z.string(),
  parameters: z.array(ParameterSchema).default([]),
  requestBody: z
    .object({ contentType: z.string().optional(), payload: z.unknown() })
    .optional(),
  successCriteria: z.array(z.object({ condition: z.string() })).default([]),
  outputs: z.record(z.string(), z.string()).default({}),
});

const ArazzoWorkflowSchema = z.object({
  workflowId: z.string(),
  summary: z.string().optional(),
  inputs: z.unknown().optional(),
  steps: z.array(StepSchema).min(1),
  outputs: z.record(z.string(), z.string()).default({}),
});

const ArazzoDocumentSchema = z.object({
  arazzo: z.string().regex(/^1\./, "Only Arazzo 1.x is supported."),
  info: z.object({ title: z.string(), version: z.string() }).passthrough(),
  sourceDescriptions: z
    .array(z.object({ name: z.string(), url: z.string(), type: z.string().default("openapi") }))
    .min(1),
  workflows: z.array(ArazzoWorkflowSchema).min(1),
});

export type ArazzoDocument = z.infer<typeof ArazzoDocumentSchema>;

// ---------------------------------------------------------------------------
// Runtime-expression lowering ($inputs / $steps.<id>.outputs.<name>)
// ---------------------------------------------------------------------------

type StepOutputMap = Map<string, Map<string, string[]>>;

function lowerRuntimeExpression(
  raw: string,
  stepOutputs: StepOutputMap,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  const inputsMatch = /^\$inputs\.([A-Za-z0-9_.]+)$/.exec(raw);
  if (inputsMatch) {
    return { kind: "input", path: (inputsMatch[1] as string).split(".") };
  }
  const stepsMatch = /^\$steps\.([A-Za-z0-9_-]+)\.outputs\.([A-Za-z0-9_]+)$/.exec(raw);
  if (stepsMatch) {
    const [, stepId, outputName] = stepsMatch;
    const pointer = stepOutputs.get(stepId as string)?.get(outputName as string);
    if (!pointer) {
      fidelity.unsupported(
        "runtime-expression",
        `"${raw}" references an output that is not declared by an earlier step.`,
        path,
      );
      return undefined;
    }
    return { kind: "nodeOutput", nodeId: stepId as string, path: pointer };
  }
  if (raw.startsWith("$")) {
    fidelity.unsupported("runtime-expression", `"${raw}" is outside the supported subset.`, path);
    return undefined;
  }
  return { kind: "literal", value: raw };
}

function lowerValue(
  value: unknown,
  stepOutputs: StepOutputMap,
  fidelity: FidelityCollector,
  path: string,
): Expression | undefined {
  if (typeof value === "string") {
    return lowerRuntimeExpression(value, stepOutputs, fidelity, path);
  }
  if (Array.isArray(value)) {
    const items: Expression[] = [];
    for (const [index, item] of value.entries()) {
      const lowered = lowerValue(item, stepOutputs, fidelity, `${path}[${index}]`);
      if (!lowered) return undefined;
      items.push(lowered);
    }
    return { kind: "array", items };
  }
  if (value !== null && typeof value === "object") {
    const entries: Record<string, Expression> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const lowered = lowerValue(item, stepOutputs, fidelity, `${path}.${key}`);
      if (!lowered) return undefined;
      entries[key] = lowered;
    }
    return { kind: "object", entries };
  }
  return { kind: "literal", value };
}

// ---------------------------------------------------------------------------
// OpenAPI operation lookup (via the pinned resolver)
// ---------------------------------------------------------------------------

interface OperationInfo {
  method: string;
  path: string;
  host?: string;
  provider: string;
}

async function resolveOperations(
  document: ArazzoDocument,
  context: ParseContext | CompileContext,
): Promise<Map<string, OperationInfo>> {
  const operations = new Map<string, OperationInfo>();
  for (const source of document.sourceDescriptions) {
    if (source.type !== "openapi") continue;
    const pinned = await context.resolver.resolve({ ref: source.url });
    const spec = parseYamlSafe(pinned.text) as {
      servers?: Array<{ url?: string }>;
      paths?: Record<string, Record<string, { operationId?: string }>>;
    };
    const serverUrl = spec.servers?.[0]?.url;
    const host = serverUrl ? safeHost(serverUrl) : undefined;
    for (const [pathTemplate, methods] of Object.entries(spec.paths ?? {})) {
      for (const [method, operation] of Object.entries(methods)) {
        if (operation && typeof operation === "object" && operation.operationId) {
          operations.set(operation.operationId, {
            method: method.toUpperCase(),
            path: pathTemplate,
            ...(host === undefined ? {} : { host }),
            provider: source.name,
          });
        }
      }
    }
  }
  return operations;
}

function safeHost(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function effectOf(method: string): SideEffect {
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return "read";
  if (method === "DELETE") return "destructive";
  return "mutation";
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const arazzoImporter: WorkflowImporter<ArazzoDocument> = {
  id: ENGINE,
  supportedVersions: ["1.0", "1.1"],
  declaredConformance: 4,

  async detect(artifact: SourceArtifact) {
    try {
      const doc = parseYamlSafe(entrypointFile(artifact).text) as Record<string, unknown> | null;
      if (doc && typeof doc.arazzo === "string") {
        return { detected: true, confidence: "exact" as const, formatVersion: doc.arazzo };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<ArazzoDocument>> {
    let raw: unknown;
    try {
      raw = parseYamlSafe(entrypointFile(artifact).text);
    } catch (error) {
      return {
        ok: false,
        diagnostics: [errorDiagnostic("parse-failed", error instanceof Error ? error.message : String(error))],
      };
    }
    const parsed = ArazzoDocumentSchema.safeParse(raw);
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

  async validate(model, context): Promise<ValidationReport> {
    const diagnostics: Diagnostic[] = [];
    let operations: Map<string, OperationInfo>;
    try {
      operations = await resolveOperations(model, context);
    } catch (error) {
      return {
        valid: false,
        diagnostics: [
          errorDiagnostic(
            "source-description-unresolvable",
            error instanceof Error ? error.message : String(error),
          ),
        ],
      };
    }
    for (const workflow of model.workflows) {
      const seen = new Set<string>();
      for (const step of workflow.steps) {
        if (seen.has(step.stepId)) {
          diagnostics.push(
            errorDiagnostic("duplicate-step-id", `Step "${step.stepId}" is declared twice.`, workflow.workflowId),
          );
        }
        seen.add(step.stepId);
        if (!operations.has(step.operationId)) {
          diagnostics.push(
            errorDiagnostic(
              "unknown-operation",
              `Step "${step.stepId}" references operationId "${step.operationId}" not present in any source description.`,
              `${workflow.workflowId}.${step.stepId}`,
            ),
          );
        }
      }
    }
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const workflowId = (context.config?.workflowId as string | undefined) ?? model.workflows[0]?.workflowId;
    const workflow = model.workflows.find((candidate) => candidate.workflowId === workflowId);
    if (!workflow) {
      return {
        diagnostics: [
          { severity: "error", code: "unknown-workflow", message: `No workflow "${workflowId}" in document.` },
        ],
        fidelity: fidelity.report(),
        requirements: [],
      };
    }

    const operations = await resolveOperations(model, context);
    const stepOutputs: StepOutputMap = new Map();
    const requirements = new Map<string, CapabilityRequirement>();
    const nodes: PlanNode[] = [];
    const hosts = new Set<string>();

    for (const [index, step] of workflow.steps.entries()) {
      const operation = operations.get(step.operationId);
      if (!operation) {
        fidelity.blocked("operation", `operationId "${step.operationId}" is unresolved.`, step.stepId);
        continue;
      }
      if (operation.host) hosts.add(operation.host);
      const effect = effectOf(operation.method);
      requirements.set(step.operationId, {
        id: step.operationId,
        protocol: "openapi",
        provider: operation.provider,
        operation: `${operation.method} ${operation.path}`,
        requiredScopes: [],
        effect,
      });

      // Declared outputs: `$response.body#/ptr` → response-body pointer paths.
      const outputs = new Map<string, string[]>();
      for (const [name, pointer] of Object.entries(step.outputs)) {
        const match = /^\$response\.body#\/(.+)$/.exec(pointer);
        if (match) {
          outputs.set(name, (match[1] as string).split("/"));
          fidelity.exact("step-output", `${step.stepId}.${name}`);
        } else if (pointer === "$response.body") {
          outputs.set(name, []);
          fidelity.exact("step-output", `${step.stepId}.${name}`);
        } else {
          fidelity.unsupported("step-output", `"${pointer}" is not a $response.body pointer.`, step.stepId);
        }
      }
      stepOutputs.set(step.stepId, outputs);

      // Path template + parameters → args expression.
      const pathParts: Expression[] = [];
      let template = operation.path;
      for (const parameter of step.parameters.filter((param) => param.in === "path")) {
        const lowered = lowerValue(parameter.value, stepOutputs, fidelity, `${step.stepId}.${parameter.name}`);
        if (!lowered) continue;
        const placeholder = `{${parameter.name}}`;
        const [before, ...rest] = template.split(placeholder);
        pathParts.push({ kind: "literal", value: before ?? "" }, lowered);
        template = rest.join(placeholder);
      }
      pathParts.push({ kind: "literal", value: template });

      const queryEntries: Record<string, Expression> = {};
      for (const parameter of step.parameters.filter((param) => param.in === "query")) {
        const lowered = lowerValue(parameter.value, stepOutputs, fidelity, `${step.stepId}.${parameter.name}`);
        if (lowered) queryEntries[parameter.name] = lowered;
      }
      for (const parameter of step.parameters.filter((param) => param.in === "header")) {
        fidelity.approximated("header-parameter", `Header "${parameter.name}" is not forwarded.`, step.stepId);
      }

      const argsEntries: Record<string, Expression> = {
        path: { kind: "interpolate", parts: pathParts },
      };
      if (Object.keys(queryEntries).length > 0) {
        argsEntries.query = { kind: "object", entries: queryEntries };
      }

      let providerKey: Expression | undefined;
      if (step.requestBody) {
        const payload = lowerValue(step.requestBody.payload, stepOutputs, fidelity, `${step.stepId}.requestBody`);
        if (payload) argsEntries.body = payload;
        const rawPayload = step.requestBody.payload as Record<string, unknown> | undefined;
        if (rawPayload && typeof rawPayload === "object" && "idempotencyKey" in rawPayload) {
          providerKey = lowerValue(rawPayload.idempotencyKey, stepOutputs, fidelity, `${step.stepId}.idempotencyKey`);
        }
      }

      for (const criterion of step.successCriteria) {
        if (/^\$statusCode\s*==\s*2\d\d$/.test(criterion.condition)) {
          fidelity.exact("success-criterion", step.stepId);
        } else {
          fidelity.approximated(
            "success-criterion",
            `"${criterion.condition}" approximates to HTTP-success enforcement.`,
            step.stepId,
          );
        }
      }

      const nextStep = workflow.steps[index + 1];
      const node: InvokeNode = {
        id: step.stepId,
        kind: "invoke",
        binding: step.operationId,
        input: { kind: "object", entries: argsEntries },
        effect,
        approval: "none",
        retry: { maxAttempts: effect === "read" ? 3 : 2, backoffSeconds: 0 },
        ...(effect === "read"
          ? {}
          : providerKey
            ? { idempotency: { kind: "provider-key", key: providerKey } }
            : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${step.stepId}` } }),
        next: nextStep ? nextStep.stepId : "__succeed",
      };
      nodes.push(node);
      fidelity.exact("api-step", step.stepId);
    }

    const workflowOutputEntries: Record<string, Expression> = {};
    for (const [name, pointer] of Object.entries(workflow.outputs)) {
      const lowered = lowerRuntimeExpression(pointer, stepOutputs, fidelity, `outputs.${name}`);
      if (lowered) workflowOutputEntries[name] = lowered;
    }
    nodes.push({
      id: "__succeed",
      kind: "succeed",
      ...(Object.keys(workflowOutputEntries).length > 0
        ? { output: { kind: "object", entries: workflowOutputEntries } as Expression }
        : {}),
    });

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
        requirements: [...requirements.values()],
      };
    }

    const plan = buildPlan({
      id: context.planId,
      name: context.planName,
      source: {
        format: ENGINE,
        formatVersion: model.arazzo,
        artifactDigest: context.artifactDigest ?? "sha256:pending",
        entrypoint: context.entrypoint ?? "-",
      },
      compiler: { name: ENGINE, version: "0.1.0" },
      entryNodeId: workflow.steps[0]?.stepId ?? "__succeed",
      nodes,
      capabilityRequirements: [...requirements.values()],
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

    return {
      plan,
      diagnostics: planDiagnostics,
      fidelity: fidelity.report(),
      requirements: [...requirements.values()],
    };
  },
};

export default arazzoImporter;
