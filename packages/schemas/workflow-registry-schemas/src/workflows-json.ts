import { z } from "zod";
import { EXACT_VERSION_PATTERN, WORKFLOW_IMPORTER_ENGINE_PATTERN } from "./workflow-manifest.js";

export const WORKFLOWS_JSON_SCHEMA_URI = "https://quickdeploy.ai/schemas/workflows-json.schema.json";

export const QUICKDEPLOY_REGISTRY_CURATION_META_KEY = "ai.quickdeploy.registry/curation";
export const QUICKDEPLOY_REGISTRY_IMPORT_META_KEY = "ai.quickdeploy.registry/import";
export const QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY = "ai.quickdeploy.registry/monetization";

/**
 * Curation fields live ONLY under reverse-DNS `_meta` keys so entries stay
 * consumable by any workflows-json-aware client without QuickDeploy leakage.
 */
const FORBIDDEN_TOP_LEVEL_KEYS = [
  "verifiedStatus",
  "category",
  "isOfficial",
  "isPaid",
  "tags",
  "quickdeploy",
  "curation",
  "manifest",
  "monetization",
  "pricing",
  "acceptedProtocols",
  "x402",
] as const;

export const QuickDeployRegistryCurationSchema = z.object({
  verifiedStatus: z.enum(["unverified", "verified", "review", "deprecated", "blocked"]),
  category: z.string().min(1),
  isOfficial: z.boolean().default(false),
  isPaid: z.boolean().optional(),
  tags: z.array(z.string().min(1)).default([]),
});
export type QuickDeployRegistryCuration = z.infer<typeof QuickDeployRegistryCurationSchema>;

/** Conformance the importer proved for this entry (levels 0–5). */
export const QuickDeployRegistryImportSchema = z.object({
  engine: z.string().regex(WORKFLOW_IMPORTER_ENGINE_PATTERN),
  conformanceLevel: z.number().int().min(0).max(5),
  irVersion: z.string().optional(),
  planDigest: z.string().optional(),
  fidelity: z
    .object({
      exact: z.number().int().nonnegative(),
      approximated: z.number().int().nonnegative(),
      unsupported: z.number().int().nonnegative(),
      blocked: z.number().int().nonnegative(),
    })
    .optional(),
});
export type QuickDeployRegistryImport = z.infer<typeof QuickDeployRegistryImportSchema>;

/**
 * Monetization metadata (advertisement only — payment is enforced by the
 * capability gateway at execution time, not by this registry).
 */
export const QuickDeployRegistryMonetizationSchema = z
  .object({
    pricing: z.object({
      model: z.enum(["per-request", "metered", "subscription", "one-time"]),
      /** Decimal USD string, e.g. "0.01". Omitted for metered (rate-card) pricing. */
      price: z
        .string()
        .regex(/^\d+(\.\d+)?$/)
        .optional(),
      currency: z.literal("USD").default("USD"),
    }),
    /** Agentic payment protocols the capability accepts (enforced by the capability gateway). */
    acceptedProtocols: z
      .array(z.enum(["a2h", "x402", "l402", "mpp", "ap2", "acp", "ucp"]))
      .default([]),
    /** x402-specific advertisement (public, non-secret). */
    x402: z
      .object({
        networks: z.array(z.enum(["base", "base-sepolia"])).default(["base"]),
        asset: z.literal("USDC").default("USDC"),
        /** Public receiving wallet address (NOT a secret). */
        payTo: z.string().optional(),
      })
      .optional(),
  })
  .strict();
export type QuickDeployRegistryMonetization = z.infer<
  typeof QuickDeployRegistryMonetizationSchema
>;

export const WorkflowEntrySchema = z
  .object({
    name: z.string().min(1),
    version: z.string().regex(EXACT_VERSION_PATTERN).optional(),
    description: z.string().optional(),
    labels: z.array(z.string().min(1)).optional(),
    manifestPath: z.string().min(1),
    contentHash: z.string().regex(/^[0-9a-f]{64}$/).optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown())
  .superRefine((entry, ctx) => {
    for (const key of FORBIDDEN_TOP_LEVEL_KEYS) {
      if (key in entry) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `Curation belongs under _meta["${QUICKDEPLOY_REGISTRY_CURATION_META_KEY}"], not at the entry top level.`,
        });
      }
    }
    const meta = entry._meta ?? {};
    const curation = meta[QUICKDEPLOY_REGISTRY_CURATION_META_KEY];
    if (curation !== undefined) {
      const parsed = QuickDeployRegistryCurationSchema.safeParse(curation);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          path: ["_meta", QUICKDEPLOY_REGISTRY_CURATION_META_KEY],
          message: parsed.error.issues.map((issue) => issue.message).join("; "),
        });
      }
    }
    const importMeta = meta[QUICKDEPLOY_REGISTRY_IMPORT_META_KEY];
    if (importMeta !== undefined) {
      const parsed = QuickDeployRegistryImportSchema.safeParse(importMeta);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          path: ["_meta", QUICKDEPLOY_REGISTRY_IMPORT_META_KEY],
          message: parsed.error.issues.map((issue) => issue.message).join("; "),
        });
      }
    }
    const monetization = meta[QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY];
    if (monetization !== undefined) {
      const parsed = QuickDeployRegistryMonetizationSchema.safeParse(monetization);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          path: ["_meta", QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY],
          message: parsed.error.issues.map((issue) => issue.message).join("; "),
        });
      }
    }
  });
export type WorkflowEntry = z.infer<typeof WorkflowEntrySchema>;

export const WorkflowsJsonEnvelopeSchema = z.object({
  $schema: z.string().optional(),
  workflows: z.array(WorkflowEntrySchema),
  _meta: z.record(z.string(), z.unknown()).optional(),
});
export type WorkflowsJsonEnvelope = z.infer<typeof WorkflowsJsonEnvelopeSchema>;

export function quickDeployRegistryCuration(
  entry: WorkflowEntry,
): QuickDeployRegistryCuration | undefined {
  const value = entry._meta?.[QUICKDEPLOY_REGISTRY_CURATION_META_KEY];
  const parsed = QuickDeployRegistryCurationSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function quickDeployRegistryMonetization(
  entry: WorkflowEntry,
): QuickDeployRegistryMonetization | undefined {
  const value = entry._meta?.[QUICKDEPLOY_REGISTRY_MONETIZATION_META_KEY];
  const parsed = QuickDeployRegistryMonetizationSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
