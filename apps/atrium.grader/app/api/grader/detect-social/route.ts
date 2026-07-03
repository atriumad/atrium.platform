import { NextResponse } from "next/server"
import { getWebsiteUrlForPlace } from "@/lib/open-data-places"
import { safeFetch } from "@/lib/safe-fetch"
import { detectSocialHandles } from "@/lib/social-detector"

const EMPTY_HANDLES = { instagram: null, facebook: null, tiktok: null, confidence: "manual" as const }

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { placeId?: unknown } | null
  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  const websiteUrl = await getWebsiteUrlForPlace(placeId)

  if (!websiteUrl) {
    return NextResponse.json({ socialHandles: EMPTY_HANDLES })
  }

  try {
    const res = await safeFetch(websiteUrl, {
      method: "GET",
      signal: AbortSignal.timeout(4_000),
    })

    if (!res.ok) {
      return NextResponse.json({ socialHandles: EMPTY_HANDLES })
    }

    const html = await res.text()
    return NextResponse.json({ socialHandles: detectSocialHandles(html) })
  } catch {
    return NextResponse.json({ socialHandles: EMPTY_HANDLES })
  }
}
