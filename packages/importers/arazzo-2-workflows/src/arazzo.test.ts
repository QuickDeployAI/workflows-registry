import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createPinnedResolver,
  ingestSourceFiles,
  type SourceArtifact,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { beforeAll, describe, expect, it } from "vitest";
import { arazzoImporter } from "./index.js";

const SOURCES = join(import.meta.dirname, "../../../../sources/quickdeploy");

let artifact: SourceArtifact;
let resolver: ReturnType<typeof createPinnedResolver>;

beforeAll(async () => {
  const files = [
    {
      path: "petstore-checkout.arazzo.yaml",
      text: await readFile(join(SOURCES, "petstore-checkout.arazzo.yaml"), "utf8"),
    },
    {
      path: "petstore-openapi.yaml",
      text: await readFile(join(SOURCES, "petstore-openapi.yaml"), "utf8"),
    },
  ];
  artifact = ingestSourceFiles(files, { entrypoint: "petstore-checkout.arazzo.yaml" });
  resolver = createPinnedResolver({ files });
});

describe("arazzo-2-workflows", () => {
  it("level 0: detects Arazzo documents exactly", async () => {
    const detection = await arazzoImporter.detect(artifact);
    expect(detection).toMatchObject({ detected: true, confidence: "exact", formatVersion: "1.1.0" });
    const other = ingestSourceFiles([{ path: "x.json", text: "{}" }]);
    expect((await arazzoImporter.detect(other)).detected).toBe(false);
  });

  it("level 1: parses and validates the committed fixture", async () => {
    const parsed = await arazzoImporter.parse(artifact, { resolver });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const report = await arazzoImporter.validate(parsed.model, { resolver });
    expect(report.diagnostics).toEqual([]);
    expect(report.valid).toBe(true);
  });

  it("level 2+3: compiles to a valid plan with bindable requirements", async () => {
    const parsed = await arazzoImporter.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await arazzoImporter.compile(parsed.model, {
      planId: "petstore-checkout",
      planName: "Petstore checkout",
      artifactDigest: artifact.digest,
      entrypoint: "petstore-checkout.arazzo.yaml",
      config: { workflowId: "checkout" },
      resolver,
    });

    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("findPet");
    expect(Object.keys(plan.nodes).sort()).toEqual(["__succeed", "findPet", "placeOrder"]);
    expect(plan.source.artifactDigest).toBe(artifact.digest);

    const requirementIds = result.requirements.map((requirement) => requirement.id).sort();
    expect(requirementIds).toEqual(["getPetById", "placeOrder"]);
    expect(result.requirements.find((r) => r.id === "placeOrder")?.effect).toBe("mutation");
    expect(plan.effects.outboundHosts).toContain("petstore.example.com");

    // idempotencyKey in the payload promotes the mutation to provider-key.
    const placeOrder = plan.nodes.placeOrder;
    expect(placeOrder?.kind).toBe("invoke");
    if (placeOrder?.kind === "invoke") {
      expect(placeOrder.idempotency?.kind).toBe("provider-key");
    }

    const statuses = result.fidelity.findings.map((finding) => finding.status);
    expect(statuses).not.toContain("unsupported");
    expect(statuses).not.toContain("blocked");
  });

  it("rejects steps referencing unknown operations", async () => {
    const files = [
      {
        path: "bad.arazzo.yaml",
        text: (await readFile(join(SOURCES, "petstore-checkout.arazzo.yaml"), "utf8")).replace(
          "operationId: getPetById",
          "operationId: nonexistentOp",
        ),
      },
      { path: "petstore-openapi.yaml", text: await readFile(join(SOURCES, "petstore-openapi.yaml"), "utf8") },
    ];
    const badArtifact = ingestSourceFiles(files, { entrypoint: "bad.arazzo.yaml" });
    const badResolver = createPinnedResolver({ files });
    const parsed = await arazzoImporter.parse(badArtifact, { resolver: badResolver });
    if (!parsed.ok) throw new Error("parse failed");
    const report = await arazzoImporter.validate(parsed.model, { resolver: badResolver });
    expect(report.valid).toBe(false);
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toContain("unknown-operation");
  });

  it("fails compilation when unsupported runtime expressions affect execution", async () => {
    const files = [
      {
        path: "unsupported.arazzo.yaml",
        text: (await readFile(join(SOURCES, "petstore-checkout.arazzo.yaml"), "utf8")).replace(
          "$inputs.petId",
          "$faultyContext.magic",
        ),
      },
      { path: "petstore-openapi.yaml", text: await readFile(join(SOURCES, "petstore-openapi.yaml"), "utf8") },
    ];
    const resolverBad = createPinnedResolver({ files });
    const parsed = await arazzoImporter.parse(
      ingestSourceFiles(files, { entrypoint: "unsupported.arazzo.yaml" }),
      { resolver: resolverBad },
    );
    if (!parsed.ok) throw new Error("parse failed");
    const result = await arazzoImporter.compile(parsed.model, {
      planId: "x",
      planName: "x",
      resolver: resolverBad,
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain("fidelity-blocking");
    expect(result.fidelity.findings.some((finding) => finding.status === "unsupported")).toBe(true);
  });
});
