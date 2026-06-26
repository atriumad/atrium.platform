import { describe, expect, test } from "bun:test"
import { gradeRestaurantGrowth, type RestaurantGrowthProfile } from "./restaurant-growth-grader"

const strongProfile: RestaurantGrowthProfile = {
  id: "demo-bistro",
  name: "Demo Bistro",
  category: "Restaurant",
  address: "123 Main St, Miami, FL",
  websiteUrl: "https://demo.example",
  googleRating: 4.7,
  googleReviewCount: 420,
  recentNegativeReviewCount: 2,
  unansweredReviewCount: 8,
  profileCompleteness: 0.92,
  localRank: 3,
  competitorAverageRating: 4.4,
  website: {
    hasMobileFriendlyLayout: true,
    hasMenu: true,
    hasOnlineOrdering: true,
    hasReservations: true,
    hasPhoneVisible: true,
    hasLocationSchema: true,
    hasMetaDescription: true,
    loadTimeMs: 1_800,
  },
  conversion: {
    hasPrimaryCta: true,
    hasOnlineOrderingCta: true,
    hasReservationCta: true,
    hasTrackingPixel: true,
    hasClickToCall: true,
  },
}

describe("gradeRestaurantGrowth", () => {
  test("returns an overall score from weighted sub-scores", () => {
    const result = gradeRestaurantGrowth(strongProfile)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.overallScore).toBeGreaterThanOrEqual(80)
    expect(result.value.scores.discovery).toBeGreaterThanOrEqual(80)
    expect(result.value.scores.website).toBeGreaterThanOrEqual(80)
    expect(result.value.scores.reputation).toBeGreaterThanOrEqual(80)
    expect(result.value.scores.conversion).toBeGreaterThanOrEqual(80)
    expect(result.value.nextBestAction).toContain("Maintain")
  })

  test("identifies missing conversion paths as high-priority issues", () => {
    const result = gradeRestaurantGrowth({
      ...strongProfile,
      website: {
        ...strongProfile.website,
        hasOnlineOrdering: false,
        hasReservations: false,
        hasPhoneVisible: false,
      },
      conversion: {
        hasPrimaryCta: false,
        hasOnlineOrderingCta: false,
        hasReservationCta: false,
        hasTrackingPixel: false,
        hasClickToCall: false,
      },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.scores.conversion).toBeLessThan(50)
    expect(result.value.issues.some((issue) =>
      issue.severity === "high" && issue.message.includes("conversion paths")
    )).toBe(true)
  })

  test("creates a reputation recommendation when rating is weak", () => {
    const result = gradeRestaurantGrowth({
      ...strongProfile,
      googleRating: 3.8,
      recentNegativeReviewCount: 12,
      unansweredReviewCount: 35,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.scores.reputation).toBeLessThan(70)
    expect(result.value.recommendations.some((recommendation) =>
      recommendation.category === "reputation"
        && recommendation.title.includes("review response")
    )).toBe(true)
  })

  test("does not treat unavailable reputation data as a zero-star profile", () => {
    const result = gradeRestaurantGrowth({
      ...strongProfile,
      googleRating: 0,
      googleReviewCount: 0,
      recentNegativeReviewCount: 0,
      unansweredReviewCount: 0,
      reputationDataSource: "unavailable",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.scores.reputation).toBeGreaterThanOrEqual(60)
    expect(result.value.confidence).toBe("medium")
    expect(result.value.recommendations.some((recommendation) =>
      recommendation.title.includes("reputation data")
    )).toBe(true)
  })

  test("rejects invalid input", () => {
    const result = gradeRestaurantGrowth({
      ...strongProfile,
      id: "",
      name: "",
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toContain("Restaurant id and name are required")
  })
})
