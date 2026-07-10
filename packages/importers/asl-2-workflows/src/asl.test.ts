import { createPinnedResolver, ingestSourceFiles } from "@quickdeployai/workflow-importer-kit";
import { validatePlan } from "@quickdeployai/workflow-ir";
import { describe, expect, it } from "vitest";
import { aslImporter } from "./index.js";

const resolver = createPinnedResolver({ files: [] });

const FIXTURE = JSON.stringify({
  Comment: "Order pipeline",
  StartAt: "FetchOrder",
  States: {
    FetchOrder: {
      Type: "Task",
      Resource: "https://api.example.com/orders/fetch",
      Parameters: { "orderId.$": "$.orderId", channel: "web" },
      Retry: [{ ErrorEquals: ["States.ALL"], MaxAttempts: 4 }],
      Catch: [{ ErrorEquals: ["States.ALL"], Next: "FailState" }],
      ResultPath: "$.order",
      Next: "CheckTotal",
    },
    CheckTotal: {
      Type: "Choice",
      Choices: [{ Variable: "$.total", NumericGreaterThan: 100, Next: "Fanout" }],
      Default: "SmallOrder",
    },
    SmallOrder: { Type: "Pass", Next: "Cooldown" },
    Cooldown: { Type: "Wait", Seconds: 5, Next: "Done" },
    Fanout: {
      Type: "Parallel",
      Branches: [
        {
          StartAt: "NotifyA",
          States: {
            NotifyA: {
              Type: "Task",
              Resource: "arn:aws:lambda:us-east-1:123456789012:function:notify",
              End: true,
            },
          },
        },
        {
          StartAt: "NotifyB",
          States: {
            NotifyB: { Type: "Task", Resource: "https://hooks.example.com/notify", End: true },
          },
        },
      ],
      Next: "EachItem",
    },
    EachItem: {
      Type: "Map",
      ItemsPath: "$.items",
      MaxConcurrency: 2,
      ItemProcessor: {
        StartAt: "ShipItem",
        States: {
          ShipItem: { Type: "Task", Resource: "https://api.example.com/ship", End: true },
        },
      },
      Next: "Done",
    },
    Done: { Type: "Succeed" },
    FailState: { Type: "Fail", Error: "OrderFailed", Cause: "upstream error" },
  },
});

const BLOCKING_FIXTURE = JSON.stringify({
  StartAt: "Greet",
  States: {
    Greet: {
      Type: "Task",
      Resource: "https://api.example.com/greet",
      Parameters: { "greeting.$": "States.Format('Hello {}!', $.name)" },
      End: true,
    },
  },
});

function artifactOf(text: string, path = "workflow.asl.json") {
  return ingestSourceFiles([{ path, text }], { entrypoint: path });
}

describe("asl-2-workflows", () => {
  it("level 0: detects StartAt+States documents and rejects garbage", async () => {
    const detection = await aslImporter.detect(artifactOf(FIXTURE));
    expect(detection.detected).toBe(true);
    expect(detection.confidence).toBe("exact");

    expect((await aslImporter.detect(artifactOf('{"foo": []}'))).detected).toBe(false);
    expect((await aslImporter.detect(artifactOf("not json at all"))).detected).toBe(false);
  });

  it("level 1: parses and validates state routing", async () => {
    const parsed = await aslImporter.parse(artifactOf(FIXTURE), { resolver });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const report = await aslImporter.validate(parsed.model, { resolver });
    expect(report.valid).toBe(true);
    expect(report.diagnostics).toEqual([]);

    const broken = JSON.parse(FIXTURE) as { States: Record<string, { Next?: string }> };
    (broken.States.Cooldown as { Next?: string }).Next = "Nowhere";
    const brokenParsed = await aslImporter.parse(artifactOf(JSON.stringify(broken)), { resolver });
    expect(brokenParsed.ok).toBe(true);
    if (!brokenParsed.ok) return;
    const brokenReport = await aslImporter.validate(brokenParsed.model, { resolver });
    expect(brokenReport.valid).toBe(false);
    expect(brokenReport.diagnostics.map((diagnostic) => diagnostic.code)).toContain("unknown-next-target");
  });

  it("level 2: compiles Task/Choice/Wait/Parallel/Map/Pass/Succeed/Fail into a valid plan", async () => {
    const artifact = artifactOf(FIXTURE);
    const parsed = await aslImporter.parse(artifact, { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await aslImporter.compile(parsed.model, {
      planId: "order-pipeline",
      planName: "Order pipeline",
      artifactDigest: artifact.digest,
      resolver,
    });

    expect(result.plan).toBeDefined();
    const plan = result.plan;
    if (!plan) return;
    expect(validatePlan(plan)).toEqual([]);
    expect(plan.entryNodeId).toBe("FetchOrder");

    const fetch = plan.nodes.FetchOrder;
    expect(fetch?.kind).toBe("invoke");
    if (fetch?.kind === "invoke") {
      expect(fetch.retry?.maxAttempts).toBe(4);
      expect(fetch.onError).toBe("FailState");
      expect(fetch.effect).toBe("mutation");
      expect(fetch.idempotency).toEqual({
        kind: "deduplication-record",
        namespace: "order-pipeline:FetchOrder",
      });
      expect(fetch.input).toEqual({
        kind: "object",
        entries: {
          orderId: { kind: "input", path: ["orderId"] },
          channel: { kind: "literal", value: "web" },
        },
      });
    }

    const check = plan.nodes.CheckTotal;
    expect(check?.kind).toBe("choice");
    if (check?.kind === "choice") {
      expect(check.choices[0]?.then).toBe("Fanout");
      expect(check.choices[0]?.when).toEqual({
        kind: "compare",
        operator: "gt",
        left: { kind: "input", path: ["total"] },
        right: { kind: "literal", value: 100 },
      });
      expect(check.otherwise).toBe("SmallOrder");
    }

    expect(plan.nodes.SmallOrder?.kind).toBe("wait");
    expect(plan.nodes.Cooldown?.kind).toBe("wait");

    const fanout = plan.nodes.Fanout;
    expect(fanout?.kind).toBe("parallel");
    if (fanout?.kind === "parallel") {
      expect(fanout.branches).toEqual([
        { entryNodeId: "Fanout.NotifyA" },
        { entryNodeId: "Fanout.NotifyB" },
      ]);
      expect(fanout.next).toBe("EachItem");
    }

    const each = plan.nodes.EachItem;
    expect(each?.kind).toBe("forEach");
    if (each?.kind === "forEach") {
      expect(each.items).toEqual({ kind: "input", path: ["items"] });
      expect(each.bodyEntryNodeId).toBe("EachItem.ShipItem");
      expect(each.maxConcurrency).toBe(2);
    }

    expect(plan.nodes.Done?.kind).toBe("succeed");
    const failState = plan.nodes.FailState;
    expect(failState?.kind).toBe("fail");
    if (failState?.kind === "fail") {
      expect(failState.error).toBe("OrderFailed");
      expect(failState.message).toBe("upstream error");
    }

    expect(result.requirements.map((requirement) => requirement.id).sort()).toEqual([
      "EachItem.ShipItem",
      "Fanout.NotifyA",
      "Fanout.NotifyB",
      "FetchOrder",
    ]);
    const lambda = result.requirements.find((requirement) => requirement.id === "Fanout.NotifyA");
    expect(lambda?.provider).toBe("lambda");
    expect(plan.effects.outboundHosts).toEqual(["api.example.com", "hooks.example.com"]);

    expect(result.fidelity.findings.some((finding) => finding.status === "blocked")).toBe(false);
    expect(result.fidelity.findings.some((finding) => finding.status === "unsupported")).toBe(false);
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "pass" && finding.status === "approximated",
      ),
    ).toBe(true);
  });

  it("level 2: an intrinsic function blocks compilation with fidelity-blocking", async () => {
    const parsed = await aslImporter.parse(artifactOf(BLOCKING_FIXTURE), { resolver });
    if (!parsed.ok) throw new Error("parse failed");
    const result = await aslImporter.compile(parsed.model, {
      planId: "greeter",
      planName: "Greeter",
      resolver,
    });
    expect(result.plan).toBeUndefined();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.code).toBe("fidelity-blocking");
    expect(result.diagnostics[0]?.severity).toBe("error");
    expect(
      result.fidelity.findings.some(
        (finding) => finding.feature === "intrinsic-function" && finding.status === "unsupported",
      ),
    ).toBe(true);
  });
});
