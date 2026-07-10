import type { RestaurantConversionSignals, RestaurantWebsiteSignals } from "@atrium/application"

export type ManualReputationInput = {
  readonly rating?: number | null
  readonly reviewCount?: number | null
}

export type LocalBenchmark = {
  readonly competitorCount: number
  readonly competitorsWithWebsite: number
  readonly competitorsWithPhone: number
  readonly competitorsWithHours: number
}

export function normalizeUrl(value: string | null): string | null {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

export function normalizeReputation(reputation: ManualReputationInput | undefined): {
  readonly rating: number | null
  readonly reviewCount: number | null
} {
  const rating = typeof reputation?.rating === "number" && Number.isFinite(reputation.rating)
    ? Math.min(5, Math.max(1, reputation.rating))
    : null
  const reviewCount = typeof reputation?.reviewCount === "number" && Number.isFinite(reputation.reviewCount)
    ? Math.max(0, Math.round(reputation.reviewCount))
    : null

  return { rating, reviewCount }
}

export function estimateNegativeReviews(rating: number, reviewCount: number): number {
  if (reviewCount === 0 || rating >= 4.6) return 0
  if (rating >= 4.3) return Math.min(8, Math.ceil(reviewCount * 0.02))
  if (rating >= 4.0) return Math.min(16, Math.ceil(reviewCount * 0.04))
  return Math.min(24, Math.ceil(reviewCount * 0.08))
}

export function readableType(type: string): string {
  return type
    .split(/[;_,]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function deriveLocalRank(hasWebsite: boolean, benchmark: LocalBenchmark): number | null {
  if (benchmark.competitorCount < 3) return null

  const websiteShare = benchmark.competitorsWithWebsite / benchmark.competitorCount
  const phoneShare = benchmark.competitorsWithPhone / benchmark.competitorCount

  if (hasWebsite && websiteShare < 0.35) return 3
  if (hasWebsite && websiteShare < 0.65) return 6
  if (!hasWebsite && websiteShare >= 0.5) return 12
  if (!hasWebsite && phoneShare >= 0.7) return 10
  return 8
}

// Unified conversion builder for Google-sourced profile and website evidence.
export function buildConversionSignals(
  website: RestaurantWebsiteSignals,
  hasPhone: boolean,
): RestaurantConversionSignals {
  return {
    hasPrimaryCta: website.hasOnlineOrdering || website.hasReservations || website.hasPhoneVisible || hasPhone,
    hasOnlineOrderingCta: website.hasOnlineOrdering,
    hasReservationCta: website.hasReservations,
    hasTrackingPixel: false,
    hasClickToCall: website.hasPhoneVisible || hasPhone,
  }
}
