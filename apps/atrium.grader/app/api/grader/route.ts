import type { DiagnosticStepResult, RestaurantGrowthReport, RestaurantScoreInterpretation } from "@atrium/application"
import { gradeRestaurantGrowth, scoreSocialHealth } from "@atrium/application"
import { NextResponse } from "next/server"
import { autoDetectSocial } from "@/lib/auto-detect-social"
import type { ManualReputationInput } from "@/lib/open-data-places"
import { getRestaurantGrowthProfileFromPlace, OpenDataPlacesLookupError } from "@/lib/open-data-places"
import { runPageSpeedWebsiteAudit } from "@/lib/pagespeed-client"
import { generateReportNarrative, mergeNarrativeIntoReport } from "@/lib/report-agent"
import { scanSocialProfiles } from "@/lib/scrape-creators"

const PAGESPEED_TIMEOUT_MS = 20_000

function pagespeedWithTimeout(websiteUrl: string): Promise<Awaited<ReturnType<typeof runPageSpeedWebsiteAudit>> | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), PAGESPEED_TIMEOUT_MS))
  return Promise.race([
    runPageSpeedWebsiteAudit(websiteUrl).catch(() => null),
    timeout,
  ])
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as {
    placeId?: unknown
    reputation?: ManualReputationInput
  } | null

  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  try {
    const { profile, googleMeta } = await getRestaurantGrowthProfileFromPlace(placeId, {
      rating: typeof body?.reputation?.rating === "number" ? body.reputation.rating : null,
      reviewCount: typeof body?.reputation?.reviewCount === "number" ? body.reputation.reviewCount : null,
    })

    // PageSpeed + social run in parallel — both optional, neither blocks the other
    const [lighthouseResult, handles] = await Promise.all([
      Boolean(process.env.PAGESPEED_API_KEY?.trim()) && profile.websiteUrl
        ? pagespeedWithTimeout(profile.websiteUrl)
        : Promise.resolve(null),
      Boolean(process.env.SCRAPECREATORS_API_KEY)
        ? autoDetectSocial(profile.websiteUrl, profile.name).catch(() => null)
        : Promise.resolve(null),
    ])

    // Merge Lighthouse into profile before grading if it arrived in time
    const gradingProfile = lighthouseResult && profile.websiteUrl
      ? { ...profile, website: { ...profile.website, lighthouse: lighthouseResult } }
      : profile

    const result = gradeRestaurantGrowth(gradingProfile)

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    let baseReport = result.value

    // Social layer — enriches scores and interpretation if handles were found
    if (handles) {
      const socialScan = await scanSocialProfiles(handles)
      const socialHealth = scoreSocialHealth(socialScan)
      const socialDetails = buildSocialDetails(socialHealth)

      baseReport = {
        ...baseReport,
        scores: { ...baseReport.scores, social: socialHealth.score },
        scoreDetails: { ...baseReport.scoreDetails, social: socialDetails },
        scoreInterpretation: [...baseReport.scoreInterpretation, buildSocialInterpretation(socialHealth.score)],
        diagnosticSteps: baseReport.diagnosticSteps.map((step) =>
          step.id === "social" ? buildSocialDiagnosticStep(socialHealth, socialDetails) : step
        ),
        dataQuality: {
          ...baseReport.dataQuality,
          hasSocial: true,
          missingCriticalData: baseReport.dataQuality.missingCriticalData.filter((item) =>
            item !== "Confirmed social profile data"
          ),
        },
        overallScore: Math.round(
          baseReport.scores.discovery * 0.20
          + baseReport.scores.website * 0.20
          + baseReport.scores.reputation * 0.20
          + baseReport.scores.conversion * 0.20
          + socialHealth.score * 0.20,
        ),
        socialHealth,
      }
    }

    // Agentic narrative layer — generates contextual copy from scored data
    const narrative = await generateReportNarrative({
      profile: gradingProfile,
      googleMeta,
      scores: baseReport.scores,
      overallScore: baseReport.overallScore,
      issues: baseReport.issues,
      recommendations: baseReport.recommendations,
    })

    const report = narrative ? mergeNarrativeIntoReport(baseReport, narrative) : baseReport

    return NextResponse.json({ report })
  } catch (error) {
    if (error instanceof OpenDataPlacesLookupError) {
      const status = error.message === "Business not found"
        ? 404
        : error.message === "placeId is required"
          ? 400
          : 502
      return NextResponse.json({ error: error.message }, { status })
    }

    return NextResponse.json({ error: "Unable to run diagnostic" }, { status: 500 })
  }
}

function buildSocialDetails(socialHealth: RestaurantGrowthReport["socialHealth"]): string[] {
  if (!socialHealth) return []

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
