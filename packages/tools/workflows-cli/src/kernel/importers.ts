import { arazzoImporter } from "@quickdeployai/arazzo-2-workflows";
import { piAgentsImporter } from "@quickdeployai/pi-agents-2-workflows";
import { serverlessWorkflowImporter } from "@quickdeployai/serverless-workflow-2-workflows";
import type { WorkflowImporter } from "@quickdeployai/workflow-importer-kit";

/** Engine registry for CLI detect/compile. Wave 2/3 engines join as they land. */
export const IMPORTERS: ReadonlyArray<WorkflowImporter<unknown>> = [
  arazzoImporter as WorkflowImporter<unknown>,
  serverlessWorkflowImporter as WorkflowImporter<unknown>,
  piAgentsImporter as WorkflowImporter<unknown>,
];

export function importerFor(engine: string): WorkflowImporter<unknown> | undefined {
  return IMPORTERS.find((importer) => importer.id === engine);
}
