import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  QUICKDEPLOY_REGISTRY_CURATION_META_KEY,
  QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY,
  WorkflowEntrySchema,
  WorkflowsJsonEnvelopeSchema,
  quickDeployRegistryCuration,
  quickDeployRegistryMonetization,
} from "./workflows-json.js";

const SCHEMAS_DIR = join(import.meta.dirname, "../../../../schemas");

function entry(): Record<string, unknown> {
  return {
    name: "ai.quickdeploy/petstore-checkout",
    version: "0.1.0",
    description: "Multi-call petstore checkout via Arazzo.",
    manifestPath: "registry/quickdeploy/petstore-checkout.workflow.json",
    _meta: {
      [QUICKDEPLOY_REGISTRY_CURATION_META_KEY]: {
        verifiedStatus: "review",
        category: "arazzo-2-workflows",
        isOfficial: true,
        tags: ["manifest-backed"],
      },
    },
  };
}

describe("WorkflowEntrySchema", () => {
  it("accepts entries with curation under _meta", () => {
    const parsed = WorkflowEntrySchema.safeParse(entry());
    expect(parsed.success).toBe(true);
    expect(quickDeployRegistryCuration(parsed.success ? parsed.data : ({} as never))?.category).toBe(
      "arazzo-2-workflows",
    );
  });

  it.each(["verifiedStatus", "category", "isOfficial", "tags", "curation"])(
    "rejects top-level curation field %s",
    (key) => {
      const bad = { ...entry(), [key]: "x" };
      expect(WorkflowEntrySchema.safeParse(bad).success).toBe(false);
    },
  );

  it("rejects malformed curation meta", () => {
    const bad = entry();
    (bad._meta as Record<string, unknown>)[QUICKDEPLOY_REGISTRY_CURATION_META_KEY] = {
      verifiedStatus: "nope",
    };
    expect(WorkflowEntrySchema.safeParse(bad).success).toBe(false);
  });

  it("accepts monetization under _meta and exposes it via the accessor", () => {
    const paid = entry();
    (paid._meta as Record<string, unknown>)[QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY] = {
      pricing: { model: "per-request", price: "0.01" },
      acceptedProtocols: ["x402", "l402"],
      x402: { payTo: "0x1234abcd" },
    };
    const parsed = WorkflowEntrySchema.safeParse(paid);
    expect(parsed.success).toBe(true);
    expect(
      quickDeployRegistryMonetization(parsed.success ? parsed.data : ({} as never)),
    ).toMatchObject({
      pricing: { model: "per-request", price: "0.01", currency: "USD" },
      acceptedProtocols: ["x402", "l402"],
      x402: { networks: ["base"], asset: "USDC", payTo: "0x1234abcd" },
    });
  });

  it.each(["monetization", "pricing", "acceptedProtocols", "x402"])(
    "rejects top-level monetization field %s",
    (key) => {
      const bad = { ...entry(), [key]: "x" };
      expect(WorkflowEntrySchema.safeParse(bad).success).toBe(false);
    },
  );

  it("rejects unknown payment protocols and non-decimal prices", () => {
    const badProtocol = entry();
    (badProtocol._meta as Record<string, unknown>)[QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY] = {
      pricing: { model: "per-request", price: "0.01" },
      acceptedProtocols: ["carrier-pigeon"],
    };
    expect(WorkflowEntrySchema.safeParse(badProtocol).success).toBe(false);

    const badPrice = entry();
    (badPrice._meta as Record<string, unknown>)[QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY] = {
      pricing: { model: "per-request", price: "$0.01" },
    };
    expect(WorkflowEntrySchema.safeParse(badPrice).success).toBe(false);
  });
});

describe("workflows.json envelope + published schema parity", () => {
  it("agrees with the published JSON Schema", async () => {
    const raw = await readFile(join(SCHEMAS_DIR, "workflows-json.schema.json"), "utf8");
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(JSON.parse(raw));

    const envelope = { workflows: [entry()] };
    expect(validate(envelope)).toBe(true);
    expect(WorkflowsJsonEnvelopeSchema.safeParse(envelope).success).toBe(true);

    const bad = { workflows: [{ ...entry(), verifiedStatus: "verified" }] };
    expect(validate(bad)).toBe(false);
    expect(WorkflowsJsonEnvelopeSchema.safeParse(bad).success).toBe(false);
  });
});
