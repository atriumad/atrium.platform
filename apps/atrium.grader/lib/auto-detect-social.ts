import type { SocialHandles } from "@atrium/application"
import { detectSocialHandles } from "./social-detector"
import { searchFacebookByName, searchInstagramByName, searchTikTokByName } from "./social-name-search"

const EMPTY: SocialHandles = { instagram: null, facebook: null, tiktok: null, confidence: "manual" }

type SocialDetectionContext = {
  readonly address?: string | null
}

async function scrapeWebsite(url: string, fetcher: typeof fetch): Promise<SocialHandles> {
  try {
    const res = await fetcher(url, {
      signal: AbortSignal.timeout(4_500),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AtriumGrader/0.1)",
        "Accept": "text/html",
      },
    })
    if (!res.ok) return EMPTY
    const html = await res.text()
    return detectSocialHandles(html)
  } catch {
    return EMPTY
  }
}

export async function autoDetectSocial(
  websiteUrl: string | null,
  businessName: string,
  fetcher: typeof fetch = fetch,
  context: SocialDetectionContext = {},
): Promise<SocialHandles | null> {
  const [website, instagram, tiktok, facebook] = await Promise.all([
    websiteUrl ? scrapeWebsite(websiteUrl, fetcher) : Promise.resolve(EMPTY),
    searchInstagramByName(businessName, fetcher),
    searchTikTokByName(businessName, fetcher),
    searchFacebookByName(businessName, context, fetcher),
  ])

  // Website-detected handles take priority over name-search
  const resolvedInstagram = website.instagram ?? instagram
  const resolvedFacebook = website.facebook ?? facebook
  const resolvedTiktok = website.tiktok ?? tiktok

  if (!resolvedInstagram && !resolvedFacebook && !resolvedTiktok) return null

  return {
    instagram: resolvedInstagram,
    facebook: resolvedFacebook,
    tiktok: resolvedTiktok,
    confidence: "detected",
  }
}
