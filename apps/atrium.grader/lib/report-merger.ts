import type {
  DiagnosticStepResult,
  RestaurantGrowthReport,
  RestaurantScoreInterpretation,
} from "@atrium/application"

export type NarrativeData = {
  readonly headline: string
  readonly summary: string
  readonly priority: string
  readonly primaryLeak: string
  readonly rootCause: string
  readonly whyItMatters: string
  readonly firstMove: string
  readonly thirtyDayPlan: readonly string[]
  readonly evidenceHighlights: readonly string[]
  readonly atriumPlan?: readonly string[]
  readonly businessImpactHeadline: string
  readonly businessImpactExplanation: string
  readonly estimatedLostOpportunity: string
  readonly scoreInterpretations: ReadonlyArray<{
    readonly category: "discovery" | "website" | "reputation" | "conversion" | "social"
    readonly meaning: string
    readonly businessImpact: string
    readonly atriumFix: string
  }>
}

export function mergeNarrativeIntoReport(
  report: RestaurantGrowthReport,
  narrative: NarrativeData,
): RestaurantGrowthReport {
  const updatedInterpretations: RestaurantScoreInterpretation[] = report.scoreInterpretation.map((interp) => {
    const match = narrative.scoreInterpretations.find((i) => i.category === interp.category)
    if (!match) return interp
    return { ...interp, meaning: match.meaning, businessImpact: match.businessImpact, atriumFix: match.atriumFix }
  })

  return {
    ...report,
    executiveSummary: {
      ...report.executiveSummary,
      headline: narrative.headline,
      summary: narrative.summary,
      priority: narrative.priority,
      primaryLeak: narrative.primaryLeak,
      rootCause: narrative.rootCause,
      whyItMatters: narrative.whyItMatters,
      firstMove: narrative.firstMove,
      evidenceHighlights: narrative.evidenceHighlights,
      atriumPlan: narrative.thirtyDayPlan.length > 0
        ? narrative.thirtyDayPlan
        : narrative.atriumPlan ?? report.executiveSummary.atriumPlan,
    },
    businessImpact: {
      ...report.businessImpact,
      headline: narrative.businessImpactHeadline,
      explanation: narrative.businessImpactExplanation,
    },
    estimatedLostOpportunity: narrative.estimatedLostOpportunity,
    scoreInterpretation: updatedInterpretations,
  }
}

export function mergeSocialIntoReport(
  report: RestaurantGrowthReport,
  socialHealth: NonNullable<RestaurantGrowthReport["socialHealth"]>,
): RestaurantGrowthReport {
  const socialDetails = buildSocialDetails(socialHealth)

  return {
    ...report,
    scores: { ...report.scores, social: socialHealth.score },
    scoreDetails: { ...report.scoreDetails, social: socialDetails },
    scoreInterpretation: [...report.scoreInterpretation, buildSocialInterpretation(socialHealth.score)],
    providerVersions: {
      ...report.providerVersions,
      social: "scrapecreators-social-v1",
    },
    diagnosticSteps: report.diagnosticSteps.map((step) =>
      step.id === "social" ? buildSocialDiagnosticStep(socialHealth, socialDetails) : step
    ),
    dataQuality: {
      ...report.dataQuality,
      hasSocial: true,
      missingCriticalData: report.dataQuality.missingCriticalData.filter(
        (item) => item !== "Confirmed social profile data"
      ),
    },
    overallScore: Math.round(
      (report.scores.discovery ?? 0) * 0.20
      + (report.scores.website ?? 0) * 0.20
      + (report.scores.reputation ?? 0) * 0.20
      + (report.scores.conversion ?? 0) * 0.20
      + socialHealth.score * 0.20,
    ),
    socialHealth,
  }
}

function buildSocialDetails(socialHealth: NonNullable<RestaurantGrowthReport["socialHealth"]>): string[] {
  const activePlatforms = socialHealth.platforms.filter((p) => p.score > 0)
  const bestPlatform = [...socialHealth.platforms].sort((a, b) => b.score - a.score)[0]
  const issueCount = socialHealth.issues.length

  return [
    activePlatforms.length > 0
      ? `${activePlatforms.length} social platform${activePlatforms.length === 1 ? "" : "s"} returned usable signals.`
      : "No usable social platform signals were found.",
    bestPlatform
      ? `Strongest social channel: ${bestPlatform.platform} at ${bestPlatform.score}/100.`
      : "No social channel is strong enough to benchmark yet.",
    issueCount > 0
      ? `${issueCount} social issue${issueCount === 1 ? "" : "s"} need attention.`
      : "No major social issue was detected.",
  ]
}

function buildSocialDiagnosticStep(
  socialHealth: NonNullable<RestaurantGrowthReport["socialHealth"]>,
  details: readonly string[],
): DiagnosticStepResult {
  const activePlatforms = socialHealth.platforms.filter((p) => p.score > 0)
  const inactivePlatforms = socialHealth.platforms.filter((p) => p.score <= 0)

  return {
    id: "social",
    status: activePlatforms.length > 0 ? "complete" : "partial",
    source: "ScrapeCreators public social scan",
    confidence: activePlatforms.length >= 2 ? "medium" : "low",
    checked: ["Instagram profile", "Facebook profile", "TikTok profile", "Posting activity", "Profile completeness", "Engagement"],
    found: [...activePlatforms.map((p) => `${p.platform}: ${p.score}/100`), ...details],
    missing: inactivePlatforms.map((p) => `${p.platform} usable signals`),
    assumptions: ["Social score uses public profile data only and does not include reach, saves, shares, paid media, or conversion data."],
    errors: [],
  }
}

function buildSocialInterpretation(score: number): RestaurantScoreInterpretation {
  const status = score >= 80 ? "healthy" : score >= 60 ? "watch" : "leaking"

  return {
    category: "social",
    label: "Social",
    score,
    status,
    meaning: status === "healthy"
      ? "Social presence is supporting discovery and trust."
      : status === "watch"
        ? "Social presence exists, but posting cadence or profile completeness is uneven."
        : "Social channels are not yet creating enough proof, activity, or attention.",
    businessImpact: status === "healthy"
      ? "Social can reinforce decisions after guests discover the restaurant elsewhere."
      : "Weak social signals can make the restaurant feel less active than competitors.",
    atriumFix: status === "healthy"
      ? "Atrium would tie social cadence to offers, events, and measurable demand."
      : "Atrium would repair profile completeness, posting rhythm, and high-intent calls to action.",
  }
}
