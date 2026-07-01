import { err, ok, type Result } from "@atrium/shared"
import type { SocialHealthScore } from "./social-health-scorer"

export type RestaurantGrowthProfile = {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly address: string
  readonly websiteUrl: string | null
  readonly photoUrl?: string | null
  readonly photoAttribution?: string | null
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
  readonly lighthouse?: RestaurantLighthouseAuditResult
}

export type RestaurantLighthouseStrategy = "mobile" | "desktop"

export type RestaurantLighthouseAuditSummary = {
  readonly strategy: RestaurantLighthouseStrategy
  readonly performanceScore: number | null
  readonly accessibilityScore: number | null
  readonly bestPracticesScore: number | null
  readonly seoScore: number | null
  readonly finalUrl: string | null
  readonly metrics: {
    readonly firstContentfulPaintMs: number | null
    readonly largestContentfulPaintMs: number | null
    readonly totalBlockingTimeMs: number | null
    readonly cumulativeLayoutShift: number | null
    readonly speedIndexMs: number | null
  }
  readonly opportunities: readonly string[]
  readonly warnings: readonly string[]
}

export type RestaurantLighthouseAuditResult = {
  readonly provider: "pagespeed"
  readonly mobile: RestaurantLighthouseAuditSummary | null
  readonly desktop: RestaurantLighthouseAuditSummary | null
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

export type RestaurantScoreDetails = {
  readonly openData: readonly string[]
  readonly website: readonly string[]
  readonly benchmark: readonly string[]
  readonly reputation: readonly string[]
  readonly social?: readonly string[]
  readonly brief: readonly string[]
}

export type RestaurantScoreInterpretation = {
  readonly category: keyof RestaurantGrowthScores
  readonly label: string
  readonly score: number
  readonly status: "healthy" | "watch" | "leaking"
  readonly meaning: string
  readonly businessImpact: string
  readonly atriumFix: string
}

export type RestaurantBusinessImpact = {
  readonly level: "low" | "medium" | "high"
  readonly headline: string
  readonly explanation: string
}

export type RestaurantExecutiveSummary = {
  readonly headline: string
  readonly summary: string
  readonly priority: string
  readonly atriumPlan: readonly string[]
}

export type DiagnosticStepId =
  | "openData"
  | "website"
  | "benchmark"
  | "reputation"
  | "social"
  | "brief"

export type DiagnosticStepResult = {
  readonly id: DiagnosticStepId
  readonly status: "complete" | "partial" | "skipped" | "failed"
  readonly source: string
  readonly confidence: "low" | "medium" | "high"
  readonly checked: readonly string[]
  readonly found: readonly string[]
  readonly missing: readonly string[]
  readonly assumptions: readonly string[]
  readonly errors: readonly string[]
}

export type RestaurantDataQuality = {
  readonly provider: "osm" | "google" | "manual" | "mixed"
  readonly hasWebsite: boolean
  readonly hasReputation: boolean
  readonly hasSocial: boolean
  readonly missingCriticalData: readonly string[]
}

export type RestaurantGrowthReport = {
  readonly business: {
    readonly id: string
    readonly name: string
    readonly category: string
    readonly address: string
    readonly websiteUrl: string | null
    readonly photoUrl?: string | null
    readonly photoAttribution?: string | null
  }
  readonly overallScore: number
  readonly scores: RestaurantGrowthScores
  readonly scoreDetails: RestaurantScoreDetails
  readonly scoreInterpretation: readonly RestaurantScoreInterpretation[]
  readonly businessImpact: RestaurantBusinessImpact
  readonly executiveSummary: RestaurantExecutiveSummary
  readonly issues: RestaurantGrowthIssue[]
  readonly opportunities: RestaurantGrowthOpportunity[]
  readonly recommendations: RestaurantGrowthRecommendation[]
  readonly estimatedLostOpportunity: string
  readonly nextBestAction: string
  readonly confidence: "low" | "medium" | "high"
  readonly diagnosticSteps: readonly DiagnosticStepResult[]
  readonly dataQuality: RestaurantDataQuality
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
  const businessImpact = buildBusinessImpact(overallScore, issues)
  const scoreInterpretation = buildScoreInterpretation(scores, profile)
  const executiveSummary = buildExecutiveSummary(
    overallScore,
    issues,
    recommendations,
    businessImpact,
  )
  const dataQuality = buildDataQuality(profile, false)
  const scoreDetails = {
    openData: buildOpenDataDetails(profile),
    website: buildWebsiteDetails(profile.website),
    benchmark: buildBenchmarkDetails(profile),
    reputation: buildReputationDetails(profile),
    brief: buildBriefDetails(issues, recommendations),
  }

  return ok({
    business: {
      id: profile.id,
      name: profile.name,
      category: profile.category,
      address: profile.address,
      websiteUrl: profile.websiteUrl,
      photoUrl: profile.photoUrl ?? null,
      photoAttribution: profile.photoAttribution ?? null,
    },
    overallScore,
    scores,
    scoreDetails,
    scoreInterpretation,
    businessImpact,
    executiveSummary,
    issues,
    opportunities,
    recommendations,
    estimatedLostOpportunity: estimateLostOpportunity(overallScore, issues),
    nextBestAction: nextBestAction(overallScore, recommendations),
    confidence: reportConfidence(profile),
    diagnosticSteps: buildDiagnosticSteps(profile, scoreDetails, issues, recommendations),
    dataQuality,
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

  if (website.lighthouse) {
    const actionPathScore = checks.filter(Boolean).length / checks.length * 30
    const mobileScore = lighthouseQualityScore(website.lighthouse.mobile)
    const desktopScore = lighthouseQualityScore(website.lighthouse.desktop)

    if (mobileScore !== null || desktopScore !== null) {
      return roundScore(
        (mobileScore ?? desktopScore ?? 0) * 0.45
        + (desktopScore ?? mobileScore ?? 0) * 0.25
        + actionPathScore,
      )
    }
  }

  const checklistScore = checks.filter(Boolean).length * 12
  const speedScore = website.loadTimeMs <= 2_500
    ? 16
    : website.loadTimeMs <= 4_000
      ? 9
      : 3

  return roundScore(checklistScore + speedScore)
}

function lighthouseQualityScore(
  summary: RestaurantLighthouseAuditSummary | null,
): number | null {
  if (!summary) return null
  const scores = [
    summary.performanceScore,
    summary.accessibilityScore,
    summary.bestPracticesScore,
    summary.seoScore,
  ].filter((score): score is number => typeof score === "number")

  if (scores.length === 0) return null

  return scores.reduce((acc, score) => acc + score, 0) / scores.length
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

function buildOpenDataDetails(profile: RestaurantGrowthProfile): string[] {
  const completeness = Math.round(clamp(profile.profileCompleteness, 0, 1) * 100)
  const details = [
    `${profile.category || "Restaurant"} listing found for ${profile.name}.`,
    `Public profile completeness is ${completeness}%.`,
  ]

  if (profile.websiteUrl) {
    details.push("A website is attached to the public listing.")
  } else {
    details.push("No website was found in the public listing.")
  }

  if (profile.googleReviewCount > 0) {
    details.push(`${profile.googleReviewCount} reviews are available for reputation context.`)
  } else {
    details.push("No public review volume was available in this scan.")
  }

  return details
}

function buildWebsiteDetails(website: RestaurantWebsiteSignals): string[] {
  const present = [
    website.hasMobileFriendlyLayout ? "mobile viewport" : null,
    website.hasMenu ? "menu access" : null,
    website.hasOnlineOrdering ? "online ordering" : null,
    website.hasReservations ? "reservations" : null,
    website.hasPhoneVisible ? "click-to-call" : null,
    website.hasLocationSchema ? "local schema" : null,
    website.hasMetaDescription ? "search description" : null,
  ].filter((item): item is string => item !== null)

  const missing = [
    !website.hasMobileFriendlyLayout ? "mobile viewport" : null,
    !website.hasMenu ? "menu access" : null,
    !website.hasOnlineOrdering ? "online ordering" : null,
    !website.hasReservations ? "reservations" : null,
    !website.hasPhoneVisible ? "click-to-call" : null,
    !website.hasLocationSchema ? "local schema" : null,
    !website.hasMetaDescription ? "search description" : null,
  ].filter((item): item is string => item !== null)

  return [
    `${present.length} of 7 website conversion signals were found.`,
    ...buildLighthouseDetails(website),
    `Load time measured around ${formatSeconds(website.loadTimeMs)}.`,
    missing.length > 0
      ? `Missing signals: ${missing.slice(0, 3).join(", ")}.`
      : "Core website signals are present.",
  ]
}

function buildLighthouseDetails(website: RestaurantWebsiteSignals): string[] {
  if (!website.lighthouse) return []

  return [
    website.lighthouse.mobile?.performanceScore !== null && website.lighthouse.mobile?.performanceScore !== undefined
      ? `Mobile Lighthouse performance: ${website.lighthouse.mobile.performanceScore}/100.`
      : null,
    website.lighthouse.desktop?.performanceScore !== null && website.lighthouse.desktop?.performanceScore !== undefined
      ? `Desktop Lighthouse performance: ${website.lighthouse.desktop.performanceScore}/100.`
      : null,
  ].filter((item): item is string => item !== null)
}

function buildBenchmarkDetails(profile: RestaurantGrowthProfile): string[] {
  if (profile.localRank === null) {
    return [
      "Nearby competitor data was limited for this location.",
      "Discovery score is directional until more local benchmark data is connected.",
    ]
  }

  const rankCopy = profile.localRank <= 3
    ? "The restaurant appears strong against nearby discovery signals."
    : profile.localRank <= 6
      ? "The restaurant is visible, but competitors may still win some high-intent searches."
      : "Nearby competitors may be easier to find in local search."

  return [
    `Estimated local visibility rank: ${profile.localRank}.`,
    rankCopy,
  ]
}

function buildReputationDetails(profile: RestaurantGrowthProfile): string[] {
  if (isReputationUnknown(profile)) {
    return [
      "Reputation data was not available in this free scan.",
      "The score uses a neutral baseline until ratings and review volume are connected.",
    ]
  }

  const details = [
    `Rating baseline: ${profile.googleRating.toFixed(1)} across ${profile.googleReviewCount} reviews.`,
  ]

  if (profile.recentNegativeReviewCount > 0) {
    details.push(`${profile.recentNegativeReviewCount} recent negative-review signals were estimated.`)
  }

  if (profile.unansweredReviewCount > 0) {
    details.push(`${profile.unansweredReviewCount} reviews appear unanswered or need response attention.`)
  }

  if (profile.competitorAverageRating !== null) {
    const delta = profile.googleRating - profile.competitorAverageRating
    details.push(`Rating delta versus competitors: ${formatSigned(delta)} stars.`)
  }

  return details
}

function buildBriefDetails(
  issues: RestaurantGrowthIssue[],
  recommendations: RestaurantGrowthRecommendation[],
): string[] {
  const topIssue = issues[0]
  const nextRecommendation = recommendations[0]

  if (!topIssue && !nextRecommendation) {
    return [
      "No severe leak was found in the free scan.",
      "The next move is to monitor week-over-week performance and keep conversion paths fresh.",
    ]
  }

  return [
    topIssue ? `Highest-risk leak: ${topIssue.message}` : "No severe leak was found.",
    nextRecommendation
      ? `First fix: ${nextRecommendation.action}`
      : "Start with the weakest score category.",
  ]
}

function buildDataQuality(
  profile: RestaurantGrowthProfile,
  hasSocial: boolean,
): RestaurantDataQuality {
  const hasWebsite = Boolean(profile.websiteUrl)
  const hasReputation = !isReputationUnknown(profile)
  const missingCriticalData = [
    !hasWebsite ? "Verified website URL" : null,
    !hasReputation ? "Verified reputation data" : null,
    !hasSocial ? "Confirmed social profile data" : null,
  ].filter((item): item is string => item !== null)

  return {
    provider: dataQualityProvider(profile),
    hasWebsite,
    hasReputation,
    hasSocial,
    missingCriticalData,
  }
}

function dataQualityProvider(profile: RestaurantGrowthProfile): RestaurantDataQuality["provider"] {
  if (profile.reputationDataSource === "google") return "google"
  if (profile.reputationDataSource === "manual") return "mixed"
  if (profile.reputationDataSource === "open-data") return "osm"
  return "osm"
}

function buildDiagnosticSteps(
  profile: RestaurantGrowthProfile,
  scoreDetails: RestaurantScoreDetails,
  issues: RestaurantGrowthIssue[],
  recommendations: RestaurantGrowthRecommendation[],
): DiagnosticStepResult[] {
  return [
    buildOpenDataStep(profile),
    buildWebsiteStep(profile),
    buildBenchmarkStep(profile),
    buildReputationStep(profile),
    buildSocialSkippedStep(),
    buildBriefStep(issues, recommendations, scoreDetails.brief),
  ]
}

function buildOpenDataStep(profile: RestaurantGrowthProfile): DiagnosticStepResult {
  const completeness = clamp(profile.profileCompleteness, 0, 1)

  return {
    id: "openData",
    status: completeness >= 0.72 ? "complete" : "partial",
    source: "Public business listing",
    confidence: completeness >= 0.84 ? "high" : completeness >= 0.5 ? "medium" : "low",
    checked: ["Business name", "Category", "Address", "Website URL", "Profile completeness"],
    found: [
      profile.name ? `Name: ${profile.name}` : null,
      profile.category ? `Category: ${profile.category}` : null,
      profile.address ? "Address available" : null,
      profile.websiteUrl ? "Website URL attached" : null,
      `Profile completeness: ${Math.round(completeness * 100)}%`,
    ].filter((item): item is string => item !== null),
    missing: [
      !profile.websiteUrl ? "Website URL" : null,
      completeness < 0.72 ? "Some public listing fields" : null,
    ].filter((item): item is string => item !== null),
    assumptions: ["Public listing data may be incomplete or outdated."],
    errors: [],
  }
}

function buildWebsiteStep(profile: RestaurantGrowthProfile): DiagnosticStepResult {
  const website = profile.website
  const hasLighthouse = Boolean(website.lighthouse)
  const found = [
    website.hasMobileFriendlyLayout ? "Mobile viewport" : null,
    website.hasMenu ? "Menu access" : null,
    website.hasOnlineOrdering ? "Online ordering signal" : null,
    website.hasReservations ? "Reservation signal" : null,
    website.hasPhoneVisible ? "Click-to-call link" : null,
    website.hasLocationSchema ? "Local schema" : null,
    website.hasMetaDescription ? "Meta description" : null,
    website.lighthouse?.mobile?.performanceScore !== null && website.lighthouse?.mobile?.performanceScore !== undefined
      ? `Mobile Lighthouse performance: ${website.lighthouse.mobile.performanceScore}/100`
      : null,
    website.lighthouse?.desktop?.performanceScore !== null && website.lighthouse?.desktop?.performanceScore !== undefined
      ? `Desktop Lighthouse performance: ${website.lighthouse.desktop.performanceScore}/100`
      : null,
    `Initial HTML response around ${formatSeconds(website.loadTimeMs)}`,
  ].filter((item): item is string => item !== null)
  const missing = [
    !profile.websiteUrl ? "Website URL" : null,
    profile.websiteUrl && !website.hasMobileFriendlyLayout ? "Mobile viewport" : null,
    profile.websiteUrl && !website.hasMenu ? "Menu access" : null,
    profile.websiteUrl && !website.hasOnlineOrdering ? "Online ordering signal" : null,
    profile.websiteUrl && !website.hasReservations ? "Reservation signal" : null,
    profile.websiteUrl && !website.hasPhoneVisible ? "Click-to-call link" : null,
    profile.websiteUrl && !website.hasLocationSchema ? "Local schema" : null,
    profile.websiteUrl && !website.hasMetaDescription ? "Meta description" : null,
  ].filter((item): item is string => item !== null)

  if (!profile.websiteUrl) {
    return {
      id: "website",
      status: "skipped",
      source: "Website scanner",
      confidence: "low",
      checked: ["Website URL from public listing"],
      found,
      missing,
      assumptions: ["No owned website was available in the public listing."],
      errors: [],
    }
  }

  return {
    id: "website",
    status: missing.length === 0 ? "complete" : "partial",
    source: hasLighthouse ? "PageSpeed Insights Lighthouse + website HTML fetch" : "Website HTML fetch",
    confidence: hasLighthouse ? "high" : website.loadTimeMs <= 4_000 ? "medium" : "low",
    checked: [
      "Mobile viewport",
      "Menu",
      "Ordering",
      "Reservations",
      "Phone",
      "Local schema",
      "Meta description",
      "Initial response time",
      ...(hasLighthouse ? ["Mobile Lighthouse audit", "Desktop Lighthouse audit"] : []),
    ],
    found,
    missing,
    assumptions: hasLighthouse
      ? ["Lighthouse uses lab data and should be paired with real analytics before making revenue claims."]
      : ["The current scan reads the initial HTML response and does not render JavaScript."],
    errors: [],
  }
}

function buildBenchmarkStep(profile: RestaurantGrowthProfile): DiagnosticStepResult {
  if (profile.localRank === null) {
    return {
      id: "benchmark",
      status: "partial",
      source: "OpenStreetMap nearby-place benchmark",
      confidence: "low",
      checked: ["Nearby food businesses", "Relative website availability", "Relative phone availability"],
      found: [],
      missing: ["Enough nearby benchmark data for a stronger local visibility read"],
      assumptions: ["The local benchmark is a heuristic, not a Google Maps rank or sales comparison."],
      errors: [],
    }
  }

  return {
    id: "benchmark",
    status: "complete",
    source: "OpenStreetMap nearby-place benchmark",
    confidence: "medium",
    checked: ["Nearby food businesses", "Relative website availability", "Relative phone availability"],
    found: [`Estimated visibility heuristic: ${profile.localRank}`],
    missing: [],
    assumptions: ["The local benchmark is directional and should not be treated as true rank tracking."],
    errors: [],
  }
}

function buildReputationStep(profile: RestaurantGrowthProfile): DiagnosticStepResult {
  if (isReputationUnknown(profile)) {
    return {
      id: "reputation",
      status: "partial",
      source: "Reputation baseline",
      confidence: "low",
      checked: ["Rating", "Review count", "Negative-review risk", "Unanswered-review risk"],
      found: ["Neutral reputation baseline applied"],
      missing: ["Verified rating", "Verified review count", "Review response status"],
      assumptions: ["A neutral reputation baseline was used because ratings and review volume were unavailable."],
      errors: [],
    }
  }

  const source = profile.reputationDataSource === "google"
    ? "Google Places reputation summary"
    : profile.reputationDataSource === "manual"
      ? "Manual reputation input"
      : "Public reputation data"

  return {
    id: "reputation",
    status: "complete",
    source,
    confidence: profile.googleReviewCount >= 30 ? "high" : "medium",
    checked: ["Rating", "Review count", "Negative-review risk", "Unanswered-review risk"],
    found: [
      `Rating: ${profile.googleRating.toFixed(1)}`,
      `Review count: ${profile.googleReviewCount}`,
      `Estimated negative-review signals: ${profile.recentNegativeReviewCount}`,
    ],
    missing: profile.unansweredReviewCount === 0 ? ["Verified review response status"] : [],
    assumptions: profile.recentNegativeReviewCount > 0
      ? ["Negative-review count is estimated unless a review text provider is connected."]
      : [],
    errors: [],
  }
}

function buildSocialSkippedStep(): DiagnosticStepResult {
  return {
    id: "social",
    status: "skipped",
    source: "Public social profile scan",
    confidence: "low",
    checked: ["Instagram", "Facebook", "TikTok"],
    found: [],
    missing: ["Confirmed social handles or social provider data"],
    assumptions: ["Social is omitted unless handles and provider data are available."],
    errors: [],
  }
}

function buildBriefStep(
  issues: RestaurantGrowthIssue[],
  recommendations: RestaurantGrowthRecommendation[],
  details: readonly string[],
): DiagnosticStepResult {
  return {
    id: "brief",
    status: "complete",
    source: "Atrium diagnostic model",
    confidence: issues.length > 0 || recommendations.length > 0 ? "medium" : "high",
    checked: ["Highest-risk leak", "First recommended fix", "Business impact translation"],
    found: details,
    missing: [],
    assumptions: ["The free scan translates public signals and does not include POS, CRM, margin, or private analytics data."],
    errors: [],
  }
}

function buildScoreInterpretation(
  scores: RestaurantGrowthScores,
  profile: RestaurantGrowthProfile,
): RestaurantScoreInterpretation[] {
  return scoreEntries(scores).map(([category, score]) => ({
    category,
    label: scoreLabel(category),
    score,
    status: scoreStatus(score),
    meaning: scoreMeaning(category, score, profile),
    businessImpact: scoreBusinessImpact(category, score, profile),
    atriumFix: scoreAtriumFix(category, score),
  }))
}

function buildBusinessImpact(
  overallScore: number,
  issues: RestaurantGrowthIssue[],
): RestaurantBusinessImpact {
  const highIssues = issues.filter((issue) => issue.severity === "high").length

  if (overallScore >= 85 && highIssues === 0) {
    return {
      level: "low",
      headline: "Most obvious demand leaks are under control.",
      explanation: "The restaurant is likely capturing a healthy share of guests who already find it. The opportunity is incremental: better tracking, sharper offers, and more repeatable growth rhythm.",
    }
  }

  if (overallScore >= 65) {
    return {
      level: "medium",
      headline: "Some ready-to-buy guests are likely dropping before they act.",
      explanation: "The restaurant has enough digital presence to create demand, but friction in discovery, trust, or conversion can turn searches into missed orders, reservations, and calls.",
    }
  }

  return {
    level: "high",
    headline: "The restaurant is likely losing meaningful local demand.",
    explanation: "When search visibility, website action paths, and trust signals are weak together, guests often choose a competitor before the restaurant gets a chance to convert them.",
  }
}

function buildExecutiveSummary(
  overallScore: number,
  issues: RestaurantGrowthIssue[],
  recommendations: RestaurantGrowthRecommendation[],
  businessImpact: RestaurantBusinessImpact,
): RestaurantExecutiveSummary {
  const topIssue = issues[0]
  const nextRecommendation = recommendations[0]

  return {
    headline: headlineForScore(overallScore),
    summary: businessImpact.explanation,
    priority: topIssue
      ? `${topIssue.message} ${topIssue.impact}`
      : "No critical leak was found in this scan. The priority is to keep the strongest channels consistent and measurable.",
    atriumPlan: buildAtriumPlan(recommendations, nextRecommendation),
  }
}

function buildAtriumPlan(
  recommendations: RestaurantGrowthRecommendation[],
  nextRecommendation: RestaurantGrowthRecommendation | undefined,
): string[] {
  const plan = [
    nextRecommendation?.action ?? "Validate the strongest channel and weakest leak with a deeper audit.",
    "Prioritize a 30-day implementation plan around the category most likely to unlock orders, bookings, or calls.",
    "Track the fixes against search visibility, website actions, review momentum, and social activity.",
  ]

  for (const recommendation of recommendations.slice(1, 3)) {
    if (!plan.includes(recommendation.action)) {
      plan.push(recommendation.action)
    }
  }

  return plan.slice(0, 4)
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

function headlineForScore(score: number): string {
  if (score >= 85) return "Strong foundation, now optimize the growth system."
  if (score >= 70) return "Good demand exists, but friction is costing the restaurant."
  if (score >= 55) return "The restaurant has visible leaks across the guest journey."
  return "The digital presence is likely leaving demand for competitors."
}

function scoreEntries(scores: RestaurantGrowthScores): Array<[keyof RestaurantGrowthScores, number]> {
  return (Object.entries(scores) as Array<[keyof RestaurantGrowthScores, number | undefined]>)
    .filter((entry): entry is [keyof RestaurantGrowthScores, number] => entry[1] !== undefined)
}

function scoreLabel(category: keyof RestaurantGrowthScores): string {
  const labels: Record<keyof RestaurantGrowthScores, string> = {
    discovery: "Discovery",
    website: "Website",
    reputation: "Reputation",
    conversion: "Conversion",
    social: "Social",
  }
  return labels[category]
}

function scoreStatus(score: number): RestaurantScoreInterpretation["status"] {
  if (score >= 80) return "healthy"
  if (score >= 60) return "watch"
  return "leaking"
}

function scoreMeaning(
  category: keyof RestaurantGrowthScores,
  score: number,
  profile: RestaurantGrowthProfile,
): string {
  const status = scoreStatus(score)

  if (category === "discovery") {
    if (status === "healthy") return "Guests can likely find the restaurant when they search nearby."
    if (status === "watch") return "The restaurant is findable, but local search coverage is not strong enough to rely on."
    return "The restaurant may be invisible for high-intent local searches."
  }

  if (category === "website") {
    if (!profile.websiteUrl) return "No website was found, so search traffic has fewer owned paths to convert."
    if (status === "healthy") return "The website has most of the basic signals guests need before taking action."
    if (status === "watch") return "The website has useful information, but some guest actions still require effort."
    return "The website is likely creating friction for guests who are ready to order, reserve, or call."
  }

  if (category === "reputation") {
    if (isReputationUnknown(profile)) return "Review quality could not be confirmed in this free scan."
    if (status === "healthy") return "The reputation baseline supports trust before a guest visits or orders."
    if (status === "watch") return "Reputation is not a full blocker, but weak spots can reduce conversion from search."
    return "Ratings, review volume, or unanswered reviews may be costing trust."
  }

  if (category === "conversion") {
    if (status === "healthy") return "Core calls to action are visible enough for guests to act."
    if (status === "watch") return "Guests can act, but the path is not direct enough."
    return "The restaurant is making interested guests work too hard to become customers."
  }

  if (status === "healthy") return "Social presence is supporting discovery and trust."
  if (status === "watch") return "Social presence exists, but activity or completeness is uneven."
  return "Social channels are not yet doing enough to create demand or trust."
}

function scoreBusinessImpact(
  category: keyof RestaurantGrowthScores,
  score: number,
  profile: RestaurantGrowthProfile,
): string {
  const status = scoreStatus(score)

  if (category === "discovery") {
    return status === "healthy"
      ? "Discovery is helping the restaurant compete for nearby intent."
      : "Lower discovery can mean fewer guests ever reach the website, menu, phone, or reservation flow."
  }

  if (category === "website") {
    return status === "healthy"
      ? "The website is less likely to block ready-to-buy visitors."
      : profile.websiteUrl
        ? "Website friction can turn paid, social, and search traffic into abandoned visits."
        : "Without an owned website path, the restaurant depends more heavily on third-party platforms."
  }

  if (category === "reputation") {
    return status === "healthy"
      ? "Strong trust signals make search impressions more likely to become visits."
      : "Weak or unclear reputation makes guests compare alternatives before choosing."
  }

  if (category === "conversion") {
    return status === "healthy"
      ? "Guests have clear ways to order, reserve, or call."
      : "Conversion gaps directly affect orders, bookings, calls, and attribution."
  }

  return status === "healthy"
    ? "Social is helping reinforce demand outside search."
    : "Weak social signals can reduce familiarity, proof, and repeat attention."
}

function scoreAtriumFix(category: keyof RestaurantGrowthScores, score: number): string {
  const status = scoreStatus(score)

  if (category === "discovery") {
    return status === "healthy"
      ? "Atrium would monitor rank movement and keep listings consistent."
      : "Atrium would tighten profile coverage, local landing-page intent, and review velocity."
  }

  if (category === "website") {
    return status === "healthy"
      ? "Atrium would tune speed, tracking, and landing-page experiments."
      : "Atrium would fix menu access, page speed, local schema, and action paths."
  }

  if (category === "reputation") {
    return status === "healthy"
      ? "Atrium would protect review momentum and response consistency."
      : "Atrium would build a review response and review generation rhythm."
  }

  if (category === "conversion") {
    return status === "healthy"
      ? "Atrium would test offers and attribution across ordering, booking, and calls."
      : "Atrium would make ordering, reservations, and click-to-call visible in the first decision moments."
  }

  return status === "healthy"
    ? "Atrium would keep social cadence tied to measurable demand."
    : "Atrium would repair profile completeness, posting cadence, and high-intent social CTAs."
}

function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
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
