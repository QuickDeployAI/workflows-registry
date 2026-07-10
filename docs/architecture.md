# workflows-registry — Architecture

The workflows sibling of [MCP-Registry](https://github.com/QuickDeployAI/MCP-Registry) (`servers.json`) and
[agent-skills-registry](https://github.com/QuickDeployAI/agent-skills-registry) (`skills.json`).
It registers, imports, validates, compiles, policy-governs, and durably executes workflows from external formats.

Program of record: Linear project **[Workflows Registry](https://linear.app/quickdeploy-ai/project/workflows-registry-85a3df37abce)**
(milestones M0–M9, issues QUI-453…QUI-497). See [docs/backlog/README.md](backlog/README.md) for the index.

## Product pipeline

```text
Workflow/task formats (Arazzo, Serverless/Open Workflow, Pi Agents; later ASL, Logic Apps,
Google Workflows, n8n, Make, Power Automate, Zapier, Pipedream, Workato, IFTTT)
→ secure ingestion + official validation (importers)
→ versioned internal ExecutionPlanV1 (private IR + expression AST)
→ capability requirement resolution → binding lock
→ policy intent → effective policy → runtime decisions
→ generic precompiled plan interpreter on the Vercel Workflow SDK
→ World implementation (Local World first)
→ static durable executors (HTTP/OpenAPI, MCP, agent turn, sandbox, artifact, approval)
→ MXC/OpenShell-governed sandbox and capability gateway
```

For agentic execution:

```text
Pi control graph → Workflow SDK child workflows → durable agent turn (Flue later)
→ proposed capability actions → policy/approval → durable capability steps
→ tool results returned to the agent session → bounded next turn
```

## Decisions

1. **Runtime: the real Vercel Workflow SDK.** Local World + `@workflow/vitest` + hooks + child
   workflows. No custom `DurableWorkflowRuntime`, no in-memory "durable" engine — a parallel
   engine's semantics would inevitably diverge from real replay/suspension/retry behavior.
2. **Importers, not interpreters.** Every source format is a `packages/importers/<source>-2-workflows`
   package implementing `detect/parse/validate/compile` and producing an `ExecutionPlanV1`, a
   fidelity report (`exact | approximated | unsupported | blocked`), and capability requirements.
3. **Kernel before breadth.** The first milestone proves the difficult path (imported plan →
   real durable run → pause/approve/resume → retry without duplicate effect → parallel branch →
   bounded agent loop → audit trail). Format coverage then expands through conformance-tested
   importers.
4. **Flue / OpenShell / MXC behind interfaces.** `AgentRuntime`, `SandboxBackend`, and the policy
   adapter are first-class contracts with deterministic test doubles in v0.1; real adapters are
   separate, later issues (fail-closed where governance requires it).

## Mapping vs the sibling registries

### Maps 1:1

| Convention | Source |
|---|---|
| pnpm + turbo workspace, `catalog:` pins, node ≥22.18, single `pnpm check` CI gate | both siblings |
| Lanes `packages/{core,importers,schemas,tools}` (+ `runtime/` like MCP-Registry) | both |
| Hand-authored `registry/<provider>/*.workflow.json` manifests | `*.mcp.json` / `*.skill.json` |
| Zod as source of truth (`packages/schemas/workflow-registry-schemas`) + published `schemas/*.json` | both |
| Generated committed `workflows.json` + gitignored `registry/index.json` + drift gate (`build --check`) | `servers.json` / `skills.json` |
| Curation only in `_meta["ai.quickdeploy.registry/curation"]`; top-level curation fields schema-rejected | both |
| Exact semver only; `sha256:`/immutable-SHA pinned sources; env-name-only secrets | both |
| Collect-all validation with typed codes; `tsx`-run CLI in `packages/tools/workflows-cli` | both |
| Importer naming `<source>-2-workflows` | `<x>-2-mcp`, `<x>-2-agent-skills` |

### New here

- `ExecutionPlanV1` IR (invoke/choice/parallel/forEach/loop/wait/signal/approval/childWorkflow/succeed/fail)
  with budgets, effect summaries, plan digests — source formats and runtimes never leak into the IR.
- Private expression AST + safe evaluator — no `eval`, no passthrough of source expression languages;
  unsupported expressions fail compilation or land in the fidelity report, never silently `undefined`.
- The Workflow SDK plan-interpreter runtime lane (`packages/runtime/{plan-interpreter,executors}`)
  with a **closed** static executor surface: `invokeHttp, invokeMcp, invokeAgentTurn,
  invokeSandboxCommand, readArtifact, writeArtifact, evaluateAssertion, recordAuditEvent`.
- Capability requirements + binding locks: shared workflows stay portable; installations bind to a
  particular MCP server / OpenAPI operation / credential handle / schema version / policy.
- Three-stage policy (`intent → effective (intersection, reduce-only) → runtime decision`) with
  default-deny; digest-bound approvals (plan + node + argument digest, recomputed before execution;
  business-effect and policy-expansion planes).
- Explicit idempotency policies on every mutation node; stable execution identity
  (`runId + planDigest + nodeId + iteration + attempt`).
- Mediated agent-turn loop (every proposed tool action is policy-evaluated and executed as a durable
  capability step) and bounded dynamic subplans (propose → validate → compile → bind → policy → digest
  → child workflow; never in-place graph mutation).
- Sandbox lease model with content-addressed workspace snapshots, decoupling sandbox lifetime from
  durable run lifetime.
- Importer conformance levels 0–5 published per importer in `workflows.json` `_meta`.

### Deliberately cut (for now)

- Custom durable runtime — never.
- OCI bundle packaging/signing (`application/vnd.oneclick.workflow.bundle.v1`, ORAS, cosign) — M8.
- Real Flue / OpenShell / MXC adapters — later M5 issues behind the proven interfaces.
- Registry web UI / service — the platform consumes `workflows.json` raw, like the siblings.

## Conformance levels

| Level | Meaning |
|---|---|
| 0 | Format can be detected |
| 1 | Official/schema validation is supported |
| 2 | A plan can be compiled with a fidelity report |
| 3 | Capability requirements can be bound |
| 4 | The supported subset executes durably |
| 5 | Parity tests exist against the source platform's expected behavior |

## Relationship to the QuickDeploy monorepo

- The platform consumes this repo's generated `workflows.json` **raw over HTTPS** (env-overridable
  URL), exactly like `servers.json` / `skills.json` (`ard-sources.ts` `GIT_CATALOG_SOURCES`, plus a
  `SyncHandler` ingester). Platform-side work is routed to `QuickDeployAI/monorepo` per ADR 0019.
- `workflow` is already a first-class capability type in the monorepo's `registry-schemas`.
- The Serverless Workflow importer also accepts the monorepo's `oneclick.workflow.package.v1`
  documents (unwrapping `canonicalSpec.document`, `specVersion: "serverless-workflow/v1"`), so
  existing platform workflow packages are importable from day one.
- The monorepo's internal saga engine (Azure Durable Functions `workflow-dispatch`) is unrelated
  infrastructure plumbing; this registry's execution kernel targets the Vercel Workflow SDK and
  Worlds for imported, user-facing workflows.

## v0.1 acceptance criteria

v0.1 = M0–M5 with test doubles for Flue/OpenShell/MXC. Done only when all of these hold
(tracking: QUI-497):

1. An Arazzo 1.1 fixture compiles and executes a multi-call API workflow.
2. An Open/Serverless Workflow fixture executes a choice, retry, wait, and failure path.
3. A Pi workflow executes `spawn`, `fork`, `join`, and a bounded review loop.
4. A Workflow hook pauses an external-write action and resumes after approval.
5. Approval is bound to the plan, node, and argument digest.
6. A deliberately retried mutation does not create a duplicate external effect.
7. A parallel branch executes through actual Workflow SDK semantics.
8. A child subplan is validated, compiled, policy-checked, and launched as a child workflow.
9. An agent tool call is mediated through the capability executor, not hidden in an opaque agent step.
10. An agent session is reused or reconciled after a retry.
11. Policy intent defaults to denied network, read-only filesystem, and no raw credentials.
12. Unsupported expressions and nodes appear in a fidelity report and cannot execute.
13. Secrets are absent from plans, logs, snapshots, and error messages.
14. Integration tests run against Local World using official Workflow SDK test tooling.
15. Every run emits a correlated audit record covering workflow, node, agent, sandbox, policy
    decision, approval, and capability call.
16. `pnpm build`, `pnpm test`, and all CLI example commands succeed.

## Target repository layout

```text
packages/
  core/
    workspace-config/     # shared tsconfig/eslint (M0)
    workflow-core/        # fetcher, hashing, stableJson, diagnostics (M1)
    ir/                   # ExecutionPlanV1 (M2)
    expressions/          # expression AST + evaluator (M2)
    capabilities/         # requirements + binding locks (M4)
  importers/
    arazzo-2-workflows/
    serverless-workflow-2-workflows/
    pi-agents-2-workflows/
    …                     # waves 2–3
  runtime/
    plan-interpreter/     # runExecutionPlan on the Workflow SDK (M2)
    executors/            # static durable executor surface (M2)
  agent-runtime/
    core/                 # AgentRuntime + mediated loop (M5)
    flue/                 # real adapter (later)
  security/
    policy/               # 3-stage policy model (M4)
    openshell/            # policy adapter (later)
    sandbox/              # SandboxBackend + doubles (M5)
  packaging/
    bundle/ oci/          # OCI bundles (M8)
  schemas/
    workflow-registry-schemas/
  tools/
    workflows-cli/        # detect | validate | compile | bind | policy | run | inspect | approve | build | scaffold
registry/<provider>/*.workflow.json
schemas/*.json
sources/<provider>/*
workflows.json            # generated, committed, drift-gated
docs/
```
