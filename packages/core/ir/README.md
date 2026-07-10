# @quickdeployai/workflow-ir

`ExecutionPlanV1` — the versioned, private execution IR every importer compiles to. Source
formats and runtimes never leak into the IR: there is no ArazzoStep or PiAgentStep, only
generic control and invocation primitives. Plans are immutable; identity is
`computePlanDigest(plan)` (diagnostics excluded).

## Node semantics

| Node | Semantics |
|---|---|
| `invoke` | Dispatch one effect through a declared capability requirement (`binding`). `input` is an expression evaluated against `{ input, nodeOutputs }`. `effect: read \| mutation \| send \| destructive`; every non-read invoke MUST declare an `idempotency` policy; `not-idempotent` additionally requires `approval: "business-effect"`. On error, control moves to `onError` if set, otherwise the failure propagates (branch → parallel join → plan). Retries per `retry` (at-least-once — hence idempotency). |
| `choice` | First `choices[].when` that evaluates `true` wins; falls through to `otherwise`; no match and no otherwise → plan failure (`no-choice-matched`). |
| `parallel` | All `branches[].entryNodeId` subgraphs run concurrently; join mode is **all** — the node completes when every branch reaches a terminator (a `succeed` node or a node without `next`). Any branch failure fails the node (after all settle). Branch count ≤ `budgets.maxParallelism`. |
| `forEach` | Evaluates `items`, runs the body subgraph once per item (item available as the forEach node's output slot during the iteration), `maxConcurrency` bounded by budgets. |
| `loop` | Runs the body subgraph while `continueWhile` (if present) evaluates `true`, at most `maxIterations` (≤ `budgets.maxIterations`). Termination is structural — budgets are enforced by the interpreter regardless of the condition. |
| `wait` | Durable sleep for `seconds`. |
| `signal` | Suspends on a run-scoped durable hook (`signal:<runId>:<signalName>`) until external data arrives. |
| `approval` | Digest-bound approval: the runtime computes `sha256(subject-arguments)` and suspends on a hook token containing plan digest + node id + argument digest. Resuming with a different digest, or after expiry, invalidates the approval. Planes: `business-effect` and `policy-expansion`. |
| `childWorkflow` | Launches an inline, already-compiled subplan with its own digest, budgets, policy, and audit identity. Child `maxDepth` must be strictly smaller than the parent's. |
| `succeed` / `fail` | Terminate the plan (or branch) with an optional output / a typed error. |

## Failure propagation

`invoke.onError` handles node-local failures. Unhandled failures terminate the enclosing
branch; a failed branch fails its `parallel` join; an unhandled failure at the top level
fails the run. `fail` nodes always terminate the plan with `FatalError` semantics (no retry).

## Output references

Each node's result is recorded by node id and addressed with
`{ kind: "nodeOutput", nodeId, path }` expressions. Missing outputs/paths are runtime
errors, never silent `undefined` (see `@quickdeployai/workflow-expressions`).
