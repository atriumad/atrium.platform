import { gradeRestaurantGrowth, scoreSocialHealth } from "@atrium/application"
import type { RestaurantGrowthReport, SocialHandles } from "@atrium/application"
import { NextResponse } from "next/server"
import { getRestaurantGrowthProfileFromPlace, OpenDataPlacesLookupError } from "@/lib/open-data-places"
import type { ManualReputationInput } from "@/lib/open-data-places"
import { scanSocialProfiles } from "@/lib/scrape-creators"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as {
    placeId?: unknown
    reputation?: ManualReputationInput
    socialHandles?: { instagram?: unknown; facebook?: unknown; tiktok?: unknown }
  } | null

  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  try {
    const profile = await getRestaurantGrowthProfileFromPlace(placeId, {
      rating: typeof body?.reputation?.rating === "number" ? body.reputation.rating : null,
      reviewCount: typeof body?.reputation?.reviewCount === "number" ? body.reputation.reviewCount : null,
    })
    const result = gradeRestaurantGrowth(profile)

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const handles = parseSocialHandles(body?.socialHandles)

    if (!handles) {
      return NextResponse.json({ report: result.value })
    }

    const socialScan = await scanSocialProfiles(handles)
    const socialHealth = scoreSocialHealth(socialScan)
    const baseReport = result.value

    const report: RestaurantGrowthReport = {
      ...baseReport,
      scores: { ...baseReport.scores, social: socialHealth.score },
      overallScore: Math.round(
        baseReport.scores.discovery * 0.20
        + baseReport.scores.website * 0.20
        + baseReport.scores.reputation * 0.20
        + baseReport.scores.conversion * 0.20
        + socialHealth.score * 0.20,
      ),
      socialHealth,
    }

    return NextResponse.json({ report })
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

function parseSocialHandles(
  raw: { instagram?: unknown; facebook?: unknown; tiktok?: unknown } | null | undefined,
): SocialHandles | null {
  if (!raw || typeof raw !== "object") return null

  const instagram = typeof raw.instagram === "string" && raw.instagram.trim().length > 0
    ? raw.instagram.trim() : null
  const facebook = typeof raw.facebook === "string" && raw.facebook.trim().length > 0
    ? raw.facebook.trim() : null
  const tiktok = typeof raw.tiktok === "string" && raw.tiktok.trim().length > 0
    ? raw.tiktok.trim() : null

  if (instagram === null && facebook === null && tiktok === null) return null

  return { instagram, facebook, tiktok, confidence: "manual" }
}
