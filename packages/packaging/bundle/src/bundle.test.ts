import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WORKFLOW_BUNDLE_MEDIA_TYPE,
  packBundle,
  readBundleDir,
  verifyBundle,
  writeBundleDir,
  type PackBundleOptions,
} from "./bundle.js";
import { SigningUnavailableError, createCosignSigner, createLocalSigner, createOrasClient } from "./signing.js";

function options(): PackBundleOptions {
  return {
    metadata: {
      mediaType: WORKFLOW_BUNDLE_MEDIA_TYPE,
      name: "ai.quickdeploy/petstore-checkout",
      version: "0.1.0",
      publisher: "quickdeploy",
      license: "MIT",
      importer: { engine: "arazzo-2-workflows", versionRange: "*" },
      compiler: { name: "arazzo-2-workflows", version: "0.1.0" },
    },
    provenance: {
      sourceDigest: `sha256:${"a".repeat(64)}`,
      builder: "@quickdeployai/workflows-cli",
      builtWith: "workflow-bundle@0.1.0",
    },
    policyIntent: {
      planDigest: `sha256:${"b".repeat(64)}`,
      outboundHosts: ["petstore.example.com"],
      credentialHandles: [],
      effects: { read: 1, mutation: 1, send: 0, destructive: 0 },
      maxAgentSessions: 0,
      maxChildWorkflows: 0,
      writablePaths: [],
    },
    sourceFiles: [{ path: "petstore-checkout.arazzo.yaml", content: "arazzo: 1.1.0" }],
  };
}

describe("workflow bundles", () => {
  it("packs, round-trips through disk, and verifies", async () => {
    const bundle = packBundle(options());
    expect(bundle.bundleDigest).toMatch(/^sha256:/);
    const dir = await mkdtemp(join(tmpdir(), "wfbundle-"));
    await writeBundleDir(bundle, dir);
    const restored = await readBundleDir(dir);
    const verified = verifyBundle(restored);
    expect(verified.diagnostics).toEqual([]);
    expect(verified.valid).toBe(true);
    expect(verified.bundleDigest).toBe(bundle.bundleDigest);
  });

  it("packing is deterministic (same input, same digest)", () => {
    expect(packBundle(options()).bundleDigest).toBe(packBundle(options()).bundleDigest);
  });

  it("detects tampering, unlisted files, and missing provenance", () => {
    const bundle = packBundle(options());
    const tampered = bundle.files.map((file) =>
      file.path === "source/petstore-checkout.arazzo.yaml" ? { ...file, content: "arazzo: 9.9.9" } : file,
    );
    const tamperResult = verifyBundle(tampered);
    expect(tamperResult.valid).toBe(false);
    expect(tamperResult.diagnostics.map((diagnostic) => diagnostic.code)).toContain("digest-mismatch");

    const extra = [...bundle.files, { path: "sneaky.txt", content: "boo" }];
    expect(verifyBundle(extra).diagnostics.map((diagnostic) => diagnostic.code)).toContain("unlisted-file");

    const withoutProvenance = bundle.files.filter((file) => file.path !== "provenance.json");
    expect(verifyBundle(withoutProvenance).diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      "missing-required-file",
    );
  });

  it("local signer round-trips; cosign/ORAS fail closed without their binaries", async () => {
    const signer = createLocalSigner("test-secret");
    const { signature } = await signer.sign("sha256:abc");
    expect(await signer.verify("sha256:abc", signature)).toBe(true);
    expect(await signer.verify("sha256:def", signature)).toBe(false);

    const savedCosign = process.env.COSIGN_BIN;
    const savedOras = process.env.ORAS_BIN;
    delete process.env.COSIGN_BIN;
    delete process.env.ORAS_BIN;
    try {
      expect(() => createCosignSigner()).toThrow(SigningUnavailableError);
      expect(() => createOrasClient()).toThrow(SigningUnavailableError);
      expect(() => createCosignSigner({ binary: "/nonexistent/cosign" })).toThrow(SigningUnavailableError);
    } finally {
      if (savedCosign !== undefined) process.env.COSIGN_BIN = savedCosign;
      if (savedOras !== undefined) process.env.ORAS_BIN = savedOras;
    }
  });
});

// Live round-trip against real cosign/ORAS binaries and an OCI registry.
// Runs only when the environment provides all three (COSIGN_BIN + a key pair,
// ORAS_BIN, WORKFLOW_BUNDLE_TEST_REGISTRY); CI without them skips.
const LIVE = Boolean(
  process.env.COSIGN_BIN &&
    process.env.COSIGN_KEY_REF &&
    process.env.COSIGN_PUBLIC_KEY_REF &&
    process.env.ORAS_BIN &&
    process.env.WORKFLOW_BUNDLE_TEST_REGISTRY,
);

describe.skipIf(!LIVE)("live cosign + ORAS round-trip", () => {
  it("signs, pushes, pulls, and verifies a bundle against a real registry", async () => {
    const bundle = packBundle(options());

    const signer = createCosignSigner();
    const { signature, keyId } = await signer.sign(bundle.bundleDigest);
    expect(signature.length).toBeGreaterThan(0);
    expect(keyId).toBe(process.env.COSIGN_KEY_REF);
    expect(await signer.verify(bundle.bundleDigest, signature)).toBe(true);
    expect(await signer.verify(`sha256:${"0".repeat(64)}`, signature)).toBe(false);

    const pushDir = await mkdtemp(join(tmpdir(), "wfbundle-push-"));
    await writeBundleDir(bundle, pushDir);
    const oras = createOrasClient({ plainHttp: true });
    const reference = `${process.env.WORKFLOW_BUNDLE_TEST_REGISTRY}/quickdeploy/petstore-checkout:0.1.0`;
    const { digest } = await oras.push(pushDir, reference);
    expect(digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    const pullDir = await mkdtemp(join(tmpdir(), "wfbundle-pull-"));
    await oras.pull(reference, pullDir);
    const restored = await readBundleDir(pullDir);
    const verified = verifyBundle(restored);
    expect(verified.diagnostics).toEqual([]);
    expect(verified.valid).toBe(true);
    expect(verified.bundleDigest).toBe(bundle.bundleDigest);
    expect(await signer.verify(verified.bundleDigest ?? "", signature)).toBe(true);
  });
});
