# Atrium Design System

> **"We're humans."** Warm, hand-written personality paired with confident experimental typography on a deep-teal / mint / amber palette.

This package (`@atrium/ui`) is the single source of truth for Atrium's design system across all platform apps.

---

## Setup

### 1. Add the dependency

```json
{ "dependencies": { "@atrium/ui": "workspace:*" } }
```

### 2. Import tokens in your global CSS

```css
@import "@atrium/ui/src/tokens/tokens.css";
```

### 3. Import components

```tsx
import { Button, Eyebrow, Badge } from '@atrium/ui'
```

### 4. Logo SVGs

Place `atrium-mark.svg` and `atrium-wordmark.svg` in your app's `public/logos/` folder. Pass `assetBase="/logos"` to the `Logo` component (default).

---

## Brand Identity

**Voice:** Confident friend who happens to be very good at marketing. First-person plural "we", addressing reader as "you". Warm, direct, a little irreverent, results-obsessed.

**Casing rules:**
- Wordmark `atrium` — always lowercase
- Display headlines — bold sentence case + one italic-serif emphasis word
- Section eyebrows — WIDE LETTER-SPACED CAPS

**Signature treatments:**
- Amber highlighter swipe behind emphasised words — use `<Highlight>`
- Handwritten script accent word — use `<ScriptAccent>`
- No emoji. Personality comes from type + marker, never from emoji.

---

## Color System

Three brand anchors:

| Token | Value | Role |
|-------|-------|------|
| `--teal-800` | `#072F34` | Primary dark anchor — backgrounds, ink, wordmark on light |
| `--mint-400` | `#B5F2DB` | Primary light accent — type on teal, fields |
| `--amber-500` | `#F7A823` | Warm marigold — campaigns, CTAs, the highlighter swipe |

Default two-tone: **mint-on-teal** or **teal-on-mint**. Amber is the campaign color.

See [`docs/tokens.md`](./tokens.md) for the full token reference.

---

## Typography

Four typefaces — all bundled or loaded via Next.js font loader:

| Face | Token | Role |
|------|-------|------|
| Inter Tight | `--font-sans` | Primary — all body, UI, labels, buttons, headlines |
| Instrument Serif | `--font-serif` | Editorial serif, used **italic** for emphasis words |
| Nimora | `--font-display` | Wordmark / logo lockup only |
| Nothing You Could Do | `--font-script` | Handwriting accent callouts |

---

## Spacing & Shape

- **8px grid** — spacing tokens `--space-1` (4px) through `--space-16` (128px)
- **Stadium pills** `--radius-pill: 999px` — buttons and chips
- **Cards** `--radius-md: 14px`, large panels `--radius-lg: 22px`
- **Bento tiles** `--radius-bento: 20px`

---

## Motion

Confident settle — `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, ~220ms `--dur-base`.

- **Hover:** deepen field one step, or lift to mint
- **Press:** scale `0.97` (`--press-scale`), no color flash
- Always respect `prefers-reduced-motion`

---

## Components

| Component | Description |
|-----------|-------------|
| [Button](./components/Button.md) | Stadium-pill action — primary, mint, amber, outline, ghost |
| [Eyebrow](./components/Eyebrow.md) | Wide-spaced caps label with leading rule |
| [Badge](./components/Badge.md) | Small flat status/category tag |
| [Chip](./components/Chip.md) | Service pill — outlined or filled |
| [Highlight](./components/Highlight.md) | Amber/mint marker swipe behind text |
| [ScriptAccent](./components/ScriptAccent.md) | Handwritten accent word |
| [Logo](./components/Logo.md) | α monogram, wordmark, or lockup |
| [Card](./components/Card.md) | Color-led or aurora-gradient surface |
| [Input](./components/Input.md) | Text field with label, hint, error state |

---

## Icons

Atrium ships no functional icon set. Use **Lucide** (`lucide-react`) in consuming apps — 1.5–2px stroke, rounded caps, matching the brand's pill outlines.
