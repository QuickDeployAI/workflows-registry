# workflows-registry

The workflows sibling of [MCP-Registry](https://github.com/QuickDeployAI/MCP-Registry) and
[agent-skills-registry](https://github.com/QuickDeployAI/agent-skills-registry): a trusted public
registry that imports external workflow formats (Arazzo, Serverless/Open Workflow, Pi Agents, and
more), compiles them into a governed internal execution plan, and executes them durably on the
Vercel Workflow SDK. The platform reads the generated `workflows.json` to populate official default
workflow entries.

Implementation has not started yet — the program is scoped and triaged in the Linear project
[Workflows Registry](https://linear.app/quickdeploy-ai/project/workflows-registry-85a3df37abce).

- [Architecture](docs/architecture.md) — pipeline, decisions, mapping vs the sibling registries,
  conformance levels, v0.1 acceptance criteria, target layout
- [Backlog index](docs/backlog/README.md) — milestones M0–M9 with links to every Linear issue
