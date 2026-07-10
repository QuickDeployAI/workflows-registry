import type { CapabilityRequirement } from "@quickdeployai/workflow-ir";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Mapping-pack data model: a MappingPack turns vendor node/module/action type
// keys into capability requirements. Adding coverage for a new vendor
// operation is data-only — no importer code changes.
// ---------------------------------------------------------------------------

export interface ConnectorMapping {
  protocol: "http" | "openapi" | "mcp";
  provider: string;
  /** e.g. "POST /crm/v3/objects/contacts"; HTTP_PASSTHROUGH_OPERATION for raw HTTP nodes. */
  operation: string;
  effect: "read" | "mutation" | "send" | "destructive";
  requiredScopes?: string[];
}

export interface MappingPack {
  /** "n8n" | "make" | "zapier" | ... */
  vendor: string;
  version: string;
  /** key = vendor node/module/action type. */
  mappings: Record<string, ConnectorMapping>;
}

export const ConnectorMappingSchema = z.object({
  protocol: z.enum(["http", "openapi", "mcp"]),
  provider: z.string().min(1),
  operation: z.string().min(1),
  effect: z.enum(["read", "mutation", "send", "destructive"]),
  requiredScopes: z.array(z.string()).optional(),
});

export const MappingPackSchema = z.object({
  vendor: z.string().min(1),
  version: z.string().min(1),
  mappings: z.record(z.string(), ConnectorMappingSchema),
});

/**
 * Marker operation for vendor nodes that carry their own URL (n8n httpRequest,
 * Make http:ActionSendData, ...). Importers special-case these: the concrete
 * method/path/host come from the vendor node's parameters, not the pack.
 */
export const HTTP_PASSTHROUGH_OPERATION = "HTTP *";

export function isHttpPassthrough(mapping: ConnectorMapping): boolean {
  return mapping.protocol === "http" && mapping.operation === HTTP_PASSTHROUGH_OPERATION;
}

export function resolveMapping(pack: MappingPack, vendorType: string): ConnectorMapping | undefined {
  return pack.mappings[vendorType];
}

export function mappingCoverage(
  pack: MappingPack,
  vendorTypes: string[],
): { mapped: string[]; unmapped: string[] } {
  const mapped: string[] = [];
  const unmapped: string[] = [];
  for (const vendorType of vendorTypes) {
    (pack.mappings[vendorType] === undefined ? unmapped : mapped).push(vendorType);
  }
  return { mapped, unmapped };
}

/** Build the IR capability requirement a mapped vendor node compiles to. */
export function toCapabilityRequirement(id: string, mapping: ConnectorMapping): CapabilityRequirement {
  return {
    id,
    protocol: mapping.protocol,
    provider: mapping.provider,
    operation: mapping.operation,
    requiredScopes: mapping.requiredScopes ?? [],
    effect: mapping.effect,
  };
}

// ---------------------------------------------------------------------------
// Credential sanitization: vendor exports embed credential/connection ids and
// names. Strip them at parse time so nothing credential-shaped can survive
// into models, plans, or fidelity reports.
// ---------------------------------------------------------------------------

const DEFAULT_CREDENTIAL_KEYS = [
  "credentials",
  "credential",
  "connection",
  "connections",
  "authentication",
  "account",
  "apikey",
  "token",
];

/**
 * Deep-removes credential-ish keys (case-insensitive) from a structuredClone
 * of `raw`. `extraKeys` adds vendor-specific key names (e.g. Make's
 * "__IMTCONN__") on top of the defaults.
 */
export function stripCredentialMetadata<T>(raw: T, extraKeys: string[] = []): T {
  const blockedKeys = new Set(
    [...DEFAULT_CREDENTIAL_KEYS, ...extraKeys].map((key) => key.toLowerCase()),
  );
  const clone = structuredClone(raw);
  scrub(clone, blockedKeys);
  return clone;
}

function scrub(value: unknown, blockedKeys: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) scrub(item, blockedKeys);
    return;
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (blockedKeys.has(key.toLowerCase())) {
        delete record[key];
      } else {
        scrub(record[key], blockedKeys);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Built-in starter packs. All data — extend by adding entries.
// ---------------------------------------------------------------------------

const SLACK_POST_MESSAGE: ConnectorMapping = {
  protocol: "http",
  provider: "slack",
  operation: "POST /chat.postMessage",
  effect: "send",
  requiredScopes: ["chat:write"],
};

const HUBSPOT_CREATE_CONTACT: ConnectorMapping = {
  protocol: "http",
  provider: "hubspot",
  operation: "POST /crm/v3/objects/contacts",
  effect: "mutation",
  requiredScopes: ["crm.objects.contacts.write"],
};

const GMAIL_SEND: ConnectorMapping = {
  protocol: "http",
  provider: "gmail",
  operation: "POST /gmail/v1/users/me/messages/send",
  effect: "send",
  requiredScopes: ["https://www.googleapis.com/auth/gmail.send"],
};

const HTTP_PASSTHROUGH: ConnectorMapping = {
  protocol: "http",
  provider: "http",
  operation: HTTP_PASSTHROUGH_OPERATION,
  effect: "mutation",
};

export const N8N_PACK: MappingPack = {
  vendor: "n8n",
  version: "1",
  mappings: {
    // httpRequest nodes carry their own URL/method — passthrough marker.
    "n8n-nodes-base.httpRequest": HTTP_PASSTHROUGH,
    "n8n-nodes-base.hubspot:contact:create": HUBSPOT_CREATE_CONTACT,
    "n8n-nodes-base.hubspot:contact:get": {
      protocol: "http",
      provider: "hubspot",
      operation: "GET /crm/v3/objects/contacts/{contactId}",
      effect: "read",
      requiredScopes: ["crm.objects.contacts.read"],
    },
    "n8n-nodes-base.slack:message:post": SLACK_POST_MESSAGE,
    "n8n-nodes-base.gmail:message:send": GMAIL_SEND,
  },
};

export const MAKE_PACK: MappingPack = {
  vendor: "make",
  version: "1",
  mappings: {
    "http:ActionSendData": HTTP_PASSTHROUGH,
    "slack:CreateMessage": SLACK_POST_MESSAGE,
    "hubspotcrm:createContact": HUBSPOT_CREATE_CONTACT,
    "gmail:ActionSendEmail": GMAIL_SEND,
  },
};

export const ZAPIER_PACK: MappingPack = {
  vendor: "zapier",
  version: "1",
  mappings: {
    "HubSpotCRM:create_contact": HUBSPOT_CREATE_CONTACT,
    "SlackV2:send_channel_message": SLACK_POST_MESSAGE,
    "Webhook:custom_request": HTTP_PASSTHROUGH,
    "GoogleSheetsV2:create_spreadsheet_row": {
      protocol: "http",
      provider: "google-sheets",
      operation: "POST /v4/spreadsheets/{spreadsheetId}/values/{range}:append",
      effect: "mutation",
      requiredScopes: ["https://www.googleapis.com/auth/spreadsheets"],
    },
  },
};

export const PIPEDREAM_PACK: MappingPack = {
  vendor: "pipedream",
  version: "1",
  mappings: {
    "slack-send-message": SLACK_POST_MESSAGE,
    "hubspot-create-contact": HUBSPOT_CREATE_CONTACT,
    "http-custom-request": HTTP_PASSTHROUGH,
    "airtable-create-record": {
      protocol: "http",
      provider: "airtable",
      operation: "POST /v0/{baseId}/{tableIdOrName}",
      effect: "mutation",
      requiredScopes: ["data.records:write"],
    },
  },
};

export const WORKATO_PACK: MappingPack = {
  vendor: "workato",
  version: "1",
  mappings: {
    "salesforce:create_record": {
      protocol: "http",
      provider: "salesforce",
      operation: "POST /services/data/v59.0/sobjects/{object}",
      effect: "mutation",
      requiredScopes: ["api"],
    },
    "salesforce:search_records": {
      protocol: "http",
      provider: "salesforce",
      operation: "GET /services/data/v59.0/query",
      effect: "read",
      requiredScopes: ["api"],
    },
    "slack:post_message": SLACK_POST_MESSAGE,
  },
};

export const IFTTT_PACK: MappingPack = {
  vendor: "ifttt",
  version: "1",
  mappings: {
    "slack:post_to_channel": SLACK_POST_MESSAGE,
    "email:send_me_an_email": {
      protocol: "http",
      provider: "email",
      operation: "POST /messages",
      effect: "send",
    },
    "notifications:send_notification": {
      protocol: "http",
      provider: "ifttt",
      operation: "POST /notifications",
      effect: "send",
    },
  },
};

export const POWER_AUTOMATE_PACK: MappingPack = {
  vendor: "power-automate",
  version: "1",
  mappings: {
    "shared_office365/SendEmailV2": {
      protocol: "http",
      provider: "office365",
      operation: "POST /v2/me/sendMail",
      effect: "send",
      requiredScopes: ["Mail.Send"],
    },
    "shared_sharepointonline/PostItem": {
      protocol: "http",
      provider: "sharepoint",
      operation: "POST /sites/{site}/lists/{list}/items",
      effect: "mutation",
      requiredScopes: ["Sites.ReadWrite.All"],
    },
    "shared_teams/PostMessageToConversation": {
      protocol: "http",
      provider: "teams",
      operation: "POST /v3/conversations/{conversationId}/activities",
      effect: "send",
      requiredScopes: ["ChannelMessage.Send"],
    },
  },
};

export const BUILT_IN_PACKS: Record<string, MappingPack> = {
  n8n: N8N_PACK,
  make: MAKE_PACK,
  zapier: ZAPIER_PACK,
  pipedream: PIPEDREAM_PACK,
  workato: WORKATO_PACK,
  ifttt: IFTTT_PACK,
  "power-automate": POWER_AUTOMATE_PACK,
};
