import { gradeRestaurantGrowth } from "@atrium/application"
import { NextResponse } from "next/server"
import { getRestaurantGrowthProfileFromPlace, OpenDataPlacesLookupError } from "@/lib/open-data-places"
import type { ManualReputationInput } from "@/lib/open-data-places"

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
    const profile = await getRestaurantGrowthProfileFromPlace(placeId, {
      rating: typeof body?.reputation?.rating === "number" ? body.reputation.rating : null,
      reviewCount: typeof body?.reputation?.reviewCount === "number" ? body.reputation.reviewCount : null,
    })
    const result = gradeRestaurantGrowth(profile)

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ report: result.value })
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
