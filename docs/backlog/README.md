# workflows-registry backlog

Program of record: Linear project **[Workflows Registry](https://linear.app/quickdeploy-ai/project/workflows-registry-85a3df37abce)**
(team Quickdeploy-ai). Architecture write-up: [docs/architecture.md](../architecture.md) and the
[Linear architecture document](https://linear.app/quickdeploy-ai/document/workflows-registry-architecture-and-program-plan-91f35b294e7d).

v0.1 = M0–M5 with test doubles for Flue/OpenShell/MXC — gated by
[QUI-497 (v0.1 acceptance criteria, 16 items)](https://linear.app/quickdeploy-ai/issue/QUI-497).

## M0 — Workspace skeleton

| Issue | Title |
|---|---|
| [QUI-453](https://linear.app/quickdeploy-ai/issue/QUI-453) | Scaffold pnpm+turbo workspace mirroring the sibling registries |
| [QUI-454](https://linear.app/quickdeploy-ai/issue/QUI-454) | Write docs/architecture.md mapping playbook vs the sibling registries |

## M1 — Registry data model & CLI

| Issue | Title |
|---|---|
| [QUI-455](https://linear.app/quickdeploy-ai/issue/QUI-455) | workflow-registry-schemas: WorkflowManifest + workflows.json envelope (Zod + JSON Schema) |
| [QUI-456](https://linear.app/quickdeploy-ai/issue/QUI-456) | workflow-core: source fetcher, hashing, stableJson, diagnostics |
| [QUI-457](https://linear.app/quickdeploy-ai/issue/QUI-457) | workflows-cli: build / validate / scaffold / config-schema |
| [QUI-458](https://linear.app/quickdeploy-ai/issue/QUI-458) | registry/ conventions, seed entries, and the workflows.json drift gate |

## M2 — Execution kernel (spike)

| Issue | Title |
|---|---|
| [QUI-462](https://linear.app/quickdeploy-ai/issue/QUI-462) | ExecutionPlanV1: the versioned internal IR |
| [QUI-460](https://linear.app/quickdeploy-ai/issue/QUI-460) | Expression AST + safe evaluator (no eval, ever) |
| [QUI-461](https://linear.app/quickdeploy-ai/issue/QUI-461) | Static durable step-executor surface |
| [QUI-463](https://linear.app/quickdeploy-ai/issue/QUI-463) | plan-interpreter: runExecutionPlan on the Vercel Workflow SDK |
| [QUI-464](https://linear.app/quickdeploy-ai/issue/QUI-464) | Idempotency policies + stable execution identity |
| [QUI-465](https://linear.app/quickdeploy-ai/issue/QUI-465) | Kernel integration tests: Local World + @workflow/vitest |

## M3 — Importer framework & Wave-1 importers

| Issue | Title |
|---|---|
| [QUI-466](https://linear.app/quickdeploy-ai/issue/QUI-466) | Importer contract: detect/parse/validate/compile + conformance levels |
| [QUI-467](https://linear.app/quickdeploy-ai/issue/QUI-467) | Secure ingestion pipeline for untrusted workflow sources |
| [QUI-468](https://linear.app/quickdeploy-ai/issue/QUI-468) | arazzo-2-workflows: Arazzo 1.1 importer |
| [QUI-469](https://linear.app/quickdeploy-ai/issue/QUI-469) | serverless-workflow-2-workflows: Open/Serverless Workflow 1.0.x importer |
| [QUI-470](https://linear.app/quickdeploy-ai/issue/QUI-470) | pi-agents-2-workflows: Pi Agents canonical workflow JSON importer |
| [QUI-471](https://linear.app/quickdeploy-ai/issue/QUI-471) | Per-importer conformance & parity test harness |

## M4 — Capability binding & policy

| Issue | Title |
|---|---|
| [QUI-472](https://linear.app/quickdeploy-ai/issue/QUI-472) | CapabilityRequirement + BindingLock subsystem |
| [QUI-473](https://linear.app/quickdeploy-ai/issue/QUI-473) | Three-stage policy model: intent → effective policy → runtime decision |
| [QUI-474](https://linear.app/quickdeploy-ai/issue/QUI-474) | Digest-bound approvals (two planes, TOCTOU-safe) |
| [QUI-475](https://linear.app/quickdeploy-ai/issue/QUI-475) | Correlated audit trail across workflow/node/agent/sandbox/policy/approval/capability |
| [QUI-476](https://linear.app/quickdeploy-ai/issue/QUI-476) | Secrets hygiene: env-name-only refs + redaction everywhere |

## M5 — Agent & sandbox mediation

| Issue | Title |
|---|---|
| [QUI-477](https://linear.app/quickdeploy-ai/issue/QUI-477) | AgentRuntime interface + bounded mediated agent-turn loop |
| [QUI-478](https://linear.app/quickdeploy-ai/issue/QUI-478) | SandboxBackend lease model + content-addressed workspace snapshots |
| [QUI-479](https://linear.app/quickdeploy-ai/issue/QUI-479) | Bounded dynamic subplans (proposal flow, no in-place graph mutation) |
| [QUI-480](https://linear.app/quickdeploy-ai/issue/QUI-480) | Flue adapter: real AgentRuntime over Flue durable agents (later) |
| [QUI-481](https://linear.app/quickdeploy-ai/issue/QUI-481) | OpenShell policy adapter + MXC sandbox backend, fail-closed (later) |

## M6 — Wave-2 importers (cloud formats)

| Issue | Title |
|---|---|
| [QUI-482](https://linear.app/quickdeploy-ai/issue/QUI-482) | asl-2-workflows: AWS Step Functions (Amazon States Language) importer |
| [QUI-483](https://linear.app/quickdeploy-ai/issue/QUI-483) | logic-apps-2-workflows: Azure Logic Apps (WDL) importer |
| [QUI-484](https://linear.app/quickdeploy-ai/issue/QUI-484) | google-workflows-2-workflows: Google Cloud Workflows importer |

## M7 — Wave-3 importers (vendor exports)

| Issue | Title |
|---|---|
| [QUI-485](https://linear.app/quickdeploy-ai/issue/QUI-485) | Connector mapping-pack framework for vendor automation exports |
| [QUI-486](https://linear.app/quickdeploy-ai/issue/QUI-486) | n8n-2-workflows: n8n export importer |
| [QUI-487](https://linear.app/quickdeploy-ai/issue/QUI-487) | make-2-workflows: Make (Integromat) blueprint importer |
| [QUI-488](https://linear.app/quickdeploy-ai/issue/QUI-488) | power-automate-2-workflows: Power Automate importer |
| [QUI-489](https://linear.app/quickdeploy-ai/issue/QUI-489) | zapier-2-workflows: Zapier importer |
| [QUI-490](https://linear.app/quickdeploy-ai/issue/QUI-490) | pipedream-2-workflows: Pipedream importer |
| [QUI-491](https://linear.app/quickdeploy-ai/issue/QUI-491) | workato-2-workflows: Workato recipe importer |
| [QUI-492](https://linear.app/quickdeploy-ai/issue/QUI-492) | ifttt-2-workflows: IFTTT applet importer |

## M8 — Packaging & sharing (OCI)

| Issue | Title |
|---|---|
| [QUI-493](https://linear.app/quickdeploy-ai/issue/QUI-493) | OCI workflow bundle format + ORAS distribution |
| [QUI-494](https://linear.app/quickdeploy-ai/issue/QUI-494) | Bundle signing, provenance, and verification metadata (cosign + SBOM) |

## M9 — Platform integration (monorepo, per ADR 0019)

| Issue | Title |
|---|---|
| [QUI-495](https://linear.app/quickdeploy-ai/issue/QUI-495) | Monorepo: ARD catalog source + SyncHandler ingester for workflows.json |
| [QUI-496](https://linear.app/quickdeploy-ai/issue/QUI-496) | Monorepo: marketplace surfacing + deployment-binding UI for workflows |
