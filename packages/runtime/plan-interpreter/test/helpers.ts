import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { literal, type Expression } from "@quickdeployai/workflow-expressions";
import { buildPlan, computePlanDigest, type ExecutionPlanV1, type PlanNode } from "@quickdeployai/workflow-ir";
import type { BindingLock } from "@quickdeployai/workflow-capabilities";
import {
  computeEffectivePolicy,
  createPolicyEngine,
  derivePolicyIntent,
  type PolicyEngine,
  type PolicyGrants,
} from "@quickdeployai/workflow-policy";
import type { AuditEvent, AuditSink } from "../src/audit.js";

export const SECRET = "super-secret-token-value";

export interface TestApi {
  server: Server;
  baseUrl: string;
  host: string;
  orders: Array<{ petId: string; idempotencyKey?: string }>;
  requests: Array<{ method: string; path: string; auth?: string }>;
  close(): Promise<void>;
  reset(): void;
}

/** Deterministic local HTTP server — the "external system" under test. */
export async function startTestApi(): Promise<TestApi> {
  const orders: TestApi["orders"] = [];
  const requests: TestApi["requests"] = [];

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const record: { method: string; path: string; auth?: string } = {
      method: req.method ?? "GET",
      path: url.pathname,
    };
    if (req.headers.authorization) record.auth = req.headers.authorization;
    requests.push(record);

    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      if (req.method === "GET" && url.pathname.startsWith("/pets/")) {
        const id = url.pathname.split("/")[2];
        res.end(JSON.stringify({ id, name: "Rex", price: 12.5 }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/orders") {
        const parsed = JSON.parse(body || "{}") as { petId?: string };
        const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
        if (idempotencyKey && orders.some((order) => order.idempotencyKey === idempotencyKey)) {
          res.statusCode = 200;
          res.end(JSON.stringify({ id: `order-${orders.length}`, deduped: true }));
          return;
        }
        orders.push({ petId: parsed.petId ?? "?", ...(idempotencyKey ? { idempotencyKey } : {}) });
        res.statusCode = 201;
        res.end(JSON.stringify({ id: `order-${orders.length}`, status: "created" }));
        return;
      }
      if (req.method === "GET" && url.pathname === "/whoami") {
        res.end(JSON.stringify({ token: SECRET }));
        return;
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "not found" }));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    server,
    baseUrl,
    host: `127.0.0.1:${address.port}`,
    orders,
    requests,
    close: () => new Promise((resolve) => server.close(() => resolve())),
    reset: () => {
      orders.length = 0;
      requests.length = 0;
    },
  };
}

export function createMemoryAuditSink(): AuditSink & { events: AuditEvent[] } {
  const events: AuditEvent[] = [];
  return {
    events,
    async append(event) {
      events.push(event);
    },
    async read(runId) {
      return events.filter((event) => event.runId === runId);
    },
  };
}

export interface TestPlanOptions {
  nodes: PlanNode[];
  entryNodeId: string;
  requirements?: ExecutionPlanV1["capabilityRequirements"];
  credentialRequirements?: ExecutionPlanV1["credentialRequirements"];
  host: string;
  budgets?: Partial<ExecutionPlanV1["budgets"]>;
}

export function makePlan(options: TestPlanOptions): { plan: ExecutionPlanV1; planDigest: string } {
  const plan = buildPlan({
    id: "kernel-test",
    name: "kernel-test",
    source: { format: "test", artifactDigest: "sha256:test", entrypoint: "-" },
    compiler: { name: "kernel-test", version: "0.1.0" },
    entryNodeId: options.entryNodeId,
    nodes: options.nodes,
    capabilityRequirements: options.requirements ?? [],
    credentialRequirements: options.credentialRequirements ?? [],
    outboundHosts: [options.host],
    ...(options.budgets ? { budgets: options.budgets } : {}),
  });
  return { plan, planDigest: computePlanDigest(plan) };
}

export function makeLock(
  planDigest: string,
  plan: ExecutionPlanV1,
  endpoint: string,
  credentialHandle?: string,
): BindingLock {
  return {
    planDigest,
    bindings: plan.capabilityRequirements.map((requirement) => ({
      requirementId: requirement.id,
      implementationId: "test-api",
      implementationVersion: "1.0.0",
      ...(requirement.protocol === "http" || requirement.protocol === "openapi"
        ? { endpoint }
        : {}),
      ...(credentialHandle ? { credentialHandle } : {}),
    })),
  };
}

export function permissivePolicy(
  plan: ExecutionPlanV1,
  planDigest: string,
  overrides: Partial<PolicyGrants> = {},
): PolicyEngine {
  const intent = derivePolicyIntent(plan, planDigest);
  const effective = computeEffectivePolicy(intent, {
    allowedHosts: ["*"],
    allowedCredentials: ["*"],
    allowedEffects: ["read", "mutation", "send", "destructive"],
    approvalRequiredEffects: [],
    maxAgentSessions: 8,
    maxChildWorkflows: 8,
    writablePaths: ["*"],
    ...overrides,
  });
  return createPolicyEngine(effective);
}

export function objectExpr(entries: Record<string, Expression>): Expression {
  return { kind: "object", entries };
}

export { literal };
