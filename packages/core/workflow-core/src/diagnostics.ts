export type DiagnosticSeverity = "error" | "warning" | "info";

export interface Diagnostic {
  readonly severity: DiagnosticSeverity;
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export type Result<T> =
  | { readonly ok: true; readonly value: T; readonly diagnostics: Diagnostic[] }
  | { readonly ok: false; readonly diagnostics: Diagnostic[] };

export function ok<T>(value: T, diagnostics: Diagnostic[] = []): Result<T> {
  return { ok: true, value, diagnostics };
}

export function fail<T>(diagnostics: Diagnostic[]): Result<T> {
  return { ok: false, diagnostics };
}

export function errorDiagnostic(code: string, message: string, path?: string): Diagnostic {
  return { severity: "error", code, message, ...(path === undefined ? {} : { path }) };
}

export function warningDiagnostic(code: string, message: string, path?: string): Diagnostic {
  return { severity: "warning", code, message, ...(path === undefined ? {} : { path }) };
}

export function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

export function formatDiagnostics(diagnostics: readonly Diagnostic[]): string {
  return diagnostics
    .map(
      (diagnostic) =>
        `${diagnostic.severity}[${diagnostic.code}]${diagnostic.path ? ` at ${diagnostic.path}` : ""}: ${diagnostic.message}`,
    )
    .join("\n");
}
