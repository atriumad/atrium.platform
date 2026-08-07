# Atrium Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `packages/ui` the monorepo's shared visual layer, built from the grader's approved UI, consumed by the grader, with a specimen route for review.

**Architecture:** Tailwind v4 across the monorepo. Every design token lives in one `@theme` block in `packages/ui/src/theme.css`. Components are React with Tailwind utilities — no inline styles. The nine existing inline-styled components move to `packages/ui/src/legacy/` behind a second entry point so `apps/atrium.website` keeps rendering unchanged.

**Tech Stack:** Bun 1.3.2 workspaces, Turbo, Next.js 15 (grader) / 16 (website), React 19, Tailwind CSS v4, Biome 2.5.

**Spec:** `docs/superpowers/specs/2026-08-06-atrium-design-system-design.md`

## Global Constraints

- Tailwind v4 only. No `tailwind.config.js` anywhere when this plan is done.
- Token colour names are unprefixed and semantic: `ink`, `body`, `muted`, `green`, `amber`. The `rg-` prefix is a temporary artifact and is gone by Task 6.
- The border token is `--color-line`, not `--color-border` — `border-border` is unreadable and collides with Tailwind's `border` utility in review.
- Heading font weights are 400 and 500 only. Eyebrows and small uppercase labels are 600. Nothing in this system is 700 or 800.
- Three font families: Inter Tight (`--font-sans`), Instrument Serif (`--font-serif`), Nothing You Could Do (`--font-script`). Do not add a fourth.
- Components carry no inline `style={{}}` except where a value is computed at runtime from data (the gauge's conic-gradient is the only sanctioned case, and it lives in the grader, not the package).
- Custom breakpoints are 560, 700 and 980, consumed as arbitrary variants (`max-[560px]:`). Do not convert them to Tailwind's default scale.
- `docs/` is listed in `.gitignore` but 299 doc files are tracked. Any commit touching `docs/` needs `git add -f`.
- Every task ends green: `bun run typecheck`, `bunx biome check .`, and a production build of each app the task touched.

---

## File Structure

**Created**
- `packages/ui/src/theme.css` — the `@theme` block. Every token. No rules.
- `packages/ui/src/styles.css` — imports `theme.css`, plus the three rules that cannot be utilities.
- `packages/ui/src/components/{Button,Tag,Card,Input,Eyebrow,Meter,Stat,Logo}.tsx`
- `packages/ui/src/lib/cn.ts` — class merge helper.
- `packages/ui/src/legacy.ts` — barrel for the frozen components.
- `apps/atrium.grader/app/specimen/page.tsx` — the review surface.

**Moved**
- `packages/ui/src/components/*.tsx` (the nine current ones) → `packages/ui/src/legacy/`.

**Modified**
- `packages/ui/package.json` — gains an `exports` map.
- `apps/atrium.grader/{package.json,postcss.config.js,app/globals.css}` — v4 migration.
- `apps/atrium.grader/app/grader-client.tsx` — token rename, then imports from the package.
- `apps/atrium.grader/lib/fonts.ts` — `--font-handwriting` → `--font-script`.
- `apps/atrium.website/lib/fonts.ts` — Inter Tight axis `400 600` → `100 900`.
- `apps/atrium.website/components/ui/{Button,Eyebrow}.tsx` — repoint to `@atrium/ui/legacy`.

**Deleted**
- `apps/atrium.grader/tailwind.config.js` (Task 1).

---

### Task 1: Migrate the grader to Tailwind v4

The grader's look is already approved, so it is the safest place to prove the v4 setup. This task changes the *mechanism* only — token names stay `rg-*` and every rendered pixel stays identical. Renaming happens in Task 6, deliberately separated so a visual regression here can only have one cause.

**Files:**
- Modify: `apps/atrium.grader/package.json`
- Modify: `apps/atrium.grader/postcss.config.js`
- Modify: `apps/atrium.grader/app/globals.css`
- Delete: `apps/atrium.grader/tailwind.config.js`

**Interfaces:**
- Consumes: nothing.
- Produces: a working v4 grader whose `@theme` block is the literal source for `packages/ui/src/theme.css` in Task 2.

- [ ] **Step 1: Write the failing test**

Create `apps/atrium.grader/scripts/assert-css.mjs`. It builds the app and asserts that utilities defined by our tokens actually reach the output CSS. This catches the v4 failure mode where a class is silently stripped.

```js
// apps/atrium.grader/scripts/assert-css.mjs
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const cssDir = join(process.cwd(), ".next/static/css")
const css = readdirSync(cssDir)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(cssDir, f), "utf8"))
  .join("\n")

// Utilities that only exist because our theme defines the token behind them.
const required = [
  "#0d2f33",                  // rg-ink, via text-rg-ink
  "#f3c150",                  // rg-amber
  "26px",                     // rounded-rg
  "cubic-bezier(.2,.7,.2,1)", // ease-rg
  "rg-fade-up",               // keyframes behind animate-rg-up
]

const missing = required.filter((token) => !css.includes(token))

if (missing.length > 0) {
  console.error(`FAIL: these tokens never reached the built CSS:\n  ${missing.join("\n  ")}`)
  process.exit(1)
}

console.log(`PASS: all ${required.length} tokens present in built CSS`)
```

Add the script to `apps/atrium.grader/package.json`:

```json
"assert-css": "node scripts/assert-css.mjs"
```

- [ ] **Step 2: Run it against the current v3 build to prove it passes today**

```bash
cd apps/atrium.grader && bun run build && bun run assert-css
```

Expected: `PASS: all 5 tokens present in built CSS`. This is the baseline — the test must pass before the migration so that a failure after it means the migration broke something.

- [ ] **Step 3: Swap the dependencies**

```bash
cd apps/atrium.grader
bun remove tailwindcss
bun add -d tailwindcss@^4 @tailwindcss/postcss@^4
```

- [ ] **Step 4: Point PostCSS at the v4 plugin**

Replace the whole of `apps/atrium.grader/postcss.config.js`:

```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

- [ ] **Step 5: Move the config into `@theme`**

In `apps/atrium.grader/app/globals.css`, replace the three v3 directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

with the v4 import plus the theme. Keep `@import "@atrium/ui/src/tokens/tokens.css";` as the first line — the app still depends on `--surface-page`, `--text-strong`, `--border-light` and `--ease-out` from it.

```css
@import "@atrium/ui/src/tokens/tokens.css";
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter-tight), "Inter Tight", system-ui, sans-serif;
  --font-serif: var(--font-instrument-serif), "Instrument Serif", Georgia, serif;

  --color-rg-ink: #0d2f33;
  --color-rg-body: #3f544f;
  --color-rg-muted: #78877f;
  --color-rg-muted-soft: #93a09b;
  --color-rg-dark: #0d353b;
  --color-rg-green: #1f7a52;
  --color-rg-mint: #a9edc8;
  --color-rg-amber: #f3c150;
  --color-rg-green-fill: #3fae78;
  --color-rg-green-soft: #e3f2e9;
  --color-rg-green-ink: #186043;
  --color-rg-amber-fill: #eab63f;
  --color-rg-amber-soft: #f9ecc7;
  --color-rg-amber-ink: #a97f1c;
  --color-rg-red-fill: #e08a5b;
  --color-rg-red-soft: #f7e2d6;
  --color-rg-red-ink: #c0653a;
  --color-rg-red-tint: #f0b79b;
  --color-rg-error: #b4553a;
  --color-rg-track: #ece8da;
  --color-rg-track-soft: #e9e5d7;
  --color-rg-pending: #c7cec9;
  --color-rg-card: #fff;
  --color-rg-border: rgba(13, 47, 51, 0.1);
  --color-rg-surface: #f4f1e7;
  --color-rg-surface-soft: #faf8f0;

  --radius-rg: 26px;
  --radius-rg-sm: 18px;

  --shadow-rg: 0 1px 0 rgba(13, 47, 51, 0.04), 0 16px 40px rgba(13, 47, 51, 0.07);
  --shadow-rg-h: 0 2px 0 rgba(13, 47, 51, 0.04), 0 28px 56px rgba(13, 47, 51, 0.11);
  --shadow-rg-search-h: 0 2px 0 rgba(13, 47, 51, 0.04), 0 26px 54px rgba(13, 47, 51, 0.12);
  --shadow-rg-loading: 0 1px 0 rgba(13, 47, 51, 0.04), 0 18px 44px rgba(13, 47, 51, 0.08);

  --ease-rg: cubic-bezier(.2, .7, .2, 1);

  --animate-stage-rise: stage-rise 900ms cubic-bezier(0.19, 1, 0.22, 1) both;
  --animate-rg-up: rg-fade-up .7s var(--ease-rg) both;
  --animate-rg-up-form: rg-fade-up .7s var(--ease-rg) .08s both;
  --animate-rg-up-trust: rg-fade-up .6s var(--ease-rg) .18s both;
  --animate-rg-up-fast: rg-fade-up .5s var(--ease-rg) both;
  --animate-rg-pulse: rg-pulse 2s infinite;
  --animate-rgl-pulse: rgl-pulse 1.6s infinite;
  --animate-rgl-spin: rgl-spin .8s linear infinite;
  --animate-rgl-fade-in: rgl-fade-in .3s var(--ease-rg) both;

  @keyframes stage-rise {
    from { opacity: 0; filter: blur(8px); transform: translate3d(0, 20px, 0) scale(0.988); }
    to { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes rg-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes rg-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .35; }
  }
  @keyframes rgl-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .3; }
  }
  @keyframes rgl-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes rgl-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

Three v4 differences that will bite if missed. `@theme` replaces `theme.extend` and there is no `extend` — v4 merges with its defaults automatically. `@keyframes` must be declared **inside** `@theme` for an `--animate-*` token to resolve. And `--color-rg-ink` produces `bg-rg-ink`, `text-rg-ink`, `border-rg-ink` — the `--color-` prefix is the namespace, not part of the name.

- [ ] **Step 6: Delete the v3 config**

```bash
rm apps/atrium.grader/tailwind.config.js
```

v4 discovers sources automatically from the project root, so the `content` array has no replacement and needs none — everything under `apps/atrium.grader` is scanned.

- [ ] **Step 7: Run the test**

```bash
cd apps/atrium.grader && bun run build && bun run assert-css
```

Expected: `PASS: all 5 tokens present in built CSS`.

If a colour is missing, the `--color-` namespace prefix is wrong. If `rg-fade-up` is missing, the `@keyframes` blocks are outside `@theme`.

- [ ] **Step 8: Verify no pixels moved**

```bash
cd apps/atrium.grader && bun run dev --port 3100
```

Load `http://localhost:3100`, run a scan, and compare all three stages against the current production look at 375, 768 and 1280. Specifically confirm: the search hero's staggered entrance still fires; the loading stepper's spinner still spins and its dots fill green; the report's cards still reveal on scroll; the gauge ring still paints; the meters still animate to width.

Those five are the animation and JS-driven paths — the parts most likely to break in a v3→v4 move and the ones a static screenshot will not catch.

- [ ] **Step 9: Commit**

```bash
git add apps/atrium.grader
git commit -m "build(grader): migrate Tailwind v3 config to a v4 @theme block

Moves every token from tailwind.config.js into an @theme block in
globals.css and swaps the PostCSS plugin for @tailwindcss/postcss.
Token names are unchanged, so the rendered output is identical.

Adds scripts/assert-css.mjs, which fails the build if a token stops
reaching the output CSS — the v4 failure mode is silent stripping,
not an error."
```

---

### Task 2: Stand up the package skeleton without breaking the website

**Files:**
- Create: `packages/ui/src/theme.css`
- Create: `packages/ui/src/styles.css`
- Create: `packages/ui/src/legacy.ts`
- Create: `packages/ui/src/lib/cn.ts`
- Move: `packages/ui/src/components/*.tsx` → `packages/ui/src/legacy/`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/src/index.ts`
- Modify: `apps/atrium.website/components/ui/Button.tsx`
- Modify: `apps/atrium.website/components/ui/Eyebrow.tsx`

**Interfaces:**
- Consumes: the token values proven in Task 1.
- Produces: `@atrium/ui/styles.css` (importable stylesheet), `@atrium/ui/legacy` (the nine frozen components), and `cn(...classes)` from `packages/ui/src/lib/cn.ts` with signature `(...inputs: Array<string | false | null | undefined>) => string`.

- [ ] **Step 1: Write the failing test**

The risk this task carries is that the website silently loses its `Button`. Prove it with a resolution test rather than a build, so it runs in a second.

Create `packages/ui/test/exports.test.ts`:

```ts
import { describe, expect, test } from "bun:test"

describe("@atrium/ui entry points", () => {
  test("the new barrel exports the primitives", async () => {
    const mod = await import("../src/index.ts")
    expect(Object.keys(mod).sort()).toEqual(
      ["Button", "Card", "Eyebrow", "Input", "Logo", "Meter", "Stat", "Tag"],
    )
  })

  test("the legacy barrel still exports the nine frozen components", async () => {
    const mod = await import("../src/legacy.ts")
    expect(Object.keys(mod).sort()).toEqual(
      ["Badge", "Button", "Card", "Chip", "Eyebrow", "Highlight", "Input", "Logo", "ScriptAccent"],
    )
  })

  test("the two barrels are disjoint modules", async () => {
    const next = await import("../src/index.ts")
    const legacy = await import("../src/legacy.ts")
    expect(next.Button).not.toBe(legacy.Button)
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
cd packages/ui && bun test
```

Expected: FAIL — `Cannot find module '../src/legacy.ts'`.

The first test also fails, and stays failing until Task 4 lands the eighth component. That is intentional: it is the running checklist for Tasks 3 and 4.

- [ ] **Step 3: Move the nine components and split the barrels**

```bash
cd packages/ui/src
mkdir -p legacy
git mv components/Badge.tsx components/Button.tsx components/Card.tsx \
       components/Chip.tsx components/Eyebrow.tsx components/Highlight.tsx \
       components/Input.tsx components/Logo.tsx components/ScriptAccent.tsx legacy/
```

Replace `packages/ui/src/index.ts` with an empty-for-now barrel that Tasks 3 and 4 fill:

```ts
export {} // primitives land in Tasks 3 and 4
```

Create `packages/ui/src/legacy.ts` with the nine exports the old `index.ts` had:

```ts
export { Badge } from './legacy/Badge'
export { Button } from './legacy/Button'
export { Card } from './legacy/Card'
export { Chip } from './legacy/Chip'
export { Eyebrow } from './legacy/Eyebrow'
export { Highlight } from './legacy/Highlight'
export { Input } from './legacy/Input'
export { Logo } from './legacy/Logo'
export { ScriptAccent } from './legacy/ScriptAccent'
```

- [ ] **Step 4: Add the exports map**

`main`/`types` alone cannot express two entry points. Replace those fields in `packages/ui/package.json`:

```json
{
  "name": "@atrium/ui",
  "version": "0.0.1",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./legacy": "./src/legacy.ts",
    "./styles.css": "./src/styles.css",
    "./theme.css": "./src/theme.css",
    "./src/tokens/tokens.css": "./src/tokens/tokens.css"
  },
  "scripts": {
    "build": "echo 'ui: no build needed'",
    "lint": "biome check .",
    "test": "bun test",
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

The last entry is not redundant. Adding `exports` makes the package's subpaths a closed set, and both apps currently import `@atrium/ui/src/tokens/tokens.css` by path. Omit it and both stylesheets fail to resolve.

- [ ] **Step 5: Repoint the website's two re-exports**

`apps/atrium.website/components/ui/Button.tsx`:

```ts
export { Button as default, Button } from '@atrium/ui/legacy'
```

`apps/atrium.website/components/ui/Eyebrow.tsx`:

```ts
export { Eyebrow as default, Eyebrow } from '@atrium/ui/legacy'
```

- [ ] **Step 6: Write the theme**

Create `packages/ui/src/theme.css`. This is Task 1's `@theme` with the `rg-` prefix dropped, `--color-rg-border` renamed to `--color-line`, and the editorial accents added. The two one-off shadows collapse into `soft` and `float`.

```css
@theme {
  /* Type — three families, no more */
  --font-sans: var(--font-inter-tight), "Inter Tight", system-ui, sans-serif;
  --font-serif: var(--font-instrument-serif), "Instrument Serif", Georgia, serif;
  --font-script: var(--font-nothing-you-could-do), "Nothing You Could Do", cursive;

  /* Warm neutrals — the ground */
  --color-cream: #f4f1e7;
  --color-off-white: #faf8f0;
  --color-card: #ffffff;
  --color-track: #ece8da;
  --color-track-soft: #e9e5d7;
  --color-pending: #c7cec9;

  /* Greens */
  --color-ink: #0d2f33;
  --color-dark: #0d353b;
  --color-green: #1f7a52;
  --color-green-fill: #3fae78;
  --color-green-soft: #e3f2e9;
  --color-green-ink: #186043;
  --color-mint: #a9edc8;

  /* Accent */
  --color-amber: #f3c150;
  --color-amber-fill: #eab63f;
  --color-amber-soft: #f9ecc7;
  --color-amber-ink: #a97f1c;

  /* State — terracotta, never a traffic-light red */
  --color-red-fill: #e08a5b;
  --color-red-soft: #f7e2d6;
  --color-red-ink: #c0653a;
  --color-red-tint: #f0b79b;
  --color-error: #b4553a;

  /* Text and line */
  --color-body: #3f544f;
  --color-muted: #78877f;
  --color-muted-soft: #93a09b;
  --color-line: rgba(13, 47, 51, 0.1);

  /* Editorial accents — campaign rotation only. One leads, one supports,
     the rest stay in reserve. No component may default to one. */
  --color-coral: #ec9a82;
  --color-lilac: #d2b4ee;
  --color-sage: #a8c89a;
  --color-periwinkle: #7e9bf0;

  --radius-card: 26px;
  --radius-card-sm: 18px;

  --shadow-soft: 0 1px 0 rgba(13, 47, 51, 0.04), 0 16px 40px rgba(13, 47, 51, 0.07);
  --shadow-float: 0 2px 0 rgba(13, 47, 51, 0.04), 0 28px 56px rgba(13, 47, 51, 0.11);

  --ease-atrium: cubic-bezier(.2, .7, .2, 1);

  --animate-stage-rise: stage-rise 900ms cubic-bezier(0.19, 1, 0.22, 1) both;
  --animate-rise: rise .7s var(--ease-atrium) both;
  --animate-rise-sm: rise .5s var(--ease-atrium) both;
  --animate-pulse-soft: pulse-soft 2s infinite;
  --animate-spin-slow: spin-slow .8s linear infinite;
  --animate-fade-in: fade-in .3s var(--ease-atrium) both;

  @keyframes stage-rise {
    from { opacity: 0; filter: blur(8px); transform: translate3d(0, 20px, 0) scale(0.988); }
    to { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: .35; }
  }
  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

- [ ] **Step 7: Write the stylesheet**

Create `packages/ui/src/styles.css`. It carries the theme plus the rules that genuinely cannot be utilities, lifted from the grader's `globals.css`.

```css
@import "./theme.css";

@layer components {
  /* Score ring — conic-gradient repainted from JS, masked to an annulus. */
  .atr-ring {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(#f3c150 0 0%, rgba(255, 255, 255, .12) 0 100%);
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px));
  }

  /* Meter fill — starts at 0, widened by JS from a data-w attribute. */
  .atr-fill {
    display: block;
    height: 100%;
    width: 0;
    border-radius: 999px;
    transition: width 1.1s var(--ease-atrium);
  }

  /* Scroll reveal — gated by .atr-anim so content stays visible without JS. */
  .atr-anim .atr-reveal {
    opacity: 0;
    translate: 0 22px;
    transition: opacity .7s var(--ease-atrium), translate .7s var(--ease-atrium);
  }
  .atr-anim .atr-reveal.in {
    opacity: 1;
    translate: 0 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .atr-anim .atr-reveal {
      opacity: 1;
      translate: none;
      transition: none;
    }
    .atr-fill {
      transition: none;
    }
  }
}
```

- [ ] **Step 8: Write the class helper**

Create `packages/ui/src/lib/cn.ts`:

```ts
/** Joins class names, dropping falsy entries. Later strings win by source order,
 *  not by specificity — do not rely on it to override a conflicting utility. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}
```

- [ ] **Step 9: Run the tests**

```bash
cd packages/ui && bun test
```

Expected: the legacy and disjointness tests PASS. The primitives test still FAILS with an empty array — that is Tasks 3 and 4's remaining work.

- [ ] **Step 10: Prove the website is untouched**

```bash
cd apps/atrium.website && bun run typecheck && bun run build
```

Expected: build succeeds. This is the gate for the whole task — a passing typecheck alone would not catch a broken `exports` map, because TypeScript resolves the path while the bundler does not.

- [ ] **Step 11: Commit**

```bash
git add packages/ui apps/atrium.website
git commit -m "feat(ui): add the shared theme and freeze the inline-styled components

Adds theme.css (every design token, from the grader's approved set) and
styles.css (the four rules that cannot be Tailwind utilities).

Moves the nine inline-styled components to src/legacy/ behind a second
entry point, and repoints the website's two re-exports at it, so the
website renders exactly what it rendered before.

The exports map has to list src/tokens/tokens.css explicitly: adding
'exports' closes the subpath set, and both apps import that file by path."
```

---

### Task 3: Button, Tag, Eyebrow, Stat

The four primitives with no internal state. Grouped because they share one review concern — do the variant maps read correctly against the tokens — and a reviewer would accept or reject them together.

**Files:**
- Create: `packages/ui/src/components/{Button,Tag,Eyebrow,Stat}.tsx`
- Create: `packages/ui/test/variants.test.ts`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cn` from `../lib/cn`.
- Produces:
  - `Button`, props `{ variant?: 'primary'|'secondary'|'accent'|'ghost'; size?: 'sm'|'md'|'lg'; href?: string; className?: string }` plus native button/anchor attributes. Renders `<a>` when `href` is set, `<button>` otherwise.
  - `Tag`, props `{ variant?: 'outline'|'filled'|'solid'|'mint'; size?: 'sm'|'md'; className?: string }`.
  - `Eyebrow`, props `{ tone?: 'default'|'on-dark'; as?: 'p'|'span'|'div'; className?: string }`.
  - `Stat`, props `{ value: number|string; label: string; tone?: 'good'|'warn'|'bad'; className?: string }`.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/test/variants.test.ts`. Assert the token classes each variant must carry — this is what catches a typo'd colour name, which Tailwind will not error on.

```ts
import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { Button } from "../src/components/Button"
import { Eyebrow } from "../src/components/Eyebrow"
import { Stat } from "../src/components/Stat"
import { Tag } from "../src/components/Tag"

describe("Button", () => {
  test("primary is the ink pill with mint text", () => {
    const html = renderToStaticMarkup(createElement(Button, { variant: "primary" }, "Go"))
    expect(html).toContain("bg-ink")
    expect(html).toContain("text-mint")
    expect(html).toContain("rounded-full")
  })

  test("renders an anchor when href is set", () => {
    const html = renderToStaticMarkup(createElement(Button, { href: "/x" }, "Go"))
    expect(html).toStartWith("<a")
  })

  test("renders a button with an explicit type when href is absent", () => {
    const html = renderToStaticMarkup(createElement(Button, {}, "Go"))
    expect(html).toStartWith("<button")
    expect(html).toContain('type="button"')
  })

  test("className is appended, not replaced", () => {
    const html = renderToStaticMarkup(createElement(Button, { className: "w-full" }, "Go"))
    expect(html).toContain("w-full")
    expect(html).toContain("bg-ink")
  })
})

describe("Tag", () => {
  test("outline carries the hairline token", () => {
    const html = renderToStaticMarkup(createElement(Tag, { variant: "outline" }, "New"))
    expect(html).toContain("border-line")
  })
})

describe("Eyebrow", () => {
  test("is uppercase at the system's tracking and weight", () => {
    const html = renderToStaticMarkup(createElement(Eyebrow, {}, "Primary leak"))
    expect(html).toContain("uppercase")
    expect(html).toContain("tracking-[0.14em]")
    expect(html).toContain("font-semibold")
  })

  test("on-dark switches to mint", () => {
    const html = renderToStaticMarkup(createElement(Eyebrow, { tone: "on-dark" }, "Score"))
    expect(html).toContain("text-mint")
  })
})

describe("Stat", () => {
  test("warn uses the amber ground and ink", () => {
    const html = renderToStaticMarkup(createElement(Stat, { value: 68, label: "Reputation", tone: "warn" }))
    expect(html).toContain("border-amber")
    expect(html).toContain("text-amber-ink")
    expect(html).toContain("68")
    expect(html).toContain("Reputation")
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
cd packages/ui && bun test test/variants.test.ts
```

Expected: FAIL — `Cannot find module '../src/components/Button'`.

- [ ] **Step 3: Implement Button**

Create `packages/ui/src/components/Button.tsx`:

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-mint shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  secondary: 'bg-card text-ink border border-line shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  accent: 'bg-amber text-ink shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.82rem] gap-1.5',
  md: 'px-6 py-3.5 text-[0.92rem] gap-2',
  lg: 'px-8 py-4 text-[1.02rem] gap-2.5',
}

const base = [
  'inline-flex items-center justify-center rounded-full font-sans font-semibold leading-none',
  'cursor-pointer no-underline transition duration-200 ease-atrium',
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-green-fill',
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
].join(' ')

type Shared = { variant?: Variant; size?: Size; className?: string; children?: ReactNode }

type ButtonProps = Shared & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Shared>
type AnchorProps = Shared & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Shared | 'href'>

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('href' in props && props.href !== undefined) {
    return <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  }

  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return <button className={classes} type={type} {...buttonRest}>{children}</button>
}
```

`type` defaults to `button`. A bare `<button>` inside a form submits it, and the grader's reset button lives next to a search form — that default is load-bearing, not cosmetic.

- [ ] **Step 4: Implement Tag**

Create `packages/ui/src/components/Tag.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Variant = 'outline' | 'filled' | 'solid' | 'mint'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  outline: 'bg-transparent text-ink border border-line',
  filled: 'bg-amber text-ink',
  solid: 'bg-ink text-cream',
  mint: 'bg-mint text-ink',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1 text-[0.72rem] gap-1.5',
  md: 'px-4 py-[7px] text-[0.82rem] gap-2',
}

export function Tag({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...rest
}: { variant?: Variant; size?: Size; className?: string; children?: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-sans font-semibold leading-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 5: Implement Eyebrow**

Create `packages/ui/src/components/Eyebrow.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'default' | 'on-dark'

const tones: Record<Tone, string> = {
  default: 'text-green',
  'on-dark': 'text-mint',
}

export function Eyebrow({
  tone = 'default',
  as: Component = 'p',
  className,
  children,
  ...rest
}: {
  tone?: Tone
  as?: 'p' | 'span' | 'div'
  className?: string
  children?: ReactNode
} & HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn(
        'm-0 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
```

`as` is destructured to `Component`, not to `Tag` — `Tag` is a component in this same package and shadowing that name in a sibling file is how someone ends up debugging the wrong element.

- [ ] **Step 6: Implement Stat**

Create `packages/ui/src/components/Stat.tsx`:

```tsx
import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Tone = 'good' | 'warn' | 'bad'

const tones: Record<Tone, string> = {
  good: 'border-green-fill/35 text-green-ink',
  warn: 'border-amber/50 text-amber-ink',
  bad: 'border-red-fill/50 text-red-ink',
}

export function Stat({
  value,
  label,
  tone = 'good',
  className,
  ...rest
}: {
  value: number | string
  label: string
  tone?: Tone
  className?: string
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 rounded-full border-[1.5px] bg-transparent',
        'py-[7px] pl-3 pr-[13px] font-sans text-[0.8rem] text-body',
        tones[tone],
        className,
      )}
      {...rest}
    >
      <strong className="text-[0.92rem] font-semibold">{value}</strong> {label}
    </span>
  )
}
```

- [ ] **Step 7: Export them**

Replace `packages/ui/src/index.ts`:

```ts
export { Button } from './components/Button'
export { Eyebrow } from './components/Eyebrow'
export { Stat } from './components/Stat'
export { Tag } from './components/Tag'
```

- [ ] **Step 8: Run the tests**

```bash
cd packages/ui && bun test
```

Expected: `test/variants.test.ts` PASSES in full. `test/exports.test.ts` still fails its first case — four of eight primitives exist.

- [ ] **Step 9: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add Button, Tag, Eyebrow and Stat

The four stateless primitives, styled with Tailwind utilities against
the shared theme. Button renders an anchor when href is set and a
button with an explicit type otherwise — a bare button next to the
grader's search form would submit it."
```

---

### Task 4: Card, Input, Meter, Logo

**Files:**
- Create: `packages/ui/src/components/{Card,Input,Meter,Logo}.tsx`
- Create: `packages/ui/test/components.test.ts`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cn` from `../lib/cn`.
- Produces:
  - `Card`, props `{ tone?: 'surface'|'warm'|'dark'|'amber'; elevation?: 'none'|'soft'|'float'; hairline?: boolean; as?: 'div'|'section'|'article'|'aside'; className?: string }`.
  - `Input`, props `{ label: string; hint?: string; error?: string; size?: 'sm'|'md'; id?: string; className?: string }` plus native input attributes.
  - `Meter`, props `{ value: number; label: string; description?: string; tone?: 'hi'|'mid'|'lo'; className?: string }`. Renders the fill with `class="atr-fill"` and `data-w="{value}%"` for the JS animator.
  - `Logo`, props `{ variant?: 'mark'|'wordmark'|'lockup'; height?: number; className?: string }`.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/test/components.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { Card } from "../src/components/Card"
import { Input } from "../src/components/Input"
import { Meter } from "../src/components/Meter"

describe("Card", () => {
  test("dark tone carries the dark ground and cream text", () => {
    const html = renderToStaticMarkup(createElement(Card, { tone: "dark" }, "x"))
    expect(html).toContain("bg-dark")
    expect(html).toContain("text-cream")
  })

  test("elevation none emits no shadow utility", () => {
    const html = renderToStaticMarkup(createElement(Card, { elevation: "none" }, "x"))
    expect(html).not.toContain("shadow-soft")
    expect(html).not.toContain("shadow-float")
  })

  test("hairline adds a ring, not a border, so it does not affect layout", () => {
    const html = renderToStaticMarkup(createElement(Card, { hairline: true }, "x"))
    expect(html).toContain("ring-1")
    expect(html).toContain("ring-line")
  })
})

describe("Input", () => {
  test("label is bound to the control", () => {
    const html = renderToStaticMarkup(createElement(Input, { label: "Restaurant", id: "r" }))
    expect(html).toContain('for="r"')
    expect(html).toContain('id="r"')
  })

  test("error is announced and wired via aria-describedby", () => {
    const html = renderToStaticMarkup(createElement(Input, { label: "Email", id: "e", error: "Required" }))
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="e-error"')
    expect(html).toContain('id="e-error"')
    expect(html).toContain('role="alert"')
    expect(html).toContain("Required")
  })

  test("hint is wired when there is no error", () => {
    const html = renderToStaticMarkup(createElement(Input, { label: "Email", id: "e", hint: "Work address" }))
    expect(html).toContain('aria-describedby="e-hint"')
    expect(html).not.toContain('aria-invalid="true"')
  })
})

describe("Meter", () => {
  test("exposes the width to the JS animator and the value to assistive tech", () => {
    const html = renderToStaticMarkup(createElement(Meter, { value: 68, label: "Reputation", tone: "mid" }))
    expect(html).toContain('data-w="68%"')
    expect(html).toContain("atr-fill")
    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-valuenow="68"')
    expect(html).toContain("bg-amber-fill")
  })

  test("clamps out-of-range values", () => {
    const html = renderToStaticMarkup(createElement(Meter, { value: 140, label: "x" }))
    expect(html).toContain('data-w="100%"')
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
cd packages/ui && bun test test/components.test.ts
```

Expected: FAIL — `Cannot find module '../src/components/Card'`.

- [ ] **Step 3: Implement Card**

Create `packages/ui/src/components/Card.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'surface' | 'warm' | 'dark' | 'amber'
type Elevation = 'none' | 'soft' | 'float'

const tones: Record<Tone, string> = {
  surface: 'bg-card text-ink',
  warm: 'bg-off-white text-ink',
  dark: 'bg-dark text-cream',
  amber: 'bg-amber-soft text-ink',
}

const elevations: Record<Elevation, string> = {
  none: '',
  soft: 'shadow-soft',
  float: 'shadow-float',
}

export function Card({
  tone = 'surface',
  elevation = 'soft',
  hairline = false,
  as: Component = 'div',
  className,
  children,
  ...rest
}: {
  tone?: Tone
  elevation?: Elevation
  hairline?: boolean
  as?: 'div' | 'section' | 'article' | 'aside'
  className?: string
  children?: ReactNode
} & HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn(
        'rounded-card p-[34px] max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]',
        tones[tone],
        elevations[elevation],
        hairline && (tone === 'dark' ? 'ring-1 ring-cream/20' : 'ring-1 ring-line'),
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
```

The hairline is a `ring`, not a `border`. A border would add to the box and shift every child by a pixel when toggled; a ring paints outside the layout.

- [ ] **Step 4: Implement Input**

Create `packages/ui/src/components/Input.tsx`:

```tsx
'use client'

import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '../lib/cn'

type Size = 'sm' | 'md'

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-[0.9rem]',
  md: 'px-5 py-3.5 text-[1rem]',
}

export function Input({
  label,
  hint,
  error,
  size = 'md',
  id,
  className,
  ...rest
}: {
  label: string
  hint?: string
  error?: string
  size?: Size
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>) {
  const generated = useId()
  const inputId = id ?? generated
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="font-sans text-[0.82rem] font-medium text-body" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full rounded-full bg-card font-sans text-ink transition duration-200 ease-atrium',
          'border placeholder:text-muted',
          'focus:outline-2 focus:outline-offset-2 focus:outline-green-fill',
          error ? 'border-error' : 'border-line',
          sizes[size],
        )}
        id={inputId}
        {...rest}
      />
      {error ? (
        <span className="font-sans text-[0.8rem] text-error" id={`${inputId}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="font-sans text-[0.8rem] text-muted" id={`${inputId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: Implement Meter**

Create `packages/ui/src/components/Meter.tsx`:

```tsx
import { cn } from '../lib/cn'

type Tone = 'hi' | 'mid' | 'lo'

const fills: Record<Tone, string> = {
  hi: 'bg-green-fill',
  mid: 'bg-amber-fill',
  lo: 'bg-red-fill',
}

const badges: Record<Tone, string> = {
  hi: 'bg-green-soft text-green-ink',
  mid: 'bg-amber-soft text-amber-ink',
  lo: 'bg-red-soft text-red-ink',
}

export function Meter({
  value,
  label,
  description,
  tone = 'hi',
  className,
}: {
  value: number
  label: string
  description?: string
  tone?: Tone
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div
      className={cn(
        'grid items-center gap-6 rounded-2xl border-t border-line py-4',
        'grid-cols-[190px_1fr_96px]',
        'max-[980px]:grid-cols-[minmax(150px,1fr)_minmax(120px,1.4fr)_auto] max-[980px]:gap-[18px]',
        'max-[560px]:grid-cols-[1fr_auto] max-[560px]:gap-x-3.5 max-[560px]:gap-y-3',
        className,
      )}
    >
      <div className="font-sans text-[1rem] font-medium max-[560px]:col-span-full">
        {label}
        {description ? <small className="mt-0.5 block text-[0.8rem] font-normal text-muted">{description}</small> : null}
      </div>
      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={clamped}
        aria-label={label}
        className="h-3.5 overflow-hidden rounded-full bg-track"
        role="meter"
      >
        <span className={cn('atr-fill', fills[tone])} data-w={`${clamped}%`} />
      </div>
      <div
        className={cn(
          'justify-self-end rounded-xl px-3.5 py-2 font-sans text-[1.5rem] font-medium tracking-[-0.02em]',
          'max-[560px]:px-3 max-[560px]:py-1.5 max-[560px]:text-[1.25rem]',
          badges[tone],
        )}
      >
        {clamped}
      </div>
    </div>
  )
}
```

`role="meter"` with the aria value trio is what makes the bar mean something to a screen reader — the visual fill is a `<span>` with no accessible name of its own.

- [ ] **Step 6: Implement Logo**

Create `packages/ui/src/components/Logo.tsx` by porting `packages/ui/src/legacy/Logo.tsx`. Keep its CSS `mask` approach and the `819.21 / 225.63` wordmark ratio — those are correct and asset-derived. Replace the inline `style={{}}` sizing with utilities, and take colour from `currentColor` so a parent's `text-*` drives it:

```tsx
import { cn } from '../lib/cn'

type Variant = 'mark' | 'wordmark' | 'lockup'

const WORDMARK_RATIO = 819.21 / 225.63

export function Logo({
  variant = 'wordmark',
  height = 32,
  className,
}: {
  variant?: Variant
  height?: number
  className?: string
}) {
  const mask = (file: string, width: number) => (
    <span
      aria-hidden="true"
      className="block bg-current"
      style={{
        height,
        width,
        maskImage: `url(${file})`,
        WebkitMaskImage: `url(${file})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )

  if (variant === 'mark') {
    return <span className={cn('inline-flex text-ink', className)}>{mask('/logos/atrium-mark.svg', height)}</span>
  }

  if (variant === 'wordmark') {
    return (
      <span className={cn('inline-flex text-ink', className)}>
        {mask('/logos/atrium-wordmark.svg', height * WORDMARK_RATIO)}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-[0.5em] text-ink', className)}>
      {mask('/logos/atrium-mark.svg', height * 1.05)}
      {mask('/logos/atrium-wordmark.svg', height * WORDMARK_RATIO)}
    </span>
  )
}
```

The `style` prop here is the sanctioned exception from the global constraints: mask URLs and a computed pixel width cannot be utilities, and `height` is a runtime prop.

- [ ] **Step 7: Export them**

Replace `packages/ui/src/index.ts`:

```ts
export { Button } from './components/Button'
export { Card } from './components/Card'
export { Eyebrow } from './components/Eyebrow'
export { Input } from './components/Input'
export { Logo } from './components/Logo'
export { Meter } from './components/Meter'
export { Stat } from './components/Stat'
export { Tag } from './components/Tag'
```

- [ ] **Step 8: Run the whole suite**

```bash
cd packages/ui && bun test && bun run typecheck
```

Expected: every test passes, including `exports.test.ts`'s first case, which has been red since Task 2.

- [ ] **Step 9: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add Card, Input, Meter and Logo

Completes the eight v1 primitives. Card's hairline is a ring rather
than a border so toggling it cannot shift children. Meter carries
role=meter plus the aria value trio, and exposes data-w for the
width animator that lives in styles.css."
```

---

### Task 5: Point the grader at the package

The proof the package works: the app that defined the language stops defining it.

**Files:**
- Modify: `apps/atrium.grader/app/globals.css`
- Modify: `apps/atrium.grader/app/grader-client.tsx`
- Modify: `apps/atrium.grader/lib/fonts.ts`
- Modify: `apps/atrium.grader/package.json`
- Modify: `apps/atrium.grader/scripts/assert-css.mjs`
- Modify: `apps/atrium.website/lib/fonts.ts`

**Interfaces:**
- Consumes: `@atrium/ui/styles.css`, and `Button`, `Eyebrow`, `Meter`, `Stat`, `Tag` from `@atrium/ui`.
- Produces: a grader with zero local token definitions.

- [ ] **Step 1: Update the CSS assertion for the new names**

The token names change in this task, so the guard has to change with them. In `apps/atrium.grader/scripts/assert-css.mjs`, replace the `required` array:

```js
const required = [
  "#0d2f33",                  // ink
  "#f3c150",                  // amber
  "#f4f1e7",                  // cream — proves the package's theme is reaching the app
  "26px",                     // rounded-card
  "cubic-bezier(.2,.7,.2,1)", // ease-atrium
  "atr-fill",                 // a class defined only inside packages/ui
]
```

`atr-fill` is the important one. It exists only in `packages/ui/src/styles.css`, so it fails unless `@source` is wired correctly.

- [ ] **Step 2: Run it to make sure it fails**

```bash
cd apps/atrium.grader && bun run build && bun run assert-css
```

Expected: FAIL, listing `#f4f1e7` and `atr-fill` as missing — the app still has its own `rg-*` theme and has never imported the package's stylesheet.

- [ ] **Step 3: Add the dependency**

```bash
cd apps/atrium.grader && bun add @atrium/ui@workspace:*
```

- [ ] **Step 4: Replace the grader's CSS with an import**

`apps/atrium.grader/app/globals.css` becomes:

```css
@import "tailwindcss";
@import "@atrium/ui/styles.css";

@source "../../../packages/ui/src";

:root {
  --font-inter-tight: var(--font-inter-tight);
  --font-instrument-serif: var(--font-instrument-serif);
}

@layer components {
  /* Dot pattern — grader-only, drives the search lockup. */
  .dot-pattern {
    display: block;
  }
}
```

Delete the entire `@theme` block added in Task 1, and delete `.atr-ring`, `.atr-fill`, `.atr-reveal`, `.visually-hidden` — all four now come from the package.

Without `@source`, Tailwind v4 will not scan `packages/ui/src`, and every utility used only inside a package component is stripped from the output with no error. That is the failure `atr-fill` in Step 1 is designed to catch.

- [ ] **Step 5: Rename the tokens throughout the grader**

```bash
cd apps/atrium.grader
grep -rl 'rg-' app/ | xargs sed -i '' \
  -e 's/\brg-surface-soft\b/off-white/g' \
  -e 's/\brg-surface\b/cream/g' \
  -e 's/\brg-border\b/line/g' \
  -e 's/\brg-muted-soft\b/muted-soft/g' \
  -e 's/\brg-\(ink\|body\|muted\|dark\|green\|mint\|amber\|card\|track\|pending\|error\)\b/\1/g' \
  -e 's/\brg-\(green\|amber\|red\)-\(fill\|soft\|ink\|tint\)\b/\1-\2/g' \
  -e 's/\brg-track-soft\b/track-soft/g'

sed -i '' -e 's/rounded-rg-sm/rounded-card-sm/g' -e 's/rounded-rg\b/rounded-card/g' \
          -e 's/shadow-rg-h\|shadow-rg-search-h/shadow-float/g' \
          -e 's/shadow-rg-loading\|shadow-rg\b/shadow-soft/g' \
          -e 's/ease-rg/ease-atrium/g' \
          -e 's/animate-rg-up-fast/animate-rise-sm/g' \
          -e 's/animate-rg-up[a-z-]*/animate-rise/g' \
          -e 's/animate-rg-pulse\|animate-rgl-pulse/animate-pulse-soft/g' \
          -e 's/animate-rgl-spin/animate-spin-slow/g' \
          -e 's/animate-rgl-fade-in/animate-fade-in/g' \
          app/grader-client.tsx

sed -i '' -e 's/\brg-ring\b/atr-ring/g' -e 's/\brg-fill\b/atr-fill/g' \
          -e 's/\brg-reveal\b/atr-reveal/g' -e 's/\brg-anim\b/atr-anim/g' \
          -e 's/\brg-report\b/atr-report/g' \
          app/grader-client.tsx
```

Then confirm nothing was missed:

```bash
grep -rn 'rg-' app/ | grep -v 'atr-' || echo "clean"
```

Expected: `clean`. Anything listed is a token the sed missed — rename it by hand.

The last sed also touches the JS selectors in `ReportStage`'s `useEffect` (`.rg-reveal`, `.rg-fill[data-w]`, `.rg-gauge`, `.rg-ring`). Confirm those still match the classNames the JSX now emits, or the reveal and the gauge go dead.

- [ ] **Step 6: Swap the hand-rolled markup for package components**

In `apps/atrium.grader/app/grader-client.tsx`:

```tsx
import { Button, Eyebrow, Meter, Stat } from '@atrium/ui'
```

Replace the reset button:

```tsx
<Button onClick={onReset} variant="secondary">Scan another restaurant</Button>
```

Replace the first-move CTA:

```tsx
<Button href={contactHref} rel={opensNewTab ? 'noreferrer' : undefined} target={opensNewTab ? '_blank' : undefined} variant="primary">
  Review the full plan →
</Button>
```

Replace each signal row with `<Meter key={insight.category} description={publicReportText(insight.businessImpact)} label={insight.label} tone={insight.score >= 80 ? 'hi' : insight.score >= 60 ? 'mid' : 'lo'} value={insight.score} />`, each header pill with `<Stat key={entry.category} label={entry.label} tone={statTone(entry.status)} value={entry.score} />`, and each `<p className="… uppercase …">` eyebrow with `<Eyebrow>`.

The count-up animation reads `[data-count]`, which `Meter` and `Stat` do not emit — they render their value directly. Decide explicitly: either drop the count-up for these two, or add `data-count` to both components and have them render `0`. Dropping it is the simpler choice and the numbers still animate into view with the card reveal.

- [ ] **Step 7: Align the font variables**

`apps/atrium.grader/lib/fonts.ts` — rename the script font's CSS variable:

```ts
variable: '--font-script',
```

`apps/atrium.website/lib/fonts.ts` — widen the Inter Tight axis so both apps expose the same range:

```ts
weight: '100 900',
```

- [ ] **Step 8: Run the test**

```bash
cd apps/atrium.grader && bun run build && bun run assert-css
```

Expected: `PASS: all 6 tokens present in built CSS`.

- [ ] **Step 9: Verify the three stages still render**

```bash
cd apps/atrium.grader && bun run dev --port 3100
```

Run a full scan. Compare against Task 1 Step 8's baseline at 375, 768 and 1280. The five paths to confirm are the same five: hero entrance, spinner, card reveal, gauge ring, meter fill.

- [ ] **Step 10: Commit**

```bash
git add apps/atrium.grader apps/atrium.website/lib/fonts.ts
git commit -m "refactor(grader): consume the shared design system from @atrium/ui

The grader stops defining tokens and imports @atrium/ui/styles.css.
Local rg-* names are renamed to the system's unprefixed ones, and the
reset button, CTA, signal rows and header pills are replaced by the
package's Button, Meter and Stat.

Both apps now expose the same Inter Tight axis and the same script
font variable name."
```

---

### Task 6: The specimen route

**Files:**
- Create: `apps/atrium.grader/app/specimen/page.tsx`
- Modify: `apps/atrium.grader/app/robots.ts`

**Interfaces:**
- Consumes: every export of `@atrium/ui`.
- Produces: `/specimen`, the review surface.

- [ ] **Step 1: Write the failing test**

Create `apps/atrium.grader/test/specimen.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import Specimen from "../app/specimen/page"

describe("specimen", () => {
  test("renders every token name so the page is the palette's source of truth", () => {
    const html = renderToStaticMarkup(createElement(Specimen))
    for (const token of ["ink", "cream", "amber", "green-fill", "red-fill", "muted", "line"]) {
      expect(html).toContain(token)
    }
  })

  test("shows every Button variant", () => {
    const html = renderToStaticMarkup(createElement(Specimen))
    for (const label of ["primary", "secondary", "accent", "ghost"]) {
      expect(html).toContain(label)
    }
  })

  test("shows the three Meter tones", () => {
    const html = renderToStaticMarkup(createElement(Specimen))
    expect(html).toContain("bg-green-fill")
    expect(html).toContain("bg-amber-fill")
    expect(html).toContain("bg-red-fill")
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
cd apps/atrium.grader && bun test test/specimen.test.ts
```

Expected: FAIL — `Cannot find module '../app/specimen/page'`.

- [ ] **Step 3: Build the page**

Create `apps/atrium.grader/app/specimen/page.tsx`. Drive it from data so adding a token to the theme is a one-line change here:

```tsx
import { Button, Card, Eyebrow, Input, Logo, Meter, Stat, Tag } from '@atrium/ui'

const swatches = [
  { group: 'Warm neutrals', tokens: ['cream', 'off-white', 'card', 'track', 'track-soft', 'pending'] },
  { group: 'Greens', tokens: ['ink', 'dark', 'green', 'green-fill', 'green-soft', 'green-ink', 'mint'] },
  { group: 'Accent', tokens: ['amber', 'amber-fill', 'amber-soft', 'amber-ink'] },
  { group: 'State', tokens: ['red-fill', 'red-soft', 'red-ink', 'red-tint', 'error'] },
  { group: 'Text and line', tokens: ['body', 'muted', 'muted-soft', 'line'] },
  { group: 'Editorial — campaign rotation only', tokens: ['coral', 'lilac', 'sage', 'periwinkle'] },
] as const

const buttonVariants = ['primary', 'secondary', 'accent', 'ghost'] as const
const buttonSizes = ['sm', 'md', 'lg'] as const
const tagVariants = ['outline', 'filled', 'solid', 'mint'] as const
const cardTones = ['surface', 'warm', 'dark', 'amber'] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <Eyebrow>{title}</Eyebrow>
      {children}
    </section>
  )
}

export default function Specimen() {
  return (
    <main className="min-h-svh bg-cream px-8 py-16 font-sans text-ink max-[560px]:px-5">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-16">
        <header className="flex flex-col gap-4">
          <Logo height={28} variant="lockup" />
          <h1 className="text-[clamp(1.95rem,4.6vw,3.5rem)] font-normal leading-[1.06]">
            Design system <em className="font-serif italic text-green">specimen</em>
          </h1>
          <p className="max-w-[52ch] leading-relaxed text-body">
            Every token and primitive in <code>@atrium/ui</code>, rendered from the live package.
          </p>
        </header>

        <Section title="Colour">
          {swatches.map(({ group, tokens }) => (
            <div key={group} className="flex flex-col gap-3">
              <h2 className="text-[1.1rem] font-medium">{group}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {tokens.map((token) => (
                  <div key={token} className="flex flex-col gap-2">
                    <div className={`h-16 rounded-card-sm ring-1 ring-line bg-${token}`} />
                    <code className="text-[0.78rem] text-muted">{token}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Type">
          <div className="flex flex-col gap-4">
            <p className="text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none">
              Find the <em className="font-serif italic text-green">leaks</em>
            </p>
            <p className="text-[2rem] font-normal">Regular 400 — headings</p>
            <p className="text-[2rem] font-medium">Medium 500 — headings</p>
            <p className="max-w-[60ch] leading-relaxed text-body">
              Body copy at the system's default leading. Inter Tight carries everything functional;
              Instrument Serif appears once per composition, in italic.
            </p>
            <Eyebrow>Eyebrow — 600, 0.14em, uppercase</Eyebrow>
          </div>
        </Section>

        <Section title="Button">
          <div className="flex flex-col gap-5">
            {buttonSizes.map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} size={size} variant={variant}>
                    {variant}
                  </Button>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>disabled</Button>
              <Button href="#" variant="secondary">as a link</Button>
            </div>
          </div>
        </Section>

        <Section title="Tag and Stat">
          <div className="flex flex-wrap items-center gap-3">
            {tagVariants.map((variant) => (
              <Tag key={variant} variant={variant}>{variant}</Tag>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="Discovery" tone="good" value={80} />
            <Stat label="Reputation" tone="warn" value={68} />
            <Stat label="Social" tone="bad" value={11} />
          </div>
        </Section>

        <Section title="Card">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {cardTones.map((tone) => (
              <Card key={tone} hairline tone={tone}>
                <Eyebrow tone={tone === 'dark' ? 'on-dark' : 'default'}>{tone}</Eyebrow>
                <p className="mt-3 leading-relaxed">Card body copy at the default padding.</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Input">
          <div className="grid max-w-[520px] gap-5">
            <Input hint="Name and city" label="Restaurant" placeholder="The Original Ninfa's" />
            <Input error="Enter at least 3 characters" label="Restaurant" defaultValue="Ni" />
          </div>
        </Section>

        <Section title="Meter">
          <Card elevation="soft">
            <Meter description="Discovery is helping the restaurant compete." label="Discovery" tone="hi" value={80} />
            <Meter description="Weak reputation makes guests compare alternatives." label="Reputation" tone="mid" value={68} />
            <Meter description="Social signals are thin." label="Social" tone="lo" value={11} />
          </Card>
        </Section>
      </div>
    </main>
  )
}
```

`bg-${token}` is a dynamic class and Tailwind cannot see it — the swatches will render transparent. Fix it in the next step rather than reaching for a safelist.

- [ ] **Step 4: Make the swatch classes statically visible**

Replace the `tokens` arrays with explicit class strings so every utility appears literally in the source:

```tsx
const swatches = [
  {
    group: 'Warm neutrals',
    tokens: [
      { name: 'cream', className: 'bg-cream' },
      { name: 'off-white', className: 'bg-off-white' },
      { name: 'card', className: 'bg-card' },
      { name: 'track', className: 'bg-track' },
      { name: 'track-soft', className: 'bg-track-soft' },
      { name: 'pending', className: 'bg-pending' },
    ],
  },
  {
    group: 'Greens',
    tokens: [
      { name: 'ink', className: 'bg-ink' },
      { name: 'dark', className: 'bg-dark' },
      { name: 'green', className: 'bg-green' },
      { name: 'green-fill', className: 'bg-green-fill' },
      { name: 'green-soft', className: 'bg-green-soft' },
      { name: 'green-ink', className: 'bg-green-ink' },
      { name: 'mint', className: 'bg-mint' },
    ],
  },
  {
    group: 'Accent',
    tokens: [
      { name: 'amber', className: 'bg-amber' },
      { name: 'amber-fill', className: 'bg-amber-fill' },
      { name: 'amber-soft', className: 'bg-amber-soft' },
      { name: 'amber-ink', className: 'bg-amber-ink' },
    ],
  },
  {
    group: 'State',
    tokens: [
      { name: 'red-fill', className: 'bg-red-fill' },
      { name: 'red-soft', className: 'bg-red-soft' },
      { name: 'red-ink', className: 'bg-red-ink' },
      { name: 'red-tint', className: 'bg-red-tint' },
      { name: 'error', className: 'bg-error' },
    ],
  },
  {
    group: 'Text and line',
    tokens: [
      { name: 'body', className: 'bg-body' },
      { name: 'muted', className: 'bg-muted' },
      { name: 'muted-soft', className: 'bg-muted-soft' },
      { name: 'line', className: 'bg-line' },
    ],
  },
  {
    group: 'Editorial — campaign rotation only',
    tokens: [
      { name: 'coral', className: 'bg-coral' },
      { name: 'lilac', className: 'bg-lilac' },
      { name: 'sage', className: 'bg-sage' },
      { name: 'periwinkle', className: 'bg-periwinkle' },
    ],
  },
] as const
```

and render `<div className={`h-16 rounded-card-sm ring-1 ring-line ${token.className}`} />`.

Tailwind v4 scans source text; it never evaluates expressions. `bg-${token}` produces nothing at all, and it fails silently — exactly the failure mode `assert-css.mjs` exists to catch.

- [ ] **Step 5: Keep it out of search results**

In `apps/atrium.grader/app/robots.ts`, add `/specimen` to the disallow list. It is an internal review surface, not a page.

- [ ] **Step 6: Run the tests**

```bash
cd apps/atrium.grader && bun test && bun run build && bun run assert-css
```

Expected: all green.

- [ ] **Step 7: Review it**

```bash
cd apps/atrium.grader && bun run dev --port 3100
```

Open `http://localhost:3100/specimen` at 375, 768 and 1280. Every swatch has colour, every button variant is distinguishable, the disabled button reads as disabled, the error input shows its message in terracotta, and the three meters are green, amber and terracotta.

- [ ] **Step 8: Commit**

```bash
git add apps/atrium.grader
git commit -m "feat(grader): add the /specimen design system review route

Renders every token and all eight primitives from the live package.
Swatch classes are written out literally rather than interpolated —
Tailwind v4 scans source text and never evaluates expressions, so a
template literal would produce no CSS and fail silently."
```

---

## Verification

After Task 6:

```bash
bun run typecheck
bunx biome check .
bun run build
cd packages/ui && bun test
```

Then, by hand: run a full grader scan and confirm the three stages match the screenshots from the responsive review, and open `/specimen` at all three widths.

## Open items this plan deliberately leaves

- `apps/atrium.website` still runs on inline styles and its seven `.type-*` classes. Migrating it is a separate project, and a large one.
- `packages/ui/src/legacy/` and `packages/ui/src/tokens/tokens.css` stay until the website migrates. Both are dead weight the moment it does.
- **The dark theme and the procedural textures are in the spec but not in this plan.** This is a deliberate divergence, and it needs a decision rather than silence. The spec commits to porting `sober.css` as an opt-in layer and the four `feTurbulence` textures. Neither has a consumer: no surface in either app asks for a dark ground today except the grader's score card, which is a single `bg-dark` and needs no theme layer. Building an unexercised token set means shipping something the specimen renders but nothing proves. If you want them in the v1 review, they are roughly one extra task — the tokens are declarations, not logic.
- `Toast`, `NavPills`, `Modal` and `Select` are deferred for the same reason.
