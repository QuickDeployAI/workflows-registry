import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { start, resumeHook } from "workflow/api";
import { waitForHook } from "@workflow/vitest";
import {
  createScriptedAgentRuntime,
  type AgentRuntime,
  type AgentTurnResult,
} from "@quickdeployai/agent-runtime";
import { piAgentsImporter } from "@quickdeployai/pi-agents-2-workflows";
import {
  createPinnedResolver,
  ingestSourceFiles,
  type WorkflowImporter,
} from "@quickdeployai/workflow-importer-kit";
import { computePlanDigest, type CapabilityRequirement } from "@quickdeployai/workflow-ir";
import { literal } from "@quickdeployai/workflow-expressions";
import { configureKernel, resetKernel } from "../src/services.js";
import { createMemoryArtifactStore } from "../src/artifact-store.js";
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

const SOURCES = join(import.meta.dirname, "../../../../sources/quickdeploy");

let api: TestApi;
let audit: ReturnType<typeof createMemoryAuditSink>;

const AGENT_REQ: CapabilityRequirement = {
  id: "agent:operator",
  protocol: "agent",
  provider: "agent-runtime",
  operation: "operator",
  requiredScopes: [],
  effect: "send",
};
const PLACE_ORDER: CapabilityRequirement = {
  id: "place-order",
  protocol: "http",
  operation: "POST /orders",
  requiredScopes: [],
  effect: "mutation",
};

function agentPlan() {
  return makePlan({
    entryNodeId: "operate",
    host: api.host,
    requirements: [AGENT_REQ, PLACE_ORDER],
    nodes: [
      {
        id: "operate",
        kind: "invoke",
        binding: "agent:operator",
        input: objectExpr({ task: literal("place one order") }),
        effect: "send",
        idempotency: { kind: "deduplication-record", namespace: "agents" },
        approval: "none",
        next: "done",
      },
      { id: "done", kind: "succeed", output: { kind: "nodeOutput", nodeId: "operate", path: [] } },
    ],
  });
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

function setup(plan: ReturnType<typeof agentPlan>["plan"], digest: string, runtime: AgentRuntime, overrides = {}) {
  configureKernel({
    policyEngine: permissivePolicy(plan, digest, overrides, [api.host]),
    artifactStore: createMemoryArtifactStore(),
    auditSink: audit,
    secretValues: [SECRET],
    agentRuntime: runtime,
  });
}

describe("mediated agent-turn loop", () => {
  it("dispatches proposed actions as governed durable capability steps", async () => {
    const runtime = createScriptedAgentRuntime({
      operator: [
        {
          kind: "actions",
          actions: [{ requirementId: "place-order", operation: "POST /orders", input: { path: "/orders", body: { petId: "agent-pet" } } }],
        },
        { kind: "final", output: "order placed" },
      ],
    });
    const { plan, planDigest } = agentPlan();
    setup(plan, planDigest, runtime);

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).resolves.toBe("order placed");
    expect(api.orders).toEqual([{ petId: "agent-pet" }]);

    const events = await audit.read(run.runId);
    const types = events.map((event) => event.type);
    expect(types).toContain("agent-turn");
    expect(types).toContain("policy-decision");
    expect(types).toContain("capability-call");
    // The tool result was appended back into the agent session.
    const session = [...runtime.sessions.values()][0];
    expect(session?.toolResults).toHaveLength(1);
  });

  it("routes agent mutations through digest-bound approvals when policy requires", async () => {
    const runtime = createScriptedAgentRuntime({
      operator: [
        {
          kind: "actions",
          actions: [{ requirementId: "place-order", operation: "POST /orders", input: { path: "/orders", body: { petId: "approved-pet" } } }],
        },
        { kind: "final", output: "approved and placed" },
      ],
    });
    const { plan, planDigest } = agentPlan();
    setup(plan, planDigest, runtime, { approvalRequiredEffects: ["mutation"] });

    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    const hook = await waitForHook(run);
    const boundDigest = hook.token.split(":").slice(-2).join(":");
    await resumeHook(hook.token, { approved: true, argumentsDigest: boundDigest });
    await expect(run.returnValue).resolves.toBe("approved and placed");
    expect(api.orders).toHaveLength(1);
  });

  it("refuses undeclared capabilities (no unknown tools, ever)", async () => {
    const runtime = createScriptedAgentRuntime({
      operator: [
        {
          kind: "actions",
          actions: [{ requirementId: "shell-anything", operation: "sh -c", input: {} }],
        },
      ],
    });
    const { plan, planDigest } = agentPlan();
    setup(plan, planDigest, runtime);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).rejects.toThrow();
    expect(api.orders).toHaveLength(0);
  });

  it("reconnects to the SAME agent session when a turn is retried", async () => {
    const scripted = createScriptedAgentRuntime({ operator: [{ kind: "final", output: "ok" }] });
    let failedOnce = false;
    const flaky: AgentRuntime = {
      ...scripted,
      async nextTurn(session, context): Promise<AgentTurnResult> {
        if (!failedOnce) {
          failedOnce = true;
          throw new Error("transient turn failure");
        }
        return scripted.nextTurn(session, context);
      },
    };
    const { plan, planDigest } = agentPlan();
    setup(plan, planDigest, flaky);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).resolves.toBe("ok");
    // Retried turn reused the one durable session (stable sessionKey).
    expect(scripted.sessions.size).toBe(1);
  });

  it("compiles, bounds, and executes agent-proposed subplans as children", async () => {
    const subplanFiles = [
      {
        path: "sub.serverless.json",
        text: JSON.stringify({
          document: { dsl: "1.0.0", namespace: "q", name: "sub", version: "0.1.0" },
          do: [{ pause: { wait: { seconds: 0.05 } } }],
        }),
      },
    ];
    const runtime = createScriptedAgentRuntime({
      operator: [
        {
          kind: "propose-subplan",
          proposal: {
            format: "serverless-workflow-2-workflows",
            files: subplanFiles,
            entrypoint: "sub.serverless.json",
          },
        },
        { kind: "final", output: "subplan done" },
      ],
    });
    const { plan, planDigest } = agentPlan();
    setup(plan, planDigest, runtime);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).resolves.toBe("subplan done");

    const events = await audit.read(run.runId);
    const subplanEvent = events.find(
      (event) => event.type === "child-workflow" && event.detail?.phase === "subplan-compiled",
    );
    expect(subplanEvent?.detail?.childPlanDigest).toMatch(/^sha256:/);
  });

  it("rejects subplan proposals in unsupported formats", async () => {
    const runtime = createScriptedAgentRuntime({
      operator: [
        {
          kind: "propose-subplan",
          proposal: {
            format: "arbitrary-javascript",
            files: [{ path: "x.js", text: "process.exit(0)" }],
            entrypoint: "x.js",
          },
        },
      ],
    });
    const { plan, planDigest } = agentPlan();
    setup(plan, planDigest, runtime);
    const run = await start(runExecutionPlan, [
      { plan, planDigest, bindings: makeLock(planDigest, plan, api.baseUrl), input: {} },
    ]);
    await expect(run.returnValue).rejects.toThrow();
  });
});

describe("pi-agents fixture executes durably (conformance level 4)", () => {
  it("runs spawn, fork/join, and the bounded review loop end to end", async () => {
    const text = await readFile(join(SOURCES, "code-review-loop.pi.json"), "utf8");
    const files = [{ path: "code-review-loop.pi.json", text }];
    const artifact = ingestSourceFiles(files, { entrypoint: "code-review-loop.pi.json" });
    const resolver = createPinnedResolver({ files });
    const importer = piAgentsImporter as WorkflowImporter<unknown>;
    const parsed = await importer.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const compiled = await importer.compile(parsed.model, {
      planId: "code-review-loop",
      planName: "Code review loop",
      artifactDigest: artifact.digest,
      resolver,
    });
    const plan = compiled.plan!;
    const planDigest = computePlanDigest(plan);

    const runtime = createScriptedAgentRuntime({
      "code-author": [{ kind: "final", output: "draft-v1" }],
      "code-reviewer": [{ kind: "final", output: "lgtm" }],
    });
    configureKernel({
      policyEngine: permissivePolicy(plan, planDigest, {}, [api.host]),
      artifactStore: createMemoryArtifactStore(),
      auditSink: audit,
      secretValues: [SECRET],
      agentRuntime: runtime,
    });

    const run = await start(runExecutionPlan, [
      {
        plan,
        planDigest,
        bindings: {
          planDigest,
          bindings: plan.capabilityRequirements.map((requirement) => ({
            requirementId: requirement.id,
            implementationId: "scripted-agents",
            implementationVersion: "1.0.0",
          })),
        },
        input: {},
      },
    ]);
    await run.returnValue;

    // author + 2 parallel reviewers + 3 bounded revise iterations = 6 sessions
    const agents = [...runtime.sessions.values()].map((session) => session.agent);
    expect(agents.filter((agent) => agent === "code-author")).toHaveLength(4);
    expect(agents.filter((agent) => agent === "code-reviewer")).toHaveLength(2);
    const turnEvents = (await audit.read(run.runId)).filter((event) => event.type === "agent-turn");
    expect(turnEvents.length).toBeGreaterThanOrEqual(6);
  });
});
