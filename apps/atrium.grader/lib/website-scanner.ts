import type { RestaurantWebsiteSignals } from "@atrium/application"
import { runPageSpeedWebsiteAudit } from "./pagespeed-client"

export function emptyWebsiteSignals(): RestaurantWebsiteSignals {
  return {
    hasMobileFriendlyLayout: false,
    hasMenu: false,
    hasOnlineOrdering: false,
    hasReservations: false,
    hasPhoneVisible: false,
    hasLocationSchema: false,
    hasMetaDescription: false,
    loadTimeMs: 5_000,
  }
}

export async function scanRestaurantWebsite(
  websiteUrl: string | null,
  fetcher: typeof fetch = fetch,
): Promise<RestaurantWebsiteSignals> {
  if (!websiteUrl) {
    return emptyWebsiteSignals()
  }

  const basicSignals = await scanBasicWebsiteSignals(websiteUrl, fetcher)

  if (process.env.WEBSITE_AUDIT_PROVIDER?.trim().toLowerCase() !== "pagespeed") {
    return basicSignals
  }

  try {
    const lighthouse = await runPageSpeedWebsiteAudit(websiteUrl, fetcher)
    return { ...basicSignals, lighthouse }
  } catch {
    return basicSignals
  }
}

async function scanBasicWebsiteSignals(
  websiteUrl: string,
  fetcher: typeof fetch,
): Promise<RestaurantWebsiteSignals> {
  const startedAt = Date.now()

  try {
    const res = await fetcher(websiteUrl, {
      method: "GET",
      signal: AbortSignal.timeout(4_000),
    })
    const loadTimeMs = Date.now() - startedAt

    if (!res.ok) {
      return { ...emptyWebsiteSignals(), loadTimeMs }
    }

    const html = await res.text()
    const lower = html.toLowerCase()

    return {
      // Bug fix: was hardcoded `true`. Now checks for <meta name="viewport"> tag.
      hasMobileFriendlyLayout: /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html),
      hasMenu: /\bmenu\b/.test(lower),
      hasOnlineOrdering: /order online|online ordering|\/order|delivery|takeout|toasttab|doordash|ubereats|chownow|clover|squareup/.test(lower),
      hasReservations: /reservation|reservations|book a table|book now|opentable|resy/.test(lower),
      hasPhoneVisible: /href=["']tel:/.test(lower),
      hasLocationSchema: /application\/ld\+json|schema\.org\/restaurant|"@type"\s*:\s*"restaurant"|"@type"\s*:\s*"localbusiness"/.test(lower),
      hasMetaDescription: /<meta[^>]+name=["']description["'][^>]*>/i.test(html),
      loadTimeMs,
    }
  } catch {
    return emptyWebsiteSignals()
  }
}
