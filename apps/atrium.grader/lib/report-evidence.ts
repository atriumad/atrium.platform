import type {
  RestaurantGrowthProfile,
  RestaurantGrowthReport,
  RestaurantGrowthScores,
} from "@atrium/application"
import type { GooglePlaceMeta } from "./google-places-client"

export type AgentLocalBenchmark = {
  readonly competitorCount: number
  readonly averageRating: number | null
  readonly averageReviewCount: number | null
  readonly relativeRatingPosition: "above" | "near" | "below" | "unknown"
  readonly competitors: ReadonlyArray<{
    readonly placeId: string
    readonly name: string
    readonly rating: number | null
    readonly reviewCount: number | null
    readonly websiteUrl: string | null
  }>
}

export type AgentEvidenceContext = {
  readonly listing: {
    readonly category: string
    readonly profileCompleteness: number
    readonly priceLevel: string | null
    readonly primaryType: string | null
    readonly primaryTypeDisplayName: string | null
    readonly googleMapsUri: string | null
    readonly hasEditorialSummary: boolean
    readonly serviceModel: readonly string[]
    readonly amenities: readonly string[]
    readonly paymentSignals: readonly string[]
    readonly gaps: readonly string[]
    readonly hours: {
      readonly currentPublished: boolean
      readonly regularPublished: boolean
    }
  }
  readonly market: {
    readonly localRank: number | null
    readonly competitorAverageRating: number | null
    readonly benchmarkAvailable: boolean
    readonly competitorCount: number | null
    readonly averageRating: number | null
    readonly averageReviewCount: number | null
    readonly relativeRatingPosition: "above" | "near" | "below" | "unknown"
    readonly gaps: readonly string[]
  }
  readonly website: {
    readonly url: string | null
    readonly signals: readonly string[]
    readonly gaps: readonly string[]
    readonly loadTimeMs: number
    readonly lighthouse: readonly string[]
  }
  readonly reputation: {
    readonly rating: number
    readonly reviewCount: number
    readonly estimatedNegativeReviews: number
    readonly source: string
    readonly gaps: readonly string[]
  }
  readonly social: {
    readonly scanned: boolean
    readonly score: number | null
    readonly strongestPlatform: string | null
    readonly activePlatforms: readonly string[]
    readonly gaps: readonly string[]
    readonly topIssues: readonly string[]
    readonly topActions: readonly string[]
  }
  readonly decisionInputs: {
    readonly overallScore: number
    readonly scores: Readonly<Record<string, number>>
    readonly topIssues: readonly string[]
    readonly topRecommendations: readonly string[]
    readonly missingData: readonly string[]
    readonly confidence: RestaurantGrowthReport["confidence"] | null
  }
}

type BuildAgentEvidenceInput = {
  readonly profile: RestaurantGrowthProfile
  readonly googleMeta: GooglePlaceMeta | null
  readonly report: RestaurantGrowthReport
  readonly localBenchmark?: AgentLocalBenchmark | null
}

export function buildAgentEvidenceContext(input: BuildAgentEvidenceInput): AgentEvidenceContext {
  const { profile, googleMeta, report, localBenchmark = null } = input

  return {
    listing: summarizeListingEvidence(profile, googleMeta),
    market: summarizeMarketEvidence(profile, localBenchmark),
    website: summarizeWebsiteEvidence(profile),
    reputation: summarizeReputationEvidence(profile),
    social: summarizeSocialEvidence(report),
    decisionInputs: summarizeDecisionInputs(report),
  }
}

function summarizeListingEvidence(
  profile: RestaurantGrowthProfile,
  googleMeta: GooglePlaceMeta | null,
): AgentEvidenceContext["listing"] {
  const serviceModel = compact([
    googleMeta?.dineIn === true ? "dine-in" : null,
    googleMeta?.takeout === true ? "takeout" : null,
    googleMeta?.delivery === true ? "delivery" : null,
    googleMeta?.reservable === true ? "reservations accepted" : null,
  ])

  const amenities = compact([
    googleMeta?.outdoorSeating === true ? "outdoor seating" : null,
    googleMeta?.servesBreakfast === true ? "breakfast" : null,
    googleMeta?.servesLunch === true ? "lunch" : null,
    googleMeta?.servesDinner === true ? "dinner" : null,
    googleMeta?.servesCoffee === true ? "coffee" : null,
    googleMeta?.servesDessert === true ? "dessert" : null,
    googleMeta?.servesBeer === true ? "beer" : null,
    googleMeta?.servesWine === true ? "wine" : null,
  ])

  const paymentSignals = compact([
    googleMeta?.acceptsCreditCards === true ? "accepts credit cards" : null,
    googleMeta?.acceptsDebitCards === true ? "accepts debit cards" : null,
    googleMeta?.acceptsNfc === true ? "accepts NFC" : null,
    googleMeta?.acceptsCashOnly === true ? "cash only" : null,
  ])

  const gaps = compact([
    serviceModel.length === 0 ? "Service model not confirmed in Google Places" : null,
    !googleMeta?.openingHoursPublished ? "Current hours not published" : null,
    !googleMeta?.regularHoursPublished ? "Regular hours not published" : null,
    !profile.websiteUrl ? "Website missing from listing" : null,
    profile.profileCompleteness < 0.8 ? "Listing profile is not fully complete" : null,
  ])

  return {
    category: profile.category,
    profileCompleteness: Math.round(profile.profileCompleteness * 100),
    priceLevel: googleMeta?.priceLevel ?? null,
    primaryType: googleMeta?.primaryType ?? null,
    primaryTypeDisplayName: googleMeta?.primaryTypeDisplayName ?? null,
    googleMapsUri: googleMeta?.googleMapsUri ?? null,
    hasEditorialSummary: Boolean(googleMeta?.hasEditorialSummary),
    serviceModel,
    amenities,
    paymentSignals,
    gaps,
    hours: {
      currentPublished: Boolean(googleMeta?.openingHoursPublished),
      regularPublished: Boolean(googleMeta?.regularHoursPublished),
    },
  }
}

function summarizeMarketEvidence(
  profile: RestaurantGrowthProfile,
  localBenchmark: AgentLocalBenchmark | null,
): AgentEvidenceContext["market"] {
  return {
    localRank: profile.localRank,
    competitorAverageRating: profile.competitorAverageRating,
    benchmarkAvailable: Boolean(localBenchmark),
    competitorCount: localBenchmark?.competitorCount ?? null,
    averageRating: localBenchmark?.averageRating ?? null,
    averageReviewCount: localBenchmark?.averageReviewCount ?? null,
    relativeRatingPosition: localBenchmark?.relativeRatingPosition ?? "unknown",
    gaps: compact([
      profile.localRank === null ? "Local rank not established" : null,
      profile.competitorAverageRating === null ? "Competitor rating average unavailable" : null,
      !localBenchmark ? "Google local benchmark not connected yet" : null,
    ]),
  }
}

function summarizeWebsiteEvidence(profile: RestaurantGrowthProfile): AgentEvidenceContext["website"] {
  const website = profile.website
  const lighthouse = website.lighthouse
    ? compact([
      website.lighthouse.mobile?.performanceScore !== null && website.lighthouse.mobile?.performanceScore !== undefined
        ? `Mobile performance ${website.lighthouse.mobile.performanceScore}/100`
        : null,
      website.lighthouse.mobile?.seoScore !== null && website.lighthouse.mobile?.seoScore !== undefined
        ? `Mobile SEO ${website.lighthouse.mobile.seoScore}/100`
        : null,
      website.lighthouse.desktop?.performanceScore !== null && website.lighthouse.desktop?.performanceScore !== undefined
        ? `Desktop performance ${website.lighthouse.desktop.performanceScore}/100`
        : null,
    ])
    : []

  return {
    url: profile.websiteUrl,
    signals: compact([
      website.hasMobileFriendlyLayout ? "Mobile-friendly layout" : null,
      website.hasMenu ? "Menu found" : null,
      website.hasOnlineOrdering ? "Online ordering found" : null,
      website.hasReservations ? "Reservations found" : null,
      website.hasPhoneVisible ? "Phone visible" : null,
      website.hasLocationSchema ? "Local schema found" : null,
      website.hasMetaDescription ? "Meta description found" : null,
    ]),
    gaps: compact([
      !profile.websiteUrl ? "No website URL" : null,
      !website.hasMobileFriendlyLayout ? "Not mobile-friendly" : null,
      !website.hasMenu ? "No menu found" : null,
      !website.hasOnlineOrdering ? "No online ordering" : null,
      !website.hasReservations ? "No reservations CTA" : null,
      !website.hasPhoneVisible ? "No visible phone CTA" : null,
      !website.hasLocationSchema ? "No local schema" : null,
      !website.hasMetaDescription ? "No meta description" : null,
    ]),
    loadTimeMs: website.loadTimeMs,
    lighthouse,
  }
}

function summarizeReputationEvidence(profile: RestaurantGrowthProfile): AgentEvidenceContext["reputation"] {
  return {
    rating: profile.googleRating,
    reviewCount: profile.googleReviewCount,
    estimatedNegativeReviews: profile.recentNegativeReviewCount,
    source: profile.reputationDataSource ?? "unavailable",
    gaps: compact([
      profile.googleRating <= 0 ? "Google rating unavailable" : null,
      profile.googleReviewCount <= 0 ? "Google review count unavailable" : null,
      profile.unansweredReviewCount > 0 ? "Unanswered reviews estimated" : null,
    ]),
  }
}

function summarizeSocialEvidence(report: RestaurantGrowthReport): AgentEvidenceContext["social"] {
  const socialHealth = report.socialHealth
  if (!socialHealth) {
    return {
      scanned: false,
      score: null,
      strongestPlatform: null,
      activePlatforms: [],
      gaps: ["Confirmed social profile data missing"],
      topIssues: [],
      topActions: [],
    }
  }

  const sortedPlatforms = [...socialHealth.platforms].sort((a, b) => b.score - a.score)
  const activePlatforms = sortedPlatforms.filter((platform) => platform.score > 0)

  return {
    scanned: true,
    score: socialHealth.score,
    strongestPlatform: sortedPlatforms[0]?.platform ?? null,
    activePlatforms: activePlatforms.map((platform) => `${platform.platform}: ${platform.score}/100`),
    gaps: socialHealth.issues.slice(0, 5),
    topIssues: socialHealth.issues.slice(0, 5),
    topActions: socialHealth.recommendedActions.slice(0, 5),
  }
}

function summarizeDecisionInputs(report: RestaurantGrowthReport): AgentEvidenceContext["decisionInputs"] {
  return {
    overallScore: report.overallScore,
    scores: numericScores(report.scores),
    topIssues: report.issues.slice(0, 5).map((issue) => issue.message),
    topRecommendations: report.recommendations.slice(0, 5).map((recommendation) => recommendation.action),
    missingData: report.dataQuality.missingCriticalData,
    confidence: report.confidence,
  }
}

function numericScores(scores: RestaurantGrowthScores): Record<string, number> {
  const entries = Object.entries(scores).filter((entry): entry is [string, number] => typeof entry[1] === "number")
  return Object.fromEntries(entries)
}

function compact(values: ReadonlyArray<string | null | undefined | false>): string[] {
  return values.filter((value): value is string => typeof value === "string" && value.length > 0)
}
