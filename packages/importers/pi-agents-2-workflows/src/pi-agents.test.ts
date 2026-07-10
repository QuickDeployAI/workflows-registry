import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createPinnedResolver, ingestSourceFiles } from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { piAgentsImporter } from "./index.js";

const SOURCES = join(import.meta.dirname, "../../../../sources/quickdeploy");
const resolver = createPinnedResolver({ files: [] });

async function fixtureArtifact() {
  const text = await readFile(join(SOURCES, "code-review-loop.pi.json"), "utf8");
  return ingestSourceFiles([{ path: "code-review-loop.pi.json", text }], {
    entrypoint: "code-review-loop.pi.json",
  });
}

describe("pi-agents-2-workflows", () => {
  it("level 0: detects canonical workflow JSON", async () => {
    const artifact = await fixtureArtifact();
    expect((await piAgentsImporter.detect(artifact)).confidence).toBe("exact");
  });

  it("level 1: unbounded loops and duplicate ids are compile-time errors", async () => {
    const artifact = await fixtureArtifact();
    const parsed = await piAgentsImporter.parse(artifact, { resolver });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const unbounded = JSON.parse(JSON.stringify(parsed.model)) as typeof parsed.model;
    delete (unbounded.root.children![2] as { maxIterations?: number }).maxIterations;
    const report = await piAgentsImporter.validate(unbounded, { resolver });
    expect(report.valid).toBe(false);
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toContain("unbounded-loop");
  });

  it("level 2+3: compiles spawn/fork/join/loop to generic primitives", async () => {
    const artifact = await fixtureArtifact();
    const parsed = await piAgentsImporter.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await piAgentsImporter.compile(parsed.model, {
      planId: "code-review-loop",
      planName: "Code review loop",
      artifactDigest: artifact.digest,
      resolver,
    });

    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("author");

    const fork = plan.nodes.reviewers;
    expect(fork?.kind).toBe("parallel");
    if (fork?.kind === "parallel") {
      expect(fork.branches).toHaveLength(2);
      expect(fork.next).toBe("revise");
    }

    const loop = plan.nodes.revise;
    expect(loop?.kind).toBe("loop");
    if (loop?.kind === "loop") {
      expect(loop.maxIterations).toBe(3);
      expect(loop.bodyEntryNodeId).toBe("reviser");
    }

    // Agent structures compile to GENERIC invoke nodes through `agent`
    // capability requirements — no Pi-specific node types leak into the IR.
    const requirementIds = result.requirements.map((requirement) => requirement.id).sort();
    expect(requirementIds).toEqual(["agent:code-author", "agent:code-reviewer"]);
    for (const node of Object.values(plan.nodes)) {
      expect(["invoke", "parallel", "loop", "succeed"]).toContain(node.kind);
    }
    expect(plan.budgets.maxIterations).toBe(3);
  });
});
