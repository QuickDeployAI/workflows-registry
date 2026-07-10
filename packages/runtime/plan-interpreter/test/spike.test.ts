import { describe, expect, it } from "vitest";
import { start, resumeHook } from "workflow/api";
import { waitForHook } from "@workflow/vitest";
import { spikeHookWorkflow, spikeWorkflow } from "../workflows/spike.js";

describe("workflow SDK spike (real Local World)", () => {
  it("runs a workflow with a step", async () => {
    const run = await start(spikeWorkflow, [20]);
    await expect(run.returnValue).resolves.toBe(41);
  });

  it("suspends on a hook and resumes with external data", async () => {
    const run = await start(spikeHookWorkflow, ["spike:approval"]);
    const hook = await waitForHook(run, { token: "spike:approval" });
    await resumeHook(hook.token, { note: "resumed" });
    await expect(run.returnValue).resolves.toBe("resumed");
  });
});
