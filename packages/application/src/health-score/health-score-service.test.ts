import { describe, expect, test } from "bun:test"
import type { Review, StarRating } from "@atrium/domain"
import {
  computeReputationScore,
  computeRetentionScore,
  computeRevenueScore,
  computeTrafficScore,
  computeTrend,
} from "./health-score-service"

describe("HealthScoreService", () => {
  describe("computeRevenueScore", () => {
    test("growth increases score", () => {
      const score = computeRevenueScore(120_000, 100_000)
      // change = (120000 - 100000) / 100000 = 0.20
      // score = clamp(50 + 0.20 * 100, 0, 100) = 70
      expect(score).toBe(70)
    })

    test("decline decreases score", () => {
      const score = computeRevenueScore(80_000, 100_000)
      // change = (80000 - 100000) / 100000 = -0.20
      // score = clamp(50 + (-0.20 * 100), 0, 100) = 30
      expect(score).toBe(30)
    })

    test("flat revenue scores 50", () => {
      const score = computeRevenueScore(100_000, 100_000)
      expect(score).toBe(50)
    })

    test("clamps to 0", () => {
      const score = computeRevenueScore(0, 100_000)
      // change = -1.0, score = clamp(50 - 100, 0, 100) = 0 (clamped)
      expect(score).toBe(0)
    })

    test("clamps to 100", () => {
      const score = computeRevenueScore(200_000, 100_000)
      // change = 1.0, score = clamp(50 + 100, 0, 100) = 100 (clamped)
      expect(score).toBe(100)
    })

    test("handles zero previous (new location)", () => {
      const score = computeRevenueScore(50_000, 0)
      // No previous data → neutral score
      expect(score).toBe(50)
    })
  })

  describe("computeReputationScore", () => {
    function review(rating: StarRating, sentiment: number | null = 0): Review {
      return {
        id: "r1",
        locationId: "loc-1",
        platform: "google",
        rating,
        content: null,
        reply: null,
        publishedAt: new Date(),
        respondedAt: null,
        sentimentScore: sentiment,
        sourceRef: "google:abc",
      }
    }

    test("perfect ratings with positive sentiment", () => {
      const reviews = [review(5, 0.5), review(5, 0.5)]
      const score = computeReputationScore(reviews)
      // avg_rating = 5.0, (5/5 * 90) = 90
      // sentiment_adj = 0.5 * 10 = 5
      // score = 90 + 5 = 95
      expect(score).toBe(95)
    })

    test("average ratings with neutral sentiment", () => {
      const reviews = [review(3, 0), review(3, 0)]
      const score = computeReputationScore(reviews)
      // avg_rating = 3.0, (3/5 * 90) = 54
      // sentiment_adj = 0
      // score = 54
      expect(score).toBe(54)
    })

    test("handles empty reviews gracefully", () => {
      const score = computeReputationScore([])
      expect(score).toBe(50)
    })

    test("handles null sentiment scores", () => {
      const reviews = [review(4, null), review(4, null)]
      const score = computeReputationScore(reviews)
      // avg_rating = 4.0, (4/5 * 90) = 72
      // sentiment_adj = 0 (null treated as 0)
      // score = 72
      expect(score).toBe(72)
    })

    test("caps sentiment adjustment at ±10", () => {
      const reviews = [review(5, 1.0)]
      const score = computeReputationScore(reviews)
      // (5/5 * 90) = 90 + sentiment_adj(1.0*10=10) = 100
      expect(score).toBe(100)
    })
  })

  describe("computeTrafficScore", () => {
    test("growth increases score", () => {
      const score = computeTrafficScore(600, 500)
      // change = 0.20, score = clamp(50 + 20, 0, 100) = 70
      expect(score).toBe(70)
    })

    test("decline decreases score", () => {
      const score = computeTrafficScore(400, 500)
      expect(score).toBe(30)
    })

    test("handles zero previous", () => {
      const score = computeTrafficScore(100, 0)
      expect(score).toBe(50)
    })
  })

  describe("computeRetentionScore", () => {
    test("all customers returning", () => {
      const score = computeRetentionScore(
        ["c1", "c2", "c3"],
        ["c1", "c2", "c3"],
      )
      expect(score).toBe(100)
    })

    test("half customers returning", () => {
      const score = computeRetentionScore(
        ["c1", "c2", "c3", "c4"],
        ["c1", "c2"],
      )
      // 2 / 4 * 100 = 50
      expect(score).toBe(50)
    })

    test("no customers yet", () => {
      const score = computeRetentionScore([], [])
      expect(score).toBe(50)
    })
  })

  describe("computeTrend", () => {
    test("up when last score higher than average of previous 3", () => {
      const trend = computeTrend(85, [70, 75, 72])
      expect(trend).toBe("up")
    })

    test("down when last score lower than average", () => {
      const trend = computeTrend(65, [70, 75, 72])
      expect(trend).toBe("down")
    })

    test("stable when within threshold", () => {
      const trend = computeTrend(73, [70, 75, 72])
      expect(trend).toBe("stable")
    })

    test("stable when fewer than 3 previous scores", () => {
      const trend = computeTrend(80, [75])
      expect(trend).toBe("stable")
    })

    test("stable when no previous scores", () => {
      const trend = computeTrend(80, [])
      expect(trend).toBe("stable")
    })
  })
})
