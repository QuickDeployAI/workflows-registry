import { fetchTextSource, sha256Hex } from "@quickdeployai/workflow-core";

export interface PinnedArtifact {
  text: string;
  digest: string;
  ref: string;
}

export interface ReferenceRequest {
  /** Relative path within the artifact, or an absolute http(s) URL. */
  ref: string;
  /** Required for remote refs: expected sha256:<hex> of the bytes. */
  digest?: string;
}

/**
 * SSRF-safe reference resolution: relative refs resolve inside the source
 * artifact only (no traversal); remote refs require BOTH an allowlisted host
 * and a content digest pin. Nothing else resolves — fail closed.
 */
export interface ReferenceResolver {
  resolve(request: ReferenceRequest): Promise<PinnedArtifact>;
}

export interface CreateResolverOptions {
  files: ReadonlyArray<{ path: string; text: string }>;
  allowedHosts?: string[];
  /** Test seam; defaults to the digest-verifying, redirect-refusing fetcher. */
  fetchText?: (url: string, digest: string) => Promise<string>;
}

export function createPinnedResolver(options: CreateResolverOptions): ReferenceResolver {
  const byPath = new Map(options.files.map((file) => [normalizeRelative(file.path), file.text]));
  const allowedHosts = new Set(options.allowedHosts ?? []);
  const fetchText =
    options.fetchText ??
    (async (url: string, digest: string) => fetchTextSource(url, { digest }));

  return {
    async resolve(request) {
      const ref = request.ref.trim();

      if (ref.startsWith("http://")) {
        throw new Error(`Refusing plaintext http reference "${ref}".`);
      }

      if (ref.startsWith("https://")) {
        const host = new URL(ref).host;
        if (!allowedHosts.has(host)) {
          throw new Error(`Host "${host}" is not on the reference allowlist.`);
        }
        if (!request.digest) {
          throw new Error(`Remote reference "${ref}" must be digest-pinned.`);
        }
        const text = await fetchText(ref, request.digest);
        return { text, digest: request.digest, ref };
      }

      const normalized = normalizeRelative(ref);
      const text = byPath.get(normalized);
      if (text === undefined) {
        throw new Error(`Reference "${ref}" does not exist in the source artifact.`);
      }
      return { text, digest: `sha256:${sha256Hex(text)}`, ref: normalized };
    },
  };
}

/** Reject traversal/absolute paths; normalize ./ prefixes. */
export function normalizeRelative(path: string): string {
  const cleaned = path.replace(/^\.\//, "");
  if (cleaned.startsWith("/") || cleaned.startsWith("\\") || /^[A-Za-z]:/.test(cleaned)) {
    throw new Error(`Absolute paths are not allowed in source artifacts: "${path}".`);
  }
  const segments = cleaned.split("/");
  if (segments.includes("..")) {
    throw new Error(`Path traversal is not allowed in source artifacts: "${path}".`);
  }
  return segments.join("/");
}
