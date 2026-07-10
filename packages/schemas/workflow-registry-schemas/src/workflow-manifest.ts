import { z } from "zod";

/** Registry names are namespaced under the QuickDeploy reverse-DNS prefix. */
export const WORKFLOW_NAME_PATTERN = /^ai\.quickdeploy\/[A-Za-z0-9._-]+$/;

/** Exact semver only — no ranges, no `latest`. */
export const EXACT_VERSION_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

/** Importer engines are named `<source>-2-workflows`. */
export const WORKFLOW_IMPORTER_ENGINE_PATTERN = /^[a-z0-9][a-z0-9-]*-2-workflows$/;

export const SHA256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;

/** Immutable git commit pins: 40-hex (sha1) or 64-hex (sha256) object names. */
export const IMMUTABLE_GIT_REF_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

/** Secrets are referenced by env-var NAME only — never by value. */
export const ENV_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export const WORKFLOW_OUTPUT_PATH_PATTERN = /^workflows\/[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/;

export const WorkflowSourceSchema = z.object({
  type: z.enum(["http", "file", "git", "oci"]),
  uri: z.string().min(1),
  digest: z.string().regex(SHA256_DIGEST_PATTERN).optional(),
  ref: z.string().min(1).optional(),
});
export type WorkflowSource = z.infer<typeof WorkflowSourceSchema>;

export const WorkflowEnvRequirementSchema = z.object({
  name: z.string().regex(ENV_NAME_PATTERN, "Env requirements use SCREAMING_SNAKE names only."),
  description: z.string().max(200).optional(),
  secret: z.boolean().default(false),
});

export const ExecutionBudgetSchema = z.object({
  maxIterations: z.number().int().positive().default(16),
  maxParallelism: z.number().int().positive().default(8),
  maxDepth: z.number().int().positive().default(4),
  maxChildren: z.number().int().positive().default(16),
});
export type ExecutionBudget = z.infer<typeof ExecutionBudgetSchema>;

export const WorkflowManifestSchema = z
  .object({
    apiVersion: z.literal("quickdeploy.ai/v1"),
    kind: z.literal("WorkflowManifest"),
    metadata: z.object({
      name: z.string().regex(WORKFLOW_NAME_PATTERN),
      version: z.string().regex(EXACT_VERSION_PATTERN, "Exact semver versions only."),
      title: z.string().max(100).optional(),
      description: z.string().max(100).optional(),
      labels: z.array(z.string().min(1)).default([]),
    }),
    spec: z.object({
      importer: z.object({
        engine: z.string().regex(WORKFLOW_IMPORTER_ENGINE_PATTERN),
        versionRange: z.string().min(1).default("*"),
      }),
      source: WorkflowSourceSchema,
      /** Entry file/document inside multi-file sources. */
      entrypoint: z.string().min(1).optional(),
      config: z.record(z.string(), z.unknown()).optional(),
      requirements: z
        .object({
          env: z.array(WorkflowEnvRequirementSchema).default([]),
        })
        .optional(),
      budgets: ExecutionBudgetSchema.optional(),
      output: z
        .object({
          path: z.string().regex(WORKFLOW_OUTPUT_PATH_PATTERN),
        })
        .optional(),
    }),
    _meta: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((manifest, ctx) => {
    const source = manifest.spec.source;
    if ((source.type === "http" || source.type === "oci") && !source.digest) {
      ctx.addIssue({
        code: "custom",
        path: ["spec", "source", "digest"],
        message: `${source.type} sources must be pinned with a sha256: digest.`,
      });
    }
    if (
      source.type === "git" &&
      !source.digest &&
      !(source.ref && IMMUTABLE_GIT_REF_PATTERN.test(source.ref))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["spec", "source", "ref"],
        message: "git sources must pin an immutable commit SHA (ref) or a sha256: digest.",
      });
    }
  });

export type WorkflowManifest = z.infer<typeof WorkflowManifestSchema>;

/**
 * Per-engine importer config JSON Schemas, exposed by
 * `workflows-cli config-schema --importer <engine>`. Wave-1 engines are
 * registered here; later waves extend this map as their importers land.
 */
export const WORKFLOW_IMPORTER_CONFIG_SCHEMAS: Record<string, Record<string, unknown>> = {
  "arazzo-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      allowedHosts: {
        type: "array",
        items: { type: "string" },
        description: "Domain allowlist for resolving referenced OpenAPI documents.",
      },
      workflowId: {
        type: "string",
        description: "Arazzo workflowId to compile when the document declares several.",
      },
    },
  },
  "serverless-workflow-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      allowedHosts: { type: "array", items: { type: "string" } },
      acceptOneclickPackage: {
        type: "boolean",
        description:
          "Unwrap oneclick.workflow.package.v1 documents (canonicalSpec.document) before compiling.",
        default: true,
      },
    },
  },
  "pi-agents-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      defaultAgentBinding: {
        type: "string",
        description: "Capability requirement id used for agent nodes without an explicit binding.",
      },
    },
  },
  "asl-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      serviceIntegrationMappings: {
        type: "object",
        description: "Optional overrides mapping AWS service ARN patterns to capability providers.",
        additionalProperties: { type: "string" },
      },
    },
  },
  "logic-apps-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {},
  },
  "google-workflows-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {},
  },
  "n8n-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string", description: "Mapping pack id (defaults to built-in n8n pack)." },
    },
  },
  "make-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string" },
    },
  },
  "power-automate-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string" },
    },
  },
  "zapier-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string" },
    },
  },
  "pipedream-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string" },
    },
  },
  "workato-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string" },
    },
  },
  "ifttt-2-workflows": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    properties: {
      mappingPack: { type: "string" },
    },
  },
};

export function getWorkflowImporterConfigSchema(
  engine: string,
): Record<string, unknown> | undefined {
  return WORKFLOW_IMPORTER_CONFIG_SCHEMAS[engine];
}
