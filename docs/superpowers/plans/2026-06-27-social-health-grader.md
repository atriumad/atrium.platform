# Social Health Grader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Social Health as the 5th sub-score to the restaurant growth grader using ScrapeCreators API for Instagram, Facebook, and TikTok.

**Architecture:** Pure scorer in `packages/application`, HTTP connector and handle detector in `apps/grader/lib`, social handles detected from website HTML via a new `detect-social` endpoint when user selects a restaurant, merged into the grader report at the route handler level without touching `gradeRestaurantGrowth` internals.

**Tech Stack:** Bun, TypeScript strict, Next.js 15 App Router, ScrapeCreators REST API (`https://api.scrapecreators.com`), `@atrium/application` package for shared types.

## Global Constraints

- All new TypeScript must pass `bun run typecheck` with zero errors.
- All new files must pass `bun run lint` (Biome).
- Every new function with side effects gets a test in `bun:test`.
- Social scan never throws — all errors return graceful absent data.
- `SCRAPECREATORS_API_KEY` is server-side only; never passed to client.
- Test runner: `bun test <path>` from monorepo root.
- Import social types from `@atrium/application` in `apps/grader` (already a dependency — no `package.json` changes needed).
- No changes to existing `gradeRestaurantGrowth` function signature.
- Social scan is additive: grader returns valid 4-score report even when social scan is skipped or fails.

---

### Task 1: Social type contracts and scorer

**Files:**
- Create: `packages/application/src/diagnostics/social-health-scorer.ts`
- Create: `packages/application/src/diagnostics/social-health-scorer.test.ts`
- Modify: `packages/application/src/index.ts`

**Interfaces:**
- Produces: `SocialHandles`, `SocialPlatformData`, `SocialPost`, `SocialScanResult`, `SocialPlatformScore`, `SocialHealthScore`, `scoreSocialHealth(scan: SocialScanResult): SocialHealthScore`

---

- [ ] **Step 1.1: Write failing tests for the scorer**

```typescript
// packages/application/src/diagnostics/social-health-scorer.test.ts
import { describe, expect, test } from "bun:test"
import {
  scoreSocialHealth,
  type SocialPlatformData,
  type SocialScanResult,
} from "./social-health-scorer"

function platform(overrides: Partial<SocialPlatformData> = {}): SocialPlatformData {
  return {
    exists: true,
    followers: 1000,
    bio: "Great food",
    hasProfilePic: true,
    hasLink: true,
    recentPosts: [
      { date: new Date().toISOString(), likes: 50, comments: 5 },
      { date: new Date().toISOString(), likes: 60, comments: 8 },
    ],
    ...overrides,
  }
}

function absent(): SocialPlatformData {
  return { exists: false, followers: null, bio: null, hasProfilePic: false, hasLink: false, recentPosts: [], error: "no handle" }
}

describe("scoreSocialHealth", () => {
  test("absent platform scores 0 presence", () => {
    const scan: SocialScanResult = { instagram: absent(), facebook: absent(), tiktok: absent() }
    const result = scoreSocialHealth(scan)
    expect(result.score).toBe(0)
    const ig = result.platforms.find((p) => p.platform === "instagram")
    expect(ig?.presence).toBe(0)
  })

  test("present platform scores 25 presence", () => {
    const scan: SocialScanResult = { instagram: platform(), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.presence).toBe(25)
  })

  test("completeness: bio+pic+link = 25", () => {
    const scan: SocialScanResult = {
      instagram: platform({ bio: "yes", hasProfilePic: true, hasLink: true }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.completeness).toBe(25)
  })

  test("completeness: bio only = 10", () => {
    const scan: SocialScanResult = {
      instagram: platform({ bio: "yes", hasProfilePic: false, hasLink: false }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.completeness).toBe(10)
  })

  test("completeness: nothing = 0", () => {
    const scan: SocialScanResult = {
      instagram: platform({ bio: null, hasProfilePic: false, hasLink: false }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.completeness).toBe(0)
  })

  test("activity: 8+ posts = 25", () => {
    const manyPosts = Array.from({ length: 10 }, () => ({ date: new Date().toISOString(), likes: 10, comments: 1 }))
    const scan: SocialScanResult = { instagram: platform({ recentPosts: manyPosts }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(25)
  })

  test("activity: 4-7 posts = 18", () => {
    const posts = Array.from({ length: 5 }, () => ({ date: new Date().toISOString(), likes: 10, comments: 1 }))
    const scan: SocialScanResult = { instagram: platform({ recentPosts: posts }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(18)
  })

  test("activity: 1-3 posts = 10", () => {
    const posts = [{ date: new Date().toISOString(), likes: 10, comments: 1 }]
    const scan: SocialScanResult = { instagram: platform({ recentPosts: posts }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(10)
  })

  test("activity: 0 posts = 0", () => {
    const scan: SocialScanResult = { instagram: platform({ recentPosts: [] }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(0)
  })

  test("engagement >5% = 25", () => {
    // 65 interactions / 1000 followers = 6.5%
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 60, comments: 5 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(25)
  })

  test("engagement 2-5% = 18", () => {
    // 30 interactions / 1000 = 3%
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 30, comments: 0 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(18)
  })

  test("engagement 0.5-2% = 10", () => {
    // 10 interactions / 1000 = 1%
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 10, comments: 0 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(10)
  })

  test("engagement <0.5% = 5", () => {
    // 2 interactions / 1000 = 0.2%
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 2, comments: 0 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(5)
  })

  test("engagement 0 when no followers", () => {
    const scan: SocialScanResult = {
      instagram: platform({ followers: 0, recentPosts: [{ date: new Date().toISOString(), likes: 100, comments: 10 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(0)
  })

  test("overall score: instagram 40%, facebook 35%, tiktok 25% weights", () => {
    // instagram = 100, facebook = 0, tiktok = 0 → 40
    const igFull = platform({
      bio: "yes", hasProfilePic: true, hasLink: true,
      followers: 1000,
      recentPosts: Array.from({ length: 10 }, () => ({ date: new Date().toISOString(), likes: 60, comments: 5 })),
    })
    const scan: SocialScanResult = { instagram: igFull, facebook: absent(), tiktok: absent() }
    expect(scoreSocialHealth(scan).score).toBe(40)
  })

  test("absent platform generates opportunity message", () => {
    const scan: SocialScanResult = { instagram: absent(), facebook: absent(), tiktok: absent() }
    const tiktok = scoreSocialHealth(scan).platforms.find((p) => p.platform === "tiktok")
    expect(tiktok?.opportunities.length).toBeGreaterThan(0)
  })

  test("score is clamped to 0-100", () => {
    const scan: SocialScanResult = { instagram: absent(), facebook: absent(), tiktok: absent() }
    const result = scoreSocialHealth(scan)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
```

- [ ] **Step 1.2: Run tests to verify they fail**

```bash
bun test packages/application/src/diagnostics/social-health-scorer.test.ts
```

Expected: FAIL with "Cannot find module './social-health-scorer'"

- [ ] **Step 1.3: Implement the scorer**

```typescript
// packages/application/src/diagnostics/social-health-scorer.ts

export type SocialHandles = {
  readonly instagram: string | null
  readonly facebook: string | null
  readonly tiktok: string | null
  readonly confidence: "detected" | "manual"
}

export type SocialPost = {
  readonly date: string
  readonly likes: number
  readonly comments: number
}

export type SocialPlatformData = {
  readonly exists: boolean
  readonly followers: number | null
  readonly bio: string | null
  readonly hasProfilePic: boolean
  readonly hasLink: boolean
  readonly recentPosts: SocialPost[]
  readonly error?: string
}

export type SocialScanResult = {
  readonly instagram: SocialPlatformData
  readonly facebook: SocialPlatformData
  readonly tiktok: SocialPlatformData
}

export type SocialPlatformScore = {
  readonly platform: "instagram" | "facebook" | "tiktok"
  readonly score: number
  readonly presence: number
  readonly completeness: number
  readonly activity: number
  readonly engagement: number
  readonly issues: string[]
  readonly opportunities: string[]
  readonly recommendedActions: string[]
}

export type SocialHealthScore = {
  readonly score: number
  readonly platforms: SocialPlatformScore[]
  readonly issues: string[]
  readonly opportunities: string[]
  readonly recommendedActions: string[]
}

const PLATFORM_WEIGHTS: Record<"instagram" | "facebook" | "tiktok", number> = {
  instagram: 0.40,
  facebook: 0.35,
  tiktok: 0.25,
}

const PLATFORM_LABELS: Record<"instagram" | "facebook" | "tiktok", string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
}

export function scoreSocialHealth(scan: SocialScanResult): SocialHealthScore {
  const platforms: SocialPlatformScore[] = [
    scorePlatform("instagram", scan.instagram),
    scorePlatform("facebook", scan.facebook),
    scorePlatform("tiktok", scan.tiktok),
  ]

  const score = roundScore(
    platforms.reduce((acc, p) => acc + p.score * PLATFORM_WEIGHTS[p.platform], 0),
  )

  return {
    score,
    platforms,
    issues: platforms.flatMap((p) => p.issues),
    opportunities: platforms.flatMap((p) => p.opportunities),
    recommendedActions: platforms.flatMap((p) => p.recommendedActions),
  }
}

function scorePlatform(
  platform: "instagram" | "facebook" | "tiktok",
  data: SocialPlatformData,
): SocialPlatformScore {
  const label = PLATFORM_LABELS[platform]

  if (!data.exists) {
    return {
      platform,
      score: 0,
      presence: 0,
      completeness: 0,
      activity: 0,
      engagement: 0,
      issues: [],
      opportunities: [`${label} sin cuenta — crear perfil para ampliar visibilidad.`],
      recommendedActions: [`Crear cuenta en ${label} para este restaurante.`],
    }
  }

  const presence = 25
  const completeness = scoreCompleteness(data)
  const activity = scoreActivity(data.recentPosts.length)
  const engagement = scoreEngagement(data.recentPosts, data.followers)
  const score = roundScore(presence + completeness + activity + engagement)

  return {
    platform,
    score,
    presence,
    completeness,
    activity,
    engagement,
    issues: buildPlatformIssues(label, data, activity, engagement),
    opportunities: buildPlatformOpportunities(label, data, activity),
    recommendedActions: buildPlatformActions(label, data, activity),
  }
}

function scoreCompleteness(data: SocialPlatformData): number {
  let pts = 0
  if (data.bio) pts += 10
  if (data.hasProfilePic) pts += 8
  if (data.hasLink) pts += 7
  return pts
}

function scoreActivity(postCount: number): number {
  if (postCount >= 8) return 25
  if (postCount >= 4) return 18
  if (postCount >= 1) return 10
  return 0
}

function scoreEngagement(posts: SocialPost[], followers: number | null): number {
  if (!followers || followers <= 0 || posts.length === 0) return 0
  const avgInteractions = posts.reduce((acc, p) => acc + p.likes + p.comments, 0) / posts.length
  const rate = avgInteractions / followers
  if (rate > 0.05) return 25
  if (rate >= 0.02) return 18
  if (rate >= 0.005) return 10
  return 5
}

function buildPlatformIssues(label: string, data: SocialPlatformData, activity: number, engagement: number): string[] {
  const issues: string[] = []
  if (!data.bio) issues.push(`Sin bio en ${label}.`)
  if (!data.hasProfilePic) issues.push(`Sin foto de perfil en ${label}.`)
  if (!data.hasLink) issues.push(`Sin link al sitio web en ${label}.`)
  if (activity === 0) issues.push(`Sin publicaciones en los últimos 30 días en ${label}.`)
  if (engagement <= 5 && data.recentPosts.length > 0) issues.push(`Engagement bajo en ${label}.`)
  return issues
}

function buildPlatformOpportunities(label: string, data: SocialPlatformData, activity: number): string[] {
  const opportunities: string[] = []
  if (activity < 18) opportunities.push(`Aumentar frecuencia de publicaciones en ${label} a mínimo 4 por mes.`)
  if (!data.bio || !data.hasLink) opportunities.push(`Completar el perfil de ${label} con bio y link al sitio web.`)
  return opportunities
}

function buildPlatformActions(label: string, data: SocialPlatformData, activity: number): string[] {
  const actions: string[] = []
  if (!data.bio) actions.push(`Escribir una bio clara con especialidad y ciudad en ${label}.`)
  if (!data.hasLink) actions.push(`Agregar link al menú o sitio web en ${label}.`)
  if (activity === 0) actions.push(`Publicar al menos una foto de plato o ambiente esta semana en ${label}.`)
  return actions
}

function roundScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)))
}
```

- [ ] **Step 1.4: Run tests to verify they pass**

```bash
bun test packages/application/src/diagnostics/social-health-scorer.test.ts
```

Expected: all tests PASS

- [ ] **Step 1.5: Export from `packages/application/src/index.ts`**

Add after the existing `// Diagnostics` export block:

```typescript
// Social
export type {
  SocialHandles,
  SocialHealthScore,
  SocialPlatformData,
  SocialPlatformScore,
  SocialPost,
  SocialScanResult,
} from "./diagnostics/social-health-scorer"
export { scoreSocialHealth } from "./diagnostics/social-health-scorer"
```

- [ ] **Step 1.6: Typecheck**

```bash
bun run typecheck --filter=@atrium/application
```

Expected: no errors

- [ ] **Step 1.7: Commit**

```bash
git add packages/application/src/diagnostics/social-health-scorer.ts packages/application/src/diagnostics/social-health-scorer.test.ts packages/application/src/index.ts
git commit -m "feat(application): add social health scorer with 4-dimension scoring model"
```

---

### Task 2: Social handle detector

**Files:**
- Create: `apps/grader/lib/social-detector.ts`
- Create: `apps/grader/lib/social-detector.test.ts`

**Interfaces:**
- Consumes: `SocialHandles` from `@atrium/application`
- Produces: `detectSocialHandles(html: string): SocialHandles`

---

- [ ] **Step 2.1: Write failing tests**

```typescript
// apps/grader/lib/social-detector.test.ts
import { describe, expect, test } from "bun:test"
import { detectSocialHandles } from "./social-detector"

describe("detectSocialHandles", () => {
  test("detects instagram handle from anchor tag", () => {
    const html = `<a href="https://instagram.com/bistromia">Follow</a>`
    expect(detectSocialHandles(html).instagram).toBe("bistromia")
  })

  test("detects instagram handle with www prefix", () => {
    const html = `<a href="https://www.instagram.com/real_bistro">IG</a>`
    expect(detectSocialHandles(html).instagram).toBe("real_bistro")
  })

  test("detects facebook url from anchor", () => {
    const html = `<a href="https://facebook.com/bistromia">FB</a>`
    expect(detectSocialHandles(html).facebook).toMatch(/facebook\.com\/bistromia/)
  })

  test("strips facebook url query params", () => {
    const html = `<a href="https://facebook.com/bistromia?ref=ts">FB</a>`
    expect(detectSocialHandles(html).facebook).not.toContain("?ref=ts")
  })

  test("detects tiktok handle from anchor", () => {
    const html = `<a href="https://tiktok.com/@bistromia">TikTok</a>`
    expect(detectSocialHandles(html).tiktok).toBe("bistromia")
  })

  test("skips instagram post links", () => {
    const html = `<a href="https://instagram.com/p/ABC123/">Post</a>`
    expect(detectSocialHandles(html).instagram).toBeNull()
  })

  test("skips instagram reel links", () => {
    const html = `<a href="https://instagram.com/reel/DEF456/">Reel</a>`
    expect(detectSocialHandles(html).instagram).toBeNull()
  })

  test("skips instagram stories links", () => {
    const html = `<a href="https://instagram.com/stories/bistromia/123">Story</a>`
    expect(detectSocialHandles(html).instagram).toBeNull()
  })

  test("skips facebook sharer links", () => {
    const html = `<a href="https://facebook.com/sharer/sharer.php?u=https://example.com">Share</a>`
    expect(detectSocialHandles(html).facebook).toBeNull()
  })

  test("skips facebook dialog links", () => {
    const html = `<a href="https://facebook.com/dialog/share?app_id=1">Share</a>`
    expect(detectSocialHandles(html).facebook).toBeNull()
  })

  test("returns manual confidence when no handles detected", () => {
    const result = detectSocialHandles("<html><body>No social</body></html>")
    expect(result.confidence).toBe("manual")
    expect(result.instagram).toBeNull()
    expect(result.facebook).toBeNull()
    expect(result.tiktok).toBeNull()
  })

  test("returns detected confidence when at least one handle found", () => {
    const html = `<a href="https://instagram.com/bistromia">IG</a>`
    expect(detectSocialHandles(html).confidence).toBe("detected")
  })

  test("does not throw on empty string", () => {
    expect(() => detectSocialHandles("")).not.toThrow()
  })

  test("detects all three platforms from same page", () => {
    const html = `
      <a href="https://instagram.com/bistromia">IG</a>
      <a href="https://facebook.com/bistromia">FB</a>
      <a href="https://tiktok.com/@bistromia">TT</a>
    `
    const result = detectSocialHandles(html)
    expect(result.instagram).toBe("bistromia")
    expect(result.facebook).toMatch(/bistromia/)
    expect(result.tiktok).toBe("bistromia")
    expect(result.confidence).toBe("detected")
  })
})
```

- [ ] **Step 2.2: Run tests to verify they fail**

```bash
bun test apps/grader/lib/social-detector.test.ts
```

Expected: FAIL with "Cannot find module './social-detector'"

- [ ] **Step 2.3: Implement the detector**

```typescript
// apps/grader/lib/social-detector.ts
import type { SocialHandles } from "@atrium/application"

const INSTAGRAM_SKIP = /instagram\.com\/(p|reel|stories|explore|accounts|tv)\//i
const FACEBOOK_SKIP = /facebook\.com\/(sharer|dialog|plugins|login)\b/i

export function detectSocialHandles(html: string): SocialHandles {
  const hrefs = extractHrefs(html)

  const instagram = hrefs
    .filter((href) => /instagram\.com\/[a-zA-Z0-9._]+/.test(href) && !INSTAGRAM_SKIP.test(href))
    .map((href) => href.match(/instagram\.com\/([a-zA-Z0-9._]+)/)?.[1] ?? null)
    .find((h): h is string => h !== null && h.length > 0) ?? null

  const facebook = hrefs
    .filter((href) => /facebook\.com\/[a-zA-Z0-9._-]+/.test(href) && !FACEBOOK_SKIP.test(href))
    .map((href) => {
      try {
        const url = new URL(href.startsWith("http") ? href : `https:${href}`)
        url.search = ""
        return url.toString()
      } catch {
        return null
      }
    })
    .find((url): url is string => url !== null && url.length > 0) ?? null

  const tiktok = hrefs
    .filter((href) => /tiktok\.com\/@[a-zA-Z0-9._]+/.test(href))
    .map((href) => href.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/)?.[1] ?? null)
    .find((h): h is string => h !== null && h.length > 0) ?? null

  const confidence: "detected" | "manual" =
    instagram !== null || facebook !== null || tiktok !== null ? "detected" : "manual"

  return { instagram, facebook, tiktok, confidence }
}

function extractHrefs(html: string): string[] {
  const hrefs: string[] = []
  const re = /href=["']([^"']+)["']/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(html)) !== null) {
    hrefs.push(match[1])
  }

  return hrefs
}
```

- [ ] **Step 2.4: Run tests to verify they pass**

```bash
bun test apps/grader/lib/social-detector.test.ts
```

Expected: all tests PASS

- [ ] **Step 2.5: Typecheck**

```bash
bun run typecheck --filter=@atrium/grader
```

Expected: no errors

- [ ] **Step 2.6: Commit**

```bash
git add apps/grader/lib/social-detector.ts apps/grader/lib/social-detector.test.ts
git commit -m "feat(grader): add social handle detector from website HTML"
```

---

### Task 3: ScrapeCreators connector

**Files:**
- Create: `apps/grader/lib/scrape-creators.ts`
- Create: `apps/grader/lib/scrape-creators.test.ts`

**Interfaces:**
- Consumes: `SocialHandles`, `SocialPlatformData`, `SocialScanResult` from `@atrium/application`
- Produces: `scanSocialProfiles(handles: SocialHandles, fetcher?: typeof fetch): Promise<SocialScanResult>`

---

- [ ] **Step 3.1: Write failing tests**

```typescript
// apps/grader/lib/scrape-creators.test.ts
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import type { SocialHandles } from "@atrium/application"
import { scanSocialProfiles } from "./scrape-creators"

const noHandles: SocialHandles = { instagram: null, facebook: null, tiktok: null, confidence: "manual" }
const allHandles: SocialHandles = { instagram: "bistromia", facebook: "https://facebook.com/bistromia", tiktok: "bistromia", confidence: "detected" }

beforeEach(() => { process.env.SCRAPECREATORS_API_KEY = "test-key" })
afterEach(() => { delete process.env.SCRAPECREATORS_API_KEY })

describe("scanSocialProfiles", () => {
  test("returns absent for all platforms when API key is not set", async () => {
    delete process.env.SCRAPECREATORS_API_KEY
    const result = await scanSocialProfiles(allHandles)
    expect(result.instagram.exists).toBe(false)
    expect(result.facebook.exists).toBe(false)
    expect(result.tiktok.exists).toBe(false)
  })

  test("returns absent for platforms with no handle", async () => {
    globalThis.fetch = mock(async () => Response.json({})) as unknown as typeof fetch
    const result = await scanSocialProfiles(noHandles)
    expect(result.instagram.exists).toBe(false)
    expect(result.facebook.exists).toBe(false)
    expect(result.tiktok.exists).toBe(false)
  })

  test("normalizes instagram profile data", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/instagram/profile")) {
        return Response.json({ biography: "Fresh seafood", profile_pic_url: "https://example.com/pic.jpg", external_url: "https://bistro.com", follower_count: 2500 })
      }
      if (url.includes("/v2/instagram/user/posts")) {
        return Response.json({ data: [{ taken_at: Math.floor((Date.now() - 86400000) / 1000), like_count: 120, comment_count: 8 }] })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, instagram: "bistromia", confidence: "detected" })
    expect(result.instagram.exists).toBe(true)
    expect(result.instagram.followers).toBe(2500)
    expect(result.instagram.bio).toBe("Fresh seafood")
    expect(result.instagram.hasProfilePic).toBe(true)
    expect(result.instagram.hasLink).toBe(true)
    expect(result.instagram.recentPosts.length).toBeGreaterThan(0)
  })

  test("returns absent when instagram returns 404", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 404 })) as unknown as typeof fetch
    const result = await scanSocialProfiles({ ...noHandles, instagram: "notfound", confidence: "manual" })
    expect(result.instagram.exists).toBe(false)
    expect(result.instagram.error).toBeDefined()
  })

  test("normalizes tiktok profile data", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/tiktok/profile")) {
        return Response.json({ userInfo: { user: { signature: "Food vibes", avatarMedium: "https://example.com/tt.jpg", bioLink: { link: "https://bistro.com" } }, stats: { followerCount: 3200 } } })
      }
      if (url.includes("/v3/tiktok/profile/videos")) {
        return Response.json({ itemList: [{ createTime: Math.floor((Date.now() - 86400000) / 1000), stats: { diggCount: 200, commentCount: 12 } }] })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, tiktok: "bistromia", confidence: "detected" })
    expect(result.tiktok.exists).toBe(true)
    expect(result.tiktok.followers).toBe(3200)
    expect(result.tiktok.bio).toBe("Food vibes")
  })

  test("normalizes facebook profile data", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/facebook/profile/posts")) return Response.json({ data: [] })
      if (url.includes("/v1/facebook/profile")) {
        return Response.json({ about: "Miami's finest bistro", picture: "https://example.com/fb.jpg", website: "https://bistro.com", followers: 1800 })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, facebook: "https://facebook.com/bistromia", confidence: "detected" })
    expect(result.facebook.exists).toBe(true)
    expect(result.facebook.followers).toBe(1800)
    expect(result.facebook.bio).toBe("Miami's finest bistro")
  })

  test("sends x-api-key header", async () => {
    const capturedHeaders: Record<string, string>[] = []
    globalThis.fetch = mock(async (_input: string | URL | Request, init?: RequestInit) => {
      capturedHeaders.push((init?.headers ?? {}) as Record<string, string>)
      return Response.json({})
    }) as unknown as typeof fetch

    await scanSocialProfiles({ ...noHandles, instagram: "bistromia", confidence: "manual" })
    expect(capturedHeaders.some((h) => h["x-api-key"] === "test-key")).toBe(true)
  })

  test("filters posts older than 30 days", async () => {
    const oldDate = Math.floor((Date.now() - 40 * 24 * 60 * 60 * 1000) / 1000)
    const recentDate = Math.floor((Date.now() - 5 * 24 * 60 * 60 * 1000) / 1000)

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/instagram/profile")) return Response.json({ follower_count: 1000 })
      if (url.includes("/v2/instagram/user/posts")) {
        return Response.json({ data: [{ taken_at: oldDate, like_count: 100, comment_count: 5 }, { taken_at: recentDate, like_count: 50, comment_count: 3 }] })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, instagram: "bistromia", confidence: "manual" })
    expect(result.instagram.recentPosts.length).toBe(1)
  })
})
```

- [ ] **Step 3.2: Run tests to verify they fail**

```bash
bun test apps/grader/lib/scrape-creators.test.ts
```

Expected: FAIL with "Cannot find module './scrape-creators'"

- [ ] **Step 3.3: Implement the connector**

```typescript
// apps/grader/lib/scrape-creators.ts
import type { SocialHandles, SocialPlatformData, SocialScanResult } from "@atrium/application"

const BASE_URL = "https://api.scrapecreators.com"
const TIMEOUT_MS = 5_000
const POST_LIMIT = 12
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function scanSocialProfiles(
  handles: SocialHandles,
  fetcher: typeof fetch = fetch,
): Promise<SocialScanResult> {
  const apiKey = getScrapeCreatorsApiKey()

  if (!apiKey) {
    const msg = "SCRAPECREATORS_API_KEY not set"
    return { instagram: absent(msg), facebook: absent(msg), tiktok: absent(msg) }
  }

  const [instagram, facebook, tiktok] = await Promise.all([
    handles.instagram
      ? fetchInstagram(handles.instagram, apiKey, fetcher)
      : Promise.resolve(absent("No Instagram handle")),
    handles.facebook
      ? fetchFacebook(handles.facebook, apiKey, fetcher)
      : Promise.resolve(absent("No Facebook URL")),
    handles.tiktok
      ? fetchTikTok(handles.tiktok, apiKey, fetcher)
      : Promise.resolve(absent("No TikTok handle")),
  ])

  return { instagram, facebook, tiktok }
}

async function fetchInstagram(handle: string, apiKey: string, fetcher: typeof fetch): Promise<SocialPlatformData> {
  try {
    const [profile, posts] = await Promise.all([
      scrapeGet(`/v1/instagram/profile?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
      scrapeGet(`/v2/instagram/user/posts?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
    ])

    if (!profile.ok) return absent(`Instagram not found (${profile.status})`)

    const p = await profile.json() as Record<string, unknown>
    const postsBody = posts.ok ? (await posts.json() as Record<string, unknown>) : {}
    const items = postsBody.data ?? postsBody.items ?? []

    return {
      exists: true,
      followers: toNumber(p.follower_count ?? p.followers_count),
      bio: toStr(p.biography),
      hasProfilePic: Boolean(p.profile_pic_url ?? p.hd_profile_pic_url_info),
      hasLink: Boolean(p.external_url) || Boolean(Array.isArray(p.bio_links) && p.bio_links.length > 0),
      recentPosts: extractInstagramPosts(items),
    }
  } catch (e) {
    return absent(String(e))
  }
}

async function fetchFacebook(url: string, apiKey: string, fetcher: typeof fetch): Promise<SocialPlatformData> {
  try {
    const [profile, posts] = await Promise.all([
      scrapeGet(`/v1/facebook/profile?url=${encodeURIComponent(url)}`, apiKey, fetcher),
      scrapeGet(`/v1/facebook/profile/posts?url=${encodeURIComponent(url)}`, apiKey, fetcher),
    ])

    if (!profile.ok) return absent(`Facebook not found (${profile.status})`)

    const p = await profile.json() as Record<string, unknown>
    const postsBody = posts.ok ? (await posts.json() as Record<string, unknown>) : {}
    const items = postsBody.data ?? postsBody.posts ?? []

    return {
      exists: true,
      followers: toNumber(p.followers ?? p.fans),
      bio: toStr(p.about ?? p.description),
      hasProfilePic: Boolean(p.picture ?? p.profile_picture),
      hasLink: Boolean(p.website),
      recentPosts: extractFacebookPosts(items),
    }
  } catch (e) {
    return absent(String(e))
  }
}

async function fetchTikTok(handle: string, apiKey: string, fetcher: typeof fetch): Promise<SocialPlatformData> {
  try {
    const [profile, videos] = await Promise.all([
      scrapeGet(`/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
      scrapeGet(`/v3/tiktok/profile/videos?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
    ])

    if (!profile.ok) return absent(`TikTok not found (${profile.status})`)

    const p = await profile.json() as Record<string, unknown>
    const videosBody = videos.ok ? (await videos.json() as Record<string, unknown>) : {}
    const items = videosBody.itemList ?? videosBody.videos ?? []

    const userInfo = (p.userInfo ?? {}) as Record<string, unknown>
    const user = (userInfo.user ?? p.user ?? p) as Record<string, unknown>
    const stats = (userInfo.stats ?? p.stats ?? {}) as Record<string, unknown>
    const bioLink = user.bioLink as Record<string, unknown> | undefined

    return {
      exists: true,
      followers: toNumber(stats.followerCount ?? stats.fans),
      bio: toStr(user.signature ?? user.bio),
      hasProfilePic: Boolean(user.avatarMedium ?? user.avatar_medium),
      hasLink: Boolean(bioLink?.link ?? user.bio_link),
      recentPosts: extractTikTokPosts(items),
    }
  } catch (e) {
    return absent(String(e))
  }
}

function scrapeGet(path: string, apiKey: string, fetcher: typeof fetch): Promise<Response> {
  return fetcher(`${BASE_URL}${path}`, {
    headers: { "x-api-key": apiKey },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

function extractInstagramPosts(items: unknown): Array<{ date: string; likes: number; comments: number }> {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const ts = toNumber(i.taken_at ?? i.taken_at_timestamp) ?? 0
      const dateMs = ts > 1_000_000_000_000 ? ts : ts * 1000
      return { date: new Date(dateMs).toISOString(), likes: toNumber(i.like_count) ?? 0, comments: toNumber(i.comment_count) ?? 0 }
    })
    .filter((p) => new Date(p.date).getTime() >= cutoff)
}

function extractFacebookPosts(items: unknown): Array<{ date: string; likes: number; comments: number }> {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const reactions = (i.reactions as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined
      const comments = (i.comments as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined
      const ts = toStr(i.timestamp ?? i.created_time)
      const dateMs = ts ? new Date(ts).getTime() : 0
      return { date: new Date(dateMs).toISOString(), likes: toNumber(reactions?.total_count) ?? 0, comments: toNumber(comments?.total_count) ?? 0 }
    })
    .filter((p) => new Date(p.date).getTime() >= cutoff)
}

function extractTikTokPosts(items: unknown): Array<{ date: string; likes: number; comments: number }> {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const stats = (i.stats ?? {}) as Record<string, unknown>
      const ts = toNumber(i.createTime ?? i.create_time) ?? 0
      return { date: new Date(ts * 1000).toISOString(), likes: toNumber(stats.diggCount ?? stats.likeCount) ?? 0, comments: toNumber(stats.commentCount) ?? 0 }
    })
    .filter((p) => new Date(p.date).getTime() >= cutoff)
}

function absent(error: string): SocialPlatformData {
  return { exists: false, followers: null, bio: null, hasProfilePic: false, hasLink: false, recentPosts: [], error }
}

function toNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toStr(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return null
}

function getScrapeCreatorsApiKey(): string | null {
  const value = process.env.SCRAPECREATORS_API_KEY?.trim()
  return value && value.length > 0 ? value : null
}
```

- [ ] **Step 3.4: Run tests to verify they pass**

```bash
bun test apps/grader/lib/scrape-creators.test.ts
```

Expected: all tests PASS

- [ ] **Step 3.5: Typecheck**

```bash
bun run typecheck --filter=@atrium/grader
```

Expected: no errors

- [ ] **Step 3.6: Commit**

```bash
git add apps/grader/lib/scrape-creators.ts apps/grader/lib/scrape-creators.test.ts
git commit -m "feat(grader): add ScrapeCreators connector for Instagram, Facebook, TikTok"
```

---

### Task 4: Website URL helper and detect-social route

**Files:**
- Modify: `apps/grader/lib/open-data-places.ts` (add `getWebsiteUrlForPlace` after line 217)
- Create: `apps/grader/app/api/grader/detect-social/route.ts`

**Interfaces:**
- Consumes: `detectSocialHandles` from `@/lib/social-detector`, `getWebsiteUrlForPlace` from `@/lib/open-data-places`
- Produces: `POST /api/grader/detect-social` → `{ socialHandles: SocialHandles }`

---

- [ ] **Step 4.1: Add `getWebsiteUrlForPlace` to `open-data-places.ts`**

Add this exported function after `getRestaurantGrowthProfileFromPlace` (after line 217):

```typescript
export async function getWebsiteUrlForPlace(
  placeId: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const osmId = parsePlaceId(placeId)
  if (!osmId) return null

  const params = new URLSearchParams({
    osm_ids: `${osmId.prefix}${osmId.id}`,
    format: "jsonv2",
    extratags: "1",
  })

  try {
    const res = await fetcher(`${NOMINATIM_BASE_URL}/lookup?${params.toString()}`, {
      method: "GET",
      headers: openDataHeaders(),
      signal: AbortSignal.timeout(4_000),
    })

    if (!res.ok) return null

    const data = await res.json() as NominatimPlace[]
    const place = data[0]
    if (!place) return null

    return normalizeUrl(readTag(place, ["website", "contact:website", "url", "homepage"]))
  } catch {
    return null
  }
}
```

- [ ] **Step 4.2: Create the detect-social route**

```typescript
// apps/grader/app/api/grader/detect-social/route.ts
import { NextResponse } from "next/server"
import { detectSocialHandles } from "@/lib/social-detector"
import { getWebsiteUrlForPlace } from "@/lib/open-data-places"

const EMPTY_HANDLES = { instagram: null, facebook: null, tiktok: null, confidence: "manual" as const }

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { placeId?: unknown } | null
  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  const websiteUrl = await getWebsiteUrlForPlace(placeId)

  if (!websiteUrl) {
    return NextResponse.json({ socialHandles: EMPTY_HANDLES })
  }

  try {
    const res = await fetch(websiteUrl, {
      method: "GET",
      signal: AbortSignal.timeout(4_000),
    })

    if (!res.ok) {
      return NextResponse.json({ socialHandles: EMPTY_HANDLES })
    }

    const html = await res.text()
    return NextResponse.json({ socialHandles: detectSocialHandles(html) })
  } catch {
    return NextResponse.json({ socialHandles: EMPTY_HANDLES })
  }
}
```

- [ ] **Step 4.3: Typecheck**

```bash
bun run typecheck --filter=@atrium/grader
```

Expected: no errors

- [ ] **Step 4.4: Commit**

```bash
git add apps/grader/lib/open-data-places.ts apps/grader/app/api/grader/detect-social/route.ts
git commit -m "feat(grader): add detect-social route for website social handle detection"
```

---

### Task 5: Update report types and grader route

**Files:**
- Modify: `packages/application/src/diagnostics/restaurant-growth-grader.ts`
- Modify: `apps/grader/app/api/grader/route.ts`
- Modify: `apps/grader/app/api/grader/route.test.ts`
- Modify: `apps/grader/.env.example`

**Interfaces:**
- Consumes: `scoreSocialHealth`, `SocialHandles`, `SocialHealthScore` from `@atrium/application`; `scanSocialProfiles` from `@/lib/scrape-creators`
- Produces: `RestaurantGrowthReport` with optional `socialHealth` and `scores.social`

---

- [ ] **Step 5.1: Add `social?` to `RestaurantGrowthScores`**

In `packages/application/src/diagnostics/restaurant-growth-grader.ts`, find `RestaurantGrowthScores` (lines 40-45) and add `readonly social?: number`:

```typescript
export type RestaurantGrowthScores = {
  readonly discovery: number
  readonly website: number
  readonly reputation: number
  readonly conversion: number
  readonly social?: number
}
```

- [ ] **Step 5.2: Add `socialHealth?` and import to `restaurant-growth-grader.ts`**

At the top of `restaurant-growth-grader.ts`, add after the existing import:

```typescript
import type { SocialHealthScore } from "./social-health-scorer"
```

Find `RestaurantGrowthReport` type and add `readonly socialHealth?: SocialHealthScore` after the `confidence` field:

```typescript
export type RestaurantGrowthReport = {
  readonly business: {
    readonly id: string
    readonly name: string
    readonly category: string
    readonly address: string
    readonly websiteUrl: string | null
  }
  readonly overallScore: number
  readonly scores: RestaurantGrowthScores
  readonly issues: RestaurantGrowthIssue[]
  readonly opportunities: RestaurantGrowthOpportunity[]
  readonly recommendations: RestaurantGrowthRecommendation[]
  readonly estimatedLostOpportunity: string
  readonly nextBestAction: string
  readonly confidence: "low" | "medium" | "high"
  readonly socialHealth?: SocialHealthScore
}
```

- [ ] **Step 5.3: Typecheck `packages/application`**

```bash
bun run typecheck --filter=@atrium/application
```

Expected: no errors

- [ ] **Step 5.4: Write failing social tests in `route.test.ts`**

In `apps/grader/app/api/grader/route.test.ts`, add after the last existing test inside the `describe` block:

```typescript
  test("includes socialHealth when social handles provided and API key set", async () => {
    process.env.SCRAPECREATORS_API_KEY = "test-key"

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([{ osm_type: "node", osm_id: 123, lat: "25.79065", lon: "-80.13005", category: "amenity", type: "restaurant", display_name: "Real Bistro, Miami Beach, FL", namedetails: { name: "Real Bistro" }, extratags: {} }])
      }

      if (url.includes("overpass-api.de")) return Response.json({ elements: [] })

      if (url.includes("scrapecreators.com") && url.includes("/v1/instagram/profile")) {
        return Response.json({ biography: "Fresh seafood", profile_pic_url: "https://example.com/pic.jpg", external_url: "https://bistro.com", follower_count: 2000 })
      }

      if (url.includes("scrapecreators.com") && url.includes("/v2/instagram/user/posts")) {
        return Response.json({ data: Array.from({ length: 5 }, (_, i) => ({ taken_at: Math.floor((Date.now() - (i + 1) * 86400000) / 1000), like_count: 50, comment_count: 5 })) })
      }

      if (url.includes("scrapecreators.com")) return Response.json({})

      return Response.json({})
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({
      placeId: "osm:node:123",
      socialHandles: { instagram: "bistromia", facebook: null, tiktok: null, confidence: "manual" },
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.socialHealth).toBeDefined()
    expect(body.report.socialHealth.score).toBeGreaterThan(0)
    expect(body.report.scores.social).toBeGreaterThan(0)

    delete process.env.SCRAPECREATORS_API_KEY
  })

  test("returns report without socialHealth when no social handles provided", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([{ osm_type: "node", osm_id: 123, lat: "25.79065", lon: "-80.13005", category: "amenity", type: "restaurant", display_name: "Real Bistro, Miami Beach, FL", namedetails: { name: "Real Bistro" }, extratags: {} }])
      }
      return Response.json({ elements: [] })
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "osm:node:123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.socialHealth).toBeUndefined()
    expect(body.report.scores.social).toBeUndefined()
  })
```

- [ ] **Step 5.5: Run tests to verify new ones fail**

```bash
bun test apps/grader/app/api/grader/route.test.ts
```

Expected: new social tests FAIL, existing tests PASS

- [ ] **Step 5.6: Replace `apps/grader/app/api/grader/route.ts` contents**

```typescript
// apps/grader/app/api/grader/route.ts
import { gradeRestaurantGrowth, scoreSocialHealth } from "@atrium/application"
import type { RestaurantGrowthReport, SocialHandles } from "@atrium/application"
import { NextResponse } from "next/server"
import { getRestaurantGrowthProfileFromPlace, OpenDataPlacesLookupError } from "@/lib/open-data-places"
import { scanSocialProfiles } from "@/lib/scrape-creators"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as {
    placeId?: unknown
    reputation?: { rating?: unknown; reviewCount?: unknown }
    socialHandles?: { instagram?: unknown; facebook?: unknown; tiktok?: unknown }
  } | null

  const placeId = typeof body?.placeId === "string" ? body.placeId : ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  try {
    const profile = await getRestaurantGrowthProfileFromPlace(placeId, {
      rating: typeof body?.reputation?.rating === "number" ? body.reputation.rating : null,
      reviewCount: typeof body?.reputation?.reviewCount === "number" ? body.reputation.reviewCount : null,
    })

    const result = gradeRestaurantGrowth(profile)

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const handles = parseSocialHandles(body?.socialHandles)
    const hasSocialHandles = handles !== null

    if (!hasSocialHandles) {
      return NextResponse.json({ report: result.value })
    }

    const socialScan = await scanSocialProfiles(handles)
    const socialHealth = scoreSocialHealth(socialScan)
    const baseReport = result.value

    const report: RestaurantGrowthReport = {
      ...baseReport,
      scores: { ...baseReport.scores, social: socialHealth.score },
      overallScore: Math.round(
        baseReport.scores.discovery * 0.20
        + baseReport.scores.website * 0.20
        + baseReport.scores.reputation * 0.20
        + baseReport.scores.conversion * 0.20
        + socialHealth.score * 0.20,
      ),
      socialHealth,
    }

    return NextResponse.json({ report })
  } catch (error) {
    if (error instanceof OpenDataPlacesLookupError) {
      const status = error.message === "Business not found"
        ? 404
        : error.message === "placeId is required"
          ? 400
          : 502
      return NextResponse.json({ error: error.message }, { status })
    }

    return NextResponse.json({ error: "Unable to run diagnostic" }, { status: 500 })
  }
}

function parseSocialHandles(
  raw: { instagram?: unknown; facebook?: unknown; tiktok?: unknown } | null | undefined,
): SocialHandles | null {
  if (!raw || typeof raw !== "object") return null

  const instagram = typeof raw.instagram === "string" && raw.instagram.trim().length > 0
    ? raw.instagram.trim() : null
  const facebook = typeof raw.facebook === "string" && raw.facebook.trim().length > 0
    ? raw.facebook.trim() : null
  const tiktok = typeof raw.tiktok === "string" && raw.tiktok.trim().length > 0
    ? raw.tiktok.trim() : null

  if (instagram === null && facebook === null && tiktok === null) return null

  return { instagram, facebook, tiktok, confidence: "manual" }
}
```

- [ ] **Step 5.7: Add `SCRAPECREATORS_API_KEY` to `.env.example`**

In `apps/grader/.env.example`, append:

```
# SCRAPECREATORS_API_KEY=""
```

- [ ] **Step 5.8: Run all grader route tests**

```bash
bun test apps/grader/app/api/grader/route.test.ts
```

Expected: all tests PASS

- [ ] **Step 5.9: Typecheck**

```bash
bun run typecheck --filter=@atrium/grader
```

Expected: no errors

- [ ] **Step 5.10: Commit**

```bash
git add packages/application/src/diagnostics/restaurant-growth-grader.ts apps/grader/app/api/grader/route.ts apps/grader/app/api/grader/route.test.ts apps/grader/.env.example
git commit -m "feat(grader): integrate social health scan as 5th sub-score in grader route"
```

---

### Task 6: Update grader UI

**Files:**
- Modify: `apps/grader/app/grader-client.tsx`

**Interfaces:**
- Consumes: `POST /api/grader/detect-social` → `{ socialHandles }`, `POST /api/grader` (now accepts `socialHandles` body field)
- Produces: social handles form after business selection, social sub-score card in results

---

- [ ] **Step 6.1: Update `scanSteps` — add Social audit step**

Find the `scanSteps` array (line 7) and replace it entirely:

```typescript
const scanSteps = [
  { title: "Open data", detail: "Resolving the public listing, address, and restaurant category." },
  { title: "Website scan", detail: "Checking menu, ordering, reservations, phone visibility, and schema." },
  { title: "Local benchmark", detail: "Comparing nearby restaurant density and discovery signals." },
  { title: "Reputation layer", detail: "Blending available review context with the baseline you provide." },
  { title: "Social audit", detail: "Scanning Instagram, Facebook, and TikTok presence, activity, and engagement." },
  { title: "Growth brief", detail: "Ranking leaks by urgency and preparing the next action." },
]
```

- [ ] **Step 6.2: Add social types after `SearchResponse` type**

After the `type SearchResponse` definition (around line 43), add:

```typescript
type SocialHandles = {
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  confidence: "detected" | "manual"
}

type DetectSocialResponse = {
  socialHandles?: SocialHandles
  error?: string
}
```

- [ ] **Step 6.3: Update `scoreLabels` to include social**

Find `scoreLabels` (around line 51):

```typescript
const scoreLabels: Record<keyof RestaurantGrowthScores, string> = {
  discovery: "Discovery",
  website: "Website",
  reputation: "Reputation",
  conversion: "Conversion",
}
```

Replace with:

```typescript
const scoreLabels: Partial<Record<keyof RestaurantGrowthScores, string>> = {
  discovery: "Discovery",
  website: "Website",
  reputation: "Reputation",
  conversion: "Conversion",
  social: "Social",
}
```

- [ ] **Step 6.4: Add social state inside `GraderClient` function**

After the existing `useState` declarations (after `const [scanStep, setScanStep] = useState(0)`), add:

```typescript
  const [instagramHandle, setInstagramHandle] = useState("")
  const [facebookUrl, setFacebookUrl] = useState("")
  const [tiktokHandle, setTiktokHandle] = useState("")
  const [detectingSocial, setDetectingSocial] = useState(false)
```

- [ ] **Step 6.5: Add `detectSocial` function inside `GraderClient`**

After `handleQueryChange` (around line 148), add:

```typescript
  async function detectSocial(placeId: string) {
    setDetectingSocial(true)
    try {
      const res = await fetch("/api/grader/detect-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      })
      if (res.ok) {
        const data = await res.json() as DetectSocialResponse
        const handles = data.socialHandles
        if (handles) {
          if (handles.instagram) setInstagramHandle(handles.instagram)
          if (handles.facebook) setFacebookUrl(handles.facebook)
          if (handles.tiktok) setTiktokHandle(handles.tiktok)
        }
      }
    } catch {
      // silently ignore — user can fill manually
    } finally {
      setDetectingSocial(false)
    }
  }
```

- [ ] **Step 6.6: Update `chooseSuggestion` to trigger detection and clear social state**

Find `chooseSuggestion` and replace it:

```typescript
  function chooseSuggestion(suggestion: PlaceSuggestion) {
    setSelectedPlace(suggestion)
    setQuery(suggestion.name)
    setSuggestions([])
    setReport(null)
    setError(null)
    setSearchError(null)
    setInstagramHandle("")
    setFacebookUrl("")
    setTiktokHandle("")
    void detectSocial(suggestion.placeId)
  }
```

- [ ] **Step 6.7: Update `resetFlow` to clear social state**

Find `resetFlow` and replace it:

```typescript
  function resetFlow() {
    setReport(null)
    setError(null)
    setSearchError(null)
    setSuggestions([])
    setSelectedPlace(null)
    setQuery("")
    setScanStep(0)
    setInstagramHandle("")
    setFacebookUrl("")
    setTiktokHandle("")
  }
```

- [ ] **Step 6.8: Pass social handles to `/api/grader` in `runDiagnostic`**

Find the `fetch("/api/grader"` call inside `runDiagnostic` and replace the body:

```typescript
    const request = fetch("/api/grader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId: selectedPlace.placeId,
        socialHandles: {
          instagram: instagramHandle.trim() || null,
          facebook: facebookUrl.trim() || null,
          tiktok: tiktokHandle.trim() || null,
        },
      }),
    })
```

- [ ] **Step 6.9: Update `SearchStage` call with new social props**

Find the `<SearchStage` JSX call in `GraderClient`'s return and replace it:

```tsx
        <SearchStage
          compact={phase !== "search"}
          detectingSocial={detectingSocial}
          error={error}
          facebookUrl={facebookUrl}
          instagramHandle={instagramHandle}
          loading={loading}
          onChooseSuggestion={chooseSuggestion}
          onFacebookChange={setFacebookUrl}
          onInstagramChange={(v) => setInstagramHandle(v.replace(/^@/, ""))}
          onQueryChange={handleQueryChange}
          onRunDiagnostic={runDiagnostic}
          onSearch={searchRestaurants}
          onTiktokChange={(v) => setTiktokHandle(v.replace(/^@/, ""))}
          query={query}
          searchError={searchError}
          searching={searching}
          selectedPlace={selectedPlace}
          selectedSummary={selectedSummary}
          suggestions={suggestions}
          tiktokHandle={tiktokHandle}
        />
```

- [ ] **Step 6.10: Update `SearchStage` props type and social handles form**

Find the `SearchStage` function definition. Replace the entire props destructuring and type annotation:

```typescript
function SearchStage({
  compact,
  detectingSocial,
  error,
  facebookUrl,
  instagramHandle,
  loading,
  onChooseSuggestion,
  onFacebookChange,
  onInstagramChange,
  onQueryChange,
  onRunDiagnostic,
  onSearch,
  onTiktokChange,
  query,
  searchError,
  searching,
  selectedPlace,
  selectedSummary,
  suggestions,
  tiktokHandle,
}: {
  compact: boolean
  detectingSocial: boolean
  error: string | null
  facebookUrl: string
  instagramHandle: string
  loading: boolean
  onChooseSuggestion: (suggestion: PlaceSuggestion) => void
  onFacebookChange: (value: string) => void
  onInstagramChange: (value: string) => void
  onQueryChange: (value: string) => void
  onRunDiagnostic: () => void
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  onTiktokChange: (value: string) => void
  query: string
  searchError: string | null
  searching: boolean
  selectedPlace: PlaceSuggestion | null
  selectedSummary: string | null
  suggestions: PlaceSuggestion[]
  tiktokHandle: string
})
```

Find the `selectedPlace && !compact` JSX block inside `SearchStage` and replace it:

```tsx
      {selectedPlace && !compact && (
        <div className="selected-panel">
          <div className="selected-place">
            <span className="selected-kicker">Selected</span>
            <strong>{selectedPlace.name}</strong>
            {selectedSummary && <small>{selectedSummary}</small>}
          </div>

          <div className="social-handles-section">
            <p className="micro-label">
              {detectingSocial ? "Detecting social accounts..." : "Social accounts (optional)"}
            </p>
            <div className="social-handles-grid">
              <label className="social-handle-field">
                <span>Instagram</span>
                <input
                  placeholder="handle"
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => onInstagramChange(e.target.value)}
                />
              </label>
              <label className="social-handle-field">
                <span>Facebook</span>
                <input
                  placeholder="facebook.com/page"
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => onFacebookChange(e.target.value)}
                />
              </label>
              <label className="social-handle-field">
                <span>TikTok</span>
                <input
                  placeholder="handle"
                  type="text"
                  value={tiktokHandle}
                  onChange={(e) => onTiktokChange(e.target.value)}
                />
              </label>
            </div>
          </div>

          <button className="primary-cta" onClick={onRunDiagnostic} type="button">
            Scan restaurant
          </button>
        </div>
      )}
```

- [ ] **Step 6.11: Update score list to handle optional social score**

In `ResultStage`, find the `score-list` block and replace the `.map` call:

```tsx
        <div className="score-list">
          {(Object.entries(report.scores) as [keyof RestaurantGrowthScores, number | undefined][])
            .filter((entry): entry is [keyof RestaurantGrowthScores, number] => entry[1] != null)
            .map(([key, value]) => (
            <div className={`score-row score-row--${scoreTone(value)}`} key={key}>
              <span>{scoreLabels[key] ?? key}</span>
              <strong>{value}</strong>
              <div aria-hidden="true" className={`solid-meter solid-meter--${scoreTone(value)}`}>
                <span style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
```

- [ ] **Step 6.12: Typecheck**

```bash
bun run typecheck --filter=@atrium/grader
```

Expected: no errors

- [ ] **Step 6.13: Run all tests**

```bash
bun test
```

Expected: all tests PASS

- [ ] **Step 6.14: Commit**

```bash
git add apps/grader/app/grader-client.tsx
git commit -m "feat(grader): add social handles form and social sub-score display to UI"
```

---

### Task 7: Final integration check

- [ ] **Step 7.1: Run full typecheck**

```bash
bun run typecheck
```

Expected: no errors across all packages

- [ ] **Step 7.2: Run lint**

```bash
bun run lint
```

Expected: no errors

- [ ] **Step 7.3: Run all tests**

```bash
bun test
```

Expected: all tests PASS

- [ ] **Step 7.4: Verify grader starts**

```bash
bun run dev:grader
```

Open the grader URL. Verify:
1. Search for a restaurant → select it
2. "Social accounts" section appears below selected business (shows "Detecting social accounts..." briefly)
3. Handle fields are editable and pre-filled if website has social links
4. Click "Scan restaurant" → diagnostic runs with 6 scan steps in status cards
5. If `SCRAPECREATORS_API_KEY` is set in `.env.local`: Social sub-score appears in score list
6. If key is not set: report shows 4 scores only, no social row
7. All existing 4 sub-scores display correctly
8. "Scan another restaurant" resets social fields
