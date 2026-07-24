# Hero drag gallery — design

**Date:** 2026-07-24
**App:** apps/atrium.website

## Problem

The homepage hero (`components/sections/HeroSection.tsx`) uses a decorative 3D
shader canvas (`components/3d/HeroScene.tsx`) as its background. It's
abstract, doesn't show any real work, and its only consumer is this one
component. Reference: a Framer "Limitless Pro"-style multi-mode photo gallery
demo (Wall/Table/Tunnel/Flat/Stack/Carousel/Coverflow toggle). We already
ported the "Wall" mode as `components/work/DragGallery.tsx` (infinite
drag-to-pan masonry), used today on `/work/[slug]` below the fold.

## Scope

- Replace `HeroScene` with `DragGallery` as the hero's background visual,
  showing real case-study photography instead of an abstract shader.
- Reuse `DragGallery` as-is architecturally; extend it with a small number of
  props needed to make it safe to run **above the fold** (LCP, dark theme,
  mobile scroll), since its only other usage today is mid-page.
- Out of scope: the other six gallery modes (Table/Tunnel/Flat/Stack/
  Carousel/Coverflow). Only "Wall" is being built.

## Architecture

`HeroSection.tsx`:
- Drop the `next/dynamic` import of `HeroScene` and its render.
- Render `<DragGallery publicIds={heroGalleryIds} background="#0a0806" eagerCount={8} />`
  at the same `position: absolute; inset: 0; z-index: 0` slot `HeroScene`
  occupied.
- Add a scrim `<div>` between the gallery and the text content: absolute,
  inset-0, `background: linear-gradient(180deg, rgba(10,8,6,0.55) 0%, rgba(10,8,6,0.5) 55%, rgba(10,8,6,0.72) 100%)`,
  `z-index: 5`. Text/tags/buttons stay at `z-index: 10`, unchanged otherwise.
- Delete `components/3d/HeroScene.tsx` (and the now-empty `components/3d/`
  directory) since it has no other consumers.
- Remove now-unused deps from `package.json`: `three`, `@react-three/fiber`,
  `@react-three/drei`, `@types/three` — confirmed no other file in the repo
  imports from any of them.

## Content: `heroGalleryIds`

Add to `lib/work.ts`, after the existing loop that populates
`study.galleryIds` from `cloudinaryAssets` (so it draws from already-synced,
real Cloudinary IDs — no new stock/placeholder URLs):

```ts
export const heroGalleryIds: string[] = [
  'taco-naco', 'aahaa', 'hotel-kc', 'grand-coffee', 'jerusalem-cafe', 'taha',
].flatMap((slug) => caseStudies.find((c) => c.slug === slug)?.galleryIds?.slice(0, 4) ?? [])
```

Picks up to 4 images from each of 6 case studies (~24 images) for cross-brand
visual variety in the wall. If a slug's assets haven't synced yet, `?? []`
degrades gracefully to fewer images rather than throwing.

## `DragGallery` changes

Three additive, backward-compatible props (existing `/work/[slug]` call site
keeps working unchanged since all three have defaults matching current
behavior):

1. **`background?: string`** (default `'#fff'`) — replaces the hardcoded
   `background: '#fff'` on the container `div`. Hero passes `'#0a0806'` so
   gaps between tiles and unloaded-image placeholders match the dark hero
   instead of flashing white.

2. **`eagerCount?: number`** (default `0`) — within the on-screen instance
   only (`xOffset === 0 && yRep === 0` — the off-screen wrap copies at ±1
   stay lazy regardless), the first N tiles in column order get
   `loading="eager"` and `fetchPriority="high"` on their `<img>` instead of
   the current unconditional `loading="lazy"`. Above-the-fold usage (hero)
   needs a fast LCP candidate; the existing below-the-fold usage
   (`/work/[slug]`) keeps `eagerCount={0}` → all lazy, unchanged.

3. **Touch fix (no new prop, applies to both call sites):** `handleTouchStart`
   records the initial touch point but no longer assumes drag. The
   `touchmove` handler checks `Math.abs(dx) > Math.abs(dy)` on the *first*
   move event after touchstart to decide whether this gesture is a
   horizontal pan (capture it, `preventDefault`) or a vertical scroll (do
   nothing, let the page scroll natively). This fixes a real bug: today,
   `touchAction: 'none'` + unconditional `preventDefault()` traps any
   vertical swipe that starts on the gallery, which is a bigger problem in
   the hero (first thing on the page) than it was mid-page on `/work/[slug]`.

## Testing / verification

- `tsc --noEmit` and Biome lint clean.
- Visual check in browser: hero renders the wall with real case-study
  photos, dark scrim keeps headline/CTA readable, buttons remain clickable.
- Mobile emulation: vertical swipe on the hero scrolls the page; horizontal
  swipe pans the gallery.
- Confirm `/work/[slug]` gallery still renders and drags identically
  (regression check on the reused component).
- `next build` succeeds with `three`/`@react-three/*` removed (no stray
  imports left anywhere).
