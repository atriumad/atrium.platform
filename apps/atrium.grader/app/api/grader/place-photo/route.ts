import { NextResponse } from "next/server"
import { getGooglePlacePhotoUri } from "@/lib/google-places-client"

const MIN_PHOTO_DIMENSION = 1
const MAX_PHOTO_DIMENSION = 1600
const DEFAULT_WIDTH = 420
const DEFAULT_HEIGHT = 260

function clampDimension(value: string | null, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(MAX_PHOTO_DIMENSION, Math.max(MIN_PHOTO_DIMENSION, Math.round(parsed)))
}

function isGooglePhotoName(value: string): boolean {
  return /^places\/[^/]+\/photos\/[^/]+$/.test(value)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const name = url.searchParams.get("name")?.trim() ?? ""

  if (!isGooglePhotoName(name)) {
    return NextResponse.json({ error: "Google photo name is required" }, { status: 400 })
  }

  const maxWidthPx = clampDimension(url.searchParams.get("maxWidthPx"), DEFAULT_WIDTH)
  const maxHeightPx = clampDimension(url.searchParams.get("maxHeightPx"), DEFAULT_HEIGHT)

  try {
    const photoUri = await getGooglePlacePhotoUri(name, { maxWidthPx, maxHeightPx })

    if (!photoUri) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    const response = NextResponse.redirect(photoUri, { status: 302 })
    response.headers.set("Cache-Control", "no-store")
    return response
  } catch {
    return NextResponse.json({ error: "Unable to load Google Place photo" }, { status: 502 })
  }
}
