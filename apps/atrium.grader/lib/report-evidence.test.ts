import { describe, expect, test } from "bun:test"
import type { RestaurantGrowthProfile, RestaurantGrowthReport } from "@atrium/application"
import { buildAgentEvidenceContext } from "./report-evidence"

describe("buildAgentEvidenceContext", () => {
  test("compresses enriched provider data into decision-oriented evidence", () => {
    const profile = {
      name: "Atrium Bistro",
      category: "Restaurant",
      address: "12 Market St",
      websiteUrl: "https://atriumbistro.test",
      googleRating: 4.4,
      googleReviewCount: 128,
      recentNegativeReviewCount: 12,
      profileCompleteness: 0.75,
      localRank: 4,
      competitorAverageRating: 4.5,
      website: {
        hasMenu: true,
        hasOnlineOrdering: false,
        hasReservations: true,
        hasPhoneVisible: true,
        hasMobileFriendlyLayout: true,
        hasLocationSchema: false,
        hasMetaDescription: true,
        loadTimeMs: 2200,
      },
    } as RestaurantGrowthProfile

    const evidence = buildAgentEvidenceContext({
      profile,
      googleMeta: {
        priceLevel: "PRICE_LEVEL_MODERATE",
        openingHoursPublished: true,
        regularHoursPublished: true,
        takeout: true,
        delivery: false,
        reservable: true,
        googleMapsUri: "https://maps.google.com/?cid=123",
        hasEditorialSummary: false,
      },
      report: {
        overallScore: 63,
        scores: { discovery: 60, website: 68, reputation: 72, conversion: 48 },
        issues: [{
          severity: "high",
          category: "conversion",
          message: "Online ordering is missing.",
          impact: "Guests cannot order directly.",
        }],
        recommendations: [{
          category: "conversion",
          title: "Add ordering CTA",
          effort: "medium",
          action: "Add ordering CTA.",
        }],
        dataQuality: { missingCriticalData: [] },
      } as unknown as RestaurantGrowthReport,
      localBenchmark: {
        competitorCount: 3,
        averageRating: 4.5,
        averageReviewCount: 153,
        relativeRatingPosition: "near",
        competitors: [],
      },
    })

    expect(evidence.listing.serviceModel).toContain("takeout")
    expect(evidence.listing.hasEditorialSummary).toBe(false)
    expect(evidence.market.benchmarkAvailable).toBe(true)
    expect(evidence.market.averageRating).toBe(4.5)
    expect(evidence.website.gaps).toContain("No online ordering")
    expect(evidence.decisionInputs.topIssues[0]).toContain("Online ordering")
  })
})
