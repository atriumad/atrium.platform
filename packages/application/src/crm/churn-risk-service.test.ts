import { describe, expect, test } from "bun:test"
import { computeChurnRiskScore } from "./churn-risk-service"

describe("computeChurnRiskScore", () => {
  test("score is 0 for recently active customer", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 1,
      totalOrders: 20,
      visitFrequency: 7,
    })
    expect(result.score).toBe(0)
    expect(result.reasons).toEqual([])
  })

  test("score increases with days since last order", () => {
    const recent = computeChurnRiskScore({ daysSinceLastOrder: 5, totalOrders: 15, visitFrequency: 14 })
    const moderate = computeChurnRiskScore({ daysSinceLastOrder: 20, totalOrders: 15, visitFrequency: 14 })
    const high = computeChurnRiskScore({ daysSinceLastOrder: 60, totalOrders: 15, visitFrequency: 14 })

    expect(recent.score).toBeLessThan(moderate.score)
    expect(moderate.score).toBeLessThan(high.score)
    expect(high.score).toBeGreaterThanOrEqual(0.6)
  })

  test("frequency drop amplifies risk", () => {
    const noDrop = computeChurnRiskScore({ daysSinceLastOrder: 20, totalOrders: 15, visitFrequency: 14 })
    const bigDrop = computeChurnRiskScore({ daysSinceLastOrder: 50, totalOrders: 15, visitFrequency: 14 })

    expect(bigDrop.score).toBeGreaterThan(noDrop.score)
    expect(bigDrop.reasons).toContain("Visit frequency has dropped significantly")
  })

  test("new customers with few orders get baseline risk", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 5,
      totalOrders: 1,
      visitFrequency: null,
    })
    // recency = 0, freqDrop = 0.3 → score = 0.12
    expect(result.score).toBe(0.12)
    expect(result.reasons).toContain("New customer with fewer than 3 orders")
  })

  test("max score is 1 when both factors are maxed", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 200,
      totalOrders: 10,
      visitFrequency: 7,
    })
    expect(result.score).toBe(1)
  })

  test("reasons include recency warning when > 14 days", () => {
    const result = computeChurnRiskScore({ daysSinceLastOrder: 30, totalOrders: 10, visitFrequency: 14 })
    expect(result.reasons.some((r) => r.includes("Last visit was"))).toBe(true)
  })

  test("one-time customer after 60 days → high risk bonus", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 5,
      totalOrders: 1,
      visitFrequency: null,
      daysSinceFirstSeen: 61,
    })
    expect(result.score).toBeGreaterThanOrEqual(0.5)
    expect(result.reasons.some((r) => r.includes("One-time customer"))).toBe(true)
  })

  test("one-time customer under 60 days → no bonus", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 5,
      totalOrders: 1,
      visitFrequency: null,
      daysSinceFirstSeen: 30,
    })
    expect(result.reasons.some((r) => r.includes("One-time customer"))).toBe(false)
  })

  test("gold customer inactive 31+ days → critical risk bonus", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 31,
      totalOrders: 25,
      visitFrequency: 14,
      loyaltyTier: "gold",
    })
    expect(result.score).toBe(1) // clamped to max
    expect(result.reasons.some((r) => r.includes("gold"))).toBe(true)
  })

  test("vip customer inactive 31+ days → critical risk bonus", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 35,
      totalOrders: 50,
      visitFrequency: 7,
      loyaltyTier: "vip",
    })
    expect(result.score).toBe(1)
    expect(result.reasons.some((r) => r.includes("vip"))).toBe(true)
  })

  test("silver customer inactive 31+ days → no tier bonus", () => {
    const result = computeChurnRiskScore({
      daysSinceLastOrder: 31,
      totalOrders: 10,
      visitFrequency: 14,
      loyaltyTier: "silver",
    })
    expect(result.reasons.some((r) => r.includes("silver"))).toBe(false)
  })
})
