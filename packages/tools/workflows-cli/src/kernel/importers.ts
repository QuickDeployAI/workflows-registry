import { arazzoImporter } from "@quickdeployai/arazzo-2-workflows";
import { aslImporter } from "@quickdeployai/asl-2-workflows";
import { googleWorkflowsImporter } from "@quickdeployai/google-workflows-2-workflows";
import { iftttImporter } from "@quickdeployai/ifttt-2-workflows";
import { logicAppsImporter } from "@quickdeployai/logic-apps-2-workflows";
import { makeImporter } from "@quickdeployai/make-2-workflows";
import { n8nImporter } from "@quickdeployai/n8n-2-workflows";
import { piAgentsImporter } from "@quickdeployai/pi-agents-2-workflows";
import { pipedreamImporter } from "@quickdeployai/pipedream-2-workflows";
import { powerAutomateImporter } from "@quickdeployai/power-automate-2-workflows";
import { serverlessWorkflowImporter } from "@quickdeployai/serverless-workflow-2-workflows";
import { workatoImporter } from "@quickdeployai/workato-2-workflows";
import { zapierImporter } from "@quickdeployai/zapier-2-workflows";
import type { WorkflowImporter } from "@quickdeployai/workflow-importer-kit";

/** Engine registry for CLI detect/compile, in wave order. */
export const IMPORTERS: ReadonlyArray<WorkflowImporter<unknown>> = [
  // Wave 1 — spec-first formats, executable end-to-end on the kernel.
  arazzoImporter as WorkflowImporter<unknown>,
  serverlessWorkflowImporter as WorkflowImporter<unknown>,
  piAgentsImporter as WorkflowImporter<unknown>,
  // Wave 2 — cloud orchestrators.
  aslImporter as WorkflowImporter<unknown>,
  logicAppsImporter as WorkflowImporter<unknown>,
  googleWorkflowsImporter as WorkflowImporter<unknown>,
  // Wave 3 — vendor automation platforms via connector mapping packs.
  n8nImporter as WorkflowImporter<unknown>,
  makeImporter as WorkflowImporter<unknown>,
  powerAutomateImporter as WorkflowImporter<unknown>,
  zapierImporter as WorkflowImporter<unknown>,
  pipedreamImporter as WorkflowImporter<unknown>,
  workatoImporter as WorkflowImporter<unknown>,
  iftttImporter as WorkflowImporter<unknown>,
];

export function importerFor(engine: string): WorkflowImporter<unknown> | undefined {
  return IMPORTERS.find((importer) => importer.id === engine);
}
