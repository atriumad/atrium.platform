# Token Reference

Import via: `@import "@atrium/ui/src/tokens/tokens.css";`

---

## Color — Raw Palette

| Token | Value | Notes |
|-------|-------|-------|
| `--teal-900` | `#042024` | Near-black ink |
| `--teal-800` | `#072F34` | **Deep Teal** — primary dark anchor |
| `--teal-700` | `#0E3A40` | Raised teal surface |
| `--teal-500` | `#2C6168` | Mid teal, hairlines on dark |
| `--teal-300` | `#6fa39f` | Muted teal, secondary text on dark |
| `--mint-500` | `#8fe6c2` | Saturated mint |
| `--mint-400` | `#B5F2DB` | **Mint** — primary light accent |
| `--mint-300` | `#CDF6E6` | Soft mint wash |
| `--mint-200` | `#E4FAF1` | Faintest mint tint |
| `--amber-600` | `#E0911A` | Pressed amber |
| `--amber-500` | `#F7A823` | **Amber** — warm marigold accent |
| `--amber-400` | `#FFC21F` | Highlighter amber |
| `--amber-200` | `#FFE6A8` | Amber tint |
| `--cloud-100` | `#ffffff` | Pure white |
| `--cloud-200` | `#F4F8F8` | Page off-white |
| `--cloud-300` | `#E4EEF0` | **Cloud** — cool brand white |
| `--cloud-400` | `#CFdcdd` | Hairline grey-teal |
| `--ink-700`   | `#1C2B2C` | Body ink on light |

## Color — Semantic

| Token | Maps to | Usage |
|-------|---------|-------|
| `--surface-page` | `--cloud-200` | Page background |
| `--surface-card` | `--cloud-100` | Card surface |
| `--surface-dark` | `--teal-800` | Dark sections |
| `--text-strong` | `--teal-800` | Headlines on light |
| `--text-body` | `--ink-700` | Body on light |
| `--text-muted` | `--teal-500` | Secondary on light |
| `--text-on-dark` | `--cloud-300` | Body on deep teal |
| `--text-on-dark-strong` | `--mint-400` | Headlines on teal |
| `--border-light` | `--cloud-400` | Hairline on light |
| `--border-on-dark` | `--teal-500` | Hairline on dark |
| `--accent` | `--mint-400` | Primary accent |
| `--accent-warm` | `--amber-500` | Warm accent |
| `--highlight` | `--amber-400` | Marker highlight |
| `--focus-ring` | `--amber-500` | Focus indicator |

---

## Typography

| Token | Value |
|-------|-------|
| `--font-display` | `var(--font-sans)` |
| `--font-sans` | `"Inter Tight", system-ui` |
| `--font-serif` | `"Instrument Serif", Georgia` |
| `--font-script` | `"Nothing You Could Do"` |
| `--text-display-xl` | `clamp(3.5rem, 9vw, 7.5rem)` |
| `--text-display-lg` | `clamp(2.75rem, 6vw, 5rem)` |
| `--text-display-md` | `clamp(2.25rem, 4.5vw, 3.5rem)` |
| `--text-6xl` | `4.5rem` |
| `--text-5xl` | `3.5rem` |
| `--text-4xl` | `2.75rem` |
| `--text-3xl` | `2rem` |
| `--text-2xl` | `1.5rem` |
| `--text-xl` | `1.25rem` |
| `--text-lg` | `1.125rem` |
| `--text-base` | `1rem` |
| `--text-sm` | `0.875rem` |
| `--text-xs` | `0.75rem` |
| `--tracking-wider` | `0.18em` — signature spread-caps |
| `--tracking-widest` | `0.32em` |
| `--leading-tight` | `0.95` — stacked display lockups |
| `--leading-body` | `1.6` |

---

## Spacing (8px grid)

| Token | rem | px |
|-------|-----|----|
| `--space-1` | 0.25rem | 4 |
| `--space-2` | 0.5rem | 8 |
| `--space-3` | 0.75rem | 12 |
| `--space-4` | 1rem | 16 |
| `--space-5` | 1.5rem | 24 |
| `--space-6` | 2rem | 32 |
| `--space-7` | 2.5rem | 40 |
| `--space-8` | 3rem | 48 |
| `--space-10` | 4rem | 64 |
| `--space-12` | 5rem | 80 |
| `--space-16` | 8rem | 128 |

---

## Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `4px` | Inputs, small tags |
| `--radius-sm` | `8px` | Inputs |
| `--radius-md` | `14px` | Default cards |
| `--radius-lg` | `22px` | Large panels |
| `--radius-bento` | `20px` | Bento grid tiles |
| `--radius-pill` | `999px` | Buttons, chips |

---

## Shadows

| Token | Usage |
|-------|-------|
| `--shadow-soft` | Resting elevation for bento tiles |
| `--shadow-float` | Hover lift, floating elements |
| `--shadow-pop` | Modals, popovers |
| `--shadow-inset-card` | Subtle depth on white cards |

---

## Motion

| Token | Value |
|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--dur-fast` | `120ms` |
| `--dur-base` | `220ms` |
| `--dur-slow` | `420ms` |
| `--press-scale` | `0.97` |

---

## Aurora Gradients

| Token | Usage |
|-------|-------|
| `--grad-aurora` | Mint-amber aurora (default bento) |
| `--grad-aurora-warm` | Warmer amber-led aurora |
| `--grad-aurora-cool` | Cool mint-only aurora |
| `--grad-aurora-deep` | Dark teal aurora (dark section bento) |

## CSS Utility Classes

| Class | Description |
|-------|-------------|
| `.atr-marker` | Amber highlight swipe behind text |
| `.atr-marker--mint` | Mint variant of the marker |
| `.atr-aurora` | Section with aurora background |
| `.atr-aurora--warm` | Warm aurora variant |
| `.atr-aurora--cool` | Cool aurora variant |
| `.atr-aurora--deep` | Dark aurora (teal background) |
| `.atr-bento-card` | Aurora bento tile |
| `.atr-bento-card--teal` | Dark teal bento tile |
| `.atr-float-card` | White floating card |
| `.atr-lift` | Hover lift + shadow transition |
| `.atr-grain-overlay` | Grain texture overlay |
| `.atr-bg-atmos` | Atmospheric teal background |
