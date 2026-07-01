# packages/ui — Design System & Component Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/ui` as the single source of truth for Atrium's design system — unified CSS tokens, 9 typed React primitives, and living documentation — so every app in the monorepo shares the same visual language.

**Architecture:** CSS tokens live in `packages/ui/src/tokens/tokens.css` (imported by each app's global stylesheet). Nine React primitives are written in TypeScript with inline styles referencing those tokens — no Tailwind dependency, no Next.js imports. Documentation lives in `packages/ui/docs/` as structured Markdown.

**Tech Stack:** TypeScript 5, React 19 (peer dep), Bun workspaces, Turbo monorepo. No external UI library. Inline styles referencing CSS custom properties from `tokens.css`.

## Global Constraints

- All CSS values reference `var(--token-name)` — no hardcoded hex/px in component files
- No Next.js imports in `packages/ui` (must stay framework-agnostic)
- No Tailwind classes in `packages/ui` components (tokens.css is the styling layer)
- `exactOptionalPropertyTypes: true` is active — never pass `prop={value | undefined}`; use conditional spread `{...(x !== undefined ? { prop: x } : {})}`
- `noUncheckedIndexedAccess: true` — always use `!` or guard on array/object index access
- React is a peerDependency — never in `dependencies`
- Token names follow the `--category-variant` convention (`--teal-800`, `--shadow-soft`, `--dur-base`)

---

## File Map

### Created
- `packages/ui/src/tokens/tokens.css` — unified design token file (source of truth for the monorepo)
- `packages/ui/src/components/Button.tsx`
- `packages/ui/src/components/Eyebrow.tsx`
- `packages/ui/src/components/Badge.tsx`
- `packages/ui/src/components/Chip.tsx`
- `packages/ui/src/components/Highlight.tsx`
- `packages/ui/src/components/ScriptAccent.tsx`
- `packages/ui/src/components/Logo.tsx`
- `packages/ui/src/components/Card.tsx`
- `packages/ui/src/components/Input.tsx`
- `packages/ui/docs/README.md`
- `packages/ui/docs/tokens.md`
- `packages/ui/docs/components/Button.md`
- `packages/ui/docs/components/Eyebrow.md`
- `packages/ui/docs/components/Badge.md`
- `packages/ui/docs/components/Chip.md`
- `packages/ui/docs/components/Highlight.md`
- `packages/ui/docs/components/ScriptAccent.md`
- `packages/ui/docs/components/Logo.md`
- `packages/ui/docs/components/Card.md`
- `packages/ui/docs/components/Input.md`

### Modified
- `packages/ui/package.json` — add React peer deps, add `@types/react` dev dep, remove unused `@atrium/shared`
- `packages/ui/tsconfig.json` — add JSX support (`"jsx": "react-jsx"`, DOM lib)
- `packages/ui/src/index.ts` — export all 9 primitives
- `apps/atrium.website/package.json` — add `@atrium/ui: workspace:*` dep
- `apps/atrium.website/app/globals.css` — remove primitive token block (import from tokens.css instead)
- `apps/atrium.website/components/ui/Button.tsx` — re-export from `@atrium/ui`
- `apps/atrium.website/components/ui/Eyebrow.tsx` — re-export from `@atrium/ui`

---

## Task 1: Bootstrap `packages/ui`

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tsconfig.json`

**Interfaces:**
- Produces: compilable TypeScript package that accepts React JSX

- [ ] **Step 1: Update `packages/ui/package.json`**

Replace the file with:

```json
{
  "name": "@atrium/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "echo 'ui: no build needed'",
    "lint": "biome check .",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Update `packages/ui/tsconfig.json`**

Replace the file with:

```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx",
    "lib": ["dom", "dom.iterable", "esnext"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create component and token directories**

```bash
mkdir -p packages/ui/src/tokens
mkdir -p packages/ui/src/components
mkdir -p packages/ui/docs/components
```

- [ ] **Step 4: Install dependencies**

```bash
bun install
```

Expected: lockfile updated, `@types/react` added to ui package.

- [ ] **Step 5: Verify typecheck runs without errors on the empty package**

```bash
bun run typecheck --filter=@atrium/ui
```

Expected: `Tasks: 1 successful`

- [ ] **Step 6: Commit**

```bash
git add packages/ui/package.json packages/ui/tsconfig.json bun.lock
git commit -m "feat(ui): bootstrap packages/ui with React peer deps and JSX tsconfig"
```

---

## Task 2: Unified Token File

**Files:**
- Create: `packages/ui/src/tokens/tokens.css`

**Interfaces:**
- Produces: `tokens.css` — imported by each app's global stylesheet via `@import`
- Consumes: nothing

This is the authoritative CSS token file for the entire platform. It merges the design system's named tokens with all additions from `apps/atrium.website/app/globals.css` (aurora gradients, bento utilities, grain overlays, expanded shadow system). The website's `globals.css` is the source of truth for values.

- [ ] **Step 1: Create `packages/ui/src/tokens/tokens.css`**

```css
/* =============================================================
   Atrium Design System — Unified Token File
   Single source of truth for all apps in the monorepo.
   Import via: @import "@atrium/ui/src/tokens/tokens.css";
   ============================================================= */

:root {
  /* ─── Raw palette ─────────────────────────────────────────── */
  --teal-900: #042024;
  --teal-800: #072F34;
  --teal-700: #0E3A40;
  --teal-500: #2C6168;
  --teal-300: #6fa39f;

  --mint-500: #8fe6c2;
  --mint-400: #B5F2DB;
  --mint-300: #CDF6E6;
  --mint-200: #E4FAF1;

  --amber-600: #E0911A;
  --amber-500: #F7A823;
  --amber-400: #FFC21F;
  --amber-200: #FFE6A8;

  --cloud-100: #ffffff;
  --cloud-200: #F4F8F8;
  --cloud-300: #E4EEF0;
  --cloud-400: #CFdcdd;
  --ink-700:   #1C2B2C;

  /* ─── Semantic — surfaces ─────────────────────────────────── */
  --surface-page:        var(--cloud-200);
  --surface-card:        var(--cloud-100);
  --surface-sunken:      var(--cloud-300);
  --surface-dark:        var(--teal-800);
  --surface-dark-raised: var(--teal-700);
  --surface-mint:        var(--mint-400);
  --surface-amber:       var(--amber-500);

  /* ─── Semantic — text ─────────────────────────────────────── */
  --text-strong:         var(--teal-800);
  --text-body:           var(--ink-700);
  --text-muted:          var(--teal-500);
  --text-on-dark:        var(--cloud-300);
  --text-on-dark-strong: var(--mint-400);
  --text-on-mint:        var(--teal-800);
  --text-on-amber:       var(--teal-800);

  /* ─── Semantic — lines & accents ──────────────────────────── */
  --border-light:    var(--cloud-400);
  --border-strong:   var(--teal-800);
  --border-on-dark:  var(--teal-500);
  --border-width:    1.5px;
  --border-width-bold: 2px;
  --accent:          var(--mint-400);
  --accent-warm:     var(--amber-500);
  --highlight:       var(--amber-400);
  --focus-ring:      var(--amber-500);

  /* ─── Typography — families ───────────────────────────────── */
  --font-display: "Nimora", "Inter Tight", system-ui, sans-serif;
  --font-sans:    "Inter Tight", system-ui, -apple-system, sans-serif;
  --font-serif:   "Instrument Serif", Georgia, serif;
  --font-accent:  var(--font-serif);
  /* --font-script and --font-inter-tight injected by Next.js font loader */

  /* ─── Typography — fluid display scale ───────────────────── */
  --text-display-xl: clamp(3.5rem,  9vw,   7.5rem);
  --text-display-lg: clamp(2.75rem, 6vw,   5rem);
  --text-display-md: clamp(2.25rem, 4.5vw, 3.5rem);

  /* ─── Typography — static ramp ───────────────────────────── */
  --text-6xl:  4.5rem;
  --text-5xl:  3.5rem;
  --text-4xl:  2.75rem;
  --text-3xl:  2rem;
  --text-2xl:  1.5rem;
  --text-xl:   1.25rem;
  --text-lg:   1.125rem;
  --text-base: 1rem;
  --text-sm:   0.875rem;
  --text-xs:   0.75rem;

  /* ─── Typography — weights ────────────────────────────────── */
  --weight-light:     300;
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;
  --weight-extrabold: 800;

  /* ─── Typography — line heights ───────────────────────────── */
  --leading-tight:   0.95;
  --leading-snug:    1.1;
  --leading-heading: 1.15;
  --leading-body:    1.6;
  --leading-relaxed: 1.75;

  /* ─── Typography — letter spacing ────────────────────────── */
  --tracking-tight:   -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.08em;
  --tracking-wider:   0.18em;
  --tracking-widest:  0.32em;

  /* ─── Spacing (8px grid) ──────────────────────────────────── */
  --space-0:  0;
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-5:  1.5rem;
  --space-6:  2rem;
  --space-7:  2.5rem;
  --space-8:  3rem;
  --space-10: 4rem;
  --space-12: 5rem;
  --space-16: 8rem;

  /* ─── Radii ───────────────────────────────────────────────── */
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   14px;
  --radius-lg:   22px;
  --radius-xl:   32px;
  --radius-bento: 20px;
  --radius-float: 16px;
  --radius-pill: 999px;

  /* ─── Layout ──────────────────────────────────────────────── */
  --container-max:  1200px;
  --container-wide: 1360px;
  --gutter: clamp(1.25rem, 4vw, 4rem);

  /* ─── Shadows ─────────────────────────────────────────────── */
  --shadow-none:        none;
  --shadow-soft:        0 2px 6px rgba(7,47,52,.04), 0 14px 34px rgba(7,47,52,.07);
  --shadow-float:       0 4px 10px rgba(7,47,52,.05), 0 24px 60px rgba(7,47,52,.12);
  --shadow-pop:         0 12px 40px rgba(7,47,52,.14);
  --shadow-dark:        0 18px 50px rgba(0,0,0,.35);
  --shadow-inset-card:  0 1px 3px rgba(7,47,52,.06), 0 10px 24px rgba(7,47,52,.08);

  /* ─── Motion ──────────────────────────────────────────────── */
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast:    120ms;
  --dur-base:    220ms;
  --dur-slow:    420ms;
  --press-scale: 0.97;

  /* ─── Aurora gradients ────────────────────────────────────── */
  --grad-aurora:
    radial-gradient(120% 115% at 14% 16%, var(--mint-400) 0%, transparent 55%),
    radial-gradient(110% 110% at 88% 10%, var(--amber-200) 0%, transparent 52%),
    radial-gradient(120% 120% at 82% 94%, var(--mint-500) 0%, transparent 55%),
    radial-gradient(130% 125% at 22% 100%, var(--amber-200) 0%, transparent 50%),
    var(--mint-200);

  --grad-aurora-warm:
    radial-gradient(120% 115% at 16% 16%, var(--amber-200) 0%, transparent 55%),
    radial-gradient(115% 110% at 90% 12%, var(--mint-400) 0%, transparent 50%),
    radial-gradient(125% 120% at 78% 92%, var(--mint-500) 0%, transparent 55%),
    radial-gradient(130% 125% at 24% 100%, var(--amber-200) 0%, transparent 50%),
    var(--mint-200);

  --grad-aurora-cool:
    radial-gradient(120% 115% at 12% 14%, var(--mint-500) 0%, transparent 55%),
    radial-gradient(115% 110% at 86% 16%, var(--mint-400) 0%, transparent 52%),
    radial-gradient(125% 120% at 82% 92%, var(--mint-300) 0%, transparent 55%),
    var(--mint-200);

  --grad-aurora-deep:
    radial-gradient(120% 120% at 16% 18%, rgba(143,230,194,0.30) 0%, transparent 55%),
    radial-gradient(120% 115% at 86% 84%, rgba(247,168,35,0.20) 0%, transparent 55%),
    radial-gradient(140% 140% at 50% 50%, var(--teal-700) 0%, var(--teal-800) 70%);

  /* ─── Textures ────────────────────────────────────────────── */
  --surface-grain:      url("/textures/grain-paper-silver.png");
  --surface-atmos:      url("/textures/gradient-forest-glow.png");
  --surface-atmos-deep: url("/textures/gradient-charcoal-sage.png");
  --grain-opacity:      0.10;

  /* ─── Marker highlight ────────────────────────────────────── */
  --marker-amber: var(--amber-400);
  --marker-mint:  var(--mint-400);
}

/* ─── Marker highlight utility ────────────────────────────────── */
.atr-marker {
  background-image: linear-gradient(var(--marker-amber), var(--marker-amber));
  background-repeat: no-repeat;
  background-size: 100% 62%;
  background-position: 0 72%;
  padding: 0 0.12em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
.atr-marker--mint {
  background-image: linear-gradient(var(--marker-mint), var(--marker-mint));
}

/* ─── Aurora surface utilities ────────────────────────────────── */
.atr-aurora,
.atr-aurora--warm,
.atr-aurora--cool,
.atr-aurora--deep { position: relative; }

.atr-aurora       { background-color: var(--mint-200); background-image: var(--grad-aurora); }
.atr-aurora--warm { background-color: var(--mint-200); background-image: var(--grad-aurora-warm); }
.atr-aurora--cool { background-color: var(--mint-200); background-image: var(--grad-aurora-cool); }
.atr-aurora--deep { background-color: var(--teal-800); background-image: var(--grad-aurora-deep); color: var(--text-on-dark); }

.atr-aurora::after,
.atr-aurora--warm::after,
.atr-aurora--cool::after,
.atr-aurora--deep::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--surface-grain);
  background-size: 320px auto;
  opacity: 0.16;
  mix-blend-mode: soft-light;
  pointer-events: none;
}

/* ─── Grain overlay ────────────────────────────────────────────── */
.atr-grain-overlay {
  position: absolute;
  inset: 0;
  background-image: var(--surface-grain);
  background-size: 380px auto;
  opacity: var(--grain-opacity);
  mix-blend-mode: overlay;
  pointer-events: none;
}
.atr-grain-overlay--soft {
  mix-blend-mode: soft-light;
  opacity: 0.16;
}

/* ─── Bento cards ──────────────────────────────────────────────── */
.atr-bento-card {
  position: relative;
  border-radius: var(--radius-bento);
  background-color: var(--mint-200);
  background-image: var(--grad-aurora);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.atr-bento-card--teal {
  background-color: var(--teal-800);
  background-image: var(--grad-aurora-deep);
  color: var(--text-on-dark);
  box-shadow: var(--shadow-float);
}
.atr-float-card {
  background: var(--cloud-100);
  border-radius: var(--radius-float);
  box-shadow: var(--shadow-inset-card);
}

/* ─── Interactive lift ─────────────────────────────────────────── */
.atr-lift {
  transition: transform var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out);
}
.atr-lift:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-float);
}

/* ─── Atmospheric background ───────────────────────────────────── */
.atr-bg-atmos {
  background-color: var(--teal-800);
  background-image: var(--surface-atmos);
  background-size: cover;
  background-position: center;
}
.atr-bg-atmos--deep {
  background-color: #0a1512;
  background-image: var(--surface-atmos-deep);
  background-size: cover;
  background-position: center;
}

/* ─── Reduced motion ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/tokens/tokens.css
git commit -m "feat(ui): add unified design token file"
```

---

## Task 3: Stateless Primitives — Badge, Eyebrow, Highlight, ScriptAccent, Logo

**Files:**
- Create: `packages/ui/src/components/Badge.tsx`
- Create: `packages/ui/src/components/Eyebrow.tsx`
- Create: `packages/ui/src/components/Highlight.tsx`
- Create: `packages/ui/src/components/ScriptAccent.tsx`
- Create: `packages/ui/src/components/Logo.tsx`

**Interfaces:**
- Consumes: tokens from `tokens.css` (via CSS custom properties — no import needed)
- Produces: exported React components

These five have no `useState` — pure render functions, easiest to type.

- [ ] **Step 1: Create `Badge.tsx`**

```tsx
import type { ReactNode, CSSProperties } from 'react'

type BadgeTone = 'mint' | 'teal' | 'amber' | 'cloud' | 'outline'

type BadgeProps = {
  children?: ReactNode
  tone?: BadgeTone
  style?: CSSProperties
}

const tones: Record<BadgeTone, CSSProperties> = {
  mint:    { background: 'var(--mint-300)',    color: 'var(--teal-800)' },
  teal:    { background: 'var(--teal-800)',    color: 'var(--mint-400)' },
  amber:   { background: 'var(--amber-400)',   color: 'var(--teal-800)' },
  cloud:   { background: 'var(--cloud-300)',   color: 'var(--teal-700)' },
  outline: { background: 'transparent',        color: 'var(--teal-800)', boxShadow: 'inset 0 0 0 1.5px var(--teal-800)' },
}

export function Badge({ children, tone = 'mint', style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        lineHeight: 1,
        padding: '5px 10px',
        borderRadius: 'var(--radius-pill)',
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Create `Eyebrow.tsx`**

```tsx
import type { ReactNode, CSSProperties } from 'react'

type EyebrowTone = 'default' | 'mint' | 'amber' | 'onDark' | 'muted'

type EyebrowProps = {
  children: ReactNode
  tone?: EyebrowTone
  style?: CSSProperties
}

const toneColor: Record<EyebrowTone, string> = {
  default: 'var(--teal-500)',
  muted:   'var(--teal-500)',
  mint:    'var(--mint-400)',
  amber:   'var(--amber-500)',
  onDark:  'var(--teal-300)',
}

export function Eyebrow({ children, tone = 'default', style }: EyebrowProps) {
  const color = toneColor[tone]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', ...style }}>
      <span style={{ width: '24px', height: '1px', flexShrink: 0, background: color }} />
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color,
        }}
      >
        {children}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create `Highlight.tsx`**

```tsx
import type { ReactNode, CSSProperties } from 'react'

type HighlightColor = 'amber' | 'mint' | 'teal'

type HighlightProps = {
  children?: ReactNode
  color?: HighlightColor
  style?: CSSProperties
}

const band: Record<HighlightColor, string> = {
  amber: 'var(--amber-400)',
  mint:  'var(--mint-400)',
  teal:  'var(--teal-800)',
}

export function Highlight({ children, color = 'amber', style }: HighlightProps) {
  const bandColor = band[color]
  const ink = color === 'teal' ? 'var(--mint-400)' : 'inherit'
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${bandColor}, ${bandColor})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 62%',
        backgroundPosition: '0 74%',
        padding: '0 0.12em',
        color: ink,
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Create `ScriptAccent.tsx`**

```tsx
import type { ReactNode, CSSProperties } from 'react'

type ScriptAccentProps = {
  children?: ReactNode
  underline?: boolean
  color?: string
  style?: CSSProperties
}

export function ScriptAccent({ children, underline = true, color = 'inherit', style }: ScriptAccentProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-script)',
        fontWeight: 400,
        color,
        textDecoration: underline ? 'underline' : 'none',
        textDecorationThickness: '2px',
        textUnderlineOffset: '3px',
        lineHeight: 1.1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 5: Create `Logo.tsx`**

Logo uses CSS mask to recolor SVG files. Each consuming app must place `atrium-mark.svg` and `atrium-wordmark.svg` in its `public/` folder (or a subdirectory) and pass `assetBase` pointing to that path.

```tsx
import type { CSSProperties } from 'react'

type LogoVariant = 'mark' | 'wordmark' | 'lockup'

type LogoProps = {
  variant?: LogoVariant
  color?: string
  height?: number
  assetBase?: string
  gap?: number
  style?: CSSProperties
}

const WORDMARK_RATIO = 819.21 / 225.63

export function Logo({
  variant = 'wordmark',
  color = 'var(--teal-800)',
  height = 32,
  assetBase = '/logos',
  gap = 14,
  style,
}: LogoProps) {
  const mask = (file: string, ratio: number): CSSProperties => ({
    display: 'block',
    height: `${height}px`,
    width: `${height * ratio}px`,
    background: color,
    WebkitMask: `url(${assetBase}/${file}) left center / contain no-repeat`,
    mask: `url(${assetBase}/${file}) left center / contain no-repeat`,
  })

  if (variant === 'mark') {
    return <span role="img" aria-label="Atrium" style={{ ...mask('atrium-mark.svg', 1), ...style }} />
  }
  if (variant === 'wordmark') {
    return <span role="img" aria-label="atrium" style={{ ...mask('atrium-wordmark.svg', WORDMARK_RATIO), ...style }} />
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, ...style }} aria-label="Atrium" role="img">
      <span style={mask('atrium-mark.svg', 1)} />
      <span style={mask('atrium-wordmark.svg', WORDMARK_RATIO)} />
    </span>
  )
}
```

- [ ] **Step 6: Verify typecheck**

```bash
bun run typecheck --filter=@atrium/ui
```

Expected: `Tasks: 1 successful`

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/Badge.tsx packages/ui/src/components/Eyebrow.tsx packages/ui/src/components/Highlight.tsx packages/ui/src/components/ScriptAccent.tsx packages/ui/src/components/Logo.tsx
git commit -m "feat(ui): add Badge, Eyebrow, Highlight, ScriptAccent, Logo primitives"
```

---

## Task 4: Stateful Primitives — Button, Chip, Card, Input

**Files:**
- Create: `packages/ui/src/components/Button.tsx`
- Create: `packages/ui/src/components/Chip.tsx`
- Create: `packages/ui/src/components/Card.tsx`
- Create: `packages/ui/src/components/Input.tsx`

**Interfaces:**
- Consumes: tokens from `tokens.css`
- Produces: exported React components with hover/focus/press states via `useState`

Note on `Button`: no Next.js `Link` — uses native `<a>` for `href` prop. Adds `size` prop (sm/md/lg) and `iconLeft`/`iconRight` slots absent from the website version.

- [ ] **Step 1: Create `Button.tsx`**

```tsx
import { useState, type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'mint' | 'amber' | 'outline' | 'ghost' | 'ghostLight'
type ButtonSize    = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  disabled?: boolean
  children?: ReactNode
  style?: CSSProperties
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'>

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '8px 16px',  fontSize: '13px', gap: '6px' },
  md: { padding: '12px 24px', fontSize: '15px', gap: '8px' },
  lg: { padding: '16px 34px', fontSize: '17px', gap: '10px' },
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary:    { background: 'var(--teal-800)', color: 'var(--mint-400)',  border: '1.5px solid var(--teal-800)' },
  mint:       { background: 'var(--mint-400)', color: 'var(--teal-800)',  border: '1.5px solid var(--mint-400)' },
  amber:      { background: 'var(--amber-500)',color: 'var(--teal-800)',  border: '1.5px solid var(--amber-500)' },
  outline:    { background: 'transparent',     color: 'var(--teal-800)',  border: '1.5px solid var(--teal-800)' },
  ghost:      { background: 'transparent',     color: 'var(--teal-800)',  border: '1.5px solid transparent' },
  ghostLight: { background: 'transparent',     color: 'var(--cloud-300)', border: '1.5px solid var(--teal-300)' },
}

const hoverBg: Record<ButtonVariant, string> = {
  primary:    'var(--teal-900)',
  mint:       'var(--mint-500)',
  amber:      'var(--amber-600)',
  outline:    'var(--teal-800)',
  ghost:      'var(--cloud-300)',
  ghostLight: 'rgba(228,238,240,0.10)',
}

const hoverColor: Partial<Record<ButtonVariant, string>> = {
  outline:    'var(--mint-400)',
  ghostLight: 'var(--mint-300)',
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '0.01em',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false)
  const [hover,   setHover]   = useState(false)

  const computed: CSSProperties = {
    ...base,
    ...sizes[size],
    ...variantStyles[variant],
    width:   fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.45 : 1,
    cursor:  disabled ? 'not-allowed' : 'pointer',
    transform: pressed ? 'scale(0.97)' : 'scale(1)',
    ...(hover && !disabled ? { background: hoverBg[variant], color: hoverColor[variant] } : {}),
    ...style,
  }

  const events = {
    onPointerDown:  () => setPressed(true),
    onPointerUp:    () => setPressed(false),
    onPointerLeave: () => { setPressed(false); setHover(false) },
    onPointerEnter: () => setHover(true),
  }

  if (href) {
    return (
      <a href={disabled ? undefined : href} style={computed} aria-disabled={disabled} {...events}>
        {iconLeft}{children}{iconRight}
      </a>
    )
  }

  return (
    <button disabled={disabled} style={computed} {...events} {...rest}>
      {iconLeft}{children}{iconRight}
    </button>
  )
}
```

- [ ] **Step 2: Create `Chip.tsx`**

```tsx
import { type ReactNode, type CSSProperties, type MouseEvent } from 'react'

type ChipVariant = 'outline' | 'outline-light' | 'outline-soft' | 'mint' | 'mint-soft' | 'teal' | 'ink' | 'amber'
type ChipSize    = 'sm' | 'md' | 'lg'

type ChipProps = {
  children?: ReactNode
  variant?: ChipVariant
  selected?: boolean
  size?: ChipSize
  onClick?: (e: MouseEvent) => void
  style?: CSSProperties
}

const sizes: Record<ChipSize, CSSProperties> = {
  sm: { padding: '5px 14px',  fontSize: '13px' },
  md: { padding: '9px 20px',  fontSize: '15px' },
  lg: { padding: '12px 26px', fontSize: '17px' },
}

const palettes: Record<ChipVariant, CSSProperties> = {
  'outline':       { background: 'transparent',      color: 'var(--teal-800)', border: '1.5px solid var(--teal-800)' },
  'outline-light': { background: 'transparent',      color: 'var(--mint-400)', border: '1.5px solid var(--teal-500)' },
  'outline-soft':  { background: 'var(--cloud-100)', color: 'var(--teal-800)', border: '1.5px solid var(--cloud-400)' },
  'mint':          { background: 'var(--mint-400)',  color: 'var(--teal-800)', border: '1.5px solid var(--mint-400)' },
  'mint-soft':     { background: 'var(--mint-300)',  color: 'var(--teal-800)', border: '1.5px solid transparent' },
  'teal':          { background: 'var(--teal-800)',  color: 'var(--mint-400)', border: '1.5px solid var(--teal-800)' },
  'ink':           { background: 'var(--teal-800)',  color: 'var(--cloud-300)',border: '1.5px solid var(--teal-800)' },
  'amber':         { background: 'var(--amber-500)', color: 'var(--teal-800)', border: '1.5px solid var(--amber-500)' },
}

const selectedStyle: CSSProperties = {
  background: 'var(--teal-800)',
  color: 'var(--mint-400)',
  borderColor: 'var(--teal-800)',
}

export function Chip({ children, variant = 'outline', selected = false, size = 'md', onClick, style }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: 'var(--radius-pill)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        ...sizes[size],
        ...palettes[variant],
        ...(selected ? selectedStyle : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Create `Card.tsx`**

```tsx
import { useState, type ReactNode, type CSSProperties } from 'react'

type CardTone      = 'light' | 'cloud' | 'mint' | 'amber' | 'teal' | 'aurora' | 'aurora-warm' | 'aurora-cool' | 'aurora-deep'
type CardElevation = 'none' | 'soft' | 'float'

type CardProps = {
  children?: ReactNode
  tone?: CardTone
  padding?: string
  radius?: string
  bordered?: boolean
  hover?: boolean
  elevation?: CardElevation
  style?: CSSProperties
}

const tones: Record<CardTone, CSSProperties> = {
  'light':       { background: 'var(--surface-card)',  color: 'var(--text-body)' },
  'cloud':       { background: 'var(--cloud-300)',      color: 'var(--text-body)' },
  'mint':        { background: 'var(--mint-400)',       color: 'var(--teal-800)' },
  'amber':       { background: 'var(--amber-500)',      color: 'var(--teal-800)' },
  'teal':        { background: 'var(--teal-800)',       color: 'var(--text-on-dark)' },
  'aurora':      { backgroundImage: 'var(--grad-aurora)',      backgroundColor: 'var(--mint-200)', color: 'var(--text-body)' },
  'aurora-warm': { backgroundImage: 'var(--grad-aurora-warm)', backgroundColor: 'var(--mint-200)', color: 'var(--text-body)' },
  'aurora-cool': { backgroundImage: 'var(--grad-aurora-cool)', backgroundColor: 'var(--mint-200)', color: 'var(--text-body)' },
  'aurora-deep': { backgroundImage: 'var(--grad-aurora-deep)', backgroundColor: 'var(--teal-800)', color: 'var(--text-on-dark)' },
}

const elevationShadow: Record<CardElevation, string> = {
  none:  'none',
  soft:  'var(--shadow-soft)',
  float: 'var(--shadow-float)',
}

export function Card({
  children,
  tone = 'light',
  padding = '28px',
  radius = 'var(--radius-md)',
  bordered = false,
  hover = false,
  elevation = 'none',
  style,
}: CardProps) {
  const [h, setH] = useState(false)

  return (
    <div
      onPointerEnter={() => hover && setH(true)}
      onPointerLeave={() => hover && setH(false)}
      style={{
        position: 'relative',
        borderRadius: radius,
        padding,
        overflow: 'hidden',
        border: bordered && tone === 'light' ? '1px solid var(--cloud-400)' : '1px solid transparent',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        transform: h ? 'translateY(-5px)' : 'none',
        boxShadow: h ? 'var(--shadow-float)' : elevationShadow[elevation],
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create `Input.tsx`**

```tsx
import { useState, useId, type CSSProperties, type InputHTMLAttributes } from 'react'

type InputProps = {
  label?: string
  hint?: string
  invalid?: boolean
  style?: CSSProperties
  inputStyle?: CSSProperties
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'style'>

export function Input({ label, hint, id, type = 'text', invalid = false, style, inputStyle, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  const borderColor = invalid ? 'var(--amber-600)' : focused ? 'var(--teal-800)' : 'var(--cloud-400)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--text-strong)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--text-body)',
          background: 'var(--cloud-100)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: `1.5px solid ${borderColor}`,
          outline: focused ? '2px solid var(--focus-ring)' : '2px solid transparent',
          outlineOffset: '2px',
          transition: 'border-color var(--dur-base) var(--ease-out), outline-color var(--dur-base) var(--ease-out)',
          ...inputStyle,
        }}
        {...rest}
      />
      {hint && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: invalid ? 'var(--amber-600)' : 'var(--text-muted)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify typecheck**

```bash
bun run typecheck --filter=@atrium/ui
```

Expected: `Tasks: 1 successful`

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Button.tsx packages/ui/src/components/Chip.tsx packages/ui/src/components/Card.tsx packages/ui/src/components/Input.tsx
git commit -m "feat(ui): add Button, Chip, Card, Input stateful primitives"
```

---

## Task 5: Wire `index.ts` Exports

**Files:**
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Produces: `@atrium/ui` public API — all 9 components importable as named exports

- [ ] **Step 1: Replace `packages/ui/src/index.ts`**

```ts
export { Badge }        from './components/Badge'
export { Button }       from './components/Button'
export { Card }         from './components/Card'
export { Chip }         from './components/Chip'
export { Eyebrow }      from './components/Eyebrow'
export { Highlight }    from './components/Highlight'
export { Input }        from './components/Input'
export { Logo }         from './components/Logo'
export { ScriptAccent } from './components/ScriptAccent'
```

- [ ] **Step 2: Verify typecheck**

```bash
bun run typecheck --filter=@atrium/ui
```

Expected: `Tasks: 1 successful`

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): wire index.ts — export all 9 primitives from @atrium/ui"
```

---

## Task 6: Design System Documentation

**Files:**
- Create: `packages/ui/docs/README.md`
- Create: `packages/ui/docs/tokens.md`
- Create: `packages/ui/docs/components/Button.md`
- Create: `packages/ui/docs/components/Eyebrow.md`
- Create: `packages/ui/docs/components/Badge.md`
- Create: `packages/ui/docs/components/Chip.md`
- Create: `packages/ui/docs/components/Highlight.md`
- Create: `packages/ui/docs/components/ScriptAccent.md`
- Create: `packages/ui/docs/components/Logo.md`
- Create: `packages/ui/docs/components/Card.md`
- Create: `packages/ui/docs/components/Input.md`

**Interfaces:**
- Produces: living documentation inside the package — updated from the design system readme with current token values and TSX API

- [ ] **Step 1: Create `packages/ui/docs/README.md`**

```markdown
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
```

- [ ] **Step 2: Create `packages/ui/docs/tokens.md`**

```markdown
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
| `--font-display` | `"Nimora", "Inter Tight", system-ui` |
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
```

- [ ] **Step 3: Create per-component docs**

Create `packages/ui/docs/components/Button.md`:

```markdown
# Button

Stadium-pill action. Flat color fields, press scales to 0.97, hover deepens the field.

## Import

```tsx
import { Button } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'mint' \| 'amber' \| 'outline' \| 'ghost' \| 'ghostLight'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and font size |
| `href` | `string` | — | Renders as `<a>` when provided |
| `iconLeft` | `ReactNode` | — | Icon before label |
| `iconRight` | `ReactNode` | — | Icon after label |
| `fullWidth` | `boolean` | `false` | Stretch to container |
| `disabled` | `boolean` | `false` | Muted + non-interactive |

## Usage

```tsx
<Button variant="primary">Get started</Button>
<Button variant="mint" size="lg">Learn more</Button>
<Button variant="outline" href="/services">See services</Button>
<Button variant="amber" iconRight={<ArrowRight size={16} />}>Book a call</Button>
```

## On dark backgrounds

Use `variant="ghostLight"` — transparent with cloud border, lightens on hover.
```

Create `packages/ui/docs/components/Eyebrow.md`:

```markdown
# Eyebrow

Wide-spaced caps section label with a leading horizontal rule. The brand's primary section marker.

## Import

```tsx
import { Eyebrow } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tone` | `'default' \| 'mint' \| 'amber' \| 'onDark' \| 'muted'` | `'default'` | Color treatment |

## Usage

```tsx
<Eyebrow>Our Services</Eyebrow>
<Eyebrow tone="mint">What We Do</Eyebrow>
<Eyebrow tone="onDark">The Experience Era</Eyebrow>
```
```

Create `packages/ui/docs/components/Badge.md`:

```markdown
# Badge

Small flat status or category tag. Smaller than a Chip — non-interactive.

## Import

```tsx
import { Badge } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tone` | `'mint' \| 'teal' \| 'amber' \| 'cloud' \| 'outline'` | `'mint'` | Color treatment |

## Usage

```tsx
<Badge tone="mint">New</Badge>
<Badge tone="amber">Featured</Badge>
<Badge tone="teal">SEO</Badge>
<Badge tone="outline">Draft</Badge>
```
```

Create `packages/ui/docs/components/Chip.md`:

```markdown
# Chip

The Atrium service pill (SEO · Marketing · Photography). Outlined by default; filled when selected.

## Import

```tsx
import { Chip } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'outline' \| 'outline-light' \| 'outline-soft' \| 'mint' \| 'mint-soft' \| 'teal' \| 'ink' \| 'amber'` | `'outline'` | Color treatment |
| `selected` | `boolean` | `false` | Forces teal filled state |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `onClick` | `(e) => void` | — | Makes chip interactive |

## Usage

```tsx
<Chip>SEO</Chip>
<Chip variant="outline-light">Marketing</Chip>
<Chip selected>Photography</Chip>
<Chip onClick={() => setActive('seo')} selected={active === 'seo'}>SEO</Chip>
```
```

Create `packages/ui/docs/components/Highlight.md`:

```markdown
# Highlight

The Atrium signature marker swipe — an amber (or mint/teal) highlighter band sitting low behind an emphasised word.

## Import

```tsx
import { Highlight } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'amber' \| 'mint' \| 'teal'` | `'amber'` | Marker color |

## Usage

```tsx
<h1>Marketing experts and simple software for <Highlight>better</Highlight> Business.</h1>
<h2>We're <Highlight color="mint">humans</Highlight></h2>
```
```

Create `packages/ui/docs/components/ScriptAccent.md`:

```markdown
# ScriptAccent

Handwritten accent word (Nothing You Could Do) for warmth inside a headline. Usually underlined.

## Import

```tsx
import { ScriptAccent } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `underline` | `boolean` | `true` | Underline the word |
| `color` | `string` | `'inherit'` | Text color |

## Usage

```tsx
<h1>Welcome to <ScriptAccent>atrium</ScriptAccent></h1>
<h2>We're <ScriptAccent color="var(--amber-400)">humans</ScriptAccent></h2>
```
```

Create `packages/ui/docs/components/Logo.md`:

```markdown
# Logo

Atrium α monogram, lowercase wordmark, or horizontal lockup. Recolored via CSS mask.

## Import

```tsx
import { Logo } from '@atrium/ui'
```

## Setup

Place `atrium-mark.svg` and `atrium-wordmark.svg` in your app's `public/logos/` directory.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'mark' \| 'wordmark' \| 'lockup'` | `'wordmark'` | Which lockup |
| `color` | `string` | `'var(--teal-800)'` | CSS color (applied via mask) |
| `height` | `number` | `32` | Height in px |
| `assetBase` | `string` | `'/logos'` | Path to logo SVG files |
| `gap` | `number` | `14` | Gap between mark and wordmark (lockup only) |

## Usage

```tsx
<Logo />
<Logo variant="mark" height={40} />
<Logo variant="lockup" color="var(--mint-400)" height={28} />
<Logo variant="wordmark" color="var(--cloud-300)" />
```
```

Create `packages/ui/docs/components/Card.md`:

```markdown
# Card

Color-led or aurora-gradient surface. Flat tones get elevation from the field color; aurora variants are the warmer bento gradient cards.

## Import

```tsx
import { Card } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tone` | `'light' \| 'cloud' \| 'mint' \| 'amber' \| 'teal' \| 'aurora' \| 'aurora-warm' \| 'aurora-cool' \| 'aurora-deep'` | `'light'` | Surface color |
| `padding` | `string` | `'28px'` | Inner padding |
| `radius` | `string` | `'var(--radius-md)'` | Corner radius |
| `bordered` | `boolean` | `false` | Hairline border (light tone only) |
| `hover` | `boolean` | `false` | Lift + float shadow on hover |
| `elevation` | `'none' \| 'soft' \| 'float'` | `'none'` | Resting shadow |

## Usage

```tsx
<Card>Simple white card</Card>
<Card tone="teal" radius="var(--radius-bento)" elevation="soft">Dark bento tile</Card>
<Card tone="aurora" hover elevation="soft">Aurora bento tile</Card>
<Card tone="mint" bordered>Mint field</Card>
```
```

Create `packages/ui/docs/components/Input.md`:

```markdown
# Input

Clean text field with optional label and hint. Hairline border deepens to teal on focus; amber focus ring and error state.

## Import

```tsx
import { Input } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label above the field |
| `hint` | `string` | — | Helper text below |
| `invalid` | `boolean` | `false` | Error state (amber border + hint) |
| `inputStyle` | `CSSProperties` | — | Style for the `<input>` element itself |

Accepts all standard `<input>` HTML attributes (`type`, `placeholder`, `value`, `onChange`, etc.).

## Usage

```tsx
<Input label="Restaurant name" placeholder="e.g. The Rustic Fork" />
<Input label="Email" type="email" hint="We'll never share your email." />
<Input label="Website" invalid hint="Please enter a valid URL." />
```
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/docs/
git commit -m "docs(ui): add design system documentation — README, token reference, component guides"
```

---

## Task 7: Wire `atrium.website` to `@atrium/ui`

**Files:**
- Modify: `apps/atrium.website/package.json`
- Modify: `apps/atrium.website/app/globals.css`
- Modify: `apps/atrium.website/components/ui/Button.tsx`
- Modify: `apps/atrium.website/components/ui/Eyebrow.tsx`

**Interfaces:**
- Consumes: `@atrium/ui` exports
- Produces: website no longer owns copies of shared primitives

- [ ] **Step 1: Add `@atrium/ui` to website deps**

Edit `apps/atrium.website/package.json` — add to `dependencies`:

```json
"@atrium/ui": "workspace:*"
```

Run:

```bash
bun install
```

- [ ] **Step 2: Replace `globals.css` token block with import**

In `apps/atrium.website/app/globals.css`, replace the entire `:root { ... }` block (lines 3 through the closing `}` of the `:root` block, plus the `.atr-*` utility classes) with a single import:

```css
@import "@atrium/ui/src/tokens/tokens.css";
```

Keep everything after the tokens that is website-specific: the `@theme inline {}` block, the `body` reset, the `h1 em` serif rule, and the `@keyframes grain` block. The file becomes:

```css
@import "tailwindcss";
@import "@atrium/ui/src/tokens/tokens.css";

/* ─── Tailwind theme ──────────────────────────────────────────────── */
@theme inline {
  --color-background: var(--cloud-200);
  --color-foreground: var(--ink-700);
  --font-sans: var(--font-sans);
}

/* ─── Base reset ──────────────────────────────────────────────────── */
* { box-sizing: border-box; }

body {
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

h1 em, h2 em, h3 em, h4 em {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
}

/* ─── Grain keyframe ──────────────────────────────────────────────── */
@keyframes grain {
  0%,100% { transform: translate(0,0); }
  10%  { transform: translate(-5%,-5%); }
  20%  { transform: translate(-10%,5%); }
  30%  { transform: translate(5%,-10%); }
  40%  { transform: translate(-5%,15%); }
  50%  { transform: translate(-10%,5%); }
  60%  { transform: translate(15%,0); }
  70%  { transform: translate(0,10%); }
  80%  { transform: translate(-15%,0); }
  90%  { transform: translate(10%,5%); }
}
```

- [ ] **Step 3: Replace `Button.tsx` with re-export**

Replace `apps/atrium.website/components/ui/Button.tsx` with:

```tsx
export { Button as default, Button } from '@atrium/ui'
```

- [ ] **Step 4: Replace `Eyebrow.tsx` with re-export**

Replace `apps/atrium.website/components/ui/Eyebrow.tsx` with:

```tsx
export { Eyebrow as default, Eyebrow } from '@atrium/ui'
```

- [ ] **Step 5: Verify typecheck on both packages**

```bash
bun run typecheck --filter=@atrium/ui --filter=@atrium/website
```

Expected: `Tasks: 2 successful`

- [ ] **Step 6: Commit**

```bash
git add apps/atrium.website/package.json apps/atrium.website/app/globals.css apps/atrium.website/components/ui/Button.tsx apps/atrium.website/components/ui/Eyebrow.tsx bun.lock
git commit -m "feat(website): consume @atrium/ui tokens and primitives — remove local copies"
```
