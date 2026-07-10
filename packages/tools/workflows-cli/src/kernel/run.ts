import type { KernelCommandContext } from "../kernel-commands.js";

/**
 * Placeholder dispatcher — replaced as the kernel milestones land.
 * Keeping the module boundary here lets cli.mts stay stable while
 * detect/compile/bind/policy/run/inspect/approve grow real implementations.
 */
export async function runKernelCli(
  command: string,
  context: KernelCommandContext,
): Promise<number> {
  process.stderr.write(
    `"${command}" is not wired yet in this build (root: ${context.rootDir}).\n`,
  );
  return 1;
}
