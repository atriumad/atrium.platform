# Atrium Design System — consolidation into `packages/ui`

**Date:** 2026-08-06
**Status:** approved, ready for planning

## Problem

Atrium's visual language currently exists in four places that disagree with each other.

1. `packages/ui` — nine components styled entirely with inline `style={{}}` referencing CSS custom properties, plus a 312-line `tokens.css`. The website imports two of the nine. The grader imports none.
2. `apps/atrium.website` — Tailwind v4 with a near-empty `@theme` (five entries). All colour, border, shadow and gradient work happens in inline styles: 443 occurrences of `style={{` across 50 of 63 files, 759 references to `var(--…)`. Typography runs through seven hand-written `.type-*` CSS classes used in about 30 files.
3. `apps/atrium.grader` — Tailwind v3 with a populated config. One inline style in the whole app. 124 lines of CSS. This is the app whose look was approved.
4. `docs/Atrium Design System/` — a 237-file brand vault describing a *different brand*: Kansas City creative studio, cool teal and mint, "We're humans". Only 32 token names overlap with the current work and most resolve to different values.

The grader's redesign settled the question of what Atrium should look like. Nothing else in the monorepo reflects it.

## Key finding

The design bundle at `~/Downloads/Atrium Design System 2` and the grader's implemented UI are the same visual language, arrived at independently.

| Concern | Bundle | Grader |
|---|---|---|
| Warm page ground | `#F3EFE4` | `#f4f1e7` |
| Warm off-white | `#FAF9F5` | `#faf8f0` |
| Deep teal | `#042F34` | `#0d2f33` |
| Mint | `#B5F2DB` | `#a9edc8` |
| Eyebrow | 12px, 600, `0.14em`, uppercase | `0.7rem`, 600, `0.14em`, uppercase |
| Shadows | diffuse ink, 5–10% alpha | `rgba(13,47,51,.04)` / `.07` |
| Serif rule | "one serif line per layout" | one italic `rg-headline` per card |
| Core primitive | "the pill is the core primitive" | pills throughout |

The bundle is therefore a source of *completion*, not of direction: it supplies a dark theme, procedural textures, an editorial accent family and component categories the grader never needed. The direction comes from the grader.

The older `docs/Atrium Design System/` vault is superseded. It is not merged, and it is not deleted by this work — it stays as historical reference.

## Goal

One shared visual layer in `packages/ui`, derived from the grader, consumed by every app. Apps keep only the components specific to them.

Out of scope for this spec: migrating `apps/atrium.website` onto the new system. That is its own project, and it is large — 443 inline styles and seven typography classes to unwind.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Style technique | Tailwind v4 utilities, tokens in `@theme` | Matches the grader, which proved it: 124 lines of CSS against the website's 271 plus 443 inline styles |
| Tailwind version | v4 across the monorepo; grader upgrades from v3 | The website is already v4 and CSS-first. A shared `@theme` cannot serve both majors |
| Old components | Move to `packages/ui/src/legacy/`, frozen | The website re-exports `Button` and `Eyebrow` from `@atrium/ui`. An in-place rewrite would restyle the live site in the same commit |
| Type families | Three: Inter Tight, Instrument Serif, Nothing You Could Do | The bundle asks for a fourth (plain Inter) for body. The grader looks right with three; a fourth family is weight without benefit |
| Accent colour | Grader amber `#f3c150`, not the bundle's `#FFC933` | Validated on screen already |
| Error colour | Terracotta `#e08a5b`, not a true red | Warm system; a traffic-light red would be the only cold thing in it |

## Architecture

```
packages/ui/src/
  theme.css          @theme — the single definition of every token
  styles.css         imports theme.css, plus the rules that cannot be utilities
  components/        Button, Tag, Card, Input, Eyebrow, Meter, Stat, Logo
  legacy/            the nine current components, frozen, deleted once the website migrates
  index.ts           exports components/ only
  legacy.ts          exports legacy/ only
```

`index.ts` and `legacy.ts` must stay disjoint: both define a `Button`, a `Card` and a `Logo`, and a single barrel cannot export two of each. So step 2 repoints the website's two re-export files at the legacy entry:

```ts
// apps/atrium.website/components/ui/Button.tsx
export { Button as default, Button } from '@atrium/ui/legacy'
```

That is a two-line change in the website and the only edit this project makes there. The website keeps rendering exactly what it renders today.

Each app's `globals.css`:

```css
@import "tailwindcss";
@import "@atrium/ui/src/styles.css";
@source "../../../packages/ui/src";
```

The `@source` directive is required: Tailwind v4 does not scan `node_modules` or workspace packages by default, so utility classes written inside `packages/ui/src/components` would be stripped from the build without it.

Apps keep their own components. The grader keeps the gauge, the loading stepper and the report sections. The website keeps the hero, the marquee and the case-study layouts.

### The three rules that stay CSS

Not everything survives translation to utilities. These stay in `styles.css` under `@layer components`, carried over from the grader:

- `.rg-ring` — the gauge's `conic-gradient` plus `-webkit-mask`/`mask` radial ring, repainted from JS.
- `.rg-fill` — the meter's `width` transition, driven from a `data-w` attribute.
- `.rg-reveal` / `.rg-anim` — the scroll-reveal pair, plus `.visually-hidden` and `.dot-pattern`.

## Tokens

All values below are the grader's current, screen-validated values unless marked *(new)*.

### Colour

**Warm neutrals** — the system's ground, and the clearest break from the old brand.

| Token | Value | Role |
|---|---|---|
| `cream` | `#f4f1e7` | page background |
| `off-white` | `#faf8f0` | raised / hover surface |
| `card` | `#ffffff` | card surface |
| `track` | `#ece8da` | meter and progress tracks |
| `track-soft` | `#e9e5d7` | lighter track, loading stage |
| `pending` | `#c7cec9` | inert dots and disabled marks |

**Greens**

| Token | Value | Role |
|---|---|---|
| `ink` | `#0d2f33` | primary text, dark fills |
| `dark` | `#0d353b` | dark card ground |
| `green` | `#1f7a52` | eyebrows, serif accents |
| `green-fill` | `#3fae78` | positive meters, dots |
| `green-soft` | `#e3f2e9` | positive badge ground |
| `green-ink` | `#186043` | positive badge text |
| `mint` | `#a9edc8` | text and accents on dark |

**Accent — amber**

| Token | Value | Role |
|---|---|---|
| `amber` | `#f3c150` | the pop; one per view |
| `amber-fill` | `#eab63f` | warning meters |
| `amber-soft` | `#f9ecc7` | warning ground, first-move card |
| `amber-ink` | `#a97f1c` | warning text |

**State — terracotta**

| Token | Value | Role |
|---|---|---|
| `red-fill` | `#e08a5b` | negative meters |
| `red-soft` | `#f7e2d6` | negative ground |
| `red-ink` | `#c0653a` | negative text |
| `red-tint` | `#f0b79b` | negative tag on dark |
| `error` | `#b4553a` | inline form and search errors |

**Text and line**

| Token | Value | Role |
|---|---|---|
| `body` | `#3f544f` | body copy |
| `muted` | `#78877f` | secondary copy |
| `muted-soft` | `#93a09b` | tertiary, loading stage |
| `border` | `rgba(13,47,51,.10)` | hairlines |

**Editorial accents** *(new, from the bundle)* — `coral #EC9A82`, `lilac #D2B4EE`, `sage #A8C89A`, `periwinkle #7E9BF0`.

These are campaign-rotation colours, not UI colours. No component may default to one. The inherited rule holds: one leads, one supports, the rest stay in reserve — never all at once.

### Typography

Three families, strict roles:

- **Inter Tight** (`--font-sans`) — everything functional. Headings, body, UI, labels.
- **Instrument Serif** (`--font-serif`) — italic accent only. One serif line per composition.
- **Nothing You Could Do** (`--font-script`) — signature moments.

Heading weights are 400 and 500. This is the change made during the grader review: nothing in the system is 700 or 800 any more. Eyebrows and small labels stay at 600, because uppercase at 0.7rem needs the weight to hold.

`apps/atrium.website/lib/fonts.ts` clamps Inter Tight to `weight: '400 600'` while the grader exposes `100 900`. Both apps must expose the same axis range; standardise on `100 900`.

The two apps also disagree on the script font's variable name — the website exposes `--font-script`, the grader `--font-handwriting`. `packages/ui` will define `--font-script`; the grader's `fonts.ts` renames to match.

Scale: `clamp()`-based display sizes carried from the grader (`clamp(1.95rem,4.6vw,3.5rem)` for the report title, `clamp(2.4rem,6vw,4.4rem)` for the search hero), with a static ramp beneath.

### Shape, depth, motion

| Concern | Value |
|---|---|
| Radii | `18px` (`rg-sm`), `26px` (`rg`), `999px` (pill) |
| Shadow, resting | `0 1px 0 rgba(13,47,51,.04), 0 16px 40px rgba(13,47,51,.07)` |
| Shadow, raised | `0 2px 0 rgba(13,47,51,.04), 0 28px 56px rgba(13,47,51,.11)` |
| Easing | `cubic-bezier(.2,.7,.2,1)` |
| Press | `translateY(0)` from a `-2px` hover lift; no scale |
| Breakpoints | `560px`, `700px`, `980px` |

The grader also carries two one-off shadows (`rg-search-h`, `rg-loading`). These collapse into the two levels above; the difference between them was never deliberate.

The breakpoints are the three the grader uses today and they are the ones the responsive review validated. They are custom, not Tailwind defaults, and they are consumed as `max-[560px]:` style arbitrary variants.

### Dark theme *(new, from the bundle)*

Ported from the bundle's `sober.css` as an opt-in `.atrium-sober` class that reassigns the semantic tokens: cream text on charcoal-teal ground, hairlines inverted to `rgba(243,239,228,.20)`, shadows replaced by inset light lines. The grader's score card already lives in this posture, which is why the layer fits.

### Textures *(new, from the bundle)*

Grain, paper, grid and dots as inline SVG `feTurbulence` data URIs — no image assets. Replaces the three PNG textures of the old vault. The rule stays: texture is felt, not seen. Grain sits at `0.07` opacity, paper at `0.04`.

## Components

Eight primitives. Seven already exist in the grader in some form and were validated during the responsive review; only `Input` is genuinely new.

| Component | Variants | Sizes | Notes |
|---|---|---|---|
| `Button` | `primary` (ink ground, mint text), `secondary` (card ground, hairline), `accent` (amber), `ghost` | sm, md, lg | Pill radius. `primary` is the grader's first-move CTA; `secondary` is the reset button |
| `Tag` | `outline`, `filled`, `solid`, `mint` | sm, md | Pill. The bundle's core primitive |
| `Card` | `surface`, `warm`, `dark`, `amber` | — | Elevation `none` / `soft` / `float`; optional `grain` and `hairline` flags |
| `Input` | — | sm, md | Label, hint, error state, 2px focus ring |
| `Eyebrow` | `default`, `on-dark` | — | Uppercase, `0.14em`, weight 600 |
| `Meter` | `hi`, `mid`, `lo` | — | Track, fill and value badge. The signal row from the report |
| `Stat` | `good`, `warn`, `bad` | — | The `82 Discovery` pill from the report header |
| `Logo` | `mark`, `wordmark`, `lockup` | — | Ported from `legacy/`, restyled to utilities |

`Meter` and `Stat` are grader-shaped but not grader-specific: both express "a score with a tone", which any Atrium surface reporting numbers will want.

Deferred until something needs them: `Toast`, `NavPills`, `Modal`, `Select`. The bundle documents Toast and NavPills; neither app has a use for them today.

## Specimen

A `/specimen` route inside `apps/atrium.grader`, not a new app. It renders:

1. The full palette with token names and hex values.
2. The type scale, in all three families, at every weight the system allows.
3. All eight components in every variant, size and state — including focus, hover, disabled and error.
4. The dark theme applied to a subset, to prove the token reassignment works.

This is the review surface. It is a development route and does not ship in the sitemap or robots.

## Build order

1. **Grader v3 → v4.** Move `tailwind.config.js` into an `@theme` block. This is the smallest independent step and it validates the token set against a UI that already looks right.
2. **`packages/ui` skeleton.** `theme.css` and `styles.css`; move the nine existing components to `legacy/`; keep `@atrium/ui` importable by the website throughout.
3. **The eight components.**
4. **The grader consumes the package.** Delete the grader's local token definitions; the grader's own components import from `@atrium/ui`. This is the proof the package works — the app that defined the language now gets it from the shared layer.
5. **Specimen route.**

Each step ends green: `typecheck`, `biome check`, and a production build of every app that the step touched.

## Risks

**The website's two imports.** `apps/atrium.website/components/ui/{Button,Eyebrow}.tsx` re-export from `@atrium/ui`. Step 2 repoints them at `@atrium/ui/legacy`, which requires the package to expose a second entry point — `package.json` needs an `exports` map, since it currently declares only `main`/`types` pointing at `src/index.ts`. The check for step 2 is a website production build, not just a typecheck.

**Tailwind v4 and workspace packages.** Without `@source`, utilities written inside `packages/ui` are silently stripped — the component renders unstyled with no error. Step 2 must verify a class defined only in the package survives into the built CSS.

**The grader upgrade is not purely mechanical.** v4 removes `theme.extend`, changes how `keyframes` and `animation` are declared, and drops the default `content` array. The grader's nine animations and four custom shadows all move. The gate is a visual comparison of all three grader stages against the screenshots taken during the responsive review.

**Two token systems coexisting.** During steps 2 to 4 the grader has local tokens and the package has its own. They must not drift. Step 4 deletes the local set; nothing should ship with both.
