import type { KernelCommandContext } from "../kernel-commands.js";

/** bind/policy/run/inspect/approve — implemented in the M4 pass. */
export async function runGovernanceCli(
  command: string,
  context: KernelCommandContext,
): Promise<number> {
  process.stderr.write(
    `"${command}" is not wired yet in this build (root: ${context.rootDir}).\n`,
  );
  return 1;
}
