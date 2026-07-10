import {
  N8N_PACK,
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

export const ENGINE = "n8n-2-workflows";

// ---------------------------------------------------------------------------
// Model — the n8n export subset this importer understands. Credential
// metadata is stripped BEFORE schema parsing, so the model never carries it.
// ---------------------------------------------------------------------------

const ConnectionTargetSchema = z.object({
  node: z.string().min(1),
  type: z.string(),
  index: z.number().int().nonnegative(),
});

const N8nNodeSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

const N8nWorkflowSchema = z.object({
  name: z.string().min(1),
  nodes: z.array(N8nNodeSchema).min(1),
  connections: z
    .record(
      z.string(),
      z.object({ main: z.array(z.array(ConnectionTargetSchema).nullable()).optional() }),
    )
    .default({}),
});

export type N8nWorkflow = z.infer<typeof N8nWorkflowSchema>;
type N8nNode = z.infer<typeof N8nNodeSchema>;

const COSMETIC_TYPES = new Set(["n8n-nodes-base.stickyNote", "n8n-nodes-base.noOp"]);
const CODE_TYPES = new Set([
  "n8n-nodes-base.code",
  "n8n-nodes-base.function",
  "n8n-nodes-base.functionItem",
]);
const IF_TYPE = "n8n-nodes-base.if";

function isTriggerType(type: string): boolean {
  return /trigger/i.test(type) || type === "n8n-nodes-base.start" || type === "n8n-nodes-base.webhook";
}

// ---------------------------------------------------------------------------
// Expression lowering: only the `$json.<path>` subset of n8n expressions is
// lowered. `$node["Name"]...` and anything else inside {{ }} is unsupported
// and blocks compilation when execution-relevant. Lowering is total — on an
// unsupported token it records the finding and falls back to a literal, and
// the blocking finding kills the compile at the end.
// ---------------------------------------------------------------------------

function lowerToken(inner: string, fidelity: FidelityCollector, path: string): Expression {
  const json = /^\$json\.([A-Za-z0-9_$.]+)$/.exec(inner);
  if (json) return { kind: "input", path: (json[1] as string).split(".") };
  fidelity.unsupported(
    "n8n-expression",
    `"{{ ${inner} }}" is outside the supported subset ($json.<path> only).`,
    path,
  );
  return { kind: "literal", value: "" };
}

export function lowerN8nString(
  raw: string,
  fidelity: FidelityCollector,
  path: string,
): Expression {
  if (!raw.startsWith("=")) return { kind: "literal", value: raw };
  const body = raw.slice(1);
  const full = /^\{\{\s*(.+?)\s*\}\}$/.exec(body.trim());
  if (full) return lowerToken(full[1] as string, fidelity, path);
  if (!body.includes("{{")) return { kind: "literal", value: body };

  const parts: Expression[] = [];
  const pattern = /\{\{\s*(.*?)\s*\}\}/g;
  let cursor = 0;
  for (let match = pattern.exec(body); match; match = pattern.exec(body)) {
    if (match.index > cursor) {
      parts.push({ kind: "literal", value: body.slice(cursor, match.index) });
    }
    parts.push(lowerToken(match[1] as string, fidelity, path));
    cursor = match.index + match[0].length;
  }
  if (cursor < body.length) parts.push({ kind: "literal", value: body.slice(cursor) });
  return { kind: "interpolate", parts };
}

function lowerValue(value: unknown, fidelity: FidelityCollector, path: string): Expression {
  if (typeof value === "string") return lowerN8nString(value, fidelity, path);
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

const IfConditionsSchema = z.object({
  conditions: z.object({
    string: z
      .array(z.object({ value1: z.string(), operation: z.string(), value2: z.unknown() }))
      .min(1),
  }),
});

const IF_OPERATORS: Record<string, "eq" | "ne" | "lt" | "le" | "gt" | "ge"> = {
  equals: "eq",
  notEquals: "ne",
  larger: "gt",
  largerEqual: "ge",
  smaller: "lt",
  smallerEqual: "le",
};

function effectOfMethod(method: string): SideEffect {
  const upper = method.toUpperCase();
  return upper === "GET" ? "read" : upper === "DELETE" ? "destructive" : "mutation";
}

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

export const n8nImporter: WorkflowImporter<N8nWorkflow> = {
  id: ENGINE,
  supportedVersions: ["1"],
  declaredConformance: 2,

  async detect(artifact: SourceArtifact) {
    try {
      const raw = parseJsonSafe(entrypointFile(artifact).text) as {
        nodes?: unknown;
        connections?: unknown;
      } | null;
      const nodes = raw?.nodes;
      if (
        Array.isArray(nodes) &&
        typeof raw?.connections === "object" &&
        raw.connections !== null &&
        nodes.some(
          (node) =>
            typeof (node as { type?: unknown }).type === "string" &&
            ((node as { type: string }).type.startsWith("n8n-nodes-base.") ||
              (node as { type: string }).type.startsWith("@n8n/")),
        )
      ) {
        return { detected: true, confidence: "exact" as const, formatVersion: "1" };
      }
    } catch {
      // fallthrough
    }
    return { detected: false, confidence: "none" as const };
  },

  async parse(artifact, _context): Promise<ParseOutcome<N8nWorkflow>> {
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
    // Credential metadata never reaches the model. n8n's top-level
    // `connections` object is graph wiring (not credentials), so only the
    // node list is deep-stripped.
    const rawRecord = (raw !== null && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;
    const sanitized = { ...rawRecord, nodes: stripCredentialMetadata(rawRecord.nodes) };
    const parsed = N8nWorkflowSchema.safeParse(sanitized);
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
    const names = new Set(model.nodes.map((node) => node.name));
    for (const [from, connection] of Object.entries(model.connections)) {
      if (!names.has(from)) {
        diagnostics.push(
          errorDiagnostic("unknown-connection-source", `Connections reference unknown node "${from}".`, from),
        );
      }
      for (const branch of connection.main ?? []) {
        for (const target of branch ?? []) {
          if (!names.has(target.node)) {
            diagnostics.push(
              errorDiagnostic(
                "unknown-connection-target",
                `Node "${from}" connects to unknown node "${target.node}".`,
                from,
              ),
            );
          }
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
    const byName = new Map(model.nodes.map((node) => [node.name, node]));

    const successorsOf = (name: string): Array<string | undefined> => {
      const main = model.connections[name]?.main ?? [];
      return main.map((branch, index) => {
        if (branch && branch.length > 1) {
          fidelity.approximated(
            "fan-out",
            `Node "${name}" output ${index} fans out to ${branch.length} nodes; only the first is followed.`,
            name,
          );
        }
        return branch?.[0]?.node;
      });
    };

    const linearize = (from: string | undefined): string[] => {
      const chain: string[] = [];
      const seen = new Set<string>();
      let current = from;
      while (current !== undefined && !seen.has(current)) {
        seen.add(current);
        chain.push(current);
        current = model.connections[current]?.main?.[0]?.[0]?.node;
      }
      return chain;
    };

    const visiting = new Set<string>();
    const emitted = new Set<string>();

    /**
     * Compiles the chain starting at `name`, stopping (exclusive) at `until`
     * (a branch-join node compiled by the caller). Returns the id of the
     * segment's entry plan node.
     */
    const compileFrom = (name: string | undefined, until: string | undefined): string => {
      if (name === undefined) return "__succeed";
      if (until !== undefined && name === until) return until;
      if (emitted.has(name)) return name;
      if (visiting.has(name)) {
        fidelity.unsupported("cycle", `Node "${name}" participates in a cycle.`, name);
        return "__succeed";
      }
      const node = byName.get(name);
      if (!node) {
        fidelity.unsupported("unknown-node", `Connections reference unknown node "${name}".`, name);
        return "__succeed";
      }
      visiting.add(name);
      try {
        const entry = compileNode(node, until);
        return entry;
      } finally {
        visiting.delete(name);
      }
    };

    const compileNode = (node: N8nNode, until: string | undefined): string => {
      const successors = successorsOf(node.name);

      if (isTriggerType(node.type)) {
        fidelity.approximated(
          "trigger",
          `Trigger "${node.name}" (${node.type}) becomes the run input; the plan starts at its successor.`,
          node.name,
        );
        return compileFrom(successors[0], until);
      }

      if (COSMETIC_TYPES.has(node.type)) {
        // Finding already recorded upfront for every cosmetic node.
        return compileFrom(successors[0], until);
      }

      if (CODE_TYPES.has(node.type)) {
        fidelity.blocked(
          "code-node",
          `"${node.name}" (${node.type}) contains vendor JavaScript; code is never executed.`,
          node.name,
        );
        return compileFrom(successors[0], until);
      }

      if (node.type === IF_TYPE) {
        return compileIfNode(node, successors, until);
      }

      const params = node.parameters;

      if (node.type === "n8n-nodes-base.httpRequest") {
        const nextId = compileFrom(successors[0], until);
        emitHttpRequest(node, nextId);
        emitted.add(node.name);
        return node.name;
      }

      const resource = typeof params.resource === "string" ? params.resource : undefined;
      const operation = typeof params.operation === "string" ? params.operation : undefined;
      const mappingKey =
        resource !== undefined && operation !== undefined
          ? `${node.type}:${resource}:${operation}`
          : node.type;
      const mapping = resolveMapping(N8N_PACK, mappingKey) ?? resolveMapping(N8N_PACK, node.type);

      if (!mapping || isHttpPassthrough(mapping)) {
        fidelity.blocked(
          "unmapped-connector",
          `No connector mapping for "${mappingKey}".`,
          node.name,
        );
        return compileFrom(successors[0], until);
      }

      const nextId = compileFrom(successors[0], until);
      requirements.push(toCapabilityRequirement(node.name, mapping));
      const bodyParams = Object.fromEntries(
        Object.entries(params).filter(([key]) => key !== "resource" && key !== "operation"),
      );
      nodesOut.push({
        id: node.name,
        kind: "invoke",
        binding: node.name,
        input: {
          kind: "object",
          entries: { body: lowerValue(bodyParams, fidelity, `${node.name}.parameters`) },
        },
        effect: mapping.effect,
        approval: "none",
        ...(mapping.effect === "read"
          ? {}
          : {
              idempotency: {
                kind: "deduplication-record",
                namespace: `${context.planId}:${node.name}`,
              },
            }),
        next: nextId,
      });
      fidelity.exact("mapped-connector", node.name);
      emitted.add(node.name);
      return node.name;
    };

    const emitHttpRequest = (node: N8nNode, nextId: string): void => {
      const params = node.parameters;
      const urlRaw = typeof params.url === "string" ? params.url : "";
      if (urlRaw === "") {
        fidelity.unsupported("http-request", `"${node.name}" has no url parameter.`, node.name);
      }
      const method = typeof params.method === "string" ? params.method.toUpperCase() : "GET";
      const effect = effectOfMethod(method);
      const urlExpression = lowerN8nString(urlRaw, fidelity, `${node.name}.url`);

      let host: string | undefined;
      let operation = `${method} *`;
      if (!urlRaw.startsWith("=")) {
        try {
          const url = new URL(urlRaw);
          host = url.host;
          operation = `${method} ${url.pathname}`;
        } catch {
          fidelity.approximated("http-url", `"${urlRaw}" is not an absolute URL.`, node.name);
        }
      } else {
        // Expression URL: the host is only recorded when the literal prefix pins it.
        const prefix = /^=(https:\/\/([^/{\s]+))/.exec(urlRaw);
        if (prefix) host = prefix[2] as string;
      }
      if (host) hosts.add(host);

      requirements.push({
        id: node.name,
        protocol: "http",
        ...(host === undefined ? {} : { provider: host }),
        operation,
        requiredScopes: [],
        effect,
      });

      const entries: Record<string, Expression> = {
        method: { kind: "literal", value: method },
        url: urlExpression,
      };
      if (params.body !== undefined) {
        entries.body = lowerValue(params.body, fidelity, `${node.name}.body`);
      }
      nodesOut.push({
        id: node.name,
        kind: "invoke",
        binding: node.name,
        input: { kind: "object", entries },
        effect,
        approval: "none",
        ...(effect === "read"
          ? {}
          : {
              idempotency: {
                kind: "deduplication-record",
                namespace: `${context.planId}:${node.name}`,
              },
            }),
        next: nextId,
      });
      fidelity.exact("http-request", node.name);
    };

    const compileIfNode = (
      node: N8nNode,
      successors: Array<string | undefined>,
      until: string | undefined,
    ): string => {
      const conditions = IfConditionsSchema.safeParse(node.parameters);
      let when: Expression = { kind: "literal", value: true };
      if (!conditions.success) {
        fidelity.unsupported(
          "if-conditions",
          `IF node "${node.name}" uses conditions outside the supported string subset.`,
          node.name,
        );
      } else {
        const condition = conditions.data.conditions.string[0] as {
          value1: string;
          operation: string;
          value2: unknown;
        };
        if (conditions.data.conditions.string.length > 1) {
          fidelity.approximated(
            "if-conditions",
            `IF node "${node.name}" declares multiple conditions; only the first is lowered.`,
            node.name,
          );
        }
        const operator = IF_OPERATORS[condition.operation];
        if (!operator) {
          fidelity.unsupported(
            "if-operator",
            `IF operator "${condition.operation}" is not supported.`,
            node.name,
          );
        } else {
          when = {
            kind: "compare",
            operator,
            left: lowerN8nString(condition.value1, fidelity, `${node.name}.value1`),
            right:
              typeof condition.value2 === "string"
                ? lowerN8nString(condition.value2, fidelity, `${node.name}.value2`)
                : { kind: "literal", value: condition.value2 },
          };
        }
      }

      const trueHead = successors[0];
      const falseHead = successors[1];
      const falseChain = new Set(linearize(falseHead));
      const join = linearize(trueHead).find((candidate) => falseChain.has(candidate));

      const thenEntry = compileFrom(trueHead, join);
      const otherwiseEntry = compileFrom(falseHead, join);
      // Compile the join (and everything after it) with the outer continuation.
      if (join !== undefined) compileFrom(join, until);

      nodesOut.push({
        id: node.name,
        kind: "choice",
        choices: [{ when, then: thenEntry }],
        otherwise: otherwiseEntry,
      });
      fidelity.exact("if-node", node.name);
      emitted.add(node.name);
      return node.name;
    };

    // Purely cosmetic/no-op nodes are approximated-and-skipped, wherever they sit.
    for (const node of model.nodes) {
      if (COSMETIC_TYPES.has(node.type)) {
        fidelity.approximated(
          "cosmetic-node",
          `"${node.name}" (${node.type}) is cosmetic/no-op and was skipped.`,
          node.name,
        );
      }
    }

    // Entry: the first non-cosmetic node without an incoming main connection.
    const incoming = new Set<string>();
    for (const connection of Object.values(model.connections)) {
      for (const branch of connection.main ?? []) {
        for (const target of branch ?? []) incoming.add(target.node);
      }
    }
    const starts = model.nodes.filter(
      (node) => !incoming.has(node.name) && !COSMETIC_TYPES.has(node.type),
    );
    const start = starts[0];
    if (!start) {
      return {
        diagnostics: [
          {
            severity: "error",
            code: "no-entry-node",
            message: "No start node found (every node has an incoming main connection).",
          },
        ],
        fidelity: fidelity.report(),
        requirements,
      };
    }
    if (starts.length > 1) {
      fidelity.approximated(
        "multiple-entry-nodes",
        `Multiple start nodes (${starts.map((node) => node.name).join(", ")}); only "${start.name}" is compiled.`,
      );
    }

    const entryNodeId = compileFrom(start.name, undefined);
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
      entryNodeId,
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

export default n8nImporter;
