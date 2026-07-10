import {
  createPinnedResolver,
  ingestSourceFiles,
} from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { iftttImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

function artifactOf(value: unknown) {
  return ingestSourceFiles([{ path: "applet.json", text: JSON.stringify(value) }], {
    entrypoint: "applet.json",
  });
}

async function compileFixture(value: unknown) {
  const artifact = artifactOf(value);
  const parsed = await iftttImporter.parse(artifact, { resolver });
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.diagnostics));
  return iftttImporter.compile(parsed.model, {
    planId: "plan-1",
    planName: "Plan",
    artifactDigest: artifact.digest,
    entrypoint: "applet.json",
    resolver,
  });
}

const HAPPY_FIXTURE = {
  applet: {
    name: "Rain alert",
    trigger: { service: "weather", event: "tomorrows_forecast_calls_for_rain" },
    actions: [
      {
        service: "slack",
        action: "post_to_channel",
        fields: { channel: "#general", message: "Rain expected: {{TomorrowsCondition}}" },
        account: { id: "ifttt-account-5", label: "Team Slack auth" },
      },
      {
        service: "email",
        action: "send_me_an_email",
        fields: { subject: "Umbrella day", body: "It will rain tomorrow." },
      },
    ],
  },
};

describe("ifttt-2-workflows", () => {
  it("detects IFTTT applets and rejects other formats", async () => {
    expect((await iftttImporter.detect(artifactOf(HAPPY_FIXTURE))).confidence).toBe("exact");
    const other = artifactOf({ recipe: { actions: [{ provider: "p", action: "a" }] } });
    expect((await iftttImporter.detect(other)).detected).toBe(false);
  });

  it("compiles applet actions with ingredient lowering", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    expect(result.plan).toBeDefined();
    const plan = result.plan!;
    expect(validatePlan(plan)).toEqual([]);

    expect(plan.entryNodeId).toBe("slack-post_to_channel");
    expect(plan.nodes["slack-post_to_channel"]?.kind).toBe("invoke");
    expect(plan.nodes["email-send_me_an_email"]?.kind).toBe("invoke");
    expect(plan.nodes["__succeed"]?.kind).toBe("succeed");

    const byId = new Map(result.requirements.map((requirement) => [requirement.id, requirement]));
    expect(byId.get("slack-post_to_channel")?.operation).toBe("POST /chat.postMessage");
    expect(byId.get("slack-post_to_channel")?.effect).toBe("send");
    expect(byId.get("email-send_me_an_email")?.effect).toBe("send");

    const slack = plan.nodes["slack-post_to_channel"];
    if (slack?.kind === "invoke") {
      expect(slack.next).toBe("email-send_me_an_email");
      const input = slack.input;
      if (input.kind === "object" && input.entries.body?.kind === "object") {
        expect(input.entries.body.entries.message).toEqual({
          kind: "interpolate",
          parts: [
            { kind: "literal", value: "Rain expected: " },
            { kind: "input", path: ["tomorrowsCondition"] },
          ],
        });
      } else {
        throw new Error("expected object input with body");
      }
    }

    // trigger + ingredients are approximated, never blocked
    expect(result.fidelity.findings.some((f) => f.feature === "trigger" && f.status === "approximated")).toBe(true);
    expect(
      result.fidelity.findings.some((f) => f.feature === "ingredient" && f.status === "approximated"),
    ).toBe(true);
    expect(result.fidelity.findings.some((f) => f.status === "blocked")).toBe(false);
  });

  it("blocks compilation on unmapped service actions", async () => {
    const result = await compileFixture({
      applet: {
        name: "lights",
        trigger: { service: "weather", event: "sunset" },
        actions: [{ service: "philips_hue", action: "turn_on_lights", fields: {} }],
      },
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics.some((d) => d.code === "fidelity-blocking" && d.severity === "error")).toBe(true);
    expect(
      result.fidelity.findings.some(
        (f) => f.feature === "unmapped-connector" && f.status === "blocked",
      ),
    ).toBe(true);
  });

  it("never leaks account metadata into the compile result", async () => {
    const result = await compileFixture(HAPPY_FIXTURE);
    const text = JSON.stringify(result);
    expect(text).not.toContain("ifttt-account-5");
    expect(text).not.toContain("Team Slack auth");
    expect(text).not.toContain("account");
  });
});
