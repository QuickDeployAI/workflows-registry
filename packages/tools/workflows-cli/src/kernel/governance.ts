import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { formatDiagnostics, stableJson } from "@quickdeployai/workflow-core";
import {
  BindingLockSchema,
  validateBindingLock,
  type BindingLock,
} from "@quickdeployai/workflow-capabilities";
import {
  PolicyGrantsSchema,
  computeEffectivePolicy,
  createPolicyEngine,
  derivePolicyIntent,
} from "@quickdeployai/workflow-policy";
import {
  ExecutionPlanV1Schema,
  computePlanDigest,
  validatePlan,
  type ExecutionPlanV1,
} from "@quickdeployai/workflow-ir";
import type { KernelCommandContext } from "../kernel-commands.js";

/**
 * Governance commands over compiled plans:
 *   bind    — create/validate a BindingLock for a compiled plan
 *   policy  — render policy intent (and effective policy given grants)
 *   run     — execute a bound plan durably on the Local World
 *   inspect — print the correlated audit timeline for a run
 *   approve — resolve a pending digest-bound approval hook
 */
export async function runGovernanceCli(
  command: string,
  context: KernelCommandContext,
): Promise<number> {
  switch (command) {
    case "bind":
      return runBind(context);
    case "policy":
      return runPolicy(context);
    case "run":
      return runRun(context);
    case "inspect":
      return runInspect(context);
    case "approve":
      return runApprove(context);
    default:
      process.stderr.write(`Unknown kernel command "${command}".\n`);
      return 1;
  }
}

function stringFlag(context: KernelCommandContext, name: string): string | undefined {
  const value = context.flags.get(name);
  return typeof value === "string" ? value : undefined;
}

async function loadPlan(
  context: KernelCommandContext,
): Promise<{ plan: ExecutionPlanV1; planDigest: string } | undefined> {
  const planPath = stringFlag(context, "plan");
  if (!planPath) {
    process.stderr.write("This command requires --plan <compiled plan json>.\n");
    return undefined;
  }
  const raw = JSON.parse(await readFile(resolve(context.rootDir, planPath), "utf8")) as {
    plan?: unknown;
    planDigest?: string;
  };
  const plan = ExecutionPlanV1Schema.parse(raw.plan ?? raw);
  const structural = validatePlan(plan);
  if (structural.length > 0) {
    process.stderr.write(`${formatDiagnostics(structural)}\n`);
    return undefined;
  }
  const planDigest = computePlanDigest(plan);
  if (raw.planDigest && raw.planDigest !== planDigest) {
    process.stderr.write(
      `Plan file declares digest ${raw.planDigest} but the content hashes to ${planDigest}.\n`,
    );
    return undefined;
  }
  return { plan, planDigest };
}

async function runBind(context: KernelCommandContext): Promise<number> {
  const loaded = await loadPlan(context);
  if (!loaded) return 1;
  const { plan, planDigest } = loaded;

  let lock: BindingLock;
  const implementationsPath = stringFlag(context, "implementations");
  const endpoint = stringFlag(context, "endpoint");
  if (implementationsPath) {
    lock = BindingLockSchema.parse(
      JSON.parse(await readFile(resolve(context.rootDir, implementationsPath), "utf8")),
    );
  } else if (endpoint) {
    lock = {
      planDigest,
      bindings: plan.capabilityRequirements.map((requirement) => ({
        requirementId: requirement.id,
        implementationId: "cli-endpoint",
        implementationVersion: "0.0.0",
        ...(requirement.protocol === "http" || requirement.protocol === "openapi"
          ? { endpoint }
          : {}),
        ...(requirement.protocol === "mcp" ? { toolName: requirement.operation } : {}),
      })),
    };
  } else {
    process.stderr.write("bind requires --implementations <lock json> or --endpoint <url>.\n");
    return 1;
  }

  const diagnostics = validateBindingLock(plan, planDigest, lock);
  if (diagnostics.length > 0) {
    process.stderr.write(`${formatDiagnostics(diagnostics)}\n`);
    return 1;
  }
  const outPath = resolve(
    context.rootDir,
    stringFlag(context, "out") ?? join(".generated/plans", `${plan.id.split("/").pop()}.lock.json`),
  );
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, stableJson(lock), "utf8");
  process.stdout.write(
    `Bound ${lock.bindings.length} requirement(s) for ${planDigest} → ${relative(context.rootDir, outPath)}\n`,
  );
  return 0;
}

async function loadGrants(context: KernelCommandContext) {
  const grantsPath = stringFlag(context, "grants");
  if (!grantsPath) return undefined;
  return PolicyGrantsSchema.parse(
    JSON.parse(await readFile(resolve(context.rootDir, grantsPath), "utf8")),
  );
}

async function loadLock(context: KernelCommandContext): Promise<BindingLock | undefined> {
  const lockPath = stringFlag(context, "bindings");
  if (!lockPath) return undefined;
  return BindingLockSchema.parse(
    JSON.parse(await readFile(resolve(context.rootDir, lockPath), "utf8")),
  );
}

function boundHostsOf(lock: BindingLock | undefined): string[] {
  if (!lock) return [];
  const hosts: string[] = [];
  for (const binding of lock.bindings) {
    if (!binding.endpoint) continue;
    try {
      hosts.push(new URL(binding.endpoint).host);
    } catch {
      // non-URL endpoints contribute no host
    }
  }
  return hosts;
}

async function runPolicy(context: KernelCommandContext): Promise<number> {
  const loaded = await loadPlan(context);
  if (!loaded) return 1;
  const lock = await loadLock(context);
  const intent = derivePolicyIntent(loaded.plan, loaded.planDigest, {
    boundHosts: boundHostsOf(lock),
  });
  process.stdout.write(`Policy intent:\n${stableJson(intent)}`);
  const grants = await loadGrants(context);
  if (grants) {
    const effective = computeEffectivePolicy(intent, grants);
    process.stdout.write(`Effective policy (intent ∩ grants):\n${stableJson(effective)}`);
  } else {
    process.stdout.write(
      "No --grants provided; the default runtime policy is DENY-ALL (fail closed).\n",
    );
  }
  return 0;
}

async function runRun(context: KernelCommandContext): Promise<number> {
  const loaded = await loadPlan(context);
  if (!loaded) return 1;
  const { plan, planDigest } = loaded;
  const lock = (await loadLock(context)) ?? { planDigest, bindings: [] };
  const lockDiagnostics = validateBindingLock(plan, planDigest, lock);
  if (lockDiagnostics.length > 0) {
    process.stderr.write(`${formatDiagnostics(lockDiagnostics)}\n`);
    return 1;
  }
  const grants = await loadGrants(context);
  if (!grants) {
    process.stderr.write(
      "run requires --grants <grants json>: the default policy is deny-all, so an ungoverned run would refuse every effect.\n",
    );
    return 1;
  }
  const input = JSON.parse(stringFlag(context, "input") ?? "{}") as unknown;

  // Resolve the plan-interpreter package directory (its workflows/ tree is
  // what the Workflow SDK builder compiles into the durable bundles).
  const require = createRequire(import.meta.url);
  const interpreterEntry = require.resolve("@quickdeployai/plan-interpreter");
  const interpreterDir = resolve(dirname(interpreterEntry), "..");

  const dataDir = resolve(context.rootDir, ".workflow-data");
  process.env.QD_KERNEL_DATA_DIR = dataDir;

  const [{ buildWorkflowTests, setupWorkflowTests, teardownWorkflowTests, waitForHook }, api, kernel] =
    await Promise.all([
      import("@workflow/vitest"),
      import("workflow/api"),
      import("@quickdeployai/plan-interpreter"),
    ]);
  // Outside the vitest transform, start() accepts any reference carrying the
  // registered workflowId (the built bundle registers this exact name).
  const runExecutionPlan = {
    workflowId: "workflow//./workflows/run-execution-plan//runExecutionPlan",
  } as unknown as (request: unknown) => Promise<unknown>;

  const intent = derivePolicyIntent(plan, planDigest, { boundHosts: boundHostsOf(lock) });
  kernel.configureKernel({
    policyEngine: createPolicyEngine(computeEffectivePolicy(intent, grants)),
    auditSink: kernel.createFileAuditSink(join(dataDir, "audit")),
    artifactStore: kernel.createFileArtifactStore(join(dataDir, "artifacts")),
    secretValues: [],
    resolveCredential: (handle) => process.env[handle],
  });

  const outDir = join(interpreterDir, ".workflow-cli");
  await buildWorkflowTests({ cwd: interpreterDir, dataDir, outDir });
  await setupWorkflowTests({ cwd: interpreterDir, dataDir, outDir });
  try {
    const run = await api.start(runExecutionPlan, [{ plan, planDigest, bindings: lock, input }]);
    process.stdout.write(`Started run ${run.runId} (plan ${planDigest}).\n`);

    if (context.flags.get("approve-all") === true) {
      void (async () => {
        for (;;) {
          try {
            const hook = await waitForHook(run, { timeout: 60_000 });
            const argumentsDigest = hook.token.split(":").slice(-2).join(":");
            await api.resumeHook(hook.token, { approved: true, argumentsDigest });
            process.stdout.write(`Auto-approved ${hook.token}\n`);
          } catch {
            return; // no more pending hooks (run finished or timed out)
          }
        }
      })();
    }

    const result = await run.returnValue;
    process.stdout.write(`Run ${run.runId} completed.\nresult: ${JSON.stringify(result)}\n`);
    process.stdout.write(`Inspect with: workflows-cli inspect --run ${run.runId}\n`);
    return 0;
  } finally {
    await teardownWorkflowTests();
  }
}

async function runInspect(context: KernelCommandContext): Promise<number> {
  const runId = stringFlag(context, "run");
  if (!runId) {
    process.stderr.write("inspect requires --run <runId>.\n");
    return 1;
  }
  const dataDir = process.env.QD_KERNEL_DATA_DIR ?? resolve(context.rootDir, ".workflow-data");
  const { createFileAuditSink } = await import("@quickdeployai/plan-interpreter");
  const events = await createFileAuditSink(join(dataDir, "audit")).read(runId);
  if (events.length === 0) {
    process.stderr.write(`No audit records for run "${runId}" under ${dataDir}/audit.\n`);
    return 1;
  }
  for (const event of events) {
    const marker = [event.nodeId, event.attempt !== undefined ? `#${event.attempt}` : ""]
      .filter(Boolean)
      .join("");
    process.stdout.write(
      `${event.at}  ${event.type.padEnd(20)} ${marker.padEnd(24)} ${event.detail ? JSON.stringify(event.detail) : ""}\n`,
    );
  }
  return 0;
}

async function runApprove(context: KernelCommandContext): Promise<number> {
  const token = stringFlag(context, "token");
  if (!token) {
    process.stderr.write("approve requires --token <approval hook token>.\n");
    return 1;
  }
  // Approval tokens bind plan digest + node + argument digest; approving
  // resumes with EXACTLY the digest embedded in the token.
  const argumentsDigest = token.split(":").slice(-2).join(":");
  const api = await import("workflow/api");
  try {
    const result = await api.resumeHook(token, { approved: true, argumentsDigest });
    process.stdout.write(`Approved ${token} (run ${result.runId}).\n`);
    return 0;
  } catch (error) {
    process.stderr.write(
      `Could not resolve the approval hook in this process: ${error instanceof Error ? error.message : String(error)}\n` +
        `Local runs resolve approvals in-process — use "workflows-cli run --approve-all" or a hosted World.\n`,
    );
    return 1;
  }
}
