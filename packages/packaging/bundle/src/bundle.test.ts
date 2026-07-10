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

    delete process.env.COSIGN_BIN;
    delete process.env.ORAS_BIN;
    expect(() => createCosignSigner()).toThrow(SigningUnavailableError);
    expect(() => createOrasClient()).toThrow(SigningUnavailableError);
    expect(() => createCosignSigner({ binary: "/nonexistent/cosign" })).toThrow(SigningUnavailableError);
  });
});
