import { NextResponse } from "next/server"
import { OpenDataPlacesLookupError, searchRestaurantPlaces } from "@/lib/open-data-places"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { query?: unknown } | null
  const query = typeof body?.query === "string" ? body.query : ""

  if (query.trim().length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const suggestions = await searchRestaurantPlaces(query)
    return NextResponse.json({ suggestions })
  } catch (error) {
    const message = error instanceof OpenDataPlacesLookupError
      ? error.message
      : "Unable to search restaurants"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
