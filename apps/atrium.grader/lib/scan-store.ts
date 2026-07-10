import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  DiagnosticStepResult,
  RestaurantGrowthProfile,
  RestaurantGrowthReport,
} from "@atrium/application"

export type ScanEvidence = {
  readonly scanId: string
  readonly selectedPlaceId: string
  readonly providerName: RestaurantGrowthReport["dataQuality"]["provider"]
  readonly profile: RestaurantGrowthProfile
  readonly diagnosticSteps: readonly DiagnosticStepResult[]
  readonly providerErrors: readonly string[]
  readonly report: RestaurantGrowthReport
  readonly scoringVersion: string
  readonly providerVersions: Record<string, string>
  readonly createdAt: string
}

type ScanLogSummary = {
  readonly scanId: string
  readonly selectedPlaceId: string
  readonly providerName: ScanEvidence["providerName"]
  readonly scoringVersion: string
  readonly providerVersions: Record<string, string>
  readonly confidence: RestaurantGrowthReport["confidence"]
  readonly missingCriticalData: readonly string[]
  readonly diagnosticSteps: ReadonlyArray<{
    readonly id: DiagnosticStepResult["id"]
    readonly status: DiagnosticStepResult["status"]
    readonly source: string
    readonly confidence: DiagnosticStepResult["confidence"]
    readonly foundCount: number
    readonly missingCount: number
    readonly errorCount: number
  }>
  readonly providerErrors: readonly string[]
  readonly createdAt: string
}

export function createScanId(): string {
  return `scan_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`
}

export async function storeScanEvidence(evidence: ScanEvidence): Promise<void> {
  const summary = summarizeScanEvidence(evidence)

  console.info("[grader-scan]", JSON.stringify(summary))

  if (!shouldWriteLocalScanFile()) {
    return
  }

  const scanDir = path.join(process.cwd(), ".tmp", "grader-scans")
  await mkdir(scanDir, { recursive: true })
  await writeFile(
    path.join(scanDir, `${evidence.scanId}.json`),
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  )
}

export function logFailedScan(
  scanId: string,
  selectedPlaceId: string,
  error: unknown,
): void {
  const message = error instanceof Error ? error.message : "Unknown scan error"
  console.warn("[grader-scan-error]", JSON.stringify({
    scanId,
    selectedPlaceId,
    error: message,
  }))
}

function summarizeScanEvidence(evidence: ScanEvidence): ScanLogSummary {
  return {
    scanId: evidence.scanId,
    selectedPlaceId: evidence.selectedPlaceId,
    providerName: evidence.providerName,
    scoringVersion: evidence.scoringVersion,
    providerVersions: evidence.providerVersions,
    confidence: evidence.report.confidence,
    missingCriticalData: evidence.report.dataQuality.missingCriticalData,
    diagnosticSteps: evidence.diagnosticSteps.map((step) => ({
      id: step.id,
      status: step.status,
      source: step.source,
      confidence: step.confidence,
      foundCount: step.found.length,
      missingCount: step.missing.length,
      errorCount: step.errors.length,
    })),
    providerErrors: evidence.providerErrors,
    createdAt: evidence.createdAt,
  }
}

function shouldWriteLocalScanFile(): boolean {
  return process.env.GRADER_SCAN_STORE === "file" && process.env.NODE_ENV !== "production"
}
