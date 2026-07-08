# Design System Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore `packages/ui/src/tokens/tokens.css` + `packages/ui/src/components/*` as the single, actually-enforced source of truth for both `apps/atrium.website` and `apps/atrium.grader`, fix the brand typography that currently never renders, and remove the highest-value hardcoded/duplicate styling found in the 2026-07-08 design-system audit.

**Architecture:** No new architecture — this is a convergence pass. Canonical tokens/components already exist in `packages/ui`; both apps already depend on the package (`"@atrium/ui": "workspace:*"`). Work is: (1) fix font wiring so the four brand faces actually load, (2) delete grader's redundant/drifted local token block so it inherits canonical values instead of shadowing them, (3) migrate the clearest duplicate CSS/components onto `@atrium/ui`, (4) tokenize the highest-count hardcoded colors, (5) fix the two concrete touch-target violations.

**Tech Stack:** Next.js 15 (React 19) monorepo, Turborepo + bun workspaces, Tailwind v4 (`@theme inline`) on website, Tailwind v3 (`tailwind.config.js`) + hand-written CSS on grader, `next/font/local` for self-hosted fonts, Biome for lint.

**Scope note:** This plan intentionally does NOT attempt to migrate all ~4000 lines of `apps/atrium.grader/app/globals.css` onto `@atrium/ui` components in one pass — that's a much larger, higher-risk effort (every `.scan-tile`/`.diagnostic-*`/`.loading-*` class has bespoke grid-area layout logic that `Card` doesn't model). This plan fixes the token-drift root cause and migrates the components where a clean 1:1 swap exists. Full component migration is called out as follow-up work at the end.

---

## Phase 1 — P0: Make the brand actually render, stop the silent fork

### Task 1: Fix website's missing font-family wiring

**Context:** `packages/ui/src/tokens/tokens.css` defines `--font-sans: "Inter Tight", system-ui, ...` and `--font-serif: "Instrument Serif", Georgia, serif;` as **literal fallback strings** (it can't know the hashed font-family name `next/font/local` generates — that's the consuming app's job to wire in, via the `variable` CSS custom property each font loader creates). `apps/atrium.grader/app/globals.css:117,119` correctly does this wiring (`--font-sans: var(--font-inter-tight), "Inter Tight", ...`). **`apps/atrium.website` never does this anywhere.** Verified via `.next` build output: the generated font family is literally named `interTight` (no space, hashed), which does not match the literal string `"Inter Tight"` in the canonical fallback chain — so on real devices (which don't have a font called "Inter Tight" installed), the browser skips the bundled font entirely and silently renders body text and serif emphasis in the OS default sans/serif. This has been true since the token package was wired up; it is the single highest-impact bug in this audit because it affects 100% of website text.

**Files:**
- Modify: `apps/atrium.website/app/globals.css:11-24`

**Step 1: Add font-variable wiring to the `:root` block**

Open `apps/atrium.website/app/globals.css`. The existing block at lines 11-24 reads:

```css
/* Legacy website aliases retained for sections still authored against the
   pre-@atrium/ui token names. Remove once those components use semantic tokens. */
:root {
  --color-primary: var(--teal-800);
  --color-primary-900: var(--teal-900);
  --color-surface: var(--surface-page);
  --color-surface-alt: var(--surface-sunken);
  --color-accent: var(--accent);
  --color-text-light: var(--text-on-dark);
  --color-text-dark: var(--text-strong);
  --color-border-subtle: rgba(228, 238, 240, 0.1);
  --color-forest: var(--teal-800);
  --color-forest-2: var(--teal-700);
}
```

Add a new block **above** it (font wiring is not "legacy," keep it separate so it doesn't get deleted when the legacy aliases eventually are):

```css
/* ─── Font wiring ─────────────────────────────────────────────────────────
   packages/ui/tokens.css ships literal fallback family names (it can't know
   the hashed names next/font/local generates). Each consuming app must wire
   its actual loaded font variables into the semantic --font-* tokens. */
:root {
  --font-sans: var(--font-inter-tight), "Inter Tight", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-serif: var(--font-instrument-serif), "Instrument Serif", Georgia, serif;
}

/* Legacy website aliases retained for sections still authored against the
   pre-@atrium/ui token names. Remove once those components use semantic tokens. */
:root {
  --color-primary: var(--teal-800);
  --color-primary-900: var(--teal-900);
  --color-surface: var(--surface-page);
  --color-surface-alt: var(--surface-sunken);
  --color-accent: var(--accent);
  --color-text-light: var(--text-on-dark);
  --color-text-dark: var(--text-strong);
  --color-border-subtle: rgba(228, 238, 240, 0.1);
  --color-forest: var(--teal-800);
  --color-forest-2: var(--teal-700);
}
```

**Step 2: Verify in the browser**

Run: `bun run dev:website`
Open `http://localhost:3000` (or whichever port Next.js prints).
Open DevTools → Elements → select any `<p>` or `<h1>` → Computed → `font-family`. It must resolve to the hashed `interTight`/`instrumentSerif` family (or show the actual custom typeface rendering — Inter Tight has a distinctly larger x-height than the OS default; Instrument Serif italic emphasis words should look like a real serif, not Georgia/Times).
Compare before/after with a screenshot if unsure — the difference is subtle at a glance but real (this is why it went unnoticed).

**Step 3: Typecheck + build**

Run: `cd apps/atrium.website && bun run typecheck && bun run build`
Expected: both succeed with no new errors.

**Step 4: Commit**

```bash
git add apps/atrium.website/app/globals.css
git commit -m "fix(website): wire loaded font variables into --font-sans/--font-serif

Inter Tight and Instrument Serif were never actually applying — the
canonical token package only ships literal fallback family names, and
nothing in the website app bridged them to the hashed names next/font
generates. Site has been silently rendering in OS default fonts."
```

---

### Task 2: Remove Nimora from the design system

**Context:** Decision reversed from the original audit recommendation — instead of wiring Nimora in, remove it as a documented brand typeface entirely. Nimora was never actually loaded in either app (confirmed in the audit: no `@font-face`/`next/font` entry exists), so removing it from the token/docs layer just codifies what's already true in production — nothing visually changes, but the design system stops promising a face that doesn't exist, and future engineers stop hitting the "why doesn't `--font-display` look like Nimora" question. Only one place in code consumes `var(--font-display)` today: `apps/atrium.grader/app/globals.css` → `.diagnostic-wordmark`. After this task, the four-face brand system becomes a three-face system: **Inter Tight** (sans + display), **Instrument Serif** (editorial/emphasis), **Nothing You Could Do** (script accent).

**Files:**
- Modify: `packages/ui/src/tokens/tokens.css`
- Modify: `docs/Atrium Design System/tokens/fonts.css`
- Modify: `docs/Atrium Design System/tokens/typography.css`
- Modify: `docs/Atrium Design System/readme.md`
- Modify: `docs/Atrium Design System/SKILL.md`
- Note: `apps/atrium.website/docs/Atrium Design System/` is a **second, independent copy** of the same folder (confirmed byte-identical today, not a symlink) — apply the same edits there too, or the two copies drift immediately. Flagged again in "out of scope" below as its own follow-up (a duplicate doc tree is itself a design-system inconsistency).

**Step 1: Drop `--font-display` back to the sans family in canonical tokens**

In `packages/ui/src/tokens/tokens.css`, find:
```css
  --font-display: "Nimora", "Inter Tight", system-ui, sans-serif;
```
Replace with:
```css
  --font-display: var(--font-sans);
```

**Step 2: Remove the Nimora `@font-face` from the identity source**

In `docs/Atrium Design System/tokens/fonts.css`, delete the `/* --- 1 · Nimora — logo / wordmark display (single weight) --- */` `@font-face` block (the one with `font-family: "Nimora"; src: url("../assets/fonts/Nimora.woff")...`). Renumber the remaining face comments (`2 · Inter Tight` etc. shift down by one) and update the file's header comment listing the face count from 4 to 3.

In `docs/Atrium Design System/tokens/typography.css`, find:
```css
--font-display: "Nimora", "Inter Tight", system-ui, sans-serif;
```
Replace with:
```css
--font-display: var(--font-sans);
```
Also remove the comment line above it referencing `Nimora → the "atrium" wordmark / logo lockup only` (or rewrite to note display now shares the sans face).

**Step 3: Update the brand docs**

In `docs/Atrium Design System/readme.md`:
- Section 3 "Type" (~line 137-155): remove the `**Nimora** — reserved for the **atrium wordmark / logo lockup**...` bullet. Change the opening line from "four typefaces, nothing more" to "three typefaces, nothing more."
- Section 5 "Index / manifest" (~line 215): update `assets/fonts/` description from "all 4 faces bundled: Nimora (logo), Inter Tight..." to "all 3 faces bundled: Inter Tight (sans, roman+italic)..."
- Section 6 "Caveats" (~line 243-250): remove the bullet `**Nimora is single-weight**...` and remove "Nimora" from the "Text faces are final & bundled" bullet.
- Section 1 "Sources provided" (~line 38): the historical note that the original identity folder contained Nimora among the source typography files is fine to leave as historical record — don't rewrite raw source-material history, just make clear (as the existing parenthetical already does) that "current system trims to..." — update that trim list to drop Nimora.

In `docs/Atrium Design System/SKILL.md`:
- "Brand in one breath" section: change `Display type is **Nimora**; body is **Inter Tight**;` to `Body and display type are both **Inter Tight**;`

**Step 4: Confirm the Nimora asset files can stay or go**

The raw `Nimora.woff`/`Nimora.ttf` files in `docs/Atrium Design System/assets/fonts/` are historical brand-identity source material, not part of the enforced token/component contract — leave them in place (harmless, useful if the decision is ever revisited) rather than deleting brand assets as part of a token cleanup.

**Step 5: Sync the duplicate docs copy**

Apply Steps 2-3 identically to `apps/atrium.website/docs/Atrium Design System/tokens/fonts.css`, `typography.css`, `readme.md`, and (if present there) `SKILL.md`.

**Step 6: Verify**

Run `bun run dev:grader`, navigate to the diagnostic/report page, inspect `.diagnostic-wordmark` in DevTools — computed `font-family` should now resolve straight to Inter Tight (via `--font-display: var(--font-sans)`), with no console warnings about a missing Nimora resource.
`grep -rn "Nimora" packages/ui docs apps/atrium.website/docs apps/atrium.grader/app apps/atrium.website/app` should return nothing outside the two identity-doc font-asset folders and the historical "Sources provided" note.
Run `cd apps/atrium.website && bun run typecheck && bun run build` and `cd apps/atrium.grader && bun run typecheck && bun run build` — both must succeed.

**Step 7: Commit**

```bash
git add packages/ui/src/tokens/tokens.css \
        "docs/Atrium Design System/tokens/fonts.css" "docs/Atrium Design System/tokens/typography.css" \
        "docs/Atrium Design System/readme.md" "docs/Atrium Design System/SKILL.md" \
        "apps/atrium.website/docs/Atrium Design System"
git commit -m "refactor(design-system): remove Nimora, drop to a three-face type system

Nimora was documented as --font-display brand-wide but never actually
loaded in either app. Rather than wire it in, removing it from the
token/doc layer so the system stops promising a face that doesn't
exist. --font-display now aliases --font-sans (Inter Tight)."
```

---

### Task 3: Remove grader's duplicate/drifted token block

**Context:** `apps/atrium.grader/app/globals.css:1` imports `@atrium/ui/src/tokens/tokens.css`, then lines 9-175 redeclare a `:root` block that shadows most of those same token names with hand-copied values. Some are pure duplicates (safe to delete — canonical wins). Some have genuinely drifted (type ramp, line-heights, tracking, `--shadow-soft`) and must be deleted so canonical's correct value applies. Some are grader-specific additions with no canonical equivalent (`--canvas`, `--ink`, `--tone-*`, `--sage`, `--butter`, etc., plus the correct `--font-sans`/`--font-serif`/`--font-body`/`--font-script` wiring) and must stay — just moved into a clearly labeled section so future readers don't mistake them for canonical tokens.

**Files:**
- Modify: `apps/atrium.grader/app/globals.css:9-175`

**Step 1: Replace the whole `:root` block**

Replace lines 9-175 (from `:root {` through the closing `}` right before `/* ===== Base reset ===== */`) with:

```css
:root {
  /* ============================================================
     Grader-specific token additions
     Everything already defined identically in
     @atrium/ui/src/tokens/tokens.css (raw palette, radii, base
     shadows, base easing/duration, marker colors, tracking-wide/
     wider, space-1..6) has been REMOVED from this file — grader now
     inherits those from the canonical import at the top of this file
     instead of shadowing it with a stale copy. Only genuinely
     grader-specific tokens (no canonical counterpart) remain below.
     ============================================================ */

  /* Font wiring — canonical tokens.css ships literal fallback names
     only; each app must bridge its loaded next/font variables in. */
  --font-sans: var(--font-inter-tight), "Inter Tight", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-body: var(--font-sans);
  --font-serif: var(--font-instrument-serif), "Instrument Serif", Georgia, serif;
  --font-display: var(--font-sans);
  --font-script: var(--font-handwriting), "Nothing You Could Do", cursive;

  /* Semantic alias layer — grader's own naming on top of canonical
     surface/text tokens. No canonical equivalent for these names. */
  --canvas: var(--cloud-200);
  --surface: var(--cloud-100);
  --surface-soft: var(--cloud-300);
  --ink: var(--teal-800);
  --text: var(--ink-700);
  --muted: var(--teal-500);
  --line: var(--cloud-400);
  --line-strong: var(--teal-300);
  --control-border: rgb(7 47 52 / 28%);
  --control-border-active: var(--teal-800);
  --control-active-shadow: rgb(7 47 52 / 10%);
  --accent-soft: var(--mint-200);
  --sage: var(--mint-300);
  --sky: var(--cloud-300);
  --butter: var(--amber-200);

  /* Score tones — grader-only (diagnostic score bands) */
  --tone-low-bg: var(--amber-200);
  --tone-low-border: var(--amber-500);
  --tone-low-strong: var(--amber-600);
  --tone-medium-bg: var(--cloud-300);
  --tone-medium-border: var(--teal-300);
  --tone-medium-strong: var(--teal-500);
  --tone-high-bg: var(--mint-200);
  --tone-high-border: var(--mint-500);
  --tone-high-strong: var(--mint-500);

  /* Extra shadow recipe — softer than canonical --shadow-soft, used
     by grader's flat surface cards. Canonical --shadow-soft/-pop/-dark
     now apply unmodified from the import above. */
  --shadow-card: 0 1px 2px rgb(7 47 52 / 5%), 0 8px 24px rgb(7 47 52 / 6%);
  --shadow-small: var(--shadow-card);

  /* Extra easing curves — canonical --ease-out/--ease-in-out now
     apply unmodified from the import above. */
  --ease-enter: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-exit: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-float: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-soft: var(--ease-out);
  --dur-enter: 760ms;
  --dur-exit: 520ms;
  --dur-float: 6800ms;

  /* Extra spacing rungs — canonical tokens.css does not define these
     step sizes (it has --space-8: 3rem/48px then jumps to --space-10:
     4rem/64px). These values are grader-only and were previously
     mislabeled as if they matched a shared --space-7/8/9 scale, which
     they didn't (48px/64px/96px here vs canonical's 40px/48px at the
     same names). TODO(design): reconcile with @atrium/ui — either
     upstream these rungs into the canonical scale if other surfaces
     need them, or move grader to the nearest canonical step. */
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  --border-width: 1.5px;
}
```

**Step 2: Delete the now-dead `.primary-cta` rule**

While in this file, `apps/atrium.grader/app/grader-client.tsx` has zero usages of `className="primary-cta"` (verified by grep) — it's dead CSS. Find the `.primary-cta` rule (originally around line 599-604, now shifted after Step 1's edit — search for `.primary-cta`) and delete it:

```css
.primary-cta {
  background: var(--surface-dark);
  color: var(--cloud-300);
  padding: 0 26px;
  letter-spacing: 0.01em;
}

.primary-cta:hover {
  background: var(--surface-dark-raised);
  box-shadow: var(--shadow-pop);
  transform: translateY(-2px);
}

.primary-cta:active {
  transform: scale(var(--press-scale)) translateY(0);
  box-shadow: none;
}
```

Also remove `.primary-cta` from the shared selector list two rules above it:
```css
.search-button,
.primary-cta,
.secondary-cta {
```
becomes:
```css
.search-button,
.secondary-cta {
```

**Step 3: Visual regression pass**

This edit changes real values: type ramp (`--text-xs/sm/lg/xl` now ~0.02-0.03rem larger per step), line-heights (all `--leading-*` now slightly looser), `--tracking-tight` (was `0`, now inherits canonical `-0.02em`), `--shadow-soft` (was aliased to the tighter `--shadow-card` recipe, now the canonical softer/wider recipe). These are all in the direction of "matches the rest of the brand" but must be checked for layout breaks (text wrapping, overflow in tight card slots).

Run `bun run dev:grader` and manually walk through, comparing against the pre-change screenshots you should take first:
1. Search stage (homepage)
2. Loading/scanning stage (the collage animation)
3. Result/diagnostic report stage
4. Any place headings use `letter-spacing: var(--tracking-tight)` — confirm nothing overflows now that tracking tightened from 0 to -0.02em.

If something visibly breaks, fix it locally on the specific selector (e.g. add an explicit `letter-spacing: 0` override on that one rule) rather than reverting the global token — the goal is canonical-by-default, with narrow, deliberate, commented exceptions only where truly needed.

**Step 4: Typecheck, lint, build**

Run: `cd apps/atrium.grader && bun run typecheck && bunx biome check app/globals.css && bun run build`
Expected: all pass. (If Biome flags formatting-only issues, run `bun run lint:fix` from repo root.)

**Step 5: Commit**

```bash
git add apps/atrium.grader/app/globals.css
git commit -m "refactor(grader): remove duplicate token block, inherit from @atrium/ui

globals.css was redeclaring nearly every canonical token name with
hand-copied values that had already drifted (type ramp, line-heights,
tracking, shadow-soft). Grader now inherits those from the canonical
import and only locally defines tokens with no canonical counterpart."
```

---

### Task 4: Migrate grader's standalone reset button to `@atrium/ui`'s `Button`

**Context:** `.secondary-cta` (used once, `apps/atrium.grader/app/grader-client.tsx:851`) is a plain standalone button — a clean candidate to prove grader can consume `@atrium/ui` components instead of reimplementing them. (`.search-button` is intentionally **not** migrated here — it's a compound control fused to the right edge of the search input pill with a custom one-sided border-radius and a `margin: 6px` inset; `Button` doesn't model that shape. Leave it as bespoke CSS — that's a legitimate case for custom styling, not a duplication bug.)

**Files:**
- Modify: `apps/atrium.grader/app/grader-client.tsx`
- Modify: `apps/atrium.grader/app/globals.css` (delete now-unused `.secondary-cta` rules)

**Step 1: Import `Button` and replace the JSX**

In `apps/atrium.grader/app/grader-client.tsx`, add the import near the top with the other imports:
```ts
import { Button } from '@atrium/ui'
```

Find (around line 851):
```tsx
      <div className="result-actions">
        <button className="secondary-cta" onClick={onReset} type="button">
          Scan another restaurant
        </button>
      </div>
```

Replace with:
```tsx
      <div className="result-actions">
        <Button variant="outline" onClick={onReset} type="button">
          Scan another restaurant
        </Button>
      </div>
```

**Step 2: Delete the now-unused CSS**

In `apps/atrium.grader/app/globals.css`, delete:
```css
.secondary-cta {
  background: var(--surface);
  color: var(--ink);
  padding: 0 26px;
}

.secondary-cta:hover {
  border-color: var(--teal-500);
  background: var(--surface-soft);
  transform: translateY(-2px);
}

.secondary-cta:active {
  transform: scale(var(--press-scale)) translateY(0);
}
```
And update the shared selector (left over from Task 3 Step 2):
```css
.search-button,
.secondary-cta {
```
becomes:
```css
.search-button {
```
(its own declaration block below stays as-is — `.search-button` remains bespoke, on purpose).

**Step 3: Verify**

Run `bun run dev:grader`, complete a scan end-to-end, reach the result screen, confirm "Scan another restaurant" renders as a pill button matching the `outline` variant (teal border, transparent background, hover fills teal) and that clicking it resets state correctly (same `onReset` handler as before — behavior is unchanged, only presentation moved to the shared component).

Run: `cd apps/atrium.grader && bun run typecheck && bun run build`

**Step 4: Commit**

```bash
git add apps/atrium.grader/app/grader-client.tsx apps/atrium.grader/app/globals.css
git commit -m "refactor(grader): migrate reset button onto @atrium/ui Button

Proves out the pattern of consuming the shared component library
instead of hand-rolling CSS equivalents. search-button is left as
bespoke CSS — it's a compound control fused to the input pill, not a
standalone button, so Button doesn't model its shape."
```

---

## Phase 2 — P1: Tokenize hardcoded colors, close the a11y/theming gaps

### Task 5: Add a semantic danger/error color family to the canonical tokens

**Context:** `apps/atrium.grader/app/globals.css` has a one-off error palette (`#8e2f24`, `#fff5f4`, `#f0b3aa` at `.inline-message--error`) with no equivalent anywhere in `packages/ui/src/tokens/tokens.css` — error states aren't part of the documented, portable brand system.

**Files:**
- Modify: `packages/ui/src/tokens/tokens.css`
- Modify: `apps/atrium.grader/app/globals.css`

**Step 1: Add danger tokens to canonical**

In `packages/ui/src/tokens/tokens.css`, after the `/* ─── Semantic — lines & accents ─── */` block (around line 58), add:

```css
  /* ─── Semantic — status ───────────────────────────────────── */
  --danger-500:      #C0392B;
  --danger-bg:        #FFF5F4;
  --danger-border:    #F0B3AA;
  --danger-text:      #8E2F24;
```

**Step 2: Point grader's error message at the new tokens**

In `apps/atrium.grader/app/globals.css`, find:
```css
.inline-message--error {
  border-color: #f0b3aa;
  background: #fff5f4;
  color: #8e2f24;
}
```
Replace with:
```css
.inline-message--error {
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-text);
}
```

**Step 3: Verify + typecheck**

Trigger an error state in the grader search flow (e.g. submit an invalid query) and confirm the error message still renders identically (values are unchanged, just tokenized).
Run: `cd apps/atrium.grader && bun run typecheck && bun run build`

**Step 4: Commit**

```bash
git add packages/ui/src/tokens/tokens.css apps/atrium.grader/app/globals.css
git commit -m "feat(tokens): add semantic danger color family

Error states previously used one-off hex values with no brand-system
backing. Now portable via --danger-bg/-border/-text."
```

---

### Task 6: Tokenize Navbar's hardcoded overlay colors

**Files:**
- Modify: `apps/atrium.website/components/ui/Navbar.tsx`

**Step 1: Replace hardcoded rgba values**

Line 197-198 — header border/shadow, currently:
```tsx
        borderBottom: bgOpacity > 0.3 ? `1px solid rgba(228,238,240,${bgOpacity * 0.08})` : '1px solid transparent',
        boxShadow: bgOpacity > 0.6 ? `0 1px 24px rgba(4,32,36,${bgOpacity * 0.4})` : 'none',
```
These use dynamic alpha driven by scroll position, so they can't be static tokens — but the base colors should reference the palette instead of raw hex. Use `color-mix()` off the existing tokens:
```tsx
        borderBottom: bgOpacity > 0.3 ? `1px solid color-mix(in srgb, var(--cloud-300) ${bgOpacity * 8}%, transparent)` : '1px solid transparent',
        boxShadow: bgOpacity > 0.6 ? `0 1px 24px color-mix(in srgb, var(--teal-900) ${bgOpacity * 40}%, transparent)` : 'none',
```

Line 206 — backdrop tint:
```tsx
          background: `rgba(7,47,52,${bgOpacity})`,
```
becomes:
```tsx
          background: `color-mix(in srgb, var(--teal-800) ${bgOpacity * 100}%, transparent)`,
```

Line 298 — mega-menu scrim:
```tsx
          background: 'rgba(4,32,36,0.55)',
```
becomes:
```tsx
          background: 'color-mix(in srgb, var(--teal-900) 55%, transparent)',
```

Line 135-137 — `ServiceItem` icon chip background:
```tsx
        style={{
          background: 'rgba(181,242,219,0.09)',
          color: 'var(--color-accent)',
        }}
```
becomes:
```tsx
        style={{
          background: 'color-mix(in srgb, var(--mint-400) 9%, transparent)',
          color: 'var(--color-accent)',
        }}
```
And its Tailwind hover class:
```tsx
      className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[rgba(181,242,219,0.18)]"
```
becomes:
```tsx
      className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[color-mix(in_srgb,var(--mint-400)_18%,transparent)]"
```

Line 321 — mega-menu panel inline shadow (duplicates and diverges from `--shadow-dark`):
```tsx
              boxShadow: '0 24px 80px rgba(4,32,36,0.7)',
```
becomes:
```tsx
              boxShadow: 'var(--shadow-dark)',
```
(this also folds in the P2 "radius/shadow drift" finding for this element — one edit, two audit line items resolved.)

**Step 2: Verify**

Run `bun run dev:website`, scroll the homepage past the hero to confirm the navbar's scroll-driven background/border/blur transition still animates smoothly and looks the same. Open the services mega-menu and confirm the scrim and panel shadow still render correctly. Hover a mega-menu service row and confirm the icon chip still tints mint on hover.

**Step 3: Typecheck + build**

Run: `cd apps/atrium.website && bun run typecheck && bun run build`

**Step 4: Commit**

```bash
git add apps/atrium.website/components/ui/Navbar.tsx
git commit -m "refactor(website): tokenize Navbar's hardcoded overlay colors

Replaces raw rgba() literals with color-mix() off existing brand
tokens so overlay tints stay in sync with palette changes."
```

---

### Task 7: Tokenize ServiceThesis's hardcoded overlay colors

**Files:**
- Modify: `apps/atrium.website/components/services/ServiceThesis.tsx`

**Step 1: Replace hardcoded rgba values**

Line 36 — photo panel gradient:
```tsx
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(4,32,36,0.24)), var(--surface-atmos)',
```
becomes:
```tsx
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--cloud-100) 20%, transparent), color-mix(in srgb, var(--teal-900) 24%, transparent)), var(--surface-atmos)',
```

Line 55-57 — floating browser-chrome card:
```tsx
              border: '1px solid rgba(255,255,255,0.48)',
              borderRadius: '1.8rem',
              background: 'rgba(255,255,255,0.76)',
```
becomes:
```tsx
              border: '1px solid color-mix(in srgb, var(--cloud-100) 48%, transparent)',
              borderRadius: 'var(--radius-lg)',
              background: 'color-mix(in srgb, var(--cloud-100) 76%, transparent)',
```
(`1.8rem` ≈ `--radius-lg`'s `22px`/`1.375rem` is not an exact match — check visually after the swap; if the slightly smaller radius reads as noticeably tighter, keep `1.8rem` but leave a comment `/* intentionally larger than --radius-lg for this floating-card effect */` rather than silently forcing the token.)

Line 74-75 — perk tile gradients:
```tsx
                    background: index % 2 === 1
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(7,47,52,0.58)), var(--surface-atmos-deep)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(7,47,52,0.38)), var(--grad-aurora)',
```
becomes:
```tsx
                    background: index % 2 === 1
                      ? 'linear-gradient(180deg, color-mix(in srgb, var(--cloud-100) 6%, transparent), color-mix(in srgb, var(--teal-800) 58%, transparent)), var(--surface-atmos-deep)'
                      : 'linear-gradient(180deg, color-mix(in srgb, var(--cloud-100) 5%, transparent), color-mix(in srgb, var(--teal-800) 38%, transparent)), var(--grad-aurora)',
```

**Step 2: Verify**

Run `bun run dev:website`, open any `/services/[slug]` page, confirm the hero thesis panel's floating "browser chrome" card and perk-tile grid still render with the same visual weight (glassy white panel over a teal/mint photographic gradient).

**Step 3: Typecheck + build**

Run: `cd apps/atrium.website && bun run typecheck && bun run build`

**Step 4: Commit**

```bash
git add apps/atrium.website/components/services/ServiceThesis.tsx
git commit -m "refactor(website): tokenize ServiceThesis's hardcoded overlay colors"
```

---

### Task 8: Name the services pillar colors as tokens, tokenize the divider

**Context:** `apps/atrium.website/app/services/page.tsx:17,24,31,61-63` repeats three hex literals (`#B5F2DB`, `#D69445`, `#5ABABC`) twice in the same file. `#B5F2DB` is exactly `--mint-400` already — the other two are intentionally distinct "pillar identity" colors with no existing brand-token equivalent (this is fine — a 3-pillar page can have its own accent triad — but they should be named constants, not copy-pasted literals). Also fixes the `borderLeft` divider hardcoding a raw alpha color (flagged in the audit as borderline the banned accent-stripe anti-pattern — it's a plain 1px column divider today, not a colored stripe, but should still pull from a token so it doesn't quietly grow into one).

**Files:**
- Modify: `apps/atrium.website/app/services/page.tsx`

**Step 1: Extract the pillar colors into the `PILLARS` data instead of hardcoding twice**

The colors are already stored per-pillar in the `PILLARS` array (`color: '#B5F2DB'` etc. at lines 17, 24, 31) and consumed correctly via `p.color`/`cat.color` everywhere **except** the hero headline at lines 61-63, which duplicates the literals inline:
```tsx
              <span style={{ color: '#B5F2DB' }}>Generate.</span>{' '}
              <span style={{ color: '#D69445' }}>Convert.</span>{' '}
              <span style={{ color: '#5ABABC' }}>Retain.</span>
```
Replace with references to the same data the rest of the page already uses:
```tsx
              <span style={{ color: PILLARS[0].color }}>Generate.</span>{' '}
              <span style={{ color: PILLARS[1].color }}>Convert.</span>{' '}
              <span style={{ color: PILLARS[2].color }}>Retain.</span>
```
Then update the `PILLARS` array's first entry to use the token instead of its hex duplicate (they're identical values, this makes the tie to the brand palette explicit):
```tsx
  {
    num: '01',
    id: 'Generate Demand',
    color: 'var(--mint-400)',
    ...
```
Leave `#D69445` and `#5ABABC` as-is in the `PILLARS` array (single declaration, no duplication) — they're deliberate page-specific accent colors, not tokens to invent for a one-page use.

**Step 2: Tokenize the divider**

Line 84:
```tsx
                borderLeft: i > 0 ? '1px solid rgba(228,238,240,0.08)' : undefined,
```
becomes:
```tsx
                borderLeft: i > 0 ? '1px solid color-mix(in srgb, var(--cloud-300) 8%, transparent)' : undefined,
```

**Step 3: Verify**

Run `bun run dev:website`, open `/services`, confirm the hero headline "Generate. Convert. Retain." still shows the same three colors, and the three-column pillar divider still renders as a subtle 1px line.

**Step 4: Typecheck + build**

Run: `cd apps/atrium.website && bun run typecheck && bun run build`

**Step 5: Commit**

```bash
git add apps/atrium.website/app/services/page.tsx
git commit -m "refactor(website): dedupe services page pillar colors, tokenize divider"
```

---

### Task 9: Fix sub-44px touch targets

**Context:** Both pass the strict WCAG 2.5.8 (AA) 24×24px minimum, but fall short of the 44×44px comfortable-target guidance for primary interactive controls — worth fixing since one is the primary mobile navigation trigger.

**Files:**
- Modify: `apps/atrium.website/components/ui/Navbar.tsx:271`
- Modify: `apps/atrium.grader/app/globals.css:890-891`

**Step 1: Navbar hamburger — 36px → 44px**

Line 271:
```tsx
          className="flex justify-center items-center -mr-1 w-9 h-9 md:hidden"
```
becomes:
```tsx
          className="flex justify-center items-center -mr-1.5 w-11 h-11 md:hidden"
```
(`w-9 h-9` = 36px → `w-11 h-11` = 44px; `-mr-1` → `-mr-1.5` keeps the icon's optical position roughly aligned with the header's right edge padding since the tap target grew by 8px.)

**Step 2: Grader social-handle inputs — 38px → 44px**

`apps/atrium.grader/app/globals.css`:
```css
.social-handle-field input {
  min-height: 38px;
```
becomes:
```css
.social-handle-field input {
  min-height: 44px;
```

**Step 3: Verify**

Run `bun run dev:website`, resize viewport to mobile width, confirm the hamburger button is visibly larger but the icon itself (the two lines) still looks proportionate and centered, and it still toggles the mobile menu correctly.
Run `bun run dev:grader`, reach the social-handles step of the scan flow, confirm the three input fields (Instagram/Facebook/etc.) are slightly taller but the 3-column grid layout doesn't overflow or wrap awkwardly — check at a narrow mobile width specifically, since `.social-handles-grid` is `grid-template-columns: repeat(3, minmax(0, 1fr))`.

**Step 4: Typecheck + build**

Run both apps' `typecheck` + `build`.

**Step 5: Commit**

```bash
git add apps/atrium.website/components/ui/Navbar.tsx apps/atrium.grader/app/globals.css
git commit -m "fix(a11y): bring hamburger menu and social-handle inputs to 44px touch target"
```

---

## Phase 3 — P2: Spacing/radius cleanup, blur tokens (do after Phase 1-2 land and look right)

### Task 10: Replace ServiceBento's Tailwind arbitrary spacing values with tokens

**Files:**
- Modify: `apps/atrium.website/components/services/ServiceBento.tsx`
- Modify: `apps/atrium.website/components/services/CategoryBadge.tsx`

**Step 1: Map each arbitrary value to the nearest `--space-*`/`--text-*` token**

`ServiceBento.tsx` uses `p-[1.65rem]` (6 times), `gap-[0.9rem]` (4 times), `min-h-[37rem]`/`min-h-[30rem]`, `px-[0.85rem] py-[0.62rem]`, `gap-[1rem]` at the section/grid level. None map exactly onto the canonical scale (`--space-5: 1.5rem`, `--space-6: 2rem` bracket `1.65rem` on both sides with no exact rung). Rather than force an inexact fit that changes the layout's actual density, add the two missing rungs to `apps/atrium.website/app/globals.css`'s `@theme inline` block so Tailwind generates real utility classes for them, instead of inline arbitrary values scattered across the file:

```css
@theme inline {
  --color-background: var(--cloud-200);
  --color-foreground: var(--ink-700);
  --font-sans: var(--font-sans);
  --spacing-4-5: 1.65rem;
  --spacing-3-5: 0.9rem;
}
```
This makes `p-4-5` and `gap-3-5` real Tailwind utilities backed by named tokens instead of `p-[1.65rem]`/`gap-[0.9rem]` arbitrary escapes repeated 10 times across the file. Do a find-and-replace within `ServiceBento.tsx`:
- `p-[1.65rem]` → `p-4-5`
- `gap-[0.9rem]` → `gap-3-5`

Leave `min-h-[37rem]`, `min-h-[30rem]`, `px-[0.85rem]`, `py-[0.62rem]` as arbitrary values — they're one-off sizes specific to this card layout, not part of a repeating pattern, and forcing them onto the 4pt scale would change the card's proportions without a design reason to.

**Step 2: Migrate `CategoryBadge` onto `@atrium/ui`'s `Badge`**

Current `apps/atrium.website/components/services/CategoryBadge.tsx`:
```tsx
import { CATEGORY_COLOR } from './utils'

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-flex items-center w-fit rounded-full text-xs font-semibold leading-none px-3 py-[0.55rem]"
      style={{
        background: `color-mix(in srgb, ${CATEGORY_COLOR[category]} 72%, white)`,
        color: 'var(--teal-800)',
      }}
    >
      {category}
    </span>
  )
}
```
`Badge` (from `packages/ui/src/components/Badge.tsx`) takes a `tone` prop with 5 fixed tones, not an arbitrary per-category color-mix — so a direct swap isn't possible without either extending `Badge` or losing the per-category coloring. Given `CATEGORY_COLOR` drives real per-category branding (not something `Badge`'s fixed tones support), **do not force this migration** — leave `CategoryBadge` as its own component, but fix its one token gap:
```tsx
      className="inline-flex items-center w-fit rounded-full text-xs font-semibold leading-none px-3 py-[0.55rem]"
```
becomes:
```tsx
      className="inline-flex items-center w-fit rounded-full text-xs font-semibold leading-none px-3 py-2"
```
(`py-[0.55rem]` (8.8px) → `py-2` (8px, Tailwind's built-in scale) — close enough to be visually identical, removes the arbitrary-value escape.)

**Step 3: Verify**

Run `bun run dev:website`, open `/services`, confirm the bento card grid still renders with the same padding/gap rhythm, and category badges are visually unchanged.

**Step 4: Typecheck + build**

Run: `cd apps/atrium.website && bun run typecheck && bun run build`

**Step 5: Commit**

```bash
git add apps/atrium.website/app/globals.css apps/atrium.website/components/services/ServiceBento.tsx apps/atrium.website/components/services/CategoryBadge.tsx
git commit -m "refactor(website): replace repeated Tailwind arbitrary spacing with named scale tokens"
```

---

### Task 11: Fix Navbar mega-menu radius drift

**Files:**
- Modify: `apps/atrium.website/components/ui/Navbar.tsx:317`

**Step 1**

Line 317:
```tsx
            className="flex overflow-hidden w-full max-w-5xl rounded-2xl border shadow-2xl"
```
becomes:
```tsx
            className="flex overflow-hidden w-full max-w-5xl rounded-[var(--radius-lg)] border"
```
(`shadow-2xl` Tailwind default is superseded by the `boxShadow: 'var(--shadow-dark)'` inline style already fixed in Task 6 Step 1 — drop the now-redundant/conflicting Tailwind shadow class so there's a single source for that panel's shadow.)

**Step 2: Verify**

Run `bun run dev:website`, open the services mega-menu, confirm the panel's corner radius and shadow look the same as before (both were already close to the token values — `rounded-2xl` was 16px vs `--radius-lg` 22px, a subtle difference).

**Step 3: Typecheck + build, then commit**

```bash
git add apps/atrium.website/components/ui/Navbar.tsx
git commit -m "refactor(website): use --radius-lg token for mega-menu panel instead of Tailwind default"
```

---

### Task 12: Standardize blur intensity behind a shared token

**Context:** 5+ surfaces use ad hoc `blur(4px)` through `blur(18px)` with no shared scale. Per the brand's own guidance ("transparency/blur used lightly... avoid heavy glassmorphism"), pick a small, deliberate scale rather than leaving every surface to invent its own.

**Files:**
- Modify: `packages/ui/src/tokens/tokens.css`
- Modify: `apps/atrium.website/components/ui/Navbar.tsx` (lines 207-208, 299-300)
- Modify: `apps/atrium.grader/app/globals.css` (`.suggestion-list`, `.selected-inline`, `.loading-card` blur rules)

**Step 1: Add blur tokens to canonical**

In `packages/ui/src/tokens/tokens.css`, near the `--focus-ring` line, add:
```css
  --blur-sm: 4px;
  --blur-md: 10px;
  --blur-lg: 18px;
```

**Step 2: Point each usage at the nearest tier**

- Navbar scroll-driven header blur (line 207-208, currently `Math.round(bgOpacity * 14)}px` dynamic) — leave dynamic (it's intentionally animated 0→14px), but cap it at the `--blur-md` value by changing the multiplier base to reference the token in a comment for future maintainers; no functional change needed here since it's the one legitimately-dynamic case.
- Mega-menu scrim blur (line 299-300): `blur(10px)` → already matches `--blur-md`; replace literal with `var(--blur-md)`.
- Grader `.suggestion-list`, `.selected-inline` (`blur(18px)`): replace with `var(--blur-lg)`.
- Grader `.loading-card` (`blur(14px)`): closest tier is `--blur-md` (10px) or introduce nothing new — round down to `var(--blur-md)` and check visually; if the card looks meaningfully less frosted, that's fine, it's more in line with the brand's "used lightly" guidance anyway.

**Step 3: Verify visually across both apps, typecheck, build, commit.**

```bash
git add packages/ui/src/tokens/tokens.css apps/atrium.website/components/ui/Navbar.tsx apps/atrium.grader/app/globals.css
git commit -m "refactor(design-system): standardize blur intensity behind --blur-sm/md/lg tokens"
```

---

### Task 13: Re-run the audit

**Step 1**

Once Phases 1-3 are committed, re-run the `/audit` skill (design-system scope) to confirm the score improved and no new drift was introduced by these edits. Compare against the 2026-07-08 baseline (11/20 — Acceptable) documented at the top of this effort.

**Step 2**

Do not commit anything in this task — it's a verification checkpoint only.

---

## Explicitly out of scope (follow-up work, not this plan)

- **Full migration of `apps/atrium.grader/app/globals.css`'s ~4000 lines onto `@atrium/ui` components.** Task 3 fixed the token-drift root cause; Task 4 proved the component-migration pattern on one clean case. The remaining `.scan-tile`/`.diagnostic-*`/`.loading-*` classes have bespoke CSS Grid `grid-area` layouts that `Card` doesn't model — migrating them safely needs either extending `Card` to support `gridArea`/named-area composition, or accepting they stay bespoke. That's a design + engineering decision, not a mechanical refactor — flag for a follow-up plan once Phase 1-3 here are stable in production.
- **Adopting or retiring the unused `.atr-bento-card`/`.atr-aurora`/`.atr-marker` utility classes** in `packages/ui/src/tokens/tokens.css`. They're dead code today (0 usages in either app). Deciding whether to wire `ServiceBento.tsx`'s 5 card variants onto `.atr-bento-card` (visual risk: it's a fixed aurora-gradient look, not this page's actual multi-tone card system) or delete the unused utilities from the token package needs a design call, not a blind pick.
- **Reconciling grader's `--space-7/-8/-9`** (48/64/96px) against canonical's scale (40/48px at the same names, no `-9` at all) — flagged with a `TODO(design)` comment in Task 3 rather than silently picked. Needs a design decision on the actual intended step sizes before either app's spacing changes visually.
- **Unifying the two apps' script-font variable names** (`website` uses `--font-script` directly in its `next/font/local` call; `grader` uses `--font-handwriting` then aliases it to `--font-script` locally). Harmless today because it's wired correctly in both places, but worth a naming cleanup so a future engineer doesn't have to discover the alias.
