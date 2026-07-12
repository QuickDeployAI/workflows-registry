# Specification Enhancement Proposals (SEPs)

A SEP is a design document providing information to the workflows-registry
community, or describing a new feature for the registry, its importer
contract, its execution IR, or its processes. The SEP should provide a
concise technical specification of the feature and a rationale for it.

SEPs are the primary mechanism for proposing major new features, collecting
input on a design, and documenting the decisions that have gone into the
registry. The SEP author is responsible for building consensus and
documenting dissenting opinions. SEPs are maintained as markdown files in
this directory; their revision history is the historical record of the
proposal. The process is modeled on the
[Model Context Protocol SEP guidelines](https://modelcontextprotocol.io/community/sep-guidelines).

## When to write a SEP

Write a SEP when a change is substantial enough to need broad discussion, a
formal design document, and a historical record:

- **A new feature or contract change** — new source formats/engines, changes
  to `ExecutionPlanV1`, the expression AST, the importer contract, manifest
  or catalog schemas, or the governance model (policy, approvals,
  idempotency, budgets).
- **A breaking change** — anything that is not backwards-compatible,
  including changes that alter plan digests of existing workflows.
- **A process change** — altering how contributions, reviews, conformance
  levels, or releases work (like this document).
- **A complex or controversial topic** — anything with multiple valid
  solutions likely to generate real debate.

Skip the SEP process for bug fixes, documentation clarifications, adding
fixtures or examples, mapping-pack data additions (data-only vendor
coverage), and minor schema fixes that don't change behavior — those are
plain pull requests.

## SEP types

1. **Standards Track** — a new feature or implementation for the registry:
   engines/importers, IR or expression changes, kernel behavior, packaging,
   catalog surfaces.
2. **Informational** — describes a design issue or provides guidelines
   without proposing a new feature.
3. **Process** — describes or changes a process surrounding the registry.

## Workflow

```
Idea → PR with seps/0000-<title>.md → rename to PR number
     → draft → in-review → accepted → final
                        ↘ rejected
   (author may withdraw at any point; unsponsored proposals go dormant)
```

1. **Draft your SEP** as `seps/0000-your-feature-title.md` using
   [`0000-template.md`](./0000-template.md), with `Status: draft`.
2. **Open a pull request** adding the file. Once the PR exists, **rename the
   file to the PR number** (PR #17 → `0017-your-feature-title.md`) and update
   the SEP number in the preamble.
3. **Find a sponsor** — a maintainer who champions the SEP through review.
   The sponsor assigns themselves to the PR and confirms `draft` status.
4. **Informal review** happens in PR comments; the sponsor may request
   changes.
5. **Formal review** — the sponsor sets `Status: in-review`; maintainers
   review and resolve to `accepted`, `rejected`, or return it for revision.
6. **Finalization** — after acceptance, the reference implementation must be
   completed and merged, together with conformance evidence (see below).
   The sponsor then sets `Status: final`.

The `Status` field in the SEP file is canonical; matching PR labels should be
kept in sync. Authors request status changes through their sponsor rather
than editing the field themselves.

## Statuses

| Status       | Meaning                                                        |
| ------------ | -------------------------------------------------------------- |
| `draft`      | Has a sponsor, undergoing informal review                       |
| `in-review`  | Ready for formal maintainer review                              |
| `accepted`   | Approved; awaiting reference implementation + conformance       |
| `rejected`   | Declined by maintainers (not permanent — revise and resubmit)   |
| `withdrawn`  | Author withdrew the proposal                                    |
| `final`      | Implemented, conformance evidence merged, incorporated          |
| `superseded` | Replaced by a newer SEP                                         |
| `dormant`    | No sponsor found within 6 months; can be revived                |

## Acceptance and finalization criteria

For a SEP to be **accepted** it must have:

- a **prototype** demonstrating the proposal — working code reviewers can
  run (a branch, a standalone proof of concept, or integration tests), not
  pseudocode or a design document alone;
- clear benefit to the registry ecosystem;
- consensus among reviewers.

For a Standards Track SEP to reach **final**, the reference implementation
must be merged along with conformance evidence. In this repository that
means the change is covered by the standard gates — `pnpm check`
(build/typecheck/lint/test + registry validation + generated-artifact drift)
— and, for importer- or kernel-facing SEPs, executable proof at the
appropriate [conformance level](../docs/architecture.md): fixtures that
compile (level 2), bind (level 3), or execute end-to-end on the Workflow SDK
Local World (level 4), with every normative MUST/SHOULD in the Specification
section traceable to a test.

## SEP file structure

Each SEP contains, in order:

1. **Preamble** — SEP number (= PR number), title, author(s), status, type,
   created date.
2. **Abstract** — a short (~200 word) description of the issue addressed.
3. **Motivation** — why the current registry is inadequate. SEPs without
   sufficient motivation may be rejected outright.
4. **Specification** — the technical specification, detailed enough for
   competing, interoperable implementations, using normative MUST/SHOULD
   language that conformance tests can trace to.
5. **Rationale** — why these design decisions; alternatives considered;
   evidence of consensus and objections addressed.
6. **Backward Compatibility** — incompatibilities, their severity, and how
   they are handled.
7. **Reference Implementation** — must be complete before `final`; need not
   be complete before acceptance (but a prototype must exist).
8. **Security Implications** — explicit discussion of security concerns.

Optional trailing sections: **Open Questions**, **References**.

## Index

| SEP | Title | Type | Status |
| --- | ----- | ---- | ------ |
| [0004](./0004-native-workflow-dsl.md) | Native Workflow DSL: `quickdeploy.workflow/v1` | Standards Track | draft |
