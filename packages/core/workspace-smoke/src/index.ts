export function workspacePackageKinds(): readonly string[] {
  return [
    "core",
    "importers",
    "runtime",
    "agent-runtime",
    "security",
    "packaging",
    "schemas",
    "tools",
  ] as const;
}
