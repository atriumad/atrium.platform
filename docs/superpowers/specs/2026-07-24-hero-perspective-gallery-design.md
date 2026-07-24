# Hero perspective gallery — design (revision)

**Date:** 2026-07-24
**App:** apps/atrium.website
**Supersedes:** `2026-07-24-hero-drag-gallery-design.md`, sections "Architecture" (hero integration part) and everything after — see Status below.

## Status / what changed

The original spec built a full-bleed reuse of `DragGallery` as the hero's
background, with a dark scrim behind the text. After implementing and
reviewing that (Tasks 1-5 of the original plan), the user clarified the
actual target does not match: a reference screenshot shows a **dedicated
gallery panel occupying 50% of the hero's width**, sitting **beside** the
text (not behind it), with a **fixed 3D perspective tilt** and **columns
that scroll independently** — not a drag-to-pan wall.

What's kept from the original work:
- `heroGalleryIds` (`lib/work.ts`) — still the right data source.
- `DragGallery`'s touch-direction fix — a real, independent bug fix, kept.

What's reverted:
- `DragGallery`'s `background`/`eagerCount` props — no consumer in this
  design (the hero no longer uses `DragGallery` at all). Reverted in
  commit `3ea4912`.
- The `HeroSection` background swap to `DragGallery` + scrim — reverted
  in commit `e3af221` (`git revert 69e1f44`). `HeroSection.tsx` is back to
  rendering `HeroScene`.

`HeroScene` still gets deleted (it has zero remaining purpose either way)
— that part of the original plan (Task 6) is unchanged and still applies,
just at the end of this revised sequence instead.

## Scope

Build a new, purpose-specific component and wire it into the hero as a
50%-width side panel. Not a reusable general-purpose gallery — this is a
hero-only visual, so it lives in `components/sections/`, not
`components/work/`.

## Design

**Layout:** `HeroSection` becomes a two-column row at `lg` and above:
left column is the existing text/CTA content (unchanged copy, unchanged
GSAP entrance animation), right column is the new gallery panel, each
taking 50% width, both spanning the section's full height. Below `lg`,
the gallery panel is hidden (`hidden lg:block`) — the mobile hero is
text-only against the solid dark background, matching how `HeroScene`
already contributes nothing meaningful on narrow viewports today (it's a
subtle abstract background effect there). No scrim is needed in this
layout, since the gallery no longer sits behind the text.

**Gallery panel — `HeroPerspectiveGallery`:**
- Props: `{ publicIds: string[] }`.
- Splits `publicIds` into 3 columns round-robin (`id, i` → column
  `i % 3`).
- Each column is the existing `components/ui/Marquee.tsx` in `vertical`
  mode (it already implements exactly "independent infinite scroll,
  reversible direction, CSS-only, `--duration` var, `pauseOnHover`" —
  no new scrolling primitive needed). Columns alternate `reverse`
  (col 0: normal/up, col 1: reverse/down, col 2: normal/up), each with a
  slightly different `--duration` (e.g. 42s / 50s / 38s) so they drift
  out of sync with each other rather than reading as one mechanical unit.
- Each image tile: `cldImageUrl(id, { width: 500 })` inside a
  `rounded-xl overflow-hidden` box, `object-cover`, cycling through 3
  aspect ratios (`4/5`, `1/1`, `3/4`) by tile index for visual variety
  without DragGallery's JS-measured masonry (unnecessary complexity here
  — `Marquee` just needs children with *some* height, not a
  packed-masonry layout).
- **Perspective:** a fixed (non-interactive, no mouse/scroll tracking)
  3D tilt on the row of 3 columns: `transform: perspective(1400px)
  rotateY(-8deg) rotateX(2deg) scale(1.05)`. The outer wrapper clips
  overflow so the tilted content doesn't spill past the 50%-width panel.
- **Edge fade:** the outer wrapper gets a vertical fade mask
  (`mask-image` / `-webkit-mask-image`:
  `linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)`)
  so columns fade out at the top/bottom edge of the panel instead of
  cutting off images mid-tile.
- **Reduced motion:** `Marquee`'s `.animate-marquee-vertical` class has
  no existing reduced-motion handling in `globals.css` (checked — only
  `.brand-marquee-track`, `.reels-track`, and `.ge-row`/`.ge-num`/
  `.ge-name` have `prefers-reduced-motion` rules). Since this is the
  first above-the-fold, always-visible use of `Marquee`, add a rule
  pausing `.animate-marquee-vertical` under
  `@media (prefers-reduced-motion: reduce)`, matching the existing
  `animation-play-state: paused` pattern used for
  `.brand-marquee-track`. This is a small, targeted fix to code this
  task depends on, not scope creep on unrelated marquee usages (pausing
  is strictly more accessible for those too, and won't change their
  visual end-state).

**`HeroSection.tsx` integration:**
- Remove the `HeroScene` import/usage (same removal as the original
  Task 5, just without the scrim — nothing replaces `HeroScene` in the
  z-index stack because the gallery is now a sibling column, not a
  background layer).
- Restructure the section's single centered content block into a
  `lg:flex-row` two-column layout as described above.
- `HeroScene.tsx` deletion and the three.js dependency cleanup happen in
  a final task, same as the original plan's Task 6 — unchanged.

## Testing / verification

- `tsc --noEmit` and Biome lint clean.
- Visual check in browser at `lg`+ width: gallery panel renders on the
  right at 50% width, 3 columns visibly scrolling at different speeds,
  alternating direction, perspective tilt visible, edges fade instead of
  hard-cutting, text column unaffected and still legible.
- Visual check below `lg`: gallery panel is absent, text-only hero,
  no layout breakage.
- `prefers-reduced-motion: reduce` (DevTools emulation): marquee columns
  visibly stop moving.
- `next build` succeeds; confirm no leftover `HeroScene`/`three`/
  `@react-three/*` references anywhere in the repo after the final
  cleanup task.
