export interface KernelCommandContext {
  rootDir: string;
  positionals: string[];
  flags: Map<string, string | boolean>;
}

type KernelCommand = "detect" | "compile" | "bind" | "policy" | "run" | "inspect" | "approve";

/**
 * Kernel-era commands (detect/compile/bind/policy/run/inspect/approve) are
 * implemented in ./kernel/ and wired here so cli.mts stays a thin dispatcher.
 */
export async function runKernelCommand(
  command: KernelCommand | string,
  context: KernelCommandContext,
): Promise<number> {
  const { runKernelCli } = await import("./kernel/run.js");
  return runKernelCli(command, context);
}
