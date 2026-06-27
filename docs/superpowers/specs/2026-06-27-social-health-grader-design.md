# Social Health Grader — Design Spec

**Date:** 2026-06-27
**Status:** Approved

## Goal

Add Social Health as the 5th sub-score to the restaurant growth grader. Uses ScrapeCreators API to fetch public social data from Instagram, Facebook, and TikTok. Social handles are auto-detected from the restaurant's website during the search step. The grader never fails because of a missing or failed social scan.

## Platforms

| Platform | Weight | API Endpoints Used |
|----------|--------|--------------------|
| Instagram | 40% | `/v1/instagram/profile` + `/v2/instagram/user/posts` |
| Facebook | 35% | `/v1/facebook/profile` + `/v1/facebook/profile/posts` |
| TikTok | 25% | `/v1/tiktok/profile` + `/v3/tiktok/profile/videos` |

Instagram weighs most because it is the dominant platform for restaurant discovery and engagement.

## Data Flow

```
/api/grader/search
  → OSM business lookup (existing)
  → website fetch (existing)
  → social-detector: parse HTML for social links     ← NEW
  → return business profile + SocialHandles

user reviews/edits social handles in UI              ← NEW

/api/grader
  → existing scans (discovery, website, reputation, conversion)
  → scrape-creators: 6 parallel calls (profile + posts × 3)  ← NEW
  → social-health-scorer: compute sub-score          ← NEW
  → return GrowthReport with socialHealth sub-score  ← NEW
```

## Architecture

Follows the existing hexagonal pattern. New files:

```
apps/grader/lib/
  social-detector.ts          extract handles from website HTML
  scrape-creators.ts          ScrapeCreators API client (HTTP only, no scoring logic)

packages/application/src/diagnostics/
  social-health-scorer.ts     pure scoring logic (no HTTP)
  social-health-scorer.test.ts

packages/events/src/
  social.ts                   SocialHandles and SocialPlatformData type contracts
```

Modified files:

```
apps/grader/app/api/grader/search/route.ts   add social detection step
apps/grader/app/api/grader/route.ts          add social scan + scoring step
apps/grader/app/api/grader/route.test.ts     add social scan tests
apps/grader/app/grader-client.tsx            social handles inputs + social sub-score card
packages/application/src/diagnostics/restaurant-growth-grader.ts  integrate 5th sub-score
packages/application/src/index.ts            export social scorer
```

## Social Handle Detection (`social-detector.ts`)

Parses the website HTML already fetched during the search step. Searches `<a href>` attributes and meta tags for known social URL patterns.

```typescript
type SocialHandles = {
  instagram: string | null   // handle only, no @
  facebook: string | null    // full URL (ScrapeCreators FB uses URLs)
  tiktok: string | null      // handle only, no @
  confidence: "detected" | "manual"
}
```

Rules:
- Match `instagram.com/{handle}` — extract handle, skip `/p/`, `/reel/`, `/stories/`
- Match `facebook.com/{page}` — keep full URL, skip `/sharer`, `/share`, `/dialog/`
- Match `tiktok.com/@{handle}` — extract handle without `@`
- `confidence: "detected"` if at least one handle found, `"manual"` otherwise
- Returns null per platform if not found; never throws

## ScrapeCreators Connector (`scrape-creators.ts`)

Makes 6 calls in parallel via `Promise.all`. No scoring logic. Returns normalized `SocialPlatformData` per platform.

```typescript
type SocialPlatformData = {
  exists: boolean
  followers: number | null
  bio: string | null
  hasProfilePic: boolean
  hasLink: boolean
  recentPosts: Array<{ date: string; likes: number; comments: number }>
  error?: string
}
```

- Auth: `x-api-key` header from `process.env.SCRAPECREATORS_API_KEY` (server-side only)
- Per-platform timeout: 5 seconds
- On any error (404, timeout, missing handle): returns `{ exists: false, error: "..." }` — never throws
- Posts fetch: request last 12 posts, filter to those within the last 30 days

## Scoring Model (`social-health-scorer.ts`)

Each platform scores 0–100 across 4 equal dimensions (25 pts each).

### Presence (25 pts)
- Profile exists and reachable: 25
- No profile or handle null: 0

### Completeness (25 pts)
- Bio written (non-empty): +10
- Profile picture present: +8
- Link/website in profile: +7

### Activity (25 pts) — posts in last 30 days
| Posts | Points |
|-------|--------|
| 8+ | 25 |
| 4–7 | 18 |
| 1–3 | 10 |
| 0 | 0 |

### Engagement (25 pts) — avg (likes + comments) / followers across recent posts
| Rate | Points |
|------|--------|
| >5% | 25 |
| 2–5% | 18 |
| 0.5–2% | 10 |
| <0.5% | 5 |
| No followers | 0 |

### Aggregation
```
socialScore = (instagram × 0.40) + (facebook × 0.35) + (tiktok × 0.25)
```

Rounded to nearest integer, 0–100.

### Per-Platform Output

Each platform also returns:
- `issues: string[]` — e.g. "Sin bio en Instagram", "Sin actividad en los últimos 30 días"
- `opportunities: string[]` — e.g. "TikTok sin cuenta — alto potencial para food content"
- `recommendedActions: string[]` — concrete next steps

## UI Changes (`grader-client.tsx`)

After business selection, show a "Redes Sociales" section with pre-filled inputs:

```
Instagram handle:  [ @bistro_miami    ]  ✓ Detectado
Facebook URL:      [ facebook.com/... ]  ✗ No encontrado
TikTok handle:     [ @bistromia       ]  ✓ Detectado
```

Social sub-score card renders identically to the other 4 sub-score cards: score, issues, opportunities, recommended actions.

If no handles detected and user leaves blank: social score = 0 with message "Ingresa tus handles para activar Social Health".

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Handle null (not detected, not entered) | Platform score = 0, `exists: false` |
| Handle not found on platform (404) | Platform score = 0, error noted in issues |
| API key missing/invalid | `socialHealth: null` in report, other 4 scores return normally |
| Platform timeout (>5s) | Same as key invalid for that platform |
| All 3 platforms fail | `socialHealth: null`, report notes "Social no disponible" |

## Environment Variables

```
SCRAPECREATORS_API_KEY=   # required for social scan; if missing, social score is skipped
```

Add to `apps/grader/.env.example`.

## Credit Cost

6 credits per grader run (2 per platform × 3 platforms).

## Non-Goals for This Iteration

- No competitor social benchmarking
- No follower growth trend (requires multiple scans)
- No Twitter/X, LinkedIn, or YouTube
- No persistence of social scan results

## Acceptance Criteria

- `social-detector.ts` extracts handles from HTML containing social links
- `social-detector.ts` returns all-null handles without throwing when no social links present
- `social-health-scorer.ts` is a pure function with no HTTP calls
- `social-health-scorer.test.ts` covers all scoring thresholds for each dimension
- `/api/grader/search` returns `socialHandles` alongside existing business profile data
- `/api/grader` accepts `socialHandles` in request body and returns `socialHealth` sub-score
- Grader returns valid report when `SCRAPECREATORS_API_KEY` is not set (social omitted)
- Grader returns valid report when all 3 social platforms return errors
- `bun run typecheck`, `bun run lint`, and all tests pass
