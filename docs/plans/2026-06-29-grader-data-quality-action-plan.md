# Grader Data Quality Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current shallow/free-scan assumptions with a provider-driven diagnostic pipeline that exposes real step evidence, runs Lighthouse-quality website audits for mobile and desktop, and improves business/social data quality without requiring paid Google services for every public scan.

**Architecture:** Add provider ports around each external data source, return structured `DiagnosticStepResult[]` from the backend, and keep scoring logic pure inside `packages/application`. The public grader should work with free/default providers, then progressively enrich reports when PageSpeed, Google Places, ScrapeCreators, or connected-account providers are available.

**Tech Stack:** Next.js App Router, TypeScript, Bun test, Google PageSpeed Insights API/Lighthouse, optional Google Places, OSM/Nominatim, Overpass, ScrapeCreators, future OAuth providers.

---

## Source Notes

Official references checked on 2026-06-29:

- Google Places API uses pay-as-you-go SKUs, requires billing/API key or OAuth, and FieldMask controls returned data and billing tier: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
- Google Places FieldMask guidance: https://developers.google.com/maps/documentation/places/web-service/choose-fields
- PageSpeed Insights API returns Lighthouse data and supports `strategy=desktop|mobile`: https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed
- Lighthouse is the official open-source audit tool and can run in DevTools, CLI, or Node module: https://developer.chrome.com/docs/lighthouse/overview
- Google Business Profile APIs require project approval, OAuth, and access setup; they are better suited for connected clients than anonymous public scans: https://developers.google.com/my-business/content/prereqs and https://developers.google.com/my-business/content/basic-setup
- TikTok official user info APIs require authorization scopes, so they are not a drop-in anonymous public-profile replacement: https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info/

## Strategy

We will not fix this by adding one more API call to the existing route. The current route hides too many assumptions. The plan is:

1. Make every diagnostic step explicit.
2. Attach source, confidence, evidence, missing data, and errors to every step.
3. Improve website quality first with Lighthouse/PageSpeed because it gives immediate signal quality.
4. Improve business data with provider ports and a paid-provider switch, not a hardcoded Google dependency.
5. Improve social by letting the user confirm handles and by separating "not found" from "provider failed".
6. Only translate scores into business impact after we know which data was real, partial, or missing.

## Provider Decision

| Data area | Default/free provider | Optional paid/enriched provider | Notes |
| --- | --- | --- | --- |
| Business lookup | OSM/Nominatim | Google Places API | Google should be enabled by env/config and budget guard, not hardcoded. |
| Public business profile | OSM tags + website scrape | Google Places Details | Use FieldMask aggressively. |
| Reputation | Manual input fallback | Google Places rating/review count; later GBP Reviews for connected clients | Public scan can use Places summary data; full review management needs GBP OAuth. |
| Website audit | Existing fetch scanner as fallback | PageSpeed Insights API using Lighthouse | Run mobile and desktop strategies. |
| Local benchmark | Overpass heuristic | Google Places Nearby/Text Search if budget allows | Rename heuristic until true ranking exists. |
| Social discovery | Website link parser + manual correction | ScrapeCreators; later official OAuth/provider integrations | Official APIs often require OAuth/app approval and are not anonymous lookup tools. |
| Client-owned business data | None | Google Business Profile OAuth, GA4, GSC, POS/order imports | Not part of public anonymous scan. |

## Phases

### Phase 1: Diagnostic Step Contract

**Goal:** Stop hardcoding step truth in the UI. The API should explain what was checked, what was found, what was missing, and how confident we are.

**Files:**

- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.ts`
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.test.ts`
- Modify: `apps/grader/app/api/grader/route.ts`
- Modify: `apps/grader/app/api/grader/route.test.ts`
- Modify: `apps/grader/app/grader-client.tsx`

**Step 1: Add failing domain test for diagnostic steps**

Add a test that expects `gradeRestaurantGrowth(profile)` to include step-level data:

```ts
expect(report.diagnosticSteps).toEqual(expect.arrayContaining([
  expect.objectContaining({
    id: "website",
    status: expect.any(String),
    confidence: expect.any(String),
    source: expect.any(String),
    checked: expect.any(Array),
    found: expect.any(Array),
    missing: expect.any(Array),
    assumptions: expect.any(Array),
    errors: expect.any(Array),
  }),
]))
```

Run:

```bash
bun test packages/application/src/diagnostics/restaurant-growth-grader.test.ts
```

Expected: fail because `diagnosticSteps` does not exist.

**Step 2: Add shared types**

Add:

```ts
export type DiagnosticStepId =
  | "openData"
  | "website"
  | "benchmark"
  | "reputation"
  | "social"
  | "brief"

export type DiagnosticStepResult = {
  readonly id: DiagnosticStepId
  readonly status: "complete" | "partial" | "skipped" | "failed"
  readonly source: string
  readonly confidence: "low" | "medium" | "high"
  readonly checked: readonly string[]
  readonly found: readonly string[]
  readonly missing: readonly string[]
  readonly assumptions: readonly string[]
  readonly errors: readonly string[]
}
```

Extend `RestaurantGrowthReport` with:

```ts
readonly diagnosticSteps: readonly DiagnosticStepResult[]
readonly dataQuality: {
  readonly provider: "osm" | "google" | "manual" | "mixed"
  readonly hasWebsite: boolean
  readonly hasReputation: boolean
  readonly hasSocial: boolean
  readonly missingCriticalData: readonly string[]
}
```

**Step 3: Build base diagnostic steps**

Map existing details into backend-generated steps:

- `openData`: OSM/Google profile completeness.
- `website`: website scan result.
- `benchmark`: Overpass/local benchmark.
- `reputation`: manual/google/unavailable.
- `social`: skipped unless social scan runs.
- `brief`: combined interpretation.

**Step 4: Update route tests**

Assert the API returns:

- `diagnosticSteps.length >= 5`
- reputation step is `partial` or `skipped` when OSM has no reputation.
- website step includes an explicit source and confidence.

Run:

```bash
bun test apps/grader/app/api/grader/route.test.ts packages/application/src/diagnostics/restaurant-growth-grader.test.ts
```

Expected: pass after implementation.

**Step 5: Update UI to render backend step data**

Replace hardcoded `source`, `limit`, and step details in `scanSteps` with report-backed `diagnosticSteps` once available. During loading, keep presentational placeholders, but final report must show backend evidence.

Run:

```bash
bunx biome check apps/grader/app/grader-client.tsx
bun run typecheck --filter=@atrium/grader
```

Expected: pass.

### Phase 2: Provider Ports and Data Source Configuration

**Goal:** Remove hardcoded provider behavior and make data source quality explicit.

**Files:**

- Create: `apps/grader/lib/providers/business-provider.ts`
- Modify: `apps/grader/lib/open-data-places.ts`
- Modify: `apps/grader/lib/osm-client.ts`
- Modify: `apps/grader/lib/google-places-client.ts`
- Modify: `apps/grader/app/api/grader/search/route.ts`
- Modify: `apps/grader/app/api/grader/route.ts`
- Test: `apps/grader/app/api/grader/route.test.ts`

**Step 1: Add provider interface**

```ts
export type BusinessDataProviderName = "osm" | "google"

export type BusinessDataProvider = {
  readonly name: BusinessDataProviderName
  search(query: string, fetcher?: typeof fetch): Promise<PlaceSuggestion[]>
  getProfile(placeId: string, reputation?: ManualReputationInput, fetcher?: typeof fetch): Promise<RestaurantGrowthProfile>
}
```

**Step 2: Replace hardcoded `USE_GOOGLE_PLACES = false`**

Use env/config:

```txt
GRADER_BUSINESS_PROVIDER=osm|google|auto
GOOGLE_PLACES_API_KEY=
```

Rules:

- `osm`: always OSM.
- `google`: require key; fail clearly if missing.
- `auto`: use Google only when key exists, else OSM.

**Step 3: Add provider tests**

Test cases:

- `GRADER_BUSINESS_PROVIDER=osm` does not call Google.
- `GRADER_BUSINESS_PROVIDER=auto` falls back to OSM without key.
- `GRADER_BUSINESS_PROVIDER=google` with no key returns a clear provider config error.
- Google profile maps rating/review count into reputation.

Run:

```bash
bun test apps/grader/app/api/grader/route.test.ts apps/grader/app/api/grader/search/route.test.ts
```

Expected: pass.

**Step 4: Add budget guard**

Add env:

```txt
GRADER_GOOGLE_DAILY_LIMIT=
GRADER_GOOGLE_MONTHLY_LIMIT=
```

Implementation can be in-memory for MVP, but plan for persistence later. If no store exists, log warning and only enforce per-process.

**Step 5: Add FieldMask discipline**

Keep Google field masks minimal:

- Search: id, displayName, formattedAddress, types.
- Details essentials: id, displayName, formattedAddress, types, websiteUri, nationalPhoneNumber, currentOpeningHours, rating, userRatingCount, location.

Do not request photos, reviews text, editorial summaries, or atmosphere fields in public scan until we approve cost.

### Phase 3: Lighthouse/PageSpeed Website Audit

**Goal:** Replace the regex-only website score with a richer mobile + desktop audit while keeping the existing scanner as fallback.

**Recommended first implementation:** PageSpeed Insights API. It returns Lighthouse results and supports `strategy=MOBILE` and `strategy=DESKTOP`, without running Chrome inside the Next route.

**Files:**

- Create: `apps/grader/lib/website-audit-provider.ts`
- Create: `apps/grader/lib/pagespeed-client.ts`
- Modify: `apps/grader/lib/website-scanner.ts`
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.ts`
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.test.ts`
- Test: `apps/grader/lib/website-scanner.test.ts`

**Step 1: Add website audit types**

```ts
export type LighthouseStrategy = "mobile" | "desktop"

export type LighthouseAuditSummary = {
  readonly strategy: LighthouseStrategy
  readonly performanceScore: number | null
  readonly accessibilityScore: number | null
  readonly bestPracticesScore: number | null
  readonly seoScore: number | null
  readonly finalUrl: string | null
  readonly metrics: {
    readonly firstContentfulPaintMs: number | null
    readonly largestContentfulPaintMs: number | null
    readonly totalBlockingTimeMs: number | null
    readonly cumulativeLayoutShift: number | null
    readonly speedIndexMs: number | null
  }
  readonly opportunities: readonly string[]
  readonly warnings: readonly string[]
}

export type WebsiteAuditResult = {
  readonly provider: "basic-fetch" | "pagespeed" | "local-lighthouse"
  readonly mobile: LighthouseAuditSummary | null
  readonly desktop: LighthouseAuditSummary | null
  readonly fallbackSignals: RestaurantWebsiteSignals
}
```

**Step 2: Write failing tests for PageSpeed mapping**

Use fixture JSON from PageSpeed API shape and assert:

- mobile score maps to `performanceScore`.
- desktop score maps to `performanceScore`.
- `runtimeError` creates a warning and lowers confidence.
- `categories.seo.score` maps to SEO score.

Run:

```bash
bun test apps/grader/lib/website-scanner.test.ts
```

Expected: fail.

**Step 3: Implement PageSpeed client**

Call twice:

```txt
GET https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed
  ?url=<encodedUrl>
  &strategy=mobile
  &category=performance
  &category=accessibility
  &category=best-practices
  &category=seo
  &key=<optional>
```

Repeat for `strategy=desktop`.

Env:

```txt
PAGESPEED_API_KEY=
WEBSITE_AUDIT_PROVIDER=basic|pagespeed
```

**Step 4: Update website score model**

Current website score should become a blended score:

```txt
websiteScore =
  mobile lighthouse quality * 0.45
  + desktop lighthouse quality * 0.25
  + restaurant action-path signals * 0.30
```

Where action-path signals still include:

- menu
- order
- reservation
- phone
- local schema
- meta description

If PageSpeed is unavailable, fall back to current `RestaurantWebsiteSignals` score and mark website step as `partial`.

**Step 5: Add evidence to report**

Website step should expose:

- mobile performance score
- desktop performance score
- SEO score
- top 3 opportunities
- final URL
- provider warnings

**Step 6: Defer local Lighthouse to worker**

Do not run local Chrome/Lighthouse inside the public Next route. Add a future provider:

```txt
WEBSITE_AUDIT_PROVIDER=local-lighthouse
```

Only enable it in a background worker or internal deployment where Chrome is installed and timeouts are controlled.

### Phase 4: Reputation and Business Data Recovery

**Goal:** Stop treating unavailable reputation as if it were a real score.

**Files:**

- Modify: `apps/grader/app/grader-client.tsx`
- Modify: `apps/grader/app/api/grader/route.ts`
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.ts`
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.test.ts`

**Step 1: Add manual reputation capture fallback**

When provider is OSM or reputation unavailable, the UI should optionally collect:

- rating
- review count
- review source label

Keep it optional, but if provided, set `reputationDataSource: "manual"`.

**Step 2: Update scoring language**

If reputation is unavailable:

- score category label should say "Neutral baseline".
- report should not imply review analysis happened.
- business impact copy should say review quality was not verified.

**Step 3: Add Google Places reputation path**

When provider is Google, use:

- `rating`
- `userRatingCount`

Keep `recentNegativeReviewCount` as estimated unless we later connect review text through a valid provider.

**Step 4: Defer Google Business Profile to connected clients**

GBP should not be part of anonymous public scan because it requires approval, OAuth, and owned/managed location access. Add it to future authenticated dashboard work for:

- review text
- reply status
- review media
- posts
- location insights

### Phase 5: Social Data Reliability

**Goal:** Make social scoring trustworthy enough to show, and avoid penalizing restaurants when detection/provider fails.

**Files:**

- Modify: `apps/grader/lib/auto-detect-social.ts`
- Modify: `apps/grader/lib/social-detector.ts`
- Modify: `apps/grader/lib/scrape-creators.ts`
- Modify: `apps/grader/app/api/grader/route.ts`
- Modify: `apps/grader/app/grader-client.tsx`
- Modify: `packages/application/src/diagnostics/social-health-scorer.ts`
- Test: `apps/grader/lib/social-detector.test.ts`
- Test: `packages/application/src/diagnostics/social-health-scorer.test.ts`

**Step 1: Add handle confidence**

Replace one global confidence with per-platform confidence:

```ts
type SocialHandleCandidate = {
  readonly platform: "instagram" | "facebook" | "tiktok"
  readonly value: string
  readonly source: "website" | "name-search" | "manual"
  readonly confidence: "low" | "medium" | "high"
}
```

**Step 2: User confirmation before scoring**

For public scan:

- auto-fill detected handles
- allow edit/remove
- do not score low-confidence handles unless user confirms

**Step 3: Separate errors from absence**

Update `SocialPlatformData`:

```ts
readonly status: "found" | "not_found" | "skipped" | "provider_error"
```

Rules:

- `not_found`: handle confirmed but platform says no profile.
- `provider_error`: timeout/API/key/shape issue.
- `skipped`: no confirmed handle.
- Only `found` or confirmed `not_found` should affect score.

**Step 4: Keep ScrapeCreators as current practical provider**

Official social APIs generally require OAuth, app approval, or user/business authorization. For public unauthenticated scans, ScrapeCreators remains the practical enrichment provider for now, but it must be isolated behind a provider port.

**Step 5: Add future official-provider path**

Create TODO/adapter interfaces for:

- Meta/Instagram/Facebook connected business account.
- TikTok OAuth-connected account.
- TikTok/Meta ads or business APIs for paid social signals.

Do not block public grader on these.

### Phase 6: Persistence and Debuggability

**Goal:** Make bad data debuggable instead of guessing from final scores.

**Files:**

- Create: `apps/grader/lib/scan-store.ts`
- Modify: `apps/grader/app/api/grader/route.ts`
- Modify: `docs/restaurant-growth-grader-analysis.md`

**Step 1: Store scan evidence**

Persist or log, depending on current infra availability:

- request id
- selected place id
- provider name
- normalized profile
- diagnostic steps
- provider errors
- final report
- scorer version

If no DB is available in `apps/grader`, start with structured server logs and a file-backed dev store only for local testing.

**Step 2: Add internal debug route**

Future internal route:

```txt
GET /api/grader/debug/:scanId
```

Not public. Requires auth when auth exists.

**Step 3: Version scoring**

Add:

```ts
scoringVersion: "restaurant-growth-v2"
providerVersions: Record<string, string>
```

### Phase 7: UI Report Improvements

**Goal:** Show the client what we actually checked and translate numbers into concrete business impact without overclaiming.

**Files:**

- Modify: `apps/grader/app/grader-client.tsx`
- Modify: `apps/grader/app/globals.css`

**Step 1: Loading state**

Keep the animated report structure, but copy should say:

- "Checking public listing"
- "Running website audit"
- "Estimating local benchmark"
- "Checking reputation availability"
- "Checking social handles"
- "Building action plan"

If the backend is not streaming, do not imply a completed step until report returns.

**Step 2: Result state**

Each card should show:

- status: complete, partial, skipped, failed
- source
- confidence
- found signals
- missing signals
- limitation
- what Atrium would fix

**Step 3: Report summary**

Replace one-number emphasis with:

- overall score
- data quality badge
- highest-risk leak
- estimated business impact copy
- first fix
- missing-data warning if confidence is low

## Acceptance Criteria

- Public grader still works without paid APIs.
- Website audit can use PageSpeed/Lighthouse for both mobile and desktop when enabled.
- Google Places can be enabled by env without code changes.
- Google is never required for the free scan path.
- Reputation unavailable state is visible and not overclaimed.
- Social scan separates skipped, not found, and provider error.
- UI final report renders backend diagnostic steps, not hardcoded assumptions.
- API response includes source, confidence, evidence, limitations, and data quality.
- Tests cover OSM-only, Google-enabled, PageSpeed-enabled, social unavailable, and provider error paths.

## Verification Commands

Run after each implementation phase:

```bash
bunx biome check apps/grader packages/application
bun run typecheck --filter=@atrium/grader
bun test apps/grader/app/api/grader/route.test.ts apps/grader/app/api/grader/search/route.test.ts
bun test packages/application/src/diagnostics/restaurant-growth-grader.test.ts packages/application/src/diagnostics/social-health-scorer.test.ts
```

Run after modifying provider graph:

```bash
graphify update .
```

