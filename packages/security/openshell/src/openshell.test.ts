import { describe, expect, it } from "vitest";
import {
  OpenShellUnavailableError,
  assertOpenShellAvailable,
  renderOpenShellPolicy,
} from "./index.js";

describe("OpenShell policy rendering", () => {
  it("renders default-deny network, read-only filesystem, and no raw credentials", () => {
    const yaml = renderOpenShellPolicy({
      planDigest: "sha256:abc123",
      allowedHosts: [],
      allowedCredentials: [],
      allowedEffects: ["read"],
      approvalRequiredEffects: ["destructive"],
      maxAgentSessions: 0,
      maxChildWorkflows: 0,
      writablePaths: [],
    });
    expect(yaml).toContain("defaultAction: deny");
    expect(yaml).toContain("action: deny");
    expect(yaml).toContain("mode: read-only");
    expect(yaml).toContain("rawAccess: deny");
  });

  it("renders allowlists when the effective policy grants them", () => {
    const yaml = renderOpenShellPolicy({
      planDigest: "sha256:def456",
      allowedHosts: ["api.example.com"],
      allowedCredentials: ["API_TOKEN"],
      allowedEffects: ["read", "mutation"],
      approvalRequiredEffects: [],
      maxAgentSessions: 2,
      maxChildWorkflows: 4,
      writablePaths: ["/workspace"],
    });
    expect(yaml).toContain("action: allowlist");
    expect(yaml).toContain("api.example.com");
    expect(yaml).toContain("API_TOKEN");
    expect(yaml).toContain("/workspace");
  });
});

describe("MXC availability", () => {
  it("fails closed when the runtime is missing or not runnable", () => {
    delete process.env.OPENSHELL_BIN;
    expect(() => assertOpenShellAvailable(undefined)).toThrow(OpenShellUnavailableError);
    expect(() => assertOpenShellAvailable("/nonexistent/openshell")).toThrow(
      OpenShellUnavailableError,
    );
  });
});
