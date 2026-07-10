import { errorDiagnostic, type Diagnostic } from "@quickdeployai/workflow-core";
import type { ExecutionPlanV1 } from "@quickdeployai/workflow-ir";
import { z } from "zod";

/**
 * A BindingLock is created at install/deploy time: it pins each capability
 * requirement of a plan (by digest) to a concrete implementation — a
 * particular MCP server/tool, OpenAPI operation endpoint, agent runtime, or
 * artifact namespace — plus a credential HANDLE (env name / broker ref,
 * never a value).
 */
export const CapabilityBindingSchema = z.object({
  requirementId: z.string().min(1),
  implementationId: z.string().min(1),
  implementationVersion: z.string().min(1),
  endpoint: z.string().optional(),
  toolName: z.string().optional(),
  schemaDigest: z.string().optional(),
  credentialHandle: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]*$/, "Credential handles are env-var names, never values.")
    .optional(),
});
export type CapabilityBinding = z.infer<typeof CapabilityBindingSchema>;

export const BindingLockSchema = z.object({
  planDigest: z.string().min(1),
  bindings: z.array(CapabilityBindingSchema),
});
export type BindingLock = z.infer<typeof BindingLockSchema>;

/**
 * Validate a lock against a plan: digest must match, every requirement must
 * be bound exactly once, and declared schema digests must agree.
 */
export function validateBindingLock(plan: ExecutionPlanV1, planDigest: string, lock: BindingLock): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (lock.planDigest !== planDigest) {
    diagnostics.push(
      errorDiagnostic(
        "binding-plan-digest-mismatch",
        `Lock targets plan ${lock.planDigest} but the plan digest is ${planDigest}.`,
      ),
    );
  }

  const byRequirement = new Map<string, CapabilityBinding>();
  for (const binding of lock.bindings) {
    if (byRequirement.has(binding.requirementId)) {
      diagnostics.push(
        errorDiagnostic(
          "duplicate-binding",
          `Requirement "${binding.requirementId}" is bound more than once.`,
        ),
      );
    }
    byRequirement.set(binding.requirementId, binding);
  }

  for (const requirement of plan.capabilityRequirements) {
    const binding = byRequirement.get(requirement.id);
    if (!binding) {
      diagnostics.push(
        errorDiagnostic(
          "unbound-requirement",
          `Capability requirement "${requirement.id}" (${requirement.protocol} ${requirement.operation}) has no binding.`,
          requirement.id,
        ),
      );
      continue;
    }
    if (
      requirement.inputSchemaDigest &&
      binding.schemaDigest &&
      requirement.inputSchemaDigest !== binding.schemaDigest
    ) {
      diagnostics.push(
        errorDiagnostic(
          "binding-schema-mismatch",
          `Binding for "${requirement.id}" pins schema ${binding.schemaDigest}; the plan requires ${requirement.inputSchemaDigest}.`,
          requirement.id,
        ),
      );
    }
    if ((requirement.protocol === "http" || requirement.protocol === "openapi") && !binding.endpoint) {
      diagnostics.push(
        errorDiagnostic(
          "binding-missing-endpoint",
          `HTTP/OpenAPI binding for "${requirement.id}" must declare an endpoint.`,
          requirement.id,
        ),
      );
    }
    if (requirement.protocol === "mcp" && !binding.toolName) {
      diagnostics.push(
        errorDiagnostic(
          "binding-missing-tool",
          `MCP binding for "${requirement.id}" must declare a toolName.`,
          requirement.id,
        ),
      );
    }
  }

  for (const binding of lock.bindings) {
    if (!plan.capabilityRequirements.some((requirement) => requirement.id === binding.requirementId)) {
      diagnostics.push(
        errorDiagnostic(
          "unknown-requirement-binding",
          `Lock binds "${binding.requirementId}" which the plan does not declare.`,
        ),
      );
    }
  }

  return diagnostics;
}
