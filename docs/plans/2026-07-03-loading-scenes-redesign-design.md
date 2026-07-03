# Loading scenes redesign — design doc

**Date:** 2026-07-03
**App:** apps/atrium.grader
**Status:** Approved, implementing

## Problem

The `LoadingStage` component (`app/grader-client.tsx`) cycles through 4 "scenes"
during the scan animation. Every scene has the same fixed shape — a central
photo/texture, 3 text cards, 2 numeric metrics, and 3 badges, all absolutely
positioned on top of each other. On mobile especially this reads as visual
noise: too many floating pieces competing around the central image.

The metrics shown (`roi: 3.1x`, `rank: #1`, etc.) are also invented
placeholders, not real numbers — a missed opportunity, since Atrium has real,
verified client case-study results sitting in
`apps/atrium.website/docs/Atrium_Website-V1.md`.

## Goals

- Reduce visual density per scene (fewer floating elements).
- Split the 4 existing scenes (which mix content + fake metrics) into two
  distinct kinds: informative (service value props) and metrics (real client
  results), and land at 5 total scenes: 3 informative + 2 metrics.
- Replace invented metrics with real numbers sourced from verified case
  studies (T'ÄHÄ Mexican Kitchen, Don Chuy's Fresh Méx & Cantina).

## Data model change

`loadingScenes` today: every scene has `cards[3]` + `metrics[2]` + `badges[3]`.

New shape — a discriminated union by `kind`:

```ts
type InformativeScene = {
  kind: "informative"
  id: string
  image: string
  imageTone: "photo" | "texture" | "mark"
  cards: [SceneCard, SceneCard, SceneCard]
  badges: [string, string]
}

type MetricsScene = {
  kind: "metrics"
  id: string
  image: string
  imageTone: "texture"
  stats: [SceneStat, SceneStat]
  badges: [string, string]
}

type SceneCard = { label: string; body: string }
type SceneStat = { value: string; label: string }
```

`LoadingStage` renders conditionally on `scene.kind`:
- `informative` → existing 3-card layout (unchanged visual language), 2
  badges instead of 3.
- `metrics` → new layout: 2 large stat blocks (big number + short label)
  instead of 3 text cards, no numeric "metric card" duplication, 2 badges.

Removing one card/metric row per scene (going from 3 cards + 2 metrics + 3
badges = 8 pieces, to 3 cards + 2 badges = 5, or 2 stats + 2 badges = 4) is
the direct fix for the "ruido" complaint — same absolute-position collage
mechanism, just fewer things placed in it, giving each remaining piece more
room before they start overlapping (this was also the root cause of the
mobile card-overlap seen during the earlier loading-state mobile audit).

The `loading-badge--target` (shows the restaurant name being scanned) is
unaffected — it's rendered separately from `scene.badges` today and stays
that way across all 5 scenes.

## Content

### Informative (3) — cards unchanged, badges trimmed to 2, no metrics

**studio** (`imageTone: photo`, `image: /metaphoto.jpg`)
- cards: creative / market / signal (unchanged copy)
- badges: `growth`, `studio`

**forest** (`imageTone: texture`, `image: /textures/gradient-forest-glow.png`)
- cards: content / growth / proof (unchanged copy)
- badges: `local`, `social`

**mark** (`imageTone: mark`, `image: /Atrium Works -08.png` — kept as the
Atrium wordmark/isotipo; not swapped for a people photo, since its copy is
specifically about brand identity and the mark image reinforces that)
- cards: identity / system / handoff (unchanged copy)
- badges: `brand`, `audit`

`studio` and `forest`'s current images (`metaphoto.jpg`,
`gradient-forest-glow.png`) stay wired in as-is for now. The user is
generating themed people-photo replacements (briefs already given: a
creative/photographer for studio, a server/diner in motion for forest) —
swapping those in is a follow-up asset-only change (replace the file at the
same path, or point `image` at a new filename), not part of this
implementation.

### Metrics (2) — real numbers from `Atrium_Website-V1.md`

**sage** (`imageTone: texture`, `image: /textures/gradient-charcoal-sage.png`
— unchanged background) — T'ÄHÄ Mexican Kitchen:
- stats: `5.24M+` "Impressions in one engagement (+544%)", `30%` "Email open
  rate — 2x the industry average"
- badges: `t'ähä kitchen`, `kansas city`

**doncucy** *(new 5th scene)* (`imageTone: texture`,
`image: /textures/grain-paper-silver.png` — existing unused asset, no new
file needed) — Don Chuy's Fresh Méx & Cantina:
- stats: `+839%` "Total impressions across platforms", `+302%` "Instagram
  audience growth"
- badges: `don chuy's`, `multi-location`

## Testing / verification

- `tsc --noEmit` and `biome check` after the data-shape change.
- Manual verification in the browser (mobile viewport, per the earlier
  loading-state audit pattern): trigger a scan, screenshot each of the 5
  scenes mid-loop, confirm no card/badge overlap and no layout shift between
  informative and metrics scene kinds.
