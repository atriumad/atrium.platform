import type { RestaurantGrowthProfile } from "@atrium/application"
import { gradeRestaurantGrowth } from "@atrium/application"
import { NextResponse } from "next/server"
import type { GoogleLocalBenchmark, GooglePlaceMeta } from "@/lib/google-places-client"
import { getRestaurantGrowthProfileFromPlace, OpenDataPlacesLookupError } from "@/lib/open-data-places"
import { runPageSpeedWebsiteAudit } from "@/lib/pagespeed-client"
import { createScanId, logFailedScan, storeScanEvidence } from "@/lib/scan-store"

export type ReportMeta = {
  readonly profile: RestaurantGrowthProfile
  readonly googleMeta: GooglePlaceMeta | null
  readonly localBenchmark: GoogleLocalBenchmark | null
}

const PAGESPEED_TIMEOUT_MS = 5_000

function pagespeedWithTimeout(websiteUrl: string): Promise<Awaited<ReturnType<typeof runPageSpeedWebsiteAudit>> | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), PAGESPEED_TIMEOUT_MS))
  return Promise.race([
    runPageSpeedWebsiteAudit(websiteUrl).catch(() => null),
    timeout,
  ])
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as {
    placeId?: unknown
  } | null

  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  const scanId = createScanId()
  const providerErrors: string[] = []

  try {
    const { profile, googleMeta, localBenchmark } = await getRestaurantGrowthProfileFromPlace(placeId, undefined)

    // PageSpeed is optional — 5s cap so Step 1 stays fast
    const shouldRunPageSpeed = Boolean(process.env.PAGESPEED_API_KEY?.trim() && profile.websiteUrl)
    const lighthouseResult = shouldRunPageSpeed && profile.websiteUrl
      ? await pagespeedWithTimeout(profile.websiteUrl)
      : null

    if (shouldRunPageSpeed && !lighthouseResult) {
      providerErrors.push("PageSpeed audit timed out or failed")
    }

    const gradingProfile = lighthouseResult && profile.websiteUrl
      ? { ...profile, website: { ...profile.website, lighthouse: lighthouseResult } }
      : profile

    const result = gradeRestaurantGrowth(gradingProfile)

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const meta: ReportMeta = { profile: gradingProfile, googleMeta, localBenchmark }

    await storeScanEvidence({
      scanId,
      selectedPlaceId: placeId,
      providerName: result.value.dataQuality.provider,
      profile: gradingProfile,
      diagnosticSteps: result.value.diagnosticSteps,
      providerErrors,
      report: result.value,
      scoringVersion: result.value.scoringVersion,
      providerVersions: result.value.providerVersions,
      createdAt: new Date().toISOString(),
    }).catch((storeError: unknown) => {
      const message = storeError instanceof Error ? storeError.message : "Unknown scan store error"
      console.warn("[grader-scan-store-error]", JSON.stringify({ scanId, selectedPlaceId: placeId, error: message }))
    })

    return NextResponse.json({ scanId, report: result.value, meta })
  } catch (error) {
    logFailedScan(scanId, placeId, error)

    if (error instanceof OpenDataPlacesLookupError) {
      const status = error.message === "Business not found"
        ? 404
        : error.message === "placeId is required"
          ? 400
          : 502
      return NextResponse.json({ scanId, error: error.message }, { status })
    }

    return NextResponse.json({ scanId, error: "Unable to run diagnostic" }, { status: 500 })
  }
}
