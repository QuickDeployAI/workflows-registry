import { describe, expect, it } from "vitest";
import {
  QUICKDEPLOY_REGISTRY_CURATION_META_KEY,
  QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY,
  WorkflowEntrySchema,
  WorkflowsJsonEnvelopeSchema,
  quickDeployRegistryCuration,
  quickDeployRegistryMonetization,
} from "./workflows-json";

describe("WorkflowsJsonEnvelopeSchema", () => {
  it("accepts an envelope with curated and monetized workflow entries", () => {
    const parsed = WorkflowsJsonEnvelopeSchema.parse({
      $schema: "https://quickdeploy.ai/schemas/workflows-json.schema.json",
      workflows: [
        {
          name: "ai.quickdeploy/petstore-order-fulfillment",
          version: "0.1.0",
          workflowPath: "registry/quickdeploy/petstore-order-fulfillment.workflow.json",
          contentHash: "a".repeat(64),
          _meta: {
            [QUICKDEPLOY_REGISTRY_CURATION_META_KEY]: {
              verifiedStatus: "review",
              category: "commerce",
              isOfficial: true,
              isPaid: true,
              tags: ["arazzo", "petstore"],
            },
            [QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY]: {
              pricing: { model: "per-request", price: "0.01" },
              acceptedProtocols: ["x402", "l402"],
              x402: {
                networks: ["base"],
                payTo: "0x1111111111111111111111111111111111111111",
              },
            },
          },
        },
      ],
    });

    const entry = parsed.workflows[0];
    expect(entry).toBeDefined();
    expect(quickDeployRegistryCuration(entry!)).toMatchObject({
      verifiedStatus: "review",
      isPaid: true,
      tags: ["arazzo", "petstore"],
    });
    expect(quickDeployRegistryMonetization(entry!)).toMatchObject({
      pricing: { model: "per-request", price: "0.01", currency: "USD" },
      acceptedProtocols: ["x402", "l402"],
      x402: {
        networks: ["base"],
        asset: "USDC",
        payTo: "0x1111111111111111111111111111111111111111",
      },
    });
  });

  it("rejects top-level curation fields on workflow entries", () => {
    const result = WorkflowEntrySchema.safeParse({
      name: "ai.quickdeploy/example",
      workflowPath: "registry/quickdeploy/example.workflow.json",
      verifiedStatus: "verified",
    });
    expect(result.success).toBe(false);
  });

  it("rejects top-level monetization fields on workflow entries", () => {
    const result = WorkflowEntrySchema.safeParse({
      name: "ai.quickdeploy/example",
      workflowPath: "registry/quickdeploy/example.workflow.json",
      monetization: { pricing: { model: "per-request", price: "0.01" } },
      pricing: { model: "per-request" },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "monetization",
      "pricing",
    ]);
  });

  it("rejects invalid curation payloads under the reverse-DNS meta key", () => {
    const result = WorkflowEntrySchema.safeParse({
      name: "ai.quickdeploy/example",
      workflowPath: "registry/quickdeploy/example.workflow.json",
      _meta: {
        [QUICKDEPLOY_REGISTRY_CURATION_META_KEY]: { verifiedStatus: "not-a-status" },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects monetization payloads with unknown payment protocols", () => {
    const result = WorkflowEntrySchema.safeParse({
      name: "ai.quickdeploy/example",
      workflowPath: "registry/quickdeploy/example.workflow.json",
      _meta: {
        [QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY]: {
          pricing: { model: "per-request", price: "0.01" },
          acceptedProtocols: ["visa"],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects monetization payloads with non-decimal price strings", () => {
    const result = WorkflowEntrySchema.safeParse({
      name: "ai.quickdeploy/example",
      workflowPath: "registry/quickdeploy/example.workflow.json",
      _meta: {
        [QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY]: {
          pricing: { model: "per-request", price: "$0.01" },
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
