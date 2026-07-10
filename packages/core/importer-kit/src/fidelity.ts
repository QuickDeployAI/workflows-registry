import type { FidelityFinding, FidelityReport, FidelityStatus } from "@quickdeployai/workflow-ir";

/** Collects fidelity findings during compilation. */
export class FidelityCollector {
  private readonly findings: FidelityFinding[] = [];

  add(feature: string, status: FidelityStatus, detail?: string, path?: string): void {
    this.findings.push({
      feature,
      status,
      ...(detail === undefined ? {} : { detail }),
      ...(path === undefined ? {} : { path }),
    });
  }

  exact(feature: string, path?: string): void {
    this.add(feature, "exact", undefined, path);
  }

  approximated(feature: string, detail: string, path?: string): void {
    this.add(feature, "approximated", detail, path);
  }

  unsupported(feature: string, detail: string, path?: string): void {
    this.add(feature, "unsupported", detail, path);
  }

  blocked(feature: string, detail: string, path?: string): void {
    this.add(feature, "blocked", detail, path);
  }

  /** Unsupported/blocked findings that affect execution must fail compilation. */
  hasBlocking(): boolean {
    return this.findings.some(
      (finding) => finding.status === "unsupported" || finding.status === "blocked",
    );
  }

  report(): FidelityReport {
    return { findings: [...this.findings] };
  }
}

export function summarizeFidelity(report: FidelityReport): Record<FidelityStatus, number> {
  const summary: Record<FidelityStatus, number> = {
    exact: 0,
    approximated: 0,
    unsupported: 0,
    blocked: 0,
  };
  for (const finding of report.findings) summary[finding.status] += 1;
  return summary;
}
