import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

/**
 * Signing + distribution seams. Real cosign/ORAS integration is env-gated:
 * without the binaries these constructors FAIL CLOSED rather than producing
 * unsigned/unpushed bundles that look signed.
 */
export interface BundleSigner {
  sign(bundleDigest: string): Promise<{ signature: string; keyId: string }>;
  verify(bundleDigest: string, signature: string): Promise<boolean>;
}

export class SigningUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SigningUnavailableError";
  }
}

export interface CosignSignerOptions {
  binary?: string;
  /** Private key reference for signing (COSIGN_KEY_REF). Empty = keyless. */
  keyRef?: string;
  /**
   * Public key reference for verification (COSIGN_PUBLIC_KEY_REF). Required
   * for key-based flows: cosign refuses to verify against a private key.
   */
  publicKeyRef?: string;
  /**
   * Upload signatures to the public Rekor transparency log. Off by default so
   * local/CI signing never publishes digests to a public log by accident;
   * production release pipelines opt in.
   */
  uploadTlog?: boolean;
}

export function createCosignSigner(options: CosignSignerOptions = {}): BundleSigner {
  const bin = options.binary ?? process.env.COSIGN_BIN;
  if (!bin) {
    throw new SigningUnavailableError(
      "cosign is not configured (COSIGN_BIN unset); refusing to produce unsigned bundles silently.",
    );
  }
  const probe = spawnSync(bin, ["version"], { encoding: "utf8" });
  if (probe.error || probe.status !== 0) {
    throw new SigningUnavailableError(`cosign binary "${bin}" is not runnable.`);
  }
  const keyRef = options.keyRef ?? process.env.COSIGN_KEY_REF ?? "";
  const publicKeyRef = options.publicKeyRef ?? process.env.COSIGN_PUBLIC_KEY_REF ?? "";
  const uploadTlog = options.uploadTlog ?? false;
  if (keyRef && !publicKeyRef) {
    throw new SigningUnavailableError(
      "cosign key-based signing needs COSIGN_PUBLIC_KEY_REF for verification (verify-blob rejects private keys).",
    );
  }

  return {
    async sign(bundleDigest) {
      const result = spawnSync(
        bin,
        [
          "sign-blob",
          "--yes",
          `--tlog-upload=${uploadTlog}`,
          ...(keyRef ? ["--key", keyRef] : []),
          "-",
        ],
        { encoding: "utf8", input: bundleDigest },
      );
      if (result.status !== 0) {
        throw new SigningUnavailableError(`cosign sign-blob failed: ${result.stderr}`);
      }
      return { signature: result.stdout.trim(), keyId: keyRef || "keyless" };
    },
    async verify(bundleDigest, signature) {
      const result = spawnSync(
        bin,
        [
          "verify-blob",
          ...(publicKeyRef ? ["--key", publicKeyRef] : []),
          ...(uploadTlog ? [] : ["--insecure-ignore-tlog"]),
          "--signature",
          signature,
          "-",
        ],
        { encoding: "utf8", input: bundleDigest },
      );
      return result.status === 0;
    },
  };
}

/** Deterministic in-process signer for tests and local development. */
export function createLocalSigner(secret: string): BundleSigner {
  const signatureOf = async (digest: string): Promise<string> => {
    const { createHmac } = await import("node:crypto");
    return createHmac("sha256", secret).update(digest).digest("hex");
  };
  return {
    async sign(bundleDigest) {
      return { signature: await signatureOf(bundleDigest), keyId: "local-hmac" };
    },
    async verify(bundleDigest, signature) {
      return (await signatureOf(bundleDigest)) === signature;
    },
  };
}

export interface OrasClient {
  push(dir: string, reference: string): Promise<{ digest: string }>;
  pull(reference: string, dir: string): Promise<void>;
}

export interface OrasClientOptions {
  binary?: string;
  /** Allow http:// registries (local test registries). ORAS_PLAIN_HTTP=1. */
  plainHttp?: boolean;
}

export function createOrasClient(options: OrasClientOptions = {}): OrasClient {
  const bin = options.binary ?? process.env.ORAS_BIN;
  if (!bin) {
    throw new SigningUnavailableError(
      "ORAS is not configured (ORAS_BIN unset); bundle distribution fails closed.",
    );
  }
  const probe = spawnSync(bin, ["version"], { encoding: "utf8" });
  if (probe.error || probe.status !== 0) {
    throw new SigningUnavailableError(`oras binary "${bin}" is not runnable.`);
  }
  const plainHttp = options.plainHttp ?? process.env.ORAS_PLAIN_HTTP === "1";
  const plainHttpArgs = plainHttp ? ["--plain-http"] : [];

  return {
    async push(dir, reference) {
      // Enumerate bundle entries explicitly so the pulled layout matches
      // readBundleDir exactly (pushing "." would nest everything one level).
      const entries = readdirSync(dir);
      if (entries.length === 0) {
        throw new SigningUnavailableError(`oras push refused: bundle dir "${dir}" is empty.`);
      }
      const result = spawnSync(
        bin,
        [
          "push",
          ...plainHttpArgs,
          reference,
          "--artifact-type",
          "application/vnd.oneclick.workflow.bundle.v1",
          ...entries,
        ],
        { encoding: "utf8", cwd: dir },
      );
      if (result.status !== 0) throw new SigningUnavailableError(`oras push failed: ${result.stderr}`);
      const match = /sha256:[0-9a-f]{64}/.exec(`${result.stdout}\n${result.stderr}`);
      return { digest: match?.[0] ?? "" };
    },
    async pull(reference, dir) {
      const result = spawnSync(bin, ["pull", ...plainHttpArgs, reference, "-o", dir], {
        encoding: "utf8",
      });
      if (result.status !== 0) throw new SigningUnavailableError(`oras pull failed: ${result.stderr}`);
    },
  };
}
