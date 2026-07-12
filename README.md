# workflows-registry

The workflows sibling of [MCP-Registry](https://github.com/QuickDeployAI/MCP-Registry) and
[agent-skills-registry](https://github.com/QuickDeployAI/agent-skills-registry): a trusted public
registry that imports external workflow formats, compiles them into a governed internal execution
plan (ExecutionPlanV1), and executes them durably on the Vercel Workflow SDK. The platform reads
the generated `workflows.json` to populate official default workflow entries.

- [Architecture](docs/architecture.md) — pipeline, decisions, mapping vs the sibling registries,
  conformance levels, v0.1 acceptance criteria, target layout
- [Proposals (SEPs)](seps/README.md) — how substantial changes are proposed and reviewed;
  drafts live in [`seps/`](seps/)
- [Backlog index](docs/backlog/README.md) — milestones M0–M9 with links to every Linear issue in
  the [Workflows Registry](https://linear.app/quickdeploy-ai/project/workflows-registry-85a3df37abce)
  Linear project

## Supported importers

Importers are named `<source>-2-workflows` and share the detect/parse/validate/compile contract in
`packages/core/importer-kit`, emitting fidelity reports and conformance levels 0–5.

| Wave | Engines | Conformance |
| --- | --- | --- |
| 1 — spec-first | `arazzo`, `serverless-workflow` (+ `oneclick.workflow.package.v1`), `pi-agents` | 4 (fixtures execute on the kernel) |
| 2 — cloud orchestrators | `asl`, `logic-apps`, `google-workflows` | 2 (compile + fidelity) |
| 3 — vendor platforms | `n8n`, `make`, `power-automate`, `zapier`, `pipedream`, `workato`, `ifttt` | 2 (connector mapping packs, credential sanitization) |

## Quickstart

```bash
pnpm install
pnpm check                    # build + typecheck + lint + test + registry validate + drift gate

# Registry artifacts
pnpm --filter @quickdeployai/workflows-cli start build        # regenerate workflows.json
pnpm --filter @quickdeployai/workflows-cli start validate

# Import pipeline (from packages/tools/workflows-cli)
pnpm start detect  --source ../../../sources/quickdeploy/petstore-checkout.arazzo.yaml
pnpm start compile --manifest registry/quickdeploy/petstore-checkout.workflow.json
pnpm start bind    --plan .generated/plans/petstore-checkout.plan.json --implementations bindings.json
pnpm start policy  --plan .generated/plans/petstore-checkout.plan.json
pnpm start run     --plan .generated/plans/petstore-checkout.plan.json --bindings .generated/locks/petstore-checkout.lock.json
pnpm start inspect --run <runId>
pnpm start approve --token <approvalToken>

# Packaging
pnpm start bundle pack   --manifest registry/quickdeploy/petstore-checkout.workflow.json --plan .generated/plans/petstore-checkout.plan.json
pnpm start bundle verify --dir .generated/bundles/petstore-checkout
```

Compiled plans are governed end-to-end: capability binding locks, a three-stage default-deny
policy (intent → effective → runtime decision), digest-bound approvals, explicit idempotency
policies, audit JSONL, and secret redaction — all executed by the generic plan interpreter in
`packages/runtime/plan-interpreter` on the real Workflow SDK (Local World in tests). Agent nodes
run through a mediated turn loop (scripted double in tests; Flue adapter is env-gated and fails
closed), and sandbox capabilities use a lease model (local double; OpenShell/MXC adapter env-gated
likewise).
