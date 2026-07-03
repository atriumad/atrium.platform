---
name: atrium-design
description: Use this skill to generate well-branded interfaces and assets for Atrium, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — the full design guide: brand context, voice, visual foundations, iconography, manifest.
- `styles.css` — single global entry point (link this). `@import`s all tokens in `tokens/`.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `assets/fonts` — Nimora (logo), Inter Tight (sans), Instrument Serif (serif), Nothing You Could Do (script). All bundled.
- `assets/logos` — `atrium-mark.svg` (α), `atrium-wordmark.svg` (recolorable via CSS mask).
- `components/core/` — React primitives (Button, Chip, Card, Badge, Logo, Highlight, Eyebrow, ScriptAccent, Input). Each has a `.prompt.md`.
- `ui_kits/atrium-site/` — full marketing-site recreation built from the primitives.
- `templates/landing/` — forkable landing-page DC. `templates/social/` — the 15-post **Atrium Social System** (Instagram posts & stories, drag-to-fill photo slots).

## Brand in one breath
Deep Teal `#072F34` + Mint `#B5F2DB` + Cloud `#E4EEF0`, with Amber `#F7A823` for
campaigns. Voice is warm, human, confident ("We're humans"). Display type is
**Nimora**; body is **Inter Tight**; **Instrument Serif** (used italic) for
emphasis, and **Nothing You Could Do** handwriting for highlighted words.
Signature moves: the **amber marker highlight**, **wide
letter-spaced caps** eyebrows, **stadium pills**, and flat **color-led** layouts
(elevation via color, not shadow). No emoji.
