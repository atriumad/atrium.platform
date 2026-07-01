import type {
  RestaurantLighthouseAuditResult,
  RestaurantLighthouseAuditSummary,
  RestaurantLighthouseStrategy,
} from "@atrium/application"

const PAGESPEED_URL = "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed"
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const

type PageSpeedResponse = {
  readonly lighthouseResult?: {
    readonly finalDisplayedUrl?: string
    readonly runtimeError?: { readonly message?: string }
    readonly categories?: Record<string, { readonly score?: number | null } | undefined>
    readonly audits?: Record<string, {
      readonly numericValue?: number | null
      readonly title?: string
      readonly displayValue?: string
      readonly details?: unknown
    } | undefined>
  }
  readonly error?: { readonly message?: string }
}

type PageSpeedCategories = NonNullable<NonNullable<PageSpeedResponse["lighthouseResult"]>["categories"]>
type PageSpeedAudits = NonNullable<NonNullable<PageSpeedResponse["lighthouseResult"]>["audits"]>

export async function runPageSpeedWebsiteAudit(
  websiteUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<RestaurantLighthouseAuditResult> {
  const [mobile, desktop] = await Promise.all([
    runPageSpeedStrategy(websiteUrl, "mobile", fetcher),
    runPageSpeedStrategy(websiteUrl, "desktop", fetcher),
  ])

  return {
    provider: "pagespeed",
    mobile,
    desktop,
  }
}

async function runPageSpeedStrategy(
  websiteUrl: string,
  strategy: RestaurantLighthouseStrategy,
  fetcher: typeof fetch,
): Promise<RestaurantLighthouseAuditSummary | null> {
  const url = new URL(PAGESPEED_URL)
  url.searchParams.set("url", websiteUrl)
  url.searchParams.set("strategy", strategy)
  for (const category of CATEGORIES) {
    url.searchParams.append("category", category)
  }

  const apiKey = process.env.PAGESPEED_API_KEY?.trim()
  if (apiKey) {
    url.searchParams.set("key", apiKey)
  }

  try {
    const res = await fetcher(url, {
      method: "GET",
      signal: AbortSignal.timeout(12_000),
    })

    if (!res.ok) return failedSummary(strategy, `PageSpeed returned ${res.status}`)

    const body = await res.json() as PageSpeedResponse
    const lighthouse = body.lighthouseResult
    if (!lighthouse) return failedSummary(strategy, body.error?.message ?? "PageSpeed did not return Lighthouse data")

    const runtimeWarning = lighthouse.runtimeError?.message

    return {
      strategy,
      performanceScore: categoryScore(lighthouse.categories, "performance"),
      accessibilityScore: categoryScore(lighthouse.categories, "accessibility"),
      bestPracticesScore: categoryScore(lighthouse.categories, "best-practices"),
      seoScore: categoryScore(lighthouse.categories, "seo"),
      finalUrl: lighthouse.finalDisplayedUrl ?? null,
      metrics: {
        firstContentfulPaintMs: numericAudit(lighthouse.audits, "first-contentful-paint"),
        largestContentfulPaintMs: numericAudit(lighthouse.audits, "largest-contentful-paint"),
        totalBlockingTimeMs: numericAudit(lighthouse.audits, "total-blocking-time"),
        cumulativeLayoutShift: numericAudit(lighthouse.audits, "cumulative-layout-shift"),
        speedIndexMs: numericAudit(lighthouse.audits, "speed-index"),
      },
      opportunities: auditOpportunityTitles(lighthouse.audits),
      warnings: runtimeWarning ? [runtimeWarning] : [],
    }
  } catch (error) {
    return failedSummary(strategy, error instanceof Error ? error.message : String(error))
  }
}

function failedSummary(
  strategy: RestaurantLighthouseStrategy,
  warning: string,
): RestaurantLighthouseAuditSummary {
  return {
    strategy,
    performanceScore: null,
    accessibilityScore: null,
    bestPracticesScore: null,
    seoScore: null,
    finalUrl: null,
    metrics: {
      firstContentfulPaintMs: null,
      largestContentfulPaintMs: null,
      totalBlockingTimeMs: null,
      cumulativeLayoutShift: null,
      speedIndexMs: null,
    },
    opportunities: [],
    warnings: [warning],
  }
}

function categoryScore(
  categories: PageSpeedCategories | undefined,
  key: string,
): number | null {
  const score = categories?.[key]?.score
  return typeof score === "number" ? Math.round(score * 100) : null
}

function numericAudit(
  audits: PageSpeedAudits | undefined,
  key: string,
): number | null {
  const value = audits?.[key]?.numericValue
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null
}

function auditOpportunityTitles(
  audits: PageSpeedAudits | undefined,
): string[] {
  if (!audits) return []

  return Object.values(audits)
    .filter((audit) => {
      const details = audit?.details as { readonly type?: string; readonly overallSavingsMs?: number } | undefined
      return details?.type === "opportunity" && typeof details.overallSavingsMs === "number" && details.overallSavingsMs > 0
    })
    .map((audit) => audit?.title)
    .filter((title): title is string => typeof title === "string" && title.length > 0)
    .slice(0, 4)
}
