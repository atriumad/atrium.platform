import { describe, expect, test } from "bun:test"
import type { RestaurantGrowthReport } from "@atrium/application"
import { mergeNarrativeIntoReport } from "./report-merger"

describe("mergeNarrativeIntoReport", () => {
  test("merges agent decision fields into executive summary", () => {
    const report = {
      executiveSummary: { headline: "", summary: "", priority: "", atriumPlan: [] },
      businessImpact: { headline: "", explanation: "", level: "medium" },
      estimatedLostOpportunity: "",
      scoreInterpretation: [],
    } as unknown as RestaurantGrowthReport

    const merged = mergeNarrativeIntoReport(report, {
      headline: "Demand is leaking before guests order.",
      summary: "Atrium Bistro has demand signals, but conversion is underbuilt.",
      primaryLeak: "Guests can find the restaurant but do not get a direct ordering path.",
      rootCause: "The listing and social presence point to the brand, but the website lacks ordering CTA.",
      whyItMatters: "High-intent visitors lose momentum before taking action.",
      firstMove: "Add a visible order/reserve path across website and Google listing.",
      thirtyDayPlan: ["Fix ordering CTA", "Tune Google service attributes", "Publish social proof"],
      evidenceHighlights: ["4.4 rating from 128 Google reviews", "No online ordering detected"],
      businessImpactHeadline: "The leak is closest to conversion.",
      businessImpactExplanation: "The restaurant is visible enough to earn attention, but the next action is unclear.",
      estimatedLostOpportunity: "Some ready-to-order demand is likely leaking.",
      scoreInterpretations: [],
    })

    expect(merged.executiveSummary.primaryLeak).toContain("Guests can find")
    expect(merged.executiveSummary.firstMove).toContain("order/reserve")
    expect(merged.executiveSummary.atriumPlan).toEqual(["Fix ordering CTA", "Tune Google service attributes", "Publish social proof"])
    expect(merged.executiveSummary.evidenceHighlights).toHaveLength(2)
  })
})
