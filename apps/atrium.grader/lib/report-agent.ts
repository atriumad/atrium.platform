import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import type {
  RestaurantGrowthIssue,
  RestaurantGrowthProfile,
  RestaurantGrowthRecommendation,
  RestaurantGrowthScores,
} from "@atrium/application"
import { generateText } from "ai"
import { z } from "zod"
import type { GooglePlaceMeta } from "./google-places-client"
import type { NarrativeData } from "./report-merger"

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

const SYSTEM_PROMPT = `You are the Atrium Growth Intelligence engine — an AI analyst for restaurant marketing diagnostics.

Analyze the restaurant data and write the narrative sections of a growth diagnostic report.
Tone: direct, expert, business-focused. Not motivational or salesy. Honest about gaps.
The restaurant owner or operator will read this. Avoid jargon.
Be specific — use the actual restaurant name, category, address, and real data points in your copy.
Never invent data not present in the input. Never be vague when a number is available.

IMPORTANT: Respond ONLY with a valid JSON object. No markdown. No code fences. No explanation. Raw JSON only.`

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
${recLines}

OUTPUT: Return ONLY this JSON object with these exact keys filled in (no other keys, no markdown):
{
  "headline": "<one sharp sentence — the key growth situation, max 12 words>",
  "summary": "<2-3 sentences about this specific restaurant using its actual data>",
  "priority": "<one sentence: what must be fixed first and why>",
  "atriumPlan": ["<action 1>", "<action 2>", "<action 3>", "<action 4>"],
  "businessImpactHeadline": "<one sentence: business consequence of the current score>",
  "businessImpactExplanation": "<2 sentences: what this means in guests, orders, revenue>",
  "estimatedLostOpportunity": "<one sentence: qualitative estimate of demand leaking>",
  "scoreInterpretations": [
    {
      "category": "discovery",
      "meaning": "<what this score means operationally>",
      "businessImpact": "<what this costs in guests or revenue>",
      "atriumFix": "<what Atrium would specifically do>"
    }
  ]
}`
}

function resolveModel(provider: string) {
  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY?.trim()
    if (!key) throw new Error("ANTHROPIC_API_KEY required for anthropic provider")
    return createAnthropic({ apiKey: key })("claude-haiku-4-5-20251001")
  }

  if (provider === "google") {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
    if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY required for google provider")
    return createGoogleGenerativeAI({ apiKey: key })("gemini-2.0-flash")
  }

  // openrouter — default provider, uses free models
  const key = process.env.OPENROUTER_API_KEY?.trim()
  if (!key) throw new Error("OPENROUTER_API_KEY required for openrouter provider")
  const model = process.env.GRADER_AI_MODEL?.trim() ?? "openrouter/free"
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
  })(model)
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{")
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaping = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]!
    if (escaping) { escaping = false; continue }
    if (ch === "\\") { escaping = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

export async function generateReportNarrative(ctx: AgentContext): Promise<NarrativeData | null> {
  const provider = process.env.GRADER_AI_PROVIDER?.trim().toLowerCase() ?? "openrouter"

  let model: ReturnType<typeof resolveModel> | undefined
  try {
    model = resolveModel(provider)
  } catch (e) {
    console.error("[report-agent] model init failed:", e)
    return null
  }

  try {
    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(ctx),
    })

    const jsonStr = extractFirstJsonObject(text)
    if (!jsonStr) {
      console.error("[report-agent] no JSON found in response:", text.slice(0, 200))
      return null
    }

    const parsed: unknown = JSON.parse(jsonStr)

    // Try top-level first, then one level deep (some models wrap in a parent key)
    const candidates: unknown[] = [parsed]
    if (parsed !== null && typeof parsed === "object") {
      for (const v of Object.values(parsed as Record<string, unknown>)) {
        if (v !== null && typeof v === "object") candidates.push(v)
      }
    }

    for (const candidate of candidates) {
      const result = NarrativeSchema.safeParse(candidate)
      if (result.success) return result.data
    }

    console.error("[report-agent] schema validation failed for all candidates")
    return null
  } catch (e) {
    console.error("[report-agent] generateText failed:", e)
    return null
  }
}

