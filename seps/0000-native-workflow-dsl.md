# SEP-0000: Native Workflow DSL: `quickdeploy.workflow/v1`

| | |
| --- | --- |
| **SEP** | 0000 (set to the PR number after opening the PR) |
| **Title** | Native Workflow DSL: `quickdeploy.workflow/v1` |
| **Author(s)** | Tyler Kendrick \<contact.tylerkendrick@gmail.com\> |
| **Status** | draft |
| **Type** | Standards Track |
| **Created** | 2026-07-12 |

## Abstract

This SEP proposes a native, human-authorable workflow serialization format —
`quickdeploy.workflow/v1` — as the registry's own workflow DSL. The format is
YAML-first with an exact 1:1 JSON equivalence, and its semantic model is the
existing internal execution IR (`ExecutionPlanV1`): every construct the IR can
execute is directly expressible, plus authoring sugar (implicit sequencing,
`${…}` inline expressions, `if`/`switch`/`foreach`/`repeat` shorthand,
duration strings) that lowers deterministically.

Two components make the format the registry's canonical serialization type
rather than a fourteenth import source: a `quickdeploy-2-workflows` importer
that compiles documents to `ExecutionPlanV1` through the standard importer
contract, and a serializer (`planToDsl`) with a **round-trip guarantee** —
any valid plan produced by ANY of the thirteen existing importers (or by
hand) serializes into the DSL and recompiles to a semantically identical plan
(equal semantic digest, clean validation, zero non-exact fidelity findings).
This gives the registry a single format that "supports all of the
implementations": vendor workflows convert into it losslessly at the plan
level, and authors can write directly what today only the kernel can
execute.

## Motivation

The registry imports thirteen external formats (Arazzo, Serverless Workflow,
Pi Agents, ASL, Logic Apps, Google Cloud Workflows, n8n, Make,
Power Automate, Zapier, Pipedream, Workato, IFTTT) into `ExecutionPlanV1`,
but has no native authoring format of its own. A systematic analysis of what
every importer actually emits exposes three gaps.

**1. Most of the kernel is unreachable by authors.** The union of all
thirteen importers exercises only 7 of the IR's 11 node kinds. No importable
format can produce `loop`, `signal`, `approval`, or `childWorkflow` nodes —
the durable constructs the kernel is specifically built and tested for
(digest-bound approvals, signal hooks, bounded loops, governed child plans).
Likewise, of the five idempotency policies only `deduplication-record` and
`provider-key` (Arazzo only) are ever emitted; `lookup-before-create`,
`reconciliation`, and `not-idempotent`+approval are kernel-tested but
unauthorable. The expression AST's `boolean` kind (and most of its comparison
operators) is emitted by no importer at all — composite conditions are
skipped or blocked in every source format.

**2. There is no canonicalization story.** Imported workflows exist only as
compiled plan JSON — verbose, machine-oriented, with explicit expression
trees. There is no supported way to render "what the registry understood"
back into a reviewable, editable, re-compilable document. A native
serialization closes the loop: import any vendor format, serialize to the
DSL, review/edit/re-own the workflow in registry-native terms.

**3. First-party authoring stubs a foreign format.** `workflows-cli scaffold`
currently generates a Serverless Workflow stub — new first-party workflows
begin life in a third-party dialect that reaches only a fraction of the
kernel.

A thin sugar layer over the IR — rather than a new high-level language —
fixes all three at once, with a testable losslessness property.

## Specification

Normative keywords MUST, MUST NOT, SHOULD, and MAY are used per RFC 2119.
The reference model is `ExecutionPlanV1` (`packages/core/ir/src/plan.ts`) and
the expression AST (`packages/core/expressions/src/ast.ts`); this
specification adds no IR schema changes.

### 1. Document

A document is a YAML or JSON object. YAML documents MUST be parseable by the
registry's hardened YAML ingestion (core schema, alias and depth caps); the
JSON form is the identical object tree. Top-level fields:

| Field | Req | Maps to |
| --- | --- | --- |
| `dsl` | MUST | literal `"quickdeploy.workflow/v1"` — the detection discriminator |
| `name` | MUST | `plan.name` (document wins over compile context) |
| `version`, `description`, `inputs` | MAY | documentation only; not represented in the plan |
| `capabilities` | MAY | `plan.capabilityRequirements`, order preserved; entries `{id, protocol, operation, effect, provider?, scopes?, inputSchemaDigest?, outputSchemaDigest?}` (`scopes` serializes IR `requiredScopes`) |
| `credentials` | MAY | `plan.credentialRequirements`; `{id, env, description?}`, `env` MUST match `^[A-Z][A-Z0-9_]*$` (a name, never a value) |
| `sandboxes` | MAY | `plan.sandboxRequirements`; `{id, image?, network?, allowedHosts?, writablePaths?}` |
| `budgets` | MAY | merged over kernel defaults `{16, 8, 4, 16}`; document wins over compile context |
| `outboundHosts` | MAY | `plan.effects.outboundHosts`, order preserved. Effect COUNTS MUST NOT be serialized or parsed; the compiler always recomputes them |
| `steps` | MUST | the node graph; the first step is `plan.entryNodeId` |

The document MUST NOT carry a plan id: `plan.id` comes from
`CompileContext.planId` (registry/deployment identity, assigned by the
manifest). Child workflow blocks DO carry an `id` (no context exists for
them).

### 2. Steps

`steps` is a LIST of step objects (never a map — YAML/JSON maps reorder
integer-like keys, and IR node ids may be arbitrary non-empty strings,
including `"1"`, `"__succeed"`, and dotted subgraph ids like
`"ship.else.x"`). Each step is:

```
{ id, next? | end?, <exactly one kind key>, …kind fields }
```

- `id` MUST be present on top-level steps and MUST be unique plan-wide
  (including generated ids). Inside nested sugar blocks it MAY be omitted;
  the compiler generates `<parent>.<slot>.s<n>`.
- `next` and `end: true` are mutually exclusive. Lowering: explicit `next`
  wins; `end: true` lowers to an *omitted* IR `next` (terminate branch
  successfully); otherwise the step chains to its following sibling. The last
  sibling of the top-level list and of `body`/`branches`/`onError` blocks
  terminates; the last sibling of an `if`/`switch` `then`/`else` block
  rejoins the choice step's own continuation.
- Lowering MUST create exactly ONE IR node per step and MUST NOT synthesize
  nodes. (Synthetic terminals from other importers, such as ASL's
  `__succeed`, round-trip as ordinary steps.)

Step kinds (exactly one kind key per step):

| Kind key | IR node | Fields |
| --- | --- | --- |
| `call: <capabilityId>` | `invoke` | `input` (expression, default `{}`), `effect?` (default: the bound capability's effect), `retry? {maxAttempts, backoffSeconds}`, `timeoutSeconds?`, `idempotency?`, `approval?: business-effect`, `onError?: <id \| steps>` |
| `if: <expr>` + `then:` (+ `else?:`) | `choice` | sugar for a one-arm switch |
| `switch: [{when, then}…]` (+ `else?:`) | `choice` | canonical branching form |
| `parallel: {branches: [<id \| steps>…]}` | `parallel` | join = all |
| `foreach: {items, body, concurrency?}` | `forEach` | item exposed as `steps.<id>.item`, index as `steps.<id>.index` |
| `repeat: {body, while?, maxIterations}` | `loop` | `while` → `continueWhile`; `maxIterations` MUST be present (no unbounded loops) |
| `wait: <seconds \| duration>` | `wait` | duration strings `"30s"`, `"5m"`, `"2h"`, `"1d"` are input sugar; serialization emits seconds |
| `signal: <name>` | `signal` | |
| `approve: {plane, subject, expiresSeconds?}` | `approval` | key is `approve` to avoid clashing with invoke's `approval` modifier |
| `workflow: {…}` + `input:` | `childWorkflow` | nested document (no `dsl` key) with own `id`, `name`, requirements, `steps`; budgets default to parent budgets with `maxDepth − 1` |
| `succeed: {output?}` / `return: <expr>` | `succeed` | terminal (no `next`/`end`) |
| `fail: {error, message?}` | `fail` | terminal |

`idempotency` forms: `{kind: provider-key, key: <expr>}` ·
`{kind: lookup-before-create, lookupBinding}` ·
`{kind: deduplication-record, namespace}` ·
`{kind: reconciliation, verifyBinding}` · `not-idempotent` (bare string or
`{kind: not-idempotent}`; the compiler re-adds the IR's
`approvalRequired: true` and validation still requires
`approval: business-effect` on the step).

The compiler MUST materialize IR defaults explicitly (`approval: "none"`,
`requiredScopes: []`, `maxConcurrency: 1`, sandbox `network: "none"` and
empty lists) so compiled plans are digest-identical with importer-built
plans. `retry` is presence-preserving: it MUST NOT be invented when absent
nor normalized away when it equals defaults (presence is digest-relevant).

### 3. Expressions

Every expression-typed position (`input`, `when`, `if`, `while`, `items`,
`subject`, `key`, `output`, `return`) accepts a **DSL expression value**:

- A string that consists of exactly one `${…}` spanning the whole string
  lowers to that expression. A string containing embedded `${…}` lowers to
  an `interpolate` with maximal literal runs. `$${` escapes a literal `${`.
  A string with no `${` is a string literal.
- Numbers, booleans, and null are literals. A YAML map lowers to an `object`
  expression (values recursed); a list lowers to an `array` expression.
- Reserved keys: a map whose only key is `$expr` embeds a raw expression AST
  (validated against the AST schema); `$literal` embeds a verbatim value
  with no parsing. These MUST be supported so that every AST — including
  shapes the string syntax cannot print — has a document form (totality).

The `${…}` micro-grammar is parsed by a hand-written lexer and
recursive-descent parser. There MUST NOT be any code-evaluation path.

Tokens: identifiers `[A-Za-z_][A-Za-z0-9_]*`; JSON numbers; single- or
double-quoted strings with `\\ \' \" \n \t \r \uXXXX` escapes; keywords
`true false null input steps`; punctuation `== != < <= > >= && || ! ( ) . [ ]`.

Grammar (precedence low → high; comparisons are non-associative — chaining
is a parse error):

```
expr    := orExpr
orExpr  := andExpr ("||" andExpr)*        # 2+ operands flatten at this level
andExpr := cmpExpr ("&&" cmpExpr)*
cmpExpr := unary (("=="|"!="|"<"|"<="|">"|">=") unary)?
unary   := "!" unary | primary
primary := literal | ref | "(" expr ")"
ref     := "input" pathTail                              → {input, path}
         | "steps" ("." IDENT | "[" STRING "]") pathTail → {nodeOutput, nodeId, path}
pathTail := ("." IDENT | "[" STRING "]" | "[" INT "]")*  # [0] → segment "0"
```

Parentheses are structural: `a || b || c` is one three-operand `or`;
`(a || b) || c` is a nested `or` — nesting shape round-trips. The bracket
form (`steps["ship.else.x"].ok`) carries node ids that are not identifiers.

A canonical printer (AST → string) MUST exist such that
`parse(print(ast))` deep-equals `ast` for every printable AST and
`print(parse(s))` is a fixed point. ASTs outside the printable set (object or
array operands inside compare/boolean, non-finite numbers, degenerate
interpolates, maps colliding with the reserved keys) MUST serialize via the
`$expr`/`$literal` fallback.

### 4. Serialization (`planToDsl`)

Two modes, both under the round-trip guarantee:

- **canonical** — one step per IR node; the entry node first, then remaining
  nodes in plan iteration order; every non-terminal step carries explicit
  `next` or `end: true` (order is never load-bearing); bodies and branches
  reference steps **by id** (flat — prefixed subgraph node sets from other
  importers stay flat; no structural regrouping is attempted); all defaulted
  fields explicit; `childWorkflow` recurses into a nested document. The
  child's `source`/`compiler`/`fidelity`/`diagnostics` are dropped (outside
  the semantic projection; re-synthesized on compile).
- **pretty** — canonical plus a provably-safe post-pass only: DFS chain
  reordering from the entry; drop `next` when the target is the immediately
  following step with in-degree 1; drop trailing `end: true`; omit fields
  equal to defaults. Structural regrouping into nested sugar blocks is out of
  scope for v1 (see Open Questions).

Serializers MUST NOT emit `undefined`/absent optional fields, MUST preserve
array order everywhere (requirements, hosts, choices, branches, operands,
interpolation parts), and MUST NOT serialize effect counts.

### 5. Round-trip guarantee

A new IR helper `computeSemanticPlanDigest(plan)` computes the content
digest of the recursive projection:

```
{irVersion, id, name, entryNodeId, nodes′,
 capabilityRequirements, credentialRequirements, sandboxRequirements,
 budgets, effects}
```

where `nodes′` maps embedded `childWorkflow.plan` values to their own
projections. `source`, `compiler`, `fidelity`, and `diagnostics` are
excluded — provenance that necessarily changes across serialize→recompile.
`effects` is deliberately included: counts are recomputed by the compiler,
so equality verifies node preservation, and `outboundHosts` verifies host
carriage.

**Guarantee.** For any valid `ExecutionPlanV1` `p`, compiling
`planToDsl(p)` (either mode) through `quickdeploy-2-workflows` with
`planId = p.id` MUST yield `p′` such that:

1. `computeSemanticPlanDigest(p′) === computeSemanticPlanDigest(p)`,
2. `validatePlan(p′)` reports no diagnostics, and
3. the compile emits zero non-`exact` fidelity findings.

The guarantee is **plan-to-plan**, not document-to-document: doc-only fields
(`version`, `description`, `inputs`, comments, formatting) do not survive an
IR round-trip by design.

### 6. Engine registration and conformance

- Engine id: `quickdeploy-2-workflows` (conforming to the
  `^[a-z0-9][a-z0-9-]*-2-workflows$` engine pattern), registered in the CLI
  importer registry, with an entry in `WORKFLOW_IMPORTER_CONFIG_SCHEMAS`
  (empty options object for v1).
- Detection MUST be exact if and only if the parsed document's `dsl` field
  equals `"quickdeploy.workflow/v1"`; repo-wide detection ambiguity (two
  exact matches for one artifact) is a conformance failure.
- The importer's fidelity report MUST contain only `exact` findings; any
  `approximated`/`unsupported`/`blocked` path in the native format is a bug.
- Published JSON Schema: `schemas/workflow-dsl.v1.schema.json`
  (draft 2020-12) kept in parity with the Zod source of truth via the
  repository's Ajv parity-test pattern.
- Proven conformance level: **4** (fixtures execute end-to-end on the
  Workflow SDK Local World).

## Rationale

| Decision | Choice | Why |
| --- | --- | --- |
| Steps container | list of `{id, …}` objects | maps reorder integer-like keys (`"1"` is a legal node id); dotted ids need no key-quoting care; JSON 1:1 is trivial |
| Canonical chaining | explicit `next`/`end: true`; order never load-bearing | unambiguous serialization; sugar remains input-only |
| Terminal marker | `end: true` boolean | a `$end` sentinel id could collide with a real node literally named `$end` |
| Synthetic nodes | never | round-trip cornerstone: node sets are preserved bijectively |
| Plan id | from compile context, not the document | plan id is registry/deploy identity (manifest `metadata.name`); keeping it out of the document keeps the DSL free-form for lossless vendor round-trips |
| Invoke input field | `input:` (not `with:`) | mirrors the IR field; one name, no aliases |
| Conformance claim | 4, not 5 | level 5 ("parity vs source platform") is vacuous when the source platform IS this kernel |
| Altitude | sugar over the IR, not a higher-level language | a higher-level language (declarative connectors, richer control flow) would make IR→DSL serialization best-effort instead of guaranteed; the guarantee is the point |

Alternatives considered: **map-keyed steps** (rejected: key-order hazards
above); **document-carried plan id** (rejected: forces registry naming rules
into the DSL and breaks round-trips of arbitrary imported ids);
**serializing straight IR JSON as the "DSL"** (rejected: not authorable —
the entire motivation is a human surface over the same semantics).

## Backward Compatibility

Purely additive. A new engine, importer package, DSL package, published
schema file, and one new IR *helper function* — no changes to the
`ExecutionPlanV1` schema, the expression AST, existing importers, the
interpreter, or plan digests of existing workflows. Existing manifests and
catalog entries are unaffected. The scaffold default (Serverless Workflow
stub) is retained; the native stub is opt-in via `--importer`.

## Reference Implementation

Prototype required before `accepted`; complete implementation plus
conformance evidence required before `final`. Planned layout:

- **`packages/core/workflow-dsl`** — Zod document schema; expression
  lexer/parser (`expression-syntax.ts`), canonical printer
  (`expression-print.ts`), document↔AST bridge (`expression-io.ts`);
  duration sugar; `dslToPlan` lowering; `planToDsl` serializer (canonical +
  pretty); consumed by the importer and CLI.
- **`packages/importers/quickdeploy-2-workflows`** — the thin
  `WorkflowImporter` (detect/parse/validate/compile) plus the round-trip
  matrix.
- **`packages/core/ir`** — `computeSemanticPlanDigest`.
- **CLI** — `workflows-cli export --plan <plan.json>` (IR → DSL) and
  `workflows-cli convert --manifest <…>` (any of the 14 engines → DSL in one
  command); scaffold branch for a native stub.
- **Registry** — native fixture `sources/quickdeploy/release-orchestrator.workflow.yaml`
  exercising what no vendor format reaches (approval node, signal, bounded
  loop with boolean/compare `while`, child workflow, `provider-key` and
  `not-idempotent` idempotency, approval-gated invoke) with its manifest.

Conformance evidence for `final`:

1. Expression property tests (~10k seeded cases): `parse∘print` identity on
   printable ASTs; `print∘parse` fixed point; doc↔AST totality.
2. Ajv parity between the published JSON Schema and the Zod schema.
3. Lowering golden tests (chaining, rejoin, id generation, defaults,
   `id: "1"`).
4. **Round-trip matrix**: one fixture per existing engine (13) × both
   serializer modes → semantic-digest equality + clean validation + all-exact
   fidelity.
5. Native fixture executes end-to-end on the Workflow SDK Local World
   (level-4 evidence), including approval resume via digest-bound token and
   signal delivery.
6. Repo gates: `pnpm check` and the generated-artifact drift gate.

## Security Implications

- **No evaluation.** The expression grammar is parsed by a hand-written
  recursive-descent parser into the existing total, side-effect-free AST; no
  `eval`, `Function`, or template engines anywhere. Code-bearing constructs
  have no representation in the DSL at all.
- **Hardened ingestion.** Documents pass through the existing safe YAML/JSON
  ingestion (core schema, alias cap, depth cap, byte cap), which also bounds
  child-workflow and expression nesting.
- **Credentials stay names.** `credentials[].env` carries env-var names
  matching the existing pattern; values never appear in documents, plans, or
  serializations (consistent with the registry-wide strip-before-parse
  posture).
- **Governance is not bypassable.** The DSL cannot express anything the IR
  cannot: every invoke still requires a declared capability, non-read
  effects still require idempotency policies, `not-idempotent` still forces
  a business-effect approval, and budgets still bound loops, parallelism,
  and child depth — all enforced by the existing `validatePlan` and the
  kernel's policy/approval planes.
- **Digest integrity.** Serialization rules (no absent-field emission, order
  preservation, no effect-count serialization) keep plan digests stable and
  reviewable; the semantic digest gives a precise, testable definition of
  "the same workflow".

## Open Questions

1. **Pretty-mode structural regrouping** — folding flat `scope.`-prefixed
   subgraphs back into nested `then:`/`body:` blocks is deferred; safe
   regrouping in the presence of shared continuations and cross-branch jumps
   needs its own analysis.
2. **Doc-to-doc fidelity** — should a future revision preserve comments and
   formatting across `convert` (source-map style), or is plan-level
   losslessness sufficient?
3. **Provenance header** — should `workflows-cli convert` embed the source
   engine, artifact digest, and conversion date as a comment header in
   emitted YAML?

## References

- `ExecutionPlanV1`: `packages/core/ir/src/plan.ts` (+ `README.md` semantics)
- Expression AST: `packages/core/expressions/src/ast.ts`
- Importer contract & conformance levels: `packages/core/importer-kit/src/contract.ts`
- Cross-importer construct analysis: the thirteen `packages/importers/*-2-workflows` packages and `packages/core/connector-mappings`
- Process model: [MCP SEP guidelines](https://modelcontextprotocol.io/community/sep-guidelines)
