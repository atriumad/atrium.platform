import { scoreSocialHealth } from "@atrium/application"
import { NextResponse } from "next/server"
import { autoDetectSocial } from "@/lib/auto-detect-social"
import { scanSocialProfiles } from "@/lib/scrape-creators"

export async function POST(req: Request) {
  if (!process.env.SCRAPECREATORS_API_KEY) {
    return NextResponse.json({ socialHealth: null })
  }

  const body = await req.json().catch(() => null) as { websiteUrl?: unknown; name?: unknown; address?: unknown } | null
  const websiteUrl = typeof body?.websiteUrl === "string" ? body.websiteUrl : null
  const name = typeof body?.name === "string" ? body.name : ""
  const address = typeof body?.address === "string" ? body.address : null

  try {
    const handles = await autoDetectSocial(websiteUrl, name, fetch, { address }).catch(() => null)
    if (!handles) return NextResponse.json({ socialHealth: null })

    const socialScan = await scanSocialProfiles(handles)
    const socialHealth = scoreSocialHealth(socialScan)

    return NextResponse.json({ socialHealth })
  } catch {
    return NextResponse.json({ socialHealth: null })
  }
}
