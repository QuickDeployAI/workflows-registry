import {
  MAKE_PACK,
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
  type SideEffect,
} from "@quickdeployai/workflow-ir";
import { z } from "zod";

export const ENGINE = "make-2-workflows";

// ---------------------------------------------------------------------------
// Model — Make (Integromat) scenario blueprint subset: a linear `flow` of
// modules. Router modules may nest sub-flows in `routes`.
// ---------------------------------------------------------------------------

interface MakeModule {
  id: number;
  module: string;
  mapper?: Record<string, unknown>;
  routes?: Array<{ flow: MakeModule[] }>;
}

const MakeModuleSchema: z.ZodType<MakeModule> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    module: z.string().min(1),
    mapper: z.record(z.string(), z.unknown()).optional(),
    routes: z.array(z.object({ flow: z.array(MakeModuleSchema) })).optional(),
  }),
) as z.ZodType<MakeModule>;

const MakeScenarioSchema = z.object({
  name: z.string().min(1),
  flow: z.array(MakeModuleSchema).min(1),
});

export type MakeScenario = z.infer<typeof MakeScenarioSchema>;

const ROUTER_MODULE = "builtin:BasicRouter";

const moduleNodeId = (id: number): string => `m${id}`;

// ---------------------------------------------------------------------------
// Mapper token lowering: "{{<moduleId>.<field>}}" → nodeOutput(m<id>, [field]).
// Anything else inside {{ }} is unsupported (blocking when execution-relevant).
// ---------------------------------------------------------------------------

function lowerToken(inner: string, fidelity: FidelityCollector, path: string): Expression {
  const ref = /^(\d+)\.([A-Za-z0-9_.]+)$/.exec(inner);
  if (ref) {
    return {
      kind: "nodeOutput",
      nodeId: moduleNodeId(Number(ref[1])),
      path: (ref[2] as string).split("."),
    };
  }
  fidelity.unsupported(
    "make-mapping",
    `"{{${inner}}}" is outside the supported subset (<moduleId>.<field> only).`,
    path,
  );
  return { kind: "literal", value: "" };
}

export function lowerMakeString(
  raw: string,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (!raw.includes("{{")) return { kind: "literal", value: raw };
  const full = /^\{\{\s*(.+?)\s*\}\}$/.exec(raw.trim());
  if (full) return lowerToken(full[1] as string, fidelity, path);

  const parts: Expression[] = [];
  const pattern = /\{\{\s*(.*?)\s*\}\}/g;
  let cursor = 0;
  for (let match = pattern.exec(raw); match; match = pattern.exec(raw)) {
    if (match.index > cursor) parts.push({ kind: "literal", value: raw.slice(cursor, match.index) });
    parts.push(lowerToken(match[1] as string, fidelity, path));
    cursor = match.index + match[0].length;
  }
  if (cursor < raw.length) parts.push({ kind: "literal", value: raw.slice(cursor) });
  return { kind: "interpolate", parts };
}

function lowerValue(value: unknown, fidelity: FidelityCollector, path: string): Expression {
  if (typeof value === "string") return lowerMakeString(value, fidelity, path);
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

export const makeImporter: WorkflowImporter<MakeScenario> = {
  id: ENGINE,
  supportedVersions: ["1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as { flow?: unknown } | null;
      const flow = raw?.flow;
      if (
        Array.isArray(flow) &&
        flow.length > 0 &&
        flow.every(
          (module) =>
            typeof (module as { module?: unknown }).module === "string" &&
            /^[a-z0-9-]+:/i.test((module as { module: string }).module) &&
            typeof (module as { id?: unknown }).id === "number",
        )
      ) {
        return { detected: true, confidence: "exact" as const, formatVersion: "1" };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<MakeScenario>> {
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
    // Connection/credential metadata (incl. Make's __IMTCONN__ ids) never
    // reaches the model.
    const sanitized = stripCredentialMetadata(raw, ["__IMTCONN__"]);
    const parsed = MakeScenarioSchema.safeParse(sanitized);
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
    const seen = new Set<number>();
    const walk = (flow: MakeModule[]): void => {
      for (const module of flow) {
        if (seen.has(module.id)) {
          diagnostics.push(
            errorDiagnostic("duplicate-module-id", `Module id ${module.id} appears more than once.`),
          );
        }
        seen.add(module.id);
        for (const route of module.routes ?? []) walk(route.flow);
      }
    };
    walk(model.flow);
    return { valid: diagnostics.length === 0, diagnostics };
  },

  async compile(model, context): Promise<CompileResult> {
    const fidelity = new FidelityCollector();
    const requirements: CapabilityRequirement[] = [];
    const nodesOut: PlanNode[] = [];
    const hosts = new Set<string>();

    // Flatten the flow. Routers: a single route is flattened inline
    // (approximated); multiple routes cannot be represented faithfully as a
    // sequential chain and block compilation. Documented in fidelity.
    const sequence: MakeModule[] = [];
    const flatten = (flow: MakeModule[]): void => {
      for (const module of flow) {
        if (module.module === ROUTER_MODULE) {
          const routes = module.routes ?? [];
          if (routes.length <= 1) {
            fidelity.approximated(
              "router",
              `Router ${moduleNodeId(module.id)} has ${routes.length} route(s); flattened into the main chain.`,
              moduleNodeId(module.id),
            );
            const first = routes[0];
            if (first) flatten(first.flow);
          } else {
            fidelity.blocked(
              "router",
              `Router ${moduleNodeId(module.id)} declares ${routes.length} routes; multi-route branching is not supported.`,
              moduleNodeId(module.id),
            );
          }
          continue;
        }
        sequence.push(module);
      }
    };
    flatten(model.flow);

    for (const [index, module] of sequence.entries()) {
      const nodeId = moduleNodeId(module.id);
      const nextModule = sequence[index + 1];
      const nextId = nextModule === undefined ? "__succeed" : moduleNodeId(nextModule.id);
      const mapping = resolveMapping(MAKE_PACK, module.module);

      if (!mapping) {
        fidelity.blocked("unmapped-connector", `No connector mapping for "${module.module}".`, nodeId);
        continue;
      }

      const mapper = module.mapper ?? {};

      if (isHttpPassthrough(mapping)) {
        const urlRaw = typeof mapper.url === "string" ? mapper.url : "";
        if (urlRaw === "") {
          fidelity.unsupported("http-module", `Module ${nodeId} has no url in its mapper.`, nodeId);
        }
        const method = typeof mapper.method === "string" ? mapper.method.toUpperCase() : "GET";
        const effect = effectOfMethod(method);
        let host: string | undefined;
        let operation = `${method} *`;
        if (!urlRaw.includes("{{")) {
          try {
            const url = new URL(urlRaw);
            host = url.host;
            operation = `${method} ${url.pathname}`;
          } catch {
            fidelity.approximated("http-url", `"${urlRaw}" is not an absolute URL.`, nodeId);
          }
        } else {
          const prefix = /^(https:\/\/([^/{\s]+))/.exec(urlRaw);
          if (prefix) host = prefix[2] as string;
        }
        if (host) hosts.add(host);
        requirements.push({
          id: nodeId,
          protocol: "http",
          ...(host === undefined ? {} : { provider: host }),
          operation,
          requiredScopes: [],
          effect,
        });
        const entries: Record<string, Expression> = {
          method: { kind: "literal", value: method },
          url: lowerMakeString(urlRaw, fidelity, `${nodeId}.url`),
        };
        if (mapper.data !== undefined) {
          entries.body = lowerValue(mapper.data, fidelity, `${nodeId}.data`);
        }
        nodesOut.push({
          id: nodeId,
          kind: "invoke",
          binding: nodeId,
          input: { kind: "object", entries },
          effect,
          approval: "none",
          ...(effect === "read"
            ? {}
            : { idempotency: { kind: "deduplication-record", namespace: `${context.planId}:${nodeId}` } }),
          next: nextId,
        });
        fidelity.exact("http-module", nodeId);
        continue;
      }

      requirements.push(toCapabilityRequirement(nodeId, mapping));
      nodesOut.push({
        id: nodeId,
        kind: "invoke",
        binding: nodeId,
        input: {
          kind: "object",
          entries: { body: lowerValue(mapper, fidelity, `${nodeId}.mapper`) },
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

    const first = sequence[0];
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
      entryNodeId: first === undefined ? "__succeed" : moduleNodeId(first.id),
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

export default makeImporter;
