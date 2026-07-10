import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { start, resumeHook } from "workflow/api";
import { waitForHook } from "@workflow/vitest";
import { inputRef, literal, nodeOutputRef } from "@quickdeployai/workflow-expressions";
import type { CapabilityRequirement } from "@quickdeployai/workflow-ir";
import { configureKernel, resetKernel } from "../src/services.js";
import { runExecutionPlan } from "../workflows/run-execution-plan.js";
import {
  SECRET,
  createMemoryAuditSink,
  makeLock,
  makePlan,
  objectExpr,
  permissivePolicy,
  startTestApi,
  type TestApi,
} from "./helpers.js";
import { createMemoryArtifactStore } from "../src/artifact-store.js";

let api: TestApi;
let audit: ReturnType<typeof createMemoryAuditSink>;

const GET_PET: CapabilityRequirement = {
  id: "get-pet",
  protocol: "http",
  operation: "GET /pets/{petId}",
  requiredScopes: [],
  effect: "read",
};
const PLACE_ORDER: CapabilityRequirement = {
  id: "place-order",
  protocol: "http",
  operation: "POST /orders",
  requiredScopes: [],
  effect: "mutation",
};

function checkoutNodes() {
  return [
    {
      id: "findPet",
      kind: "invoke" as const,
      binding: "get-pet",
      input: objectExpr({
        path: { kind: "interpolate" as const, parts: [literal("/pets/"), inputRef("petId")] },
      }),
      effect: "read" as const,
      approval: "none" as const,
      next: "placeOrder",
    },
    {
      id: "placeOrder",
      kind: "invoke" as const,
      binding: "place-order",
      input: objectExpr({
        path: literal("/orders"),
        body: objectExpr({ petId: inputRef("petId"), price: nodeOutputRef("findPet", "price") }),
      }),
      effect: "mutation" as const,
      idempotency: { kind: "deduplication-record" as const, namespace: "orders" },
      approval: "none" as const,
      retry: { maxAttempts: 3, backoffSeconds: 0 },
      next: "done",
    },
    { id: "done", kind: "succeed" as const, output: nodeOutputRef("placeOrder", "id") },
  ];
}

beforeAll(async () => {
  api = await startTestApi();
});

afterAll(async () => {
  await api.close();
  resetKernel();
});

beforeEach(() => {
  api.reset();
  audit = createMemoryAuditSink();
});

function setupKernel(plan: Parameters<typeof permissivePolicy>[0], digest: string, overrides = {}) {
  configureKernel({
    policyEngine: permissivePolicy(plan, digest, overrides),
    artifactStore: createMemoryArtifactStore(),
    auditSink: audit,
    secretValues: [SECRET],
    resolveCredential: (handle) => (handle === "API_TOKEN" ? SECRET : undefined),
  });
}

describe("plan interpreter on the real Workflow SDK", () => {
  it("executes a multi-call API plan and emits a correlated audit trail", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "findPet",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes: checkoutNodes(),
    });
    setupKernel(plan, planDigest);

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: { petId: "p-7" } },
    ]);
    await expect(run.returnValue).resolves.toBe("order-1");
    expect(api.orders).toEqual([{ petId: "p-7" }]);

    const events = await audit.read(run.runId);
    const types = events.map((event) => event.type);
    expect(types[0]).toBe("run-started");
    expect(types).toContain("policy-decision");
    expect(types).toContain("capability-call");
    expect(types.at(-1)).toBe("run-completed");
    for (const event of events) {
      expect(event.planDigest).toBe(planDigest);
      expect(JSON.stringify(event)).not.toContain(SECRET);
    }
  });

  it("routes choices by expression", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "route",
      host: api.host,
      requirements: [GET_PET],
      nodes: [
        {
          id: "route",
          kind: "choice",
          choices: [
            {
              when: { kind: "compare", operator: "eq", left: inputRef("priority"), right: literal("express") },
              then: "fast",
            },
          ],
          otherwise: "slow",
        },
        { id: "fast", kind: "succeed", output: literal("fast-path") },
        { id: "slow", kind: "succeed", output: literal("slow-path") },
      ],
    });
    setupKernel(plan, planDigest);
    const lock = makeLock(planDigest, plan, api.baseUrl);

    const express = await start(runExecutionPlan, [
      { plan, planDigest, bindings: lock, input: { priority: "express" } },
    ]);
    await expect(express.returnValue).resolves.toBe("fast-path");

    const standard = await start(runExecutionPlan, [
      { plan, planDigest, bindings: lock, input: { priority: "standard" } },
    ]);
    await expect(standard.returnValue).resolves.toBe("slow-path");
  });

  it("runs parallel branches through real SDK concurrency", async () => {
    const branchInvoke = (id: string, petId: string) => ({
      id,
      kind: "invoke" as const,
      binding: "get-pet",
      input: objectExpr({ path: literal(`/pets/${petId}`) }),
      effect: "read" as const,
      approval: "none" as const,
    });
    const { plan, planDigest } = makePlan({
      entryNodeId: "fan",
      host: api.host,
      requirements: [GET_PET],
      nodes: [
        { id: "fan", kind: "parallel", branches: [{ entryNodeId: "left" }, { entryNodeId: "right" }], next: "done" },
        branchInvoke("left", "L"),
        branchInvoke("right", "R"),
        {
          id: "done",
          kind: "succeed",
          output: objectExpr({ left: nodeOutputRef("left", "id"), right: nodeOutputRef("right", "id") }),
        },
      ],
    });
    setupKernel(plan, planDigest);

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).resolves.toEqual({ left: "L", right: "R" });
    expect(api.requests.filter((request) => request.path.startsWith("/pets/"))).toHaveLength(2);
  });

  it("waits durably and completes", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "pause",
      host: api.host,
      nodes: [
        { id: "pause", kind: "wait", seconds: 1, next: "done" },
        { id: "done", kind: "succeed", output: literal("woke") },
      ],
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: { planDigest, bindings: [] }, input: {} },
    ]);
    await expect(run.returnValue).resolves.toBe("woke");
  });

  it("suspends on a signal hook and resumes with external data", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "gate",
      host: api.host,
      nodes: [
        { id: "gate", kind: "signal", signalName: "go", next: "done" },
        { id: "done", kind: "succeed", output: nodeOutputRef("gate", "note") },
      ],
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: { planDigest, bindings: [] }, input: {} },
    ]);
    await waitForHook(run, { token: `signal:${run.runId}:go` });
    await resumeHook(`signal:${run.runId}:go`, { note: "resumed-by-signal" });
    await expect(run.returnValue).resolves.toBe("resumed-by-signal");
  });

  it("pauses an external write behind a digest-bound approval and resumes", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "findPet",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes: checkoutNodes(),
    });
    // Mutations require approval under this policy.
    setupKernel(plan, planDigest, { approvalRequiredEffects: ["mutation"] });

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: { petId: "p-9" } },
    ]);
    const hook = await waitForHook(run);
    expect(hook.token).toContain(`approval:${run.runId}:${planDigest}:placeOrder:`);
    const boundDigest = hook.token.split(":").slice(-2).join(":");

    await resumeHook(hook.token, { approved: true, argumentsDigest: boundDigest });
    await expect(run.returnValue).resolves.toBe("order-1");
    expect(api.orders).toHaveLength(1);

    const events = await audit.read(run.runId);
    expect(events.map((event) => event.type)).toContain("approval-requested");
    expect(events.map((event) => event.type)).toContain("approval-resolved");
  });

  it("invalidates approvals whose argument digest changed (TOCTOU)", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "findPet",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes: checkoutNodes(),
    });
    setupKernel(plan, planDigest, { approvalRequiredEffects: ["mutation"] });

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: { petId: "p-9" } },
    ]);
    const hook = await waitForHook(run);
    await resumeHook(hook.token, { approved: true, argumentsDigest: "sha256:tampered" });
    await expect(run.returnValue).rejects.toThrow();
    expect(api.orders).toHaveLength(0);
  });

  it("does not duplicate a mutation when the step crashes after the effect", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "findPet",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes: checkoutNodes(),
    });
    setupKernel(plan, planDigest);
    let injected = false;
    configureKernel({
      policyEngine: permissivePolicy(plan, planDigest),
      artifactStore: createMemoryArtifactStore(),
      auditSink: audit,
      secretValues: [SECRET],
      faultInjector: ({ nodeId }) => {
        if (nodeId === "placeOrder" && !injected) {
          injected = true;
          throw new Error("simulated crash after external effect");
        }
      },
    });

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: { petId: "p-1" } },
    ]);
    await expect(run.returnValue).resolves.toBe("order-1");
    // The external system saw exactly one order despite the retried step.
    expect(api.orders).toHaveLength(1);
    expect(injected).toBe(true);
  });

  it("passes provider idempotency keys through to the external API", async () => {
    const nodes = checkoutNodes();
    (nodes[1] as { idempotency: unknown }).idempotency = {
      kind: "provider-key",
      key: inputRef("petId"),
    };
    const { plan, planDigest } = makePlan({
      entryNodeId: "findPet",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes,
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: { petId: "key-42" } },
    ]);
    await run.returnValue;
    expect(api.orders).toEqual([{ petId: "key-42", idempotencyKey: "key-42" }]);
  });

  it("bounds loops by budget", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "spin",
      host: api.host,
      requirements: [GET_PET],
      budgets: { maxIterations: 3 },
      nodes: [
        {
          id: "spin",
          kind: "loop",
          bodyEntryNodeId: "peek",
          continueWhile: literal(true),
          maxIterations: 3,
          next: "done",
        },
        {
          id: "peek",
          kind: "invoke",
          binding: "get-pet",
          input: objectExpr({ path: literal("/pets/loop") }),
          effect: "read",
          approval: "none",
        },
        { id: "done", kind: "succeed", output: nodeOutputRef("spin") },
      ],
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    const results = (await run.returnValue) as unknown[];
    expect(results).toHaveLength(3);
    expect(api.requests.filter((request) => request.path === "/pets/loop")).toHaveLength(3);
  });

  it("iterates forEach with bounded concurrency and per-iteration identity", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "each",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes: [
        {
          id: "each",
          kind: "forEach",
          items: inputRef("pets"),
          bodyEntryNodeId: "order",
          maxConcurrency: 2,
          next: "done",
        },
        {
          id: "order",
          kind: "invoke",
          binding: "place-order",
          input: objectExpr({
            path: literal("/orders"),
            body: objectExpr({ petId: nodeOutputRef("each", "item") }),
          }),
          effect: "mutation",
          idempotency: { kind: "deduplication-record", namespace: "orders" },
          approval: "none",
        },
        { id: "done", kind: "succeed", output: nodeOutputRef("each") },
      ],
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      {
        plan,
        planDigest,
        bindings: makeLock(planDigest, plan, api.baseUrl),
        input: { pets: ["a", "b", "c"] },
      },
    ]);
    const results = (await run.returnValue) as unknown[];
    expect(results).toHaveLength(3);
    expect(api.orders.map((order) => order.petId).sort()).toEqual(["a", "b", "c"]);
  });

  it("launches an inline child plan with its own digest and audit identity", async () => {
    const child = makePlan({
      entryNodeId: "childGet",
      host: api.host,
      requirements: [GET_PET],
      budgets: { maxDepth: 2 },
      nodes: [
        {
          id: "childGet",
          kind: "invoke",
          binding: "get-pet",
          input: objectExpr({ path: literal("/pets/child") }),
          effect: "read",
          approval: "none",
          next: "childDone",
        },
        { id: "childDone", kind: "succeed", output: nodeOutputRef("childGet", "id") },
      ],
    });
    const { plan, planDigest } = makePlan({
      entryNodeId: "spawn",
      host: api.host,
      requirements: [GET_PET],
      budgets: { maxDepth: 4 },
      nodes: [
        { id: "spawn", kind: "childWorkflow", plan: child.plan, input: literal({}), next: "done" },
        { id: "done", kind: "succeed", output: nodeOutputRef("spawn") },
      ],
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).resolves.toBe("child");

    const events = await audit.read(run.runId);
    const childEvent = events.find((event) => event.type === "child-workflow");
    expect(childEvent?.detail?.childPlanDigest).toMatch(/^sha256:/);
    // Child capability calls are audited under the CHILD plan digest.
    expect(events.some((event) => event.type === "capability-call" && event.planDigest !== planDigest)).toBe(
      true,
    );
  });

  it("fails closed when policy denies and records the decision", async () => {
    const { plan, planDigest } = makePlan({
      entryNodeId: "findPet",
      host: api.host,
      requirements: [GET_PET, PLACE_ORDER],
      nodes: checkoutNodes(),
    });
    setupKernel(plan, planDigest, { allowedEffects: ["read"] });

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: { petId: "p" } },
    ]);
    await expect(run.returnValue).rejects.toThrow();
    expect(api.orders).toHaveLength(0);
    const events = await audit.read(run.runId);
    expect(
      events.some(
        (event) => event.type === "policy-decision" && event.detail?.decision === "deny",
      ),
    ).toBe(true);
  });

  it("keeps secrets out of results, audit events, and errors", async () => {
    const WHOAMI: CapabilityRequirement = {
      id: "whoami",
      protocol: "http",
      operation: "GET /whoami",
      requiredScopes: [],
      effect: "read",
    };
    const { plan, planDigest } = makePlan({
      entryNodeId: "who",
      host: api.host,
      requirements: [WHOAMI],
      credentialRequirements: [{ id: "token", env: "API_TOKEN" }],
      nodes: [
        {
          id: "who",
          kind: "invoke",
          binding: "whoami",
          input: objectExpr({ path: literal("/whoami") }),
          effect: "read",
          approval: "none",
          next: "done",
        },
        { id: "done", kind: "succeed", output: nodeOutputRef("who", "token") },
      ],
    });
    setupKernel(plan, planDigest);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl, "API_TOKEN"), input: {} },
    ]);
    // The secret returned by the API is redacted before entering workflow state.
    await expect(run.returnValue).resolves.toBe("[REDACTED]");
    // The credential WAS sent to the external API...
    expect(api.requests.find((request) => request.path === "/whoami")?.auth).toBe(`Bearer ${SECRET}`);
    // ...but never appears in the audit stream.
    for (const event of await audit.read(run.runId)) {
      expect(JSON.stringify(event)).not.toContain(SECRET);
    }
  });
});
