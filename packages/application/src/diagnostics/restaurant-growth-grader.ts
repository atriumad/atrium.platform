import { err, ok, type Result } from "@atrium/shared"
import type { SocialHealthScore } from "./social-health-scorer"

export type RestaurantGrowthProfile = {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly address: string
  readonly websiteUrl: string | null
  readonly googleRating: number
  readonly googleReviewCount: number
  readonly recentNegativeReviewCount: number
  readonly unansweredReviewCount: number
  readonly reputationDataSource?: "google" | "manual" | "open-data" | "unavailable"
  readonly profileCompleteness: number
  readonly localRank: number | null
  readonly competitorAverageRating: number | null
  readonly website: RestaurantWebsiteSignals
  readonly conversion: RestaurantConversionSignals
}

export type RestaurantWebsiteSignals = {
  readonly hasMobileFriendlyLayout: boolean
  readonly hasMenu: boolean
  readonly hasOnlineOrdering: boolean
  readonly hasReservations: boolean
  readonly hasPhoneVisible: boolean
  readonly hasLocationSchema: boolean
  readonly hasMetaDescription: boolean
  readonly loadTimeMs: number
}

export type RestaurantConversionSignals = {
  readonly hasPrimaryCta: boolean
  readonly hasOnlineOrderingCta: boolean
  readonly hasReservationCta: boolean
  readonly hasTrackingPixel: boolean
  readonly hasClickToCall: boolean
}

export type RestaurantGrowthScores = {
  readonly discovery: number
  readonly website: number
  readonly reputation: number
  readonly conversion: number
  readonly social?: number
}

export type RestaurantGrowthIssue = {
  readonly category: keyof RestaurantGrowthScores
  readonly severity: "high" | "medium" | "low"
  readonly message: string
  readonly impact: string
}

export type RestaurantGrowthOpportunity = {
  readonly category: keyof RestaurantGrowthScores
  readonly title: string
  readonly description: string
}

export type RestaurantGrowthRecommendation = {
  readonly category: keyof RestaurantGrowthScores
  readonly title: string
  readonly action: string
  readonly effort: "low" | "medium" | "high"
}

export type RestaurantGrowthReport = {
  readonly business: {
    readonly id: string
    readonly name: string
    readonly category: string
    readonly address: string
    readonly websiteUrl: string | null
  }
  readonly overallScore: number
  readonly scores: RestaurantGrowthScores
  readonly issues: RestaurantGrowthIssue[]
  readonly opportunities: RestaurantGrowthOpportunity[]
  readonly recommendations: RestaurantGrowthRecommendation[]
  readonly estimatedLostOpportunity: string
  readonly nextBestAction: string
  readonly confidence: "low" | "medium" | "high"
  readonly socialHealth?: SocialHealthScore
}

export function gradeRestaurantGrowth(
  profile: RestaurantGrowthProfile,
): Result<RestaurantGrowthReport> {
  if (!profile.id || !profile.name.trim()) {
    return err(new Error("Restaurant id and name are required"))
  }

  const scores = {
    discovery: computeDiscoveryScore(profile),
    website: computeWebsiteScore(profile.website),
    reputation: computeReputationScore(profile),
    conversion: computeConversionScore(profile.conversion),
  }

  const overallScore = roundScore(
    scores.discovery * 0.25
      + scores.website * 0.25
      + scores.reputation * 0.25
      + scores.conversion * 0.25,
  )

  const issues = buildIssues(scores, profile)
  const opportunities = buildOpportunities(scores, profile)
  const recommendations = buildRecommendations(scores, profile)

  return ok({
    business: {
      id: profile.id,
      name: profile.name,
      category: profile.category,
      address: profile.address,
      websiteUrl: profile.websiteUrl,
    },
    overallScore,
    scores,
    issues,
    opportunities,
    recommendations,
    estimatedLostOpportunity: estimateLostOpportunity(overallScore, issues),
    nextBestAction: nextBestAction(overallScore, recommendations),
    confidence: reportConfidence(profile),
  })
}

function computeDiscoveryScore(profile: RestaurantGrowthProfile): number {
  const completeness = clamp(profile.profileCompleteness, 0, 1) * 45
  const rank = localRankScore(profile.localRank)
  const reviews = reviewVolumeScore(profile.googleReviewCount)
  return roundScore(completeness + rank + reviews)
}

function localRankScore(rank: number | null): number {
  if (rank === null) return 12
  if (rank <= 3) return 35
  if (rank <= 6) return 25
  if (rank <= 10) return 15
  return 5
}

function reviewVolumeScore(reviewCount: number): number {
  if (reviewCount >= 250) return 20
  if (reviewCount >= 100) return 14
  if (reviewCount >= 30) return 8
  return 3
}

function computeWebsiteScore(website: RestaurantWebsiteSignals): number {
  const checks = [
    website.hasMobileFriendlyLayout,
    website.hasMenu,
    website.hasOnlineOrdering,
    website.hasReservations,
    website.hasPhoneVisible,
    website.hasLocationSchema,
    website.hasMetaDescription,
  ]
  const checklistScore = checks.filter(Boolean).length * 12
  const speedScore = website.loadTimeMs <= 2_500
    ? 16
    : website.loadTimeMs <= 4_000
      ? 9
      : 3

  return roundScore(checklistScore + speedScore)
}

function computeReputationScore(profile: RestaurantGrowthProfile): number {
  if (isReputationUnknown(profile)) {
    return 62
  }

  const ratingScore = clamp(profile.googleRating, 0, 5) / 5 * 65
  const volumeScore = reviewVolumeScore(profile.googleReviewCount)
  const negativePenalty = Math.min(18, profile.recentNegativeReviewCount)
  const unansweredRatio = profile.googleReviewCount === 0
    ? 0
    : profile.unansweredReviewCount / profile.googleReviewCount
  const unansweredPenalty = Math.min(12, unansweredRatio * 60)
  const competitorDelta = profile.competitorAverageRating === null
    ? 0
    : profile.googleRating - profile.competitorAverageRating
  const competitorAdjustment = clamp(competitorDelta * 10, -8, 8)

  return roundScore(
    ratingScore
      + volumeScore
      - negativePenalty
      - unansweredPenalty
      + competitorAdjustment,
  )
}

function computeConversionScore(conversion: RestaurantConversionSignals): number {
  const checks = [
    conversion.hasPrimaryCta,
    conversion.hasOnlineOrderingCta,
    conversion.hasReservationCta,
    conversion.hasTrackingPixel,
    conversion.hasClickToCall,
  ]

  return roundScore(checks.filter(Boolean).length * 20)
}

function buildIssues(
  scores: RestaurantGrowthScores,
  profile: RestaurantGrowthProfile,
): RestaurantGrowthIssue[] {
  const issues: RestaurantGrowthIssue[] = []

  if (scores.conversion < 50) {
    issues.push({
      category: "conversion",
      severity: "high",
      message: "The restaurant is missing clear conversion paths for ordering, reservations, or calls.",
      impact: "Interested guests may leave without taking action.",
    })
  }

  if (scores.reputation < 70) {
    if (isReputationUnknown(profile)) {
      issues.push({
        category: "reputation",
        severity: "medium",
        message: "Reputation data needs confirmation before the report can score review momentum.",
        impact: "The diagnostic can estimate demand leaks, but review quality should be entered or connected for a sharper read.",
      })
    } else {
      issues.push({
        category: "reputation",
        severity: "high",
        message: "Reputation is under the level expected for a strong local restaurant presence.",
        impact: "Weak ratings or unanswered reviews can reduce local search conversion.",
      })
    }
  }

  if (scores.discovery < 70) {
    issues.push({
      category: "discovery",
      severity: "medium",
      message: "Local discovery signals are not strong enough to reliably win nearby searches.",
      impact: "Competitors may capture high-intent searches before guests see this restaurant.",
    })
  }

  if (!profile.websiteUrl || scores.website < 70) {
    issues.push({
      category: "website",
      severity: "medium",
      message: "The website does not yet look ready to convert high-intent local traffic.",
      impact: "Search and referral traffic may not turn into orders, reservations, or calls.",
    })
  }

  return issues
}

function buildOpportunities(
  scores: RestaurantGrowthScores,
  profile: RestaurantGrowthProfile,
): RestaurantGrowthOpportunity[] {
  const opportunities: RestaurantGrowthOpportunity[] = []

  if (scores.discovery < 85) {
    opportunities.push({
      category: "discovery",
      title: "Improve local search visibility",
      description: "Tighten the business profile, category coverage, local landing page, and review velocity.",
    })
  }

  if (isReputationUnknown(profile)) {
    opportunities.push({
      category: "reputation",
      title: "Confirm the review baseline",
      description: "Connect a reputation source later to turn the free scan into a sharper review read.",
    })
  } else if (profile.googleRating < 4.5) {
    opportunities.push({
      category: "reputation",
      title: "Lift rating quality",
      description: "Create a review response and review generation rhythm for recent guests.",
    })
  }

  if (scores.conversion < 85) {
    opportunities.push({
      category: "conversion",
      title: "Turn more visitors into orders and bookings",
      description: "Make the ordering, reservation, and click-to-call paths visible above the fold.",
    })
  }

  if (scores.website < 85) {
    opportunities.push({
      category: "website",
      title: "Make the website easier for search and guests",
      description: "Improve metadata, schema, page speed, and menu access.",
    })
  }

  return opportunities
}

function buildRecommendations(
  scores: RestaurantGrowthScores,
  profile: RestaurantGrowthProfile,
): RestaurantGrowthRecommendation[] {
  const recommendations: RestaurantGrowthRecommendation[] = []

  if (scores.reputation < 70) {
    if (isReputationUnknown(profile)) {
      recommendations.push({
        category: "reputation",
        title: "Connect reputation data",
        action: "Use a connected review source in the complete report to prioritize response and review generation actions.",
        effort: "low",
      })
    } else {
      recommendations.push({
        category: "reputation",
        title: "Launch a review response sprint",
        action: "Reply to unanswered reviews, address negative themes, and request reviews from recent happy guests.",
        effort: "medium",
      })
    }
  }

  if (scores.conversion < 85) {
    recommendations.push({
      category: "conversion",
      title: "Add visible ordering and reservation calls to action",
      action: "Place online ordering, reservations, and click-to-call options in the first viewport and menu pages.",
      effort: "low",
    })
  }

  if (scores.discovery < 85) {
    recommendations.push({
      category: "discovery",
      title: "Strengthen local profile coverage",
      action: "Complete public profile details, keep business data consistent, and align website copy with local search intent.",
      effort: "medium",
    })
  }

  if (scores.website < 85) {
    recommendations.push({
      category: "website",
      title: "Fix website fundamentals before scaling traffic",
      action: "Improve mobile speed, metadata, local schema, menu access, and primary guest actions.",
      effort: "medium",
    })
  }

  return recommendations
}

function estimateLostOpportunity(
  overallScore: number,
  issues: RestaurantGrowthIssue[],
): string {
  const hasHighRisk = issues.some((issue) => issue.severity === "high")

  if (overallScore >= 85 && !hasHighRisk) {
    return "Low. The restaurant is capturing most obvious digital demand, with room for incremental gains."
  }

  if (overallScore >= 65) {
    return "Moderate. Several high-intent guests may be dropping before ordering, booking, or calling."
  }

  return "High. The restaurant likely loses meaningful demand across discovery, trust, and conversion."
}

function nextBestAction(
  overallScore: number,
  recommendations: RestaurantGrowthRecommendation[],
): string {
  if (overallScore >= 85) {
    return "Maintain momentum and monitor for week-over-week changes in reputation, traffic, and conversion."
  }

  return recommendations[0]?.action ?? "Review the weakest score category and resolve the top issue first."
}

function isReputationUnknown(profile: RestaurantGrowthProfile): boolean {
  return profile.reputationDataSource === "unavailable"
    || (profile.googleRating <= 0 && profile.googleReviewCount === 0)
}

function reportConfidence(profile: RestaurantGrowthProfile): "low" | "medium" | "high" {
  const hasWebsite = Boolean(profile.websiteUrl)
  const hasReputation = !isReputationUnknown(profile)

  if (hasWebsite && hasReputation) return "high"
  if (hasWebsite || hasReputation) return "medium"
  return "low"
}

function roundScore(value: number): number {
  return Math.round(clamp(value, 0, 100))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
