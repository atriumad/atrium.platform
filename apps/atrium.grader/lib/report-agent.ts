import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type {
  RestaurantGrowthIssue,
  RestaurantGrowthProfile,
  RestaurantGrowthRecommendation,
  RestaurantGrowthReport,
  RestaurantGrowthScores,
  RestaurantScoreInterpretation,
} from "@atrium/application"
import { generateObject } from "ai"
import { z } from "zod"
import type { GooglePlaceMeta } from "./google-places-client"

export type AgentContext = {
  readonly profile: RestaurantGrowthProfile
  readonly googleMeta: GooglePlaceMeta | null
  readonly scores: RestaurantGrowthScores
  readonly overallScore: number
  readonly issues: readonly RestaurantGrowthIssue[]
  readonly recommendations: readonly RestaurantGrowthRecommendation[]
}

const NarrativeSchema = z.object({
  headline: z.string().describe("One sharp sentence — the key growth situation. Max 12 words."),
  summary: z.string().describe("2-3 sentences contextual to this specific restaurant and its actual data."),
  priority: z.string().describe("One sentence: what must be fixed first and why."),
  atriumPlan: z.array(z.string()).length(4).describe("4 concrete actions ordered by priority — most impactful first."),
  businessImpactHeadline: z.string().describe("One sentence: the business consequence of the current score."),
  businessImpactExplanation: z.string().describe("2 sentences: what this means in guests, orders, and revenue."),
  estimatedLostOpportunity: z.string().describe("One sentence: qualitative estimate of demand leaking."),
  scoreInterpretations: z.array(z.object({
    category: z.enum(["discovery", "website", "reputation", "conversion", "social"]),
    meaning: z.string().describe("What this score means operationally for this restaurant."),
    businessImpact: z.string().describe("What this costs the business in guests or revenue."),
    atriumFix: z.string().describe("What Atrium would specifically do to fix it."),
  })).describe("One entry per score category present."),
})

type NarrativeOutput = z.infer<typeof NarrativeSchema>

const SYSTEM_PROMPT = `You are the Atrium Growth Intelligence engine — an AI analyst for restaurant marketing diagnostics.

Analyze the restaurant data and write the narrative sections of a growth diagnostic report.
Tone: direct, expert, business-focused. Not motivational or salesy. Honest about gaps.
The restaurant owner or operator will read this. Avoid jargon.
Be specific — use the actual restaurant name, category, address, and real data points in your copy.
Never invent data not present in the input. Never be vague when a number is available.`

function buildPrompt(ctx: AgentContext): string {
  const { profile, googleMeta, scores, overallScore, issues, recommendations } = ctx

  const scoreLines = (Object.entries(scores) as [keyof RestaurantGrowthScores, number | undefined][])
    .filter((e): e is [keyof RestaurantGrowthScores, number] => e[1] !== undefined)
    .map(([k, v]) => `  ${k}: ${v}/100`)
    .join("\n")

  const websiteSignals = [
    profile.website.hasMobileFriendlyLayout ? "mobile-friendly" : "NOT mobile-friendly",
    profile.website.hasMenu ? "has menu" : "NO menu",
    profile.website.hasOnlineOrdering ? "has online ordering" : "NO online ordering",
    profile.website.hasReservations ? "has reservations" : "NO reservations",
    profile.website.hasPhoneVisible ? "phone visible" : "NO visible phone",
    profile.website.hasLocationSchema ? "local schema" : "NO local schema",
    profile.website.hasMetaDescription ? "meta description" : "NO meta description",
    `load ~${(profile.website.loadTimeMs / 1000).toFixed(1)}s`,
  ].join(", ")

  const lighthouseInfo = profile.website.lighthouse
    ? `Mobile performance: ${profile.website.lighthouse.mobile?.performanceScore ?? "n/a"}/100, SEO: ${profile.website.lighthouse.mobile?.seoScore ?? "n/a"}/100`
    : "Lighthouse: not available"

  const issueLines = issues.map((i) => `  [${i.severity}] ${i.category}: ${i.message}`).join("\n") || "  none"
  const recLines = recommendations.map((r) => `  ${r.category} (${r.effort}): ${r.action}`).join("\n") || "  none"

  const priceCopy = googleMeta?.priceLevel
    ? googleMeta.priceLevel.replace("PRICE_LEVEL_", "").toLowerCase()
    : "unknown"

  const serviceModel = googleMeta
    ? [
      googleMeta.dineIn && "dine-in",
      googleMeta.takeout && "takeout",
      googleMeta.delivery && "delivery",
      googleMeta.reservable && "reservations accepted",
    ].filter(Boolean).join(", ") || "service model unknown"
    : "service model unknown"

  return `RESTAURANT DIAGNOSTIC

Name: ${profile.name}
Category: ${profile.category}
Address: ${profile.address}
Website: ${profile.websiteUrl ?? "none"}
Price level: ${priceCopy}
Service model: ${serviceModel}
Hours published: ${googleMeta?.openingHoursPublished ? "yes" : "no"}
Editorial summary on Google: ${googleMeta?.hasEditorialSummary ? "yes" : "no"}

REPUTATION
Rating: ${profile.googleRating > 0 ? `${profile.googleRating}/5` : "unavailable"} (${profile.googleReviewCount} reviews)
Estimated negative reviews: ${profile.recentNegativeReviewCount}
Data source: ${profile.reputationDataSource ?? "unavailable"}

DISCOVERY
Profile completeness: ${Math.round(profile.profileCompleteness * 100)}%
Local rank signal: ${profile.localRank ?? "unavailable"}

WEBSITE SIGNALS
${websiteSignals}
${lighthouseInfo}

SCORES (0–100)
${scoreLines}
Overall: ${overallScore}/100

ISSUES
${issueLines}

RECOMMENDATIONS
${recLines}`
}

function resolveModel(provider: string) {
  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY?.trim()
    if (!key) throw new Error("ANTHROPIC_API_KEY required for anthropic provider")
    return createAnthropic({ apiKey: key })("claude-haiku-4-5-20251001")
  }

  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY required for google provider")
  return createGoogleGenerativeAI({ apiKey: key })("gemini-2.0-flash")
}

export async function generateReportNarrative(ctx: AgentContext): Promise<NarrativeOutput | null> {
  const provider = process.env.GRADER_AI_PROVIDER?.trim().toLowerCase() ?? "google"

  let model
  try {
    model = resolveModel(provider)
  } catch {
    return null
  }

  try {
    const { object } = await generateObject({
      model,
      schema: NarrativeSchema,
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(ctx),
    })

    return object
  } catch {
    return null
  }
}

export function mergeNarrativeIntoReport(
  report: RestaurantGrowthReport,
  narrative: NarrativeOutput,
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
      atriumPlan: narrative.atriumPlan,
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
