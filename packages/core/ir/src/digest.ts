import { contentDigest } from "@quickdeployai/workflow-core";
import type { ExecutionPlanV1 } from "./plan.js";

/**
 * Plans are immutable; their identity is this digest. Diagnostics are
 * excluded — two compiles that produce the same executable graph share a
 * digest even when advisory diagnostics differ.
 */
export function computePlanDigest(plan: ExecutionPlanV1): string {
  const { diagnostics: _diagnostics, ...identity } = plan;
  return contentDigest(identity);
}
