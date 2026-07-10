# Agent-Led Decision Report Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an agent-led restaurant grader report where enriched Google Places and ScrapeCreators evidence improves the agent's decision, while the final UI becomes shorter, clearer, and more action-oriented.

**Architecture:** Keep the public grader API-key only: Google Places for business/listing/market data and ScrapeCreators for social data. Add an internal evidence-builder layer that compresses provider output into `AgentEvidenceContext`, update the agent schema to produce decision-oriented output, then redesign the final report view as a focused decision path with audit details moved behind lower-priority UI.

**Tech Stack:** Next.js App Router, React, TypeScript, Bun test, Tailwind, Google Places API, ScrapeCreators, `@ai-sdk/*`, Zod, Biome.

---

## Guardrails

- Do not add Google Business Profile, OAuth, GA4, Search Console, POS, or private analytics.
- Keep Google as the only business data provider.
- Keep ScrapeCreators as the social provider.
- Do not show all enriched provider data in the UI; feed it to the agent first.
- Use Tailwind for new report UI composition.
- Preserve Atrium's visual line: teal/mint/amber, Inter Tight, editorial serif emphasis, restrained motion.
- Keep existing unrelated dirty files untouched.

## Task 1: Expand Google Places Evidence

**Files:**
- Modify: `apps/atrium.grader/lib/google-places-client.ts`
- Test: `apps/atrium.grader/lib/google-places-client.test.ts`
- Update if needed: `apps/atrium.grader/app/api/grader/route.test.ts`

**Step 1: Write the failing test**

Create `apps/atrium.grader/lib/google-places-client.test.ts` if it does not exist. Add a test that mocks Place Details and asserts that `getGoogleRestaurantProfile` returns enriched `googleMeta`.

```ts
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { getGoogleRestaurantProfile } from "./google-places-client"

const originalKey = process.env.GOOGLE_PLACES_API_KEY

beforeEach(() => {
  process.env.GOOGLE_PLACES_API_KEY = "test-key"
})

afterEach(() => {
  if (originalKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalKey
})

describe("getGoogleRestaurantProfile", () => {
  test("maps enriched Google Places fields into agent metadata", async () => {
    const fetcher = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("places/test-place")) {
        return Response.json({
          id: "test-place",
          displayName: { text: "Atrium Bistro" },
          formattedAddress: "12 Market St",
          types: ["restaurant"],
          primaryType: "restaurant",
          primaryTypeDisplayName: { text: "Restaurant" },
          websiteUri: "https://atriumbistro.test",
          nationalPhoneNumber: "(555) 010-9999",
          googleMapsUri: "https://maps.google.com/?cid=123",
          businessStatus: "OPERATIONAL",
          priceLevel: "PRICE_LEVEL_MODERATE",
          currentOpeningHours: { weekdayDescriptions: ["Monday: 9 AM-9 PM"] },
          regularOpeningHours: { weekdayDescriptions: ["Monday: 9 AM-9 PM"] },
          rating: 4.4,
          userRatingCount: 128,
          dineIn: true,
          takeout: true,
          delivery: false,
          reservable: true,
          outdoorSeating: true,
          servesDinner: true,
          servesCoffee: true,
          paymentOptions: { acceptsCreditCards: true },
        })
      }

      return Response.json("<html><title>Atrium Bistro</title></html>", {
        headers: { "content-type": "text/html" },
      })
    })

    const { googleMeta } = await getGoogleRestaurantProfile("test-place", fetcher as unknown as typeof fetch)

    expect(googleMeta).toEqual(expect.objectContaining({
      priceLevel: "PRICE_LEVEL_MODERATE",
      primaryType: "restaurant",
      primaryTypeDisplayName: "Restaurant",
      googleMapsUri: "https://maps.google.com/?cid=123",
      openingHoursPublished: true,
      regularHoursPublished: true,
      dineIn: true,
      takeout: true,
      delivery: false,
      reservable: true,
      outdoorSeating: true,
      servesDinner: true,
      servesCoffee: true,
      acceptsCreditCards: true,
    }))
  })
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
bun test apps/atrium.grader/lib/google-places-client.test.ts
```

Expected: fail because `GooglePlaceMeta` does not expose all enriched fields.

**Step 3: Implement minimal Google metadata expansion**

In `apps/atrium.grader/lib/google-places-client.ts`:

- Extend `GOOGLE_PLACE_DETAILS_FIELD_MASK` with only fields needed for the agent:
  - `primaryType`
  - `primaryTypeDisplayName`
  - `googleMapsUri`
  - `regularOpeningHours`
  - `priceLevel`
  - `dineIn`
  - `takeout`
  - `delivery`
  - `reservable`
  - `outdoorSeating`
  - `servesBreakfast`
  - `servesLunch`
  - `servesDinner`
  - `servesCoffee`
  - `servesDessert`
  - `servesBeer`
  - `servesWine`
  - `paymentOptions`
- Extend the `GooglePlace` type with optional versions of those fields.
- Extend `GooglePlaceMeta` with normalized fields.
- Map booleans exactly; do not coerce `undefined` to `false` unless the absence has a useful meaning.

**Step 4: Run test to verify it passes**

Run:

```bash
bun test apps/atrium.grader/lib/google-places-client.test.ts
```

Expected: pass.

**Step 5: Run route regression tests**

Run:

```bash
bun test apps/atrium.grader/app/api/grader/route.test.ts apps/atrium.grader/app/api/grader/search/route.test.ts
```

Expected: pass.

## Task 2: Add Market Benchmark Evidence

**Files:**
- Modify: `apps/atrium.grader/lib/google-places-client.ts`
- Modify: `apps/atrium.grader/lib/open-data-places.ts`
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.ts`
- Test: `apps/atrium.grader/lib/google-places-client.test.ts`
- Test: `packages/application/src/diagnostics/restaurant-growth-grader.test.ts`

**Step 1: Write failing benchmark tests**

Add tests for a new exported function:

```ts
import { getGoogleLocalBenchmark } from "./google-places-client"

test("builds a local benchmark from nearby Google restaurants", async () => {
  const fetcher = mock(async () => Response.json({
    places: [
      { id: "target", displayName: { text: "Atrium Bistro" }, rating: 4.4, userRatingCount: 128 },
      { id: "comp-1", displayName: { text: "Market Cafe" }, rating: 4.7, userRatingCount: 230 },
      { id: "comp-2", displayName: { text: "Corner Grill" }, rating: 4.1, userRatingCount: 90 },
      { id: "comp-3", displayName: { text: "Lunch House" }, rating: 4.2, userRatingCount: 140 },
    ],
  }))

  const benchmark = await getGoogleLocalBenchmark({
    googlePlaceId: "target",
    location: { latitude: 25.7617, longitude: -80.1918 },
    category: "restaurant",
  }, fetcher as unknown as typeof fetch)

  expect(benchmark).toEqual(expect.objectContaining({
    competitorCount: 3,
    averageRating: expect.any(Number),
    averageReviewCount: expect.any(Number),
    relativeRatingPosition: expect.any(String),
  }))
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
bun test apps/atrium.grader/lib/google-places-client.test.ts
```

Expected: fail because `getGoogleLocalBenchmark` does not exist.

**Step 3: Implement benchmark helper**

Add a small Google Nearby Search helper that:

- accepts `googlePlaceId`, `location`, and `category`
- calls `places:searchNearby`
- uses `includedTypes: ["restaurant"]`, `maxResultCount: 10`, `rankPreference: "POPULARITY"`, and a bounded radius
- requests only fields needed for benchmark: `places.id`, `places.displayName`, `places.rating`, `places.userRatingCount`, `places.types`, `places.websiteUri`
- removes the target place from competitors
- returns null when location is missing or fewer than three competitors exist

Suggested return type:

```ts
export type GoogleLocalBenchmark = {
  readonly competitorCount: number
  readonly averageRating: number | null
  readonly averageReviewCount: number | null
  readonly relativeRatingPosition: "above" | "near" | "below" | "unknown"
  readonly competitors: ReadonlyArray<{
    readonly placeId: string
    readonly name: string
    readonly rating: number | null
    readonly reviewCount: number | null
    readonly websiteUrl: string | null
  }>
}
```

**Step 4: Thread benchmark into scoring**

Update `RestaurantGrowthProfile` only with fields already present if possible:

- set `competitorAverageRating`
- set `localRank` only when the benchmark can defensibly estimate position

Keep the richer benchmark in agent-only evidence rather than displaying raw competitor data by default.

**Step 5: Run tests**

Run:

```bash
bun test apps/atrium.grader/lib/google-places-client.test.ts packages/application/src/diagnostics/restaurant-growth-grader.test.ts
```

Expected: pass.

## Task 3: Create Agent Evidence Context

**Files:**
- Create: `apps/atrium.grader/lib/report-evidence.ts`
- Modify: `apps/atrium.grader/lib/report-agent.ts`
- Modify: `apps/atrium.grader/app/api/grader/route.ts`
- Test: `apps/atrium.grader/lib/report-evidence.test.ts`

**Step 1: Write failing evidence-builder test**

Create `apps/atrium.grader/lib/report-evidence.test.ts`.

```ts
import { describe, expect, test } from "bun:test"
import type { RestaurantGrowthProfile, RestaurantGrowthReport } from "@atrium/application"
import { buildAgentEvidenceContext } from "./report-evidence"

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
    },
    report: {
      overallScore: 63,
      scores: { discovery: 60, website: 68, reputation: 72, conversion: 48 },
      issues: [{ severity: "high", category: "conversion", message: "Online ordering is missing." }],
      recommendations: [{ category: "conversion", effort: "medium", action: "Add ordering CTA." }],
      dataQuality: { missingCriticalData: [] },
    } as unknown as RestaurantGrowthReport,
    localBenchmark: null,
  })

  expect(evidence.listing.serviceModel).toContain("takeout")
  expect(evidence.website.gaps).toContain("No online ordering")
  expect(evidence.decisionInputs.topIssues[0]).toContain("Online ordering")
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
bun test apps/atrium.grader/lib/report-evidence.test.ts
```

Expected: fail because `report-evidence.ts` does not exist.

**Step 3: Implement `report-evidence.ts`**

Create a typed evidence builder with small helper functions:

- `summarizeListingEvidence`
- `summarizeWebsiteEvidence`
- `summarizeMarketEvidence`
- `summarizeReputationEvidence`
- `summarizeSocialEvidence`
- `summarizeDecisionInputs`

Keep the return object compact and serializable. Avoid raw provider response nesting.

**Step 4: Update `AgentContext`**

In `report-agent.ts`, change:

```ts
readonly googleMeta: GooglePlaceMeta | null
```

to:

```ts
readonly evidence: AgentEvidenceContext
```

Keep `profile`, `scores`, `overallScore`, `issues`, and `recommendations` during the first pass if that reduces blast radius.

**Step 5: Update route**

In `apps/atrium.grader/app/api/grader/route.ts`, build evidence after base report/social merge and pass it to `generateReportNarrative`.

**Step 6: Run tests**

Run:

```bash
bun test apps/atrium.grader/lib/report-evidence.test.ts apps/atrium.grader/app/api/grader/route.test.ts
```

Expected: pass.

## Task 4: Update Agent Schema to Output Decisions

**Files:**
- Modify: `apps/atrium.grader/lib/report-agent.ts`
- Modify: `apps/atrium.grader/lib/report-merger.ts`
- Test: `apps/atrium.grader/lib/report-merger.test.ts`

**Step 1: Write failing merge test**

Create `apps/atrium.grader/lib/report-merger.test.ts` if missing.

```ts
import { describe, expect, test } from "bun:test"
import { mergeNarrativeIntoReport } from "./report-merger"

test("merges agent decision fields into executive summary", () => {
  const report = {
    executiveSummary: { headline: "", summary: "", priority: "", atriumPlan: [] },
    businessImpact: { headline: "", explanation: "", level: "medium" },
    estimatedLostOpportunity: "",
    scoreInterpretation: [],
  } as any

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
})
```

**Step 2: Run test to verify it fails**

Run:

```bash
bun test apps/atrium.grader/lib/report-merger.test.ts
```

Expected: fail because narrative/report types do not include decision fields.

**Step 3: Update narrative schema**

In `report-agent.ts`, update `NarrativeSchema` to include:

- `primaryLeak`
- `rootCause`
- `whyItMatters`
- `firstMove`
- `thirtyDayPlan` with exactly 3 items
- `evidenceHighlights` with 2-4 items

Keep existing fields temporarily if the UI still uses them, but map the new fields forward.

**Step 4: Update prompt**

Rewrite `buildPrompt` so it includes:

- a compact `EVIDENCE CONTEXT` JSON block
- explicit rule: "Use enriched evidence for decision quality, not for exhaustive display"
- explicit rule: "Pick one primary leak"
- explicit rule: "Do not invent benchmark/social/revenue facts when evidence is missing"

**Step 5: Update merger**

Extend the report's `executiveSummary` type in `packages/application/src/diagnostics/restaurant-growth-grader.ts` or keep a UI-safe optional extension if lower blast radius is preferred:

```ts
readonly primaryLeak?: string
readonly rootCause?: string
readonly whyItMatters?: string
readonly firstMove?: string
readonly evidenceHighlights?: readonly string[]
```

Map `thirtyDayPlan` to `atriumPlan` or add it as a new field. Prefer `atriumPlan = thirtyDayPlan` to reduce type churn.

**Step 6: Run tests**

Run:

```bash
bun test apps/atrium.grader/lib/report-merger.test.ts apps/atrium.grader/app/api/grader/route.test.ts packages/application/src/diagnostics/restaurant-growth-grader.test.ts
```

Expected: pass.

## Task 5: Redesign Final Report UI as a Decision Path

**Files:**
- Modify: `apps/atrium.grader/app/grader-client.tsx`
- Prefer minimal CSS edits: `apps/atrium.grader/app/globals.css`
- Test manually with dev server and screenshots

**Step 1: Extract report helpers**

Inside `grader-client.tsx`, add small helpers near existing report helpers:

```ts
function topScoreEntries(report: RestaurantGrowthReport) {
  return report.scoreInterpretation.slice(0, 5)
}

function reportEvidenceHighlights(report: RestaurantGrowthReport): readonly string[] {
  return report.executiveSummary.evidenceHighlights?.length
    ? report.executiveSummary.evidenceHighlights
    : [
      report.issues[0]?.message,
      report.nextBestAction,
      report.estimatedLostOpportunity,
    ].filter((item): item is string => Boolean(item))
}
```

**Step 2: Replace report body hierarchy**

Keep the outer `ReportStage` function and existing `onReset` flow. Replace the current large equal-weight panel grid with Tailwind-first sections:

- hero: score + headline + restaurant identity
- main decision: `primaryLeak`, `rootCause`, `whyItMatters`
- first move: `firstMove` + CTA
- 30-day plan: 3 ordered actions
- compact score row
- `<details>` audit evidence section
- small data quality line

Use Tailwind classes like:

```tsx
<section className="grid gap-5 rounded-[22px] border border-[rgb(7_47_52_/_12%)] bg-white/90 p-5 shadow-[0_12px_40px_rgb(7_47_52_/_8%)] md:p-7">
```

Use CSS variables inside Tailwind arbitrary values where needed:

```tsx
className="bg-[var(--surface-dark)] text-[var(--text-on-dark)]"
```

**Step 3: Keep evidence available but secondary**

Move the existing `DiagnosticEvidenceCard` list into:

```tsx
<details className="group rounded-[18px] border border-[rgb(7_47_52_/_12%)] bg-white/75 p-4">
  <summary className="flex cursor-pointer items-center justify-between gap-4">
    <span>Audit details</span>
    <span className="transition-transform duration-150 ease-out group-open:rotate-45">+</span>
  </summary>
  ...
</details>
```

**Step 4: Motion rules**

Use only purposeful microinteractions:

- buttons: `transition-[transform,box-shadow,border-color] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]`
- cards: `transition-[transform,border-color,box-shadow] duration-200 ease-out`
- disclosure icon: `duration-150 ease-out`
- add `motion-reduce:transition-none motion-reduce:transform-none` to repeated interactive elements.

**Step 5: Verify responsive behavior**

Run:

```bash
bun run dev:grader
```

Open the local grader URL. Test at:

- 1440px desktop
- 1024px tablet
- 390px mobile

Check:

- first viewport communicates the decision
- no overlapping text
- CTA remains visible
- evidence details can open/close
- reduced motion does not hide content

## Task 6: Verification

**Files:**
- No new files unless fixing test fallout.

**Step 1: Run targeted tests**

Run:

```bash
bun test apps/atrium.grader/lib/google-places-client.test.ts apps/atrium.grader/lib/report-evidence.test.ts apps/atrium.grader/lib/report-merger.test.ts apps/atrium.grader/app/api/grader/route.test.ts apps/atrium.grader/app/api/grader/search/route.test.ts packages/application/src/diagnostics/restaurant-growth-grader.test.ts packages/application/src/diagnostics/social-health-scorer.test.ts
```

Expected: all pass.

**Step 2: Typecheck**

Run:

```bash
bun run typecheck --filter=@atrium/grader
bun run typecheck --filter=@atrium/application
```

Expected: both pass.

**Step 3: Biome**

Run:

```bash
bunx biome check apps/atrium.grader packages/application docs/plans/2026-07-09-agent-led-decision-report-design.md docs/plans/2026-07-09-agent-led-decision-report-implementation.md
```

Expected: pass or only pre-existing warnings.

**Step 4: Diff hygiene**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

**Step 5: Update graph**

Run:

```bash
graphify update .
```

Expected: graph updates successfully.

**Step 6: Commit implementation**

Stage only files touched for this feature. Do not stage unrelated website or notes files.

```bash
git add apps/atrium.grader packages/application docs/plans/2026-07-09-agent-led-decision-report-design.md docs/plans/2026-07-09-agent-led-decision-report-implementation.md
git commit -m "feat(grader): add agent-led decision report"
```

## Execution Notes

Recommended execution order:

1. Task 1: Google enriched metadata.
2. Task 3: evidence context.
3. Task 4: agent decision schema.
4. Task 5: UI redesign.
5. Task 2: local market benchmark.

Reason: the local benchmark is valuable but has the highest API-cost and interpretation risk. The agent-led report can ship first using richer listing/social/website evidence, then market benchmark can be layered in without blocking the UI restructure.
