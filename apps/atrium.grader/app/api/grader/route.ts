import type { RestaurantGrowthProfile } from "@atrium/application"
import { gradeRestaurantGrowth } from "@atrium/application"
import { NextResponse } from "next/server"
import type { ManualReputationInput } from "@/lib/open-data-places"
import { getRestaurantGrowthProfileFromPlace, OpenDataPlacesLookupError } from "@/lib/open-data-places"
import { runPageSpeedWebsiteAudit } from "@/lib/pagespeed-client"
import type { GooglePlaceMeta } from "@/lib/google-places-client"

export type ReportMeta = {
  readonly profile: RestaurantGrowthProfile
  readonly googleMeta: GooglePlaceMeta | null
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
    reputation?: ManualReputationInput
  } | null

  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  try {
    const { profile, googleMeta } = await getRestaurantGrowthProfileFromPlace(placeId, {
      rating: typeof body?.reputation?.rating === "number" ? body.reputation.rating : null,
      reviewCount: typeof body?.reputation?.reviewCount === "number" ? body.reputation.reviewCount : null,
    })

    // PageSpeed is optional — 5s cap so Step 1 stays fast
    const lighthouseResult = Boolean(process.env.PAGESPEED_API_KEY?.trim()) && profile.websiteUrl
      ? await pagespeedWithTimeout(profile.websiteUrl)
      : null

    const gradingProfile = lighthouseResult && profile.websiteUrl
      ? { ...profile, website: { ...profile.website, lighthouse: lighthouseResult } }
      : profile

    const result = gradeRestaurantGrowth(gradingProfile)

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const meta: ReportMeta = { profile: gradingProfile, googleMeta }

    return NextResponse.json({ report: result.value, meta })
  } catch (error) {
    if (error instanceof OpenDataPlacesLookupError) {
      const status = error.message === "Business not found"
        ? 404
        : error.message === "placeId is required"
          ? 400
          : 502
      return NextResponse.json({ error: error.message }, { status })
    }

    return NextResponse.json({ error: "Unable to run diagnostic" }, { status: 500 })
  }
}
