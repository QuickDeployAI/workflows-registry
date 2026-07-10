import { spawnSync } from "node:child_process";

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

export function createCosignSigner(options: { binary?: string; keyRef?: string } = {}): BundleSigner {
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

  return {
    async sign(bundleDigest) {
      const result = spawnSync(
        bin,
        ["sign-blob", "--yes", ...(keyRef ? ["--key", keyRef] : []), "-"],
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
        ["verify-blob", ...(keyRef ? ["--key", keyRef] : []), "--signature", signature, "-"],
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

export function createOrasClient(options: { binary?: string } = {}): OrasClient {
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
  return {
    async push(dir, reference) {
      const result = spawnSync(
        bin,
        ["push", reference, "--artifact-type", "application/vnd.oneclick.workflow.bundle.v1", "."],
        { encoding: "utf8", cwd: dir },
      );
      if (result.status !== 0) throw new SigningUnavailableError(`oras push failed: ${result.stderr}`);
      const match = /sha256:[0-9a-f]{64}/.exec(result.stdout);
      return { digest: match?.[0] ?? "" };
    },
    async pull(reference, dir) {
      const result = spawnSync(bin, ["pull", reference, "-o", dir], { encoding: "utf8" });
      if (result.status !== 0) throw new SigningUnavailableError(`oras pull failed: ${result.stderr}`);
    },
  };
}
