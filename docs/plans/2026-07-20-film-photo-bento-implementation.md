# Film & Photo Bento Visual Prototype Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the `/services/film-photo` text-only bento with a performant hybrid media prototype built from Higgsfield source assets, two pre-rendered Remotion sequences, an accessible before/after comparison, and an animated contact sheet.

**Architecture:** Keep `ServiceBento` server-rendered and add an optional discriminated `visual` field to bento data. Pre-render the two cinematic sequences with Remotion so Remotion is not shipped to the browser; use narrowly scoped client components for viewport-aware video, comparison, and contact-sheet behavior. All other service pages continue using the existing text-card fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, GSAP 3.15, Remotion 4.0.483, Higgsfield MCP, `next/image`, native HTML video.

**Design reference:** `docs/plans/2026-07-20-film-photo-bento-design.md`

---

### Task 1: Generate and review the Higgsfield source media

**Skills/tools:** @video, Higgsfield MCP

**Files:**
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/bts-kitchen.mp4`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/appetizer-flat.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/appetizer-directed.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/contact-01-hero.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/contact-02-cut.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/contact-03-steam.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/contact-04-hand.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/contact-05-table.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/contact-06-ingredient.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/culture-team.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/culture-bar.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/culture-table.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/culture-door.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/source/manifest.json`

**Step 1: Preflight Higgsfield models and cost**

Use `models_explore` for the selected image and video models, then call generation with `get_cost: true`. Prefer `soul_2` at 4:3/2K for stills and the best available image-to-video model for a six-second BTS clip.

Expected: Supported parameters and total credit estimate are known before submission.

**Step 2: Generate the master appetizer image**

Prompt for a plated taco-shop appetizer in a real kitchen/dining environment with direct disposable-camera flash, warm amber highlights, teal shadows, visible grain, no text, no logos, and no film-border typography.

Expected: One artifact-free master image with enough surrounding context for both treatments.

**Step 3: Generate the reference-consistent appetizer alternate**

Use the master as reference. Preserve dish, plate, garnish, and camera angle while changing only lighting from flat direct flash to controlled diffusion with deeper shadows.

Expected: The two images align closely enough for a wipe comparison without geometry jumping.

**Step 4: Generate the six contact-sheet angles**

Use one approved hero frame as reference for all six shots. Generate hero, cut/detail, steam, hand reaching, table context, and ingredient close-up.

Expected: The food, plate, styling, and environment remain recognizably consistent.

**Step 5: Generate the four no-food culture frames**

Generate team laughter, bar at golden hour, table reset, and front door opening in the same disposable-camera style.

Expected: Four varied moments with no eye contact, invented captions, or brand marks.

**Step 6: Generate the BTS video**

Generate a six-second clip of a photographer capturing a chef plating food in a real restaurant kitchen. Require documentary camera movement, no warped equipment, no text overlays, and no dramatic cinematic effects that conflict with the point-and-shoot tone.

Expected: A clean loopable source clip with no visible generation artifacts.

**Step 7: Download and normalize assets**

Convert stills to JPEG quality 85–88, preserve 4:3, and normalize the BTS video to a browser-compatible source format. Record Higgsfield job IDs, prompts, models, and source URLs in `manifest.json`.

Expected: All files open locally and `file` reports valid JPEG/video media.

**Step 8: Perform visual QA**

Inspect every source at full size. Reject extra fingers, melted camera controls, invented typography, inconsistent plates, unreadable screen UI, or broken restaurant fixtures.

Expected: All thirteen source assets pass visual review.

**Step 9: Commit source media**

```bash
git add apps/atrium.website/public/media/services/film-photo/bento/source
git commit -m "assets: add film photo bento source media"
```

---

### Task 2: Add the Remotion production workspace

**Skills:** @video

**Files:**
- Modify: `apps/atrium.website/package.json`
- Modify: `bun.lock`
- Create: `apps/atrium.website/remotion/index.ts`
- Create: `apps/atrium.website/remotion/Root.tsx`
- Create: `apps/atrium.website/remotion/theme.ts`

**Step 1: Add the rendering dependency**

Run:

```bash
bun add --dev @remotion/cli@4.0.483 --cwd apps/atrium.website
```

Expected: `@remotion/cli` is added at the same version as `remotion` and `@remotion/player`.

**Step 2: Add Remotion scripts**

Add scripts to `apps/atrium.website/package.json`:

```json
{
  "remotion:studio": "remotion studio remotion/index.ts --public-dir=public",
  "render:film-photo:shoot-once": "remotion render remotion/index.ts FilmPhotoShootOnce public/media/services/film-photo/bento/shoot-once.mp4 --codec=h264 --public-dir=public",
  "render:film-photo:culture": "remotion render remotion/index.ts FilmPhotoCultureStrip public/media/services/film-photo/bento/culture-strip.mp4 --codec=h264 --public-dir=public"
}
```

Expected: `bun run --cwd apps/atrium.website remotion:studio` resolves the entrypoint.

**Step 3: Create the Remotion entrypoint and root**

Register two 4:3 compositions at 30 fps:

```tsx
<Composition
  id="FilmPhotoShootOnce"
  component={ShootOnceComposition}
  width={1200}
  height={1600}
  fps={30}
  durationInFrames={240}
/>
<Composition
  id="FilmPhotoCultureStrip"
  component={CultureStripComposition}
  width={1600}
  height={900}
  fps={30}
  durationInFrames={180}
/>
```

Expected: Both compositions appear in Remotion Studio.

**Step 4: Define shared visual tokens**

Export the film-frame background, amber/mint/teal colors, easing helpers, and typography-safe label styles from `remotion/theme.ts`.

Expected: Compositions do not duplicate brand values.

**Step 5: Run TypeScript**

Run:

```bash
bun run --cwd apps/atrium.website typecheck
```

Expected: PASS.

**Step 6: Commit**

```bash
git add apps/atrium.website/package.json apps/atrium.website/remotion bun.lock
git commit -m "feat: add Remotion workspace for service media"
```

---

### Task 3: Build and render the Shoot Once composition

**Skills:** @video

**Files:**
- Create: `apps/atrium.website/remotion/ShootOnceComposition.tsx`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/shoot-once-poster.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/shoot-once.mp4`

**Step 1: Build the BTS opening sequence**

Use `OffthreadVideo` for the opening clip. Crop it full-bleed, apply a subtle warm overlay, and reserve the final 120 frames for the output transformation.

Expected: Frames 0–119 read as documentary BTS without interface chrome.

**Step 2: Build the six-format end state**

At frames 120–210, animate six crops into a restrained editorial grid labeled Reel, Carousel, Story, Google, Website, and Ad. Use opacity and transform only.

Expected: The final 30 frames remain static and readable.

**Step 3: Preview the composition**

Run:

```bash
bun run --cwd apps/atrium.website remotion:studio
```

Expected: No crop jumps, overlapping labels, or unreadable frame at the final state.

**Step 4: Render MP4 and poster**

Run the render script, then render or export the final frame as `shoot-once-poster.jpg`.

Expected: MP4 is under roughly 2.5 MB when practical and poster matches the final composition.

**Step 5: Commit**

```bash
git add apps/atrium.website/remotion/ShootOnceComposition.tsx apps/atrium.website/public/media/services/film-photo/bento/shoot-once*
git commit -m "feat: render shoot once bento sequence"
```

---

### Task 4: Build and render the culture film strip

**Skills:** @video

**Files:**
- Create: `apps/atrium.website/remotion/CultureStripComposition.tsx`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/culture-strip-poster.jpg`
- Create: `apps/atrium.website/public/media/services/film-photo/bento/culture-strip.mp4`

**Step 1: Build the four-frame strip**

Use `Img`, `Sequence`, `interpolate`, and `spring` to introduce the four culture frames. Keep rotation under two degrees and avoid bounce.

Expected: Each frame is legible and the strip feels tactile rather than like a carousel.

**Step 2: Add restrained horizontal movement**

Translate the film strip across the frame during the first 150 frames and settle into the final four-frame arrangement for the last 30 frames.

Expected: Motion ends cleanly and the final state works as a poster.

**Step 3: Preview and render**

Run:

```bash
bun run --cwd apps/atrium.website render:film-photo:culture
```

Expected: Render succeeds and video has no black first frame.

**Step 4: Export the poster and commit**

```bash
git add apps/atrium.website/remotion/CultureStripComposition.tsx apps/atrium.website/public/media/services/film-photo/bento/culture-strip*
git commit -m "feat: render culture film strip sequence"
```

---

### Task 5: Extend the bento data model

**Files:**
- Modify: `apps/atrium.website/lib/services.ts:1-3`
- Modify: `apps/atrium.website/lib/services.ts:87-101`
- Create: `apps/atrium.website/lib/services.test.ts`

**Step 1: Write the failing data-contract test**

Test that the Film & Photo service has four visual cards with kinds in this order:

```ts
expect(service?.bentoCards.map((card) => card.visual?.kind)).toEqual([
  'video',
  'comparison',
  'contact-sheet',
  'film-strip',
])
```

Expected: FAIL because `visual` does not exist.

**Step 2: Add a lightweight test script if needed**

If the workspace has no test runner for this package, use Bun's built-in test runner and add:

```json
"test": "bun test"
```

Expected: `bun test apps/atrium.website/lib/services.test.ts` runs and fails on the missing field.

**Step 3: Add the discriminated visual types**

Define:

```ts
export type BentoVisual =
  | { kind: 'video'; src: string; poster: string; alt: string }
  | { kind: 'comparison'; before: string; after: string; alt: string }
  | { kind: 'contact-sheet'; frames: Array<{ src: string; alt: string; label: string }> }
  | { kind: 'film-strip'; src: string; poster: string; alt: string }

export type BentoCard = {
  size: 'large' | 'medium' | 'small'
  title: string
  copy: string
  coverAlt: string
  visual?: BentoVisual
}
```

Expected: Existing service cards remain valid because `visual` is optional.

**Step 4: Add the four Film & Photo visual definitions**

Map each card to the media paths from Tasks 1, 3, and 4. Use visible plain-language contact-sheet labels.

Expected: The data-contract test passes.

**Step 5: Run tests and typecheck**

Run:

```bash
bun test apps/atrium.website/lib/services.test.ts
bun run --cwd apps/atrium.website typecheck
```

Expected: PASS.

**Step 6: Commit**

```bash
git add apps/atrium.website/lib/services.ts apps/atrium.website/lib/services.test.ts apps/atrium.website/package.json
git commit -m "feat: model service bento visual media"
```

---

### Task 6: Implement reusable bento media components

**Files:**
- Create: `apps/atrium.website/components/services/bento/ViewportVideo.tsx`
- Create: `apps/atrium.website/components/services/bento/BeforeAfterVisual.tsx`
- Create: `apps/atrium.website/components/services/bento/ContactSheetVisual.tsx`
- Create: `apps/atrium.website/components/services/bento/BentoVisual.tsx`

**Step 1: Write component behavior tests**

Add focused tests for:

- Video remains paused before intersection.
- Video pauses when the document becomes hidden.
- Reduced motion renders the poster rather than autoplaying.
- Comparison input exposes a label and value.
- Contact-sheet labels are present before animation.

Expected: Tests fail because components do not exist.

**Step 2: Implement `ViewportVideo`**

Create a client component using `IntersectionObserver`, `visibilitychange`, and `matchMedia('(prefers-reduced-motion: reduce)')`. Render a poster fallback on media error.

Expected: Only intersecting, visible, motion-allowed videos play.

**Step 3: Implement `BeforeAfterVisual`**

Use two `next/image` layers and an accessible range input controlling a CSS custom property/clip-path. Animate from 25% to 58% once on first intersection, then allow direct user control.

Expected: Keyboard arrows and touch dragging update the comparison.

**Step 4: Implement `ContactSheetVisual`**

Use `gsap.matchMedia()` and an intersection-triggered one-time stagger. Render all labels statically before animation initialization.

Expected: Reduced-motion mode skips the stagger and shows the final state.

**Step 5: Implement the dispatcher**

`BentoVisual` switches on `visual.kind` and delegates to the correct component. Return `null` for absent visuals.

Expected: TypeScript exhaustiveness checking catches missing variants.

**Step 6: Run tests and typecheck**

Run the component tests and:

```bash
bun run --cwd apps/atrium.website typecheck
```

Expected: PASS.

**Step 7: Commit**

```bash
git add apps/atrium.website/components/services/bento
git commit -m "feat: add accessible service bento visuals"
```

---

### Task 7: Refactor the bento layout and integrate the prototype

**Files:**
- Modify: `apps/atrium.website/components/services/ServiceBento.tsx`

**Step 1: Add a failing structural test**

Assert that the rendered Film & Photo section:

- Does not expose `large`, `medium`, or `small`.
- Does not render `coverAlt` as visible placeholder copy.
- Renders four articles and four media regions.

Expected: FAIL with the current component.

**Step 2: Remove internal placeholder labels**

Delete visible `card.size` and `card.coverAlt` output. Keep `coverAlt` only as a migration fallback for alternative text.

Expected: No implementation metadata is visible.

**Step 3: Integrate `BentoVisual` into each card treatment**

Render the media before or behind the copy according to card role. Keep the copy server-rendered and readable when JavaScript is unavailable.

Expected: All four Film & Photo visuals appear in narrative order.

**Step 4: Create explicit three- and four-card desktop layouts**

For four cards, use an intentional layout rather than implicit auto-placement. Preserve one dominant left card and arrange the other three as a right-side proof stack or a balanced lower row based on actual rendered density.

Expected: No orphaned grid cell at desktop widths.

**Step 5: Add media-specific mobile proportions**

Replace the current universal 30rem photo minimum with aspect-ratio-aware visual containers. Maintain at least 44px controls.

Expected: All cards fit at 390px without excessive blank height or clipped copy.

**Step 6: Run tests, lint, and typecheck**

Run:

```bash
bun test apps/atrium.website/components/services
bun run --cwd apps/atrium.website lint
bun run --cwd apps/atrium.website typecheck
```

Expected: PASS or only pre-existing lint findings documented separately.

**Step 7: Commit**

```bash
git add apps/atrium.website/components/services/ServiceBento.tsx apps/atrium.website/components/services/bento
git commit -m "feat: integrate film photo bento prototype"
```

---

### Task 8: Visual, accessibility, and production verification

**Files:**
- Modify if needed: `apps/atrium.website/components/services/ServiceBento.tsx`
- Modify if needed: `apps/atrium.website/components/services/bento/*.tsx`

**Step 1: Run the production build**

Run:

```bash
bun run build
```

Expected: Eight packages build successfully and all eleven service routes prerender.

**Step 2: Capture desktop and mobile screenshots**

Capture `/services/film-photo` at 1440px and 390px after the bento enters the viewport.

Expected: Copy remains readable, media hierarchy is clear, and the four-card layout has no empty implicit row.

**Step 3: Verify motion behavior**

Check:

- Focal video plays once in viewport and pauses offscreen.
- Film strip stops on its final state.
- Comparison remains user-controllable.
- Contact sheet reveals once and stays visible.
- Leaving the tab pauses video.

Expected: All behaviors pass without console errors.

**Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and reload.

Expected: Posters/final states appear immediately; no autoplay or stagger runs.

**Step 5: Verify failure fallbacks**

Temporarily break a video URL and reload.

Expected: Poster remains visible and card layout is unchanged.

**Step 6: Audit media weight**

Run `du -h` on the Film & Photo bento folder and inspect network requests.

Expected: No source media downloads on page load; only posters load before intersection. Rendered videos remain within the agreed budget or deviations are documented.

**Step 7: Update the code graph**

Run:

```bash
graphify update .
```

Expected: Graph update completes successfully.

**Step 8: Commit final adjustments**

```bash
git add apps/atrium.website/components/services apps/atrium.website/lib/services.ts apps/atrium.website/public/media/services/film-photo graphify-out
git commit -m "fix: polish film photo bento media experience"
```

