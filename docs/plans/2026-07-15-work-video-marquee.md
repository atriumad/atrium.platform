# Work Video Marquee Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render each case study's Cloudinary-hosted vertical videos in the curved marquee on `/work/[slug]`, starting with the 15 supplied T’ÄHÄ videos.

**Architecture:** Add optional video public IDs to the existing `CaseStudy` content model, mirroring `galleryIds`. The route conditionally renders the existing client-side `VideoMarquee`; that component resolves optimized video and poster URLs through the shared Cloudinary delivery layer and manages visibility-aware playback.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Cloudinary URL transformations, Bun test runner, Biome.

---

### Task 1: Make Cloudinary video delivery accept canonical public IDs

**Files:**
- Modify: `apps/atrium.website/lib/cloudinary.ts`
- Create: `apps/atrium.website/lib/cloudinary.test.ts`

**Step 1: Write the failing tests**

Add Bun tests asserting that `cldVideoUrl` and `cldVideoPoster` generate valid Cloudinary URLs for both a canonical ID (`v123/folder/clip`) and the supplied path form (`/v123/folder/clip.mp4`) without duplicate extensions or slashes.

**Step 2: Run the tests to verify failure**

Run: `bun test apps/atrium.website/lib/cloudinary.test.ts`

Expected: the path-form assertions fail because the current helper produces a doubled slash and `.mp4.mp4`.

**Step 3: Implement public-ID normalization**

Add a private normalizer that trims whitespace, removes leading slashes, and removes a final `.mp4`. Use it in both video URL helpers while leaving image delivery unchanged.

**Step 4: Run the focused tests**

Run: `bun test apps/atrium.website/lib/cloudinary.test.ts`

Expected: all Cloudinary URL tests pass.

### Task 2: Add T’ÄHÄ video content to the case-study model

**Files:**
- Modify: `apps/atrium.website/lib/work.ts`

**Step 1: Extend the content contract**

Add optional `videoIds?: string[]` beside `galleryIds?: string[]` on `CaseStudy`.

**Step 2: Add the supplied content**

Add all 15 versioned T’ÄHÄ video public IDs under `videoIds`. Store canonical IDs without the initial slash and final `.mp4`.

**Step 3: Verify types**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: TypeScript completes without errors introduced by the model change.

### Task 3: Harden the marquee for real Cloudinary content

**Files:**
- Modify: `apps/atrium.website/components/work/VideoMarquee.tsx`

**Step 1: Add Cloudinary posters**

When resolving `publicIds`, create each reel with both `cldVideoUrl(id)` and `cldVideoPoster(id)`.

**Step 2: Add visibility-aware playback**

Use `IntersectionObserver` at the card level to call `play()` only for intersecting or near-visible videos and `pause()` otherwise. Keep videos muted and decorative, and tolerate rejected autoplay promises.

**Step 3: Preserve reduced-motion behavior**

Keep the curved static arrangement when `prefers-reduced-motion` is enabled and ensure cleanup cancels animation frames and disconnects the observer.

**Step 4: Run static checks**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: TypeScript passes.

Run: `bun run --cwd apps/atrium.website lint components/work/VideoMarquee.tsx lib/cloudinary.ts lib/cloudinary.test.ts`

Expected: Biome reports no errors in the touched implementation.

### Task 4: Replace case-study reel placeholders

**Files:**
- Modify: `apps/atrium.website/app/work/[slug]/page.tsx`

**Step 1: Wire the component**

Import `VideoMarquee`, remove `reelSlots`, and make `ReelsSection` return `null` when `study.videoIds` is absent or empty.

**Step 2: Render configured videos**

Keep the existing section heading and copy, then render `<VideoMarquee publicIds={study.videoIds} />` instead of placeholder cards.

**Step 3: Verify the application**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: TypeScript passes.

Run: `bun run --cwd apps/atrium.website build`

Expected: the Next.js production build completes and statically generates all work slugs.

### Task 5: Refresh the code graph and inspect the result

**Files:**
- Update: `graphify-out/*` through the project graph command

**Step 1: Update graph knowledge**

Run: `graphify update .`

Expected: graphify completes its AST-only incremental refresh.

**Step 2: Inspect both conditional states**

Open `/work/taha` and confirm the real Cloudinary marquee renders with posters and movement. Open a case without `videoIds` and confirm the reels section is absent.

**Step 3: Review the final diff**

Run: `git diff -- apps/atrium.website/lib/cloudinary.ts apps/atrium.website/lib/cloudinary.test.ts apps/atrium.website/lib/work.ts apps/atrium.website/components/work/VideoMarquee.tsx 'apps/atrium.website/app/work/[slug]/page.tsx'`

Expected: only the approved model, delivery, marquee, and route changes appear in the implementation diff.
