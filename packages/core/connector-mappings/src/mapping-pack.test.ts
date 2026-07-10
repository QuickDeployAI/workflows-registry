import { describe, expect, it } from "vitest";
import {
  BUILT_IN_PACKS,
  HTTP_PASSTHROUGH_OPERATION,
  MappingPackSchema,
  N8N_PACK,
  POWER_AUTOMATE_PACK,
  isHttpPassthrough,
  mappingCoverage,
  resolveMapping,
  stripCredentialMetadata,
  toCapabilityRequirement,
} from "./index.js";

describe("mapping packs", () => {
  it("all built-in packs conform to MappingPackSchema", () => {
    for (const [vendor, pack] of Object.entries(BUILT_IN_PACKS)) {
      const parsed = MappingPackSchema.safeParse(pack);
      expect(parsed.success, `${vendor} pack must be schema-valid`).toBe(true);
    }
  });

  it("resolveMapping returns the mapping for a known vendor type", () => {
    const mapping = resolveMapping(N8N_PACK, "n8n-nodes-base.slack:message:post");
    expect(mapping).toBeDefined();
    expect(mapping?.provider).toBe("slack");
    expect(mapping?.operation).toBe("POST /chat.postMessage");
    expect(mapping?.effect).toBe("send");
  });

  it("resolveMapping returns undefined for unknown vendor types", () => {
    expect(resolveMapping(N8N_PACK, "n8n-nodes-base.doesNotExist")).toBeUndefined();
  });

  it("marks httpRequest as an HTTP passthrough", () => {
    const mapping = resolveMapping(N8N_PACK, "n8n-nodes-base.httpRequest");
    expect(mapping).toBeDefined();
    expect(mapping?.operation).toBe(HTTP_PASSTHROUGH_OPERATION);
    expect(mapping && isHttpPassthrough(mapping)).toBe(true);
    const slack = resolveMapping(N8N_PACK, "n8n-nodes-base.slack:message:post");
    expect(slack && isHttpPassthrough(slack)).toBe(false);
  });

  it("maps power-automate connection operations", () => {
    const mapping = resolveMapping(POWER_AUTOMATE_PACK, "shared_office365/SendEmailV2");
    expect(mapping?.provider).toBe("office365");
    expect(mapping?.operation).toBe("POST /v2/me/sendMail");
    expect(mapping?.effect).toBe("send");
  });

  it("mappingCoverage partitions mapped and unmapped vendor types", () => {
    const coverage = mappingCoverage(N8N_PACK, [
      "n8n-nodes-base.httpRequest",
      "n8n-nodes-base.hubspot:contact:create",
      "n8n-nodes-base.mysteryApp",
    ]);
    expect(coverage.mapped).toEqual([
      "n8n-nodes-base.httpRequest",
      "n8n-nodes-base.hubspot:contact:create",
    ]);
    expect(coverage.unmapped).toEqual(["n8n-nodes-base.mysteryApp"]);
  });

  it("toCapabilityRequirement carries the mapping into an IR requirement", () => {
    const mapping = resolveMapping(N8N_PACK, "n8n-nodes-base.hubspot:contact:create");
    if (!mapping) throw new Error("mapping missing");
    const requirement = toCapabilityRequirement("Create Contact", mapping);
    expect(requirement).toEqual({
      id: "Create Contact",
      protocol: "http",
      provider: "hubspot",
      operation: "POST /crm/v3/objects/contacts",
      requiredScopes: ["crm.objects.contacts.write"],
      effect: "mutation",
    });
  });
});

describe("stripCredentialMetadata", () => {
  it("deep-removes credential-shaped keys, case-insensitively", () => {
    const raw = {
      name: "wf",
      nodes: [
        {
          name: "a",
          credentials: { slackApi: { id: "cred-123", name: "Team Slack" } },
          parameters: {
            nested: { apiKey: "sk-live-XYZ", Token: "tok_456", keep: "yes" },
          },
        },
      ],
      Connection: { id: "conn-789" },
      settings: { AUTHENTICATION: "basic", account: "acct-1" },
    };
    const stripped = stripCredentialMetadata(raw);
    const text = JSON.stringify(stripped);
    expect(text).not.toContain("cred-123");
    expect(text).not.toContain("Team Slack");
    expect(text).not.toContain("sk-live-XYZ");
    expect(text).not.toContain("tok_456");
    expect(text).not.toContain("conn-789");
    expect(text).not.toContain("basic");
    expect(text).not.toContain("acct-1");
    expect(text).toContain("keep");
    // non-credential structure is preserved
    expect(stripped.nodes[0]?.name).toBe("a");
  });

  it("does not mutate the input and honors extra vendor keys", () => {
    const raw = { flow: [{ parameters: { __IMTCONN__: 998877, url: "https://x" } }] };
    const stripped = stripCredentialMetadata(raw, ["__IMTCONN__"]);
    expect(JSON.stringify(stripped)).not.toContain("998877");
    // original untouched
    expect(raw.flow[0]?.parameters.__IMTCONN__).toBe(998877);
    expect(stripped.flow[0]?.parameters.url).toBe("https://x");
  });

  it("handles arrays and null values", () => {
    const raw = {
      items: [null, { token: "t-1" }, [{ credentials: { id: "c-2" } }]],
      empty: null,
    };
    const text = JSON.stringify(stripCredentialMetadata(raw));
    expect(text).not.toContain("t-1");
    expect(text).not.toContain("c-2");
  });
});
