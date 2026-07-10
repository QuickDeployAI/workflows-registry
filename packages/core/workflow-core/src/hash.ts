import { createHash } from "node:crypto";

export function sha256Hex(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Canonical JSON: object keys sorted recursively, no insignificant whitespace.
 * Used for content digests so semantically identical documents hash equally
 * regardless of property insertion order.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return Object.fromEntries(entries.map(([k, v]) => [k, sortValue(v)]));
  }
  return value;
}

/** `sha256:<hex>` digest of a JSON-serializable document's canonical form. */
export function contentDigest(value: unknown): string {
  return `sha256:${sha256Hex(canonicalJson(value))}`;
}
