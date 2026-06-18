import { describe, it, expect } from "bun:test"
import { computeOverallScore } from "./location-health"

describe("computeOverallScore", () => {
  it("computes weighted score", () => {
    const score = computeOverallScore({ revenue: 80, reputation: 70, traffic: 60, retention: 50 })
    // 80*0.30 + 70*0.30 + 60*0.20 + 50*0.20 = 24 + 21 + 12 + 10 = 67
    expect(score).toBe(67)
  })

  it("max score is 100", () => {
    expect(computeOverallScore({ revenue: 100, reputation: 100, traffic: 100, retention: 100 })).toBe(100)
  })

  it("min score is 0", () => {
    expect(computeOverallScore({ revenue: 0, reputation: 0, traffic: 0, retention: 0 })).toBe(0)
  })
})
