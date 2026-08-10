# Website Design System Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/atrium.website` on the design system defined in `packages/ui` — components, typography, colour and layout patterns — page by page, each page finished before the next begins.

**Depth:** Redesign, not reskin. Sections adopt the grader's language: cards with large radii, headings at weight 400 with a serif-italic accent, and pills. Grounds alternate in bands of cream and dark — see the conventions below; there are no white grounds.

**Tech Stack:** Next.js 16 (Turbopack), React 19, Tailwind v4, `@atrium/ui`, Bun workspaces, Biome.

## Starting state

- `packages/ui` ships `theme.css`, `styles.css` and eight primitives: `Button`, `Card`, `Tag`, `Input`, `Eyebrow`, `Meter`, `Stat`, `Logo`.
- The website registers the theme via `@import "@atrium/ui/styles.css"` plus `@source` (commit `8118976`), so the system's utilities are available.
- `packages/ui/src/compat.css` repoints the legacy raw palette at the new values. **Keep it until the last file stops referencing legacy tokens.** It is what keeps unmigrated pages looking right while migrated ones move ahead; without it the site is visibly split for the duration.
- Still legacy: 755 `var(--)` references, 444 inline `style={{}}` blocks across 63 files, and seven `.type-*` classes used in about 30 files.
- The website still imports `Button` and `Eyebrow` from `@atrium/ui/legacy`.

## Global Constraints

- Tailwind v4 only. No `tailwind.config.js`.
- Heading weights are 400 and 500. Eyebrows and small uppercase labels are 600. Nothing is 700 or 800.
- One serif-italic accent per composition — never two.
- The border token is `--color-line`; the utility is `border-line` / `ring-line`.
- Custom breakpoints are 560, 700 and 980, as arbitrary variants (`max-[560px]:`).
- No new inline `style={{}}`. Existing ones are removed as their file is migrated; the only survivors are values computed at runtime from data.
- No component may default to an editorial accent (`coral`, `lilac`, `sage`, `periwinkle`). Those are campaign rotation: one leads, one supports, the rest stay in reserve.
- Every task ends green: `bun run typecheck`, `bunx biome check .`, and `bun run build` in `apps/atrium.website`.
- No task edits `packages/ui/src/legacy/`. Those nine components are frozen.

## Conventions every task follows

These replace the old vocabulary. Stated once here rather than repeated per task.

**Typography.** Retire the `.type-*` classes as each file is migrated:

| Legacy class | Replacement |
|---|---|
| `.type-page-title` | `text-[clamp(2.6rem,6vw,4.6rem)] font-normal leading-[1.02] tracking-[-0.02em]` |
| `.type-section-title` | `text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em]` |
| `.type-card-title` | `text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15]` |
| `.type-lead` | `text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body` |
| `.type-body` | `text-base leading-relaxed text-body` |
| `.type-caption` | `text-[0.875rem] text-muted` |
| `.type-eyebrow` | the `Eyebrow` primitive |

The serif accent is `<em className="font-serif italic">`, once per section. **It carries no colour** — the italic already marks it, and a second colour inside a heading reads as an inconsistency. Every heading is one colour.

Every `h3` uses the card-title treatment: one size, one weight (500). Do not introduce a second heading scale at the same level.

**Colour.** `--teal-800` / `--text-strong` become `text-ink`; `--text-muted` / `--teal-500` become `text-muted`; `--ink-700` / `--text-body` become `text-body`; `--surface-page` becomes `bg-cream`; `--cloud-100` / `--surface-card` become `bg-card`; `--mint-400` becomes `text-mint` or `bg-mint`; `--amber-500` becomes `bg-amber`; borders become `border-line`.

**Grounds alternate in bands.** This replaces the earlier "dark sections become cards" rule, which home tried and the owner rejected. A page alternates *groups* of sections, not every section: a dark opening, a run of cream, a dark band, a run of cream, a dark close. Home's settled rhythm is dark(1) / cream(5) / dark(3) / cream(3) / dark(1) — use it as the reference for pacing.

**There are no white grounds.** `bg-card` is for cards sitting on a ground, never for a section ground. Light sections are `bg-cream`; dark sections are `bg-dark`.

**Inverting a ground is not a background swap.** Every inverted section needs its contents inverted too: headings and body to `text-cream`, `Eyebrow` to `tone="on-dark"`, hairlines to `border-cream/20` (never `border-line`, which is a dark hairline for light grounds). `text-ink`, `text-body` and `text-muted` are invisible on dark. Compute the contrast of every text colour against its new ground before committing — large text needs 3:1, body 4.5:1.

**Components.** `<button>` and `<a>`-styled-as-button become `Button`. Bordered boxes become `Card`. Pills and labels become `Tag`. Form fields become `Input`. Numeric callouts become `Stat`. Score or progress bars become `Meter`. Internal navigation keeps its `TransitionLink` / `TransitionCTA` wrapper; the primary CTA stays a plain `Button` because it points at Cal.com externally.

**Per-task verification.** Every task ends with a browser check at 375, 768 and 1280: no horizontal overflow, no unstyled element, no mint-on-cream or ink-on-ink contrast failure, and every interactive element reachable and visibly focused.

---

### Task 1: Home — DONE (commits `bc4adf9`, `a7c2c8e`, `4b92db2`, `8099e56`, `505c8c4`)

**Files:** `app/page.tsx`, `components/sections/HeroSection.tsx`, `components/sections/BrandMarquee.tsx`, `components/sections/BentoGrid.tsx`, `components/sections/AudiencePaths.tsx`, `components/sections/WorkGrid.tsx`, `components/sections/GrowthEngineDiagram.tsx`

The home page is the reference for every page after it. Decisions made here — how a dark hero resolves, how the bento grid becomes cards, how the marquee sits on cream — become the pattern the rest of the plan follows.

- [x] Migrate the hero: retire `.type-page-title`, apply the heading scale, keep one serif-italic accent, replace the CTA pair with `Button` (`primary` external, `secondary` internal wrapped in `TransitionCTA`).
- [x] Convert `BentoGrid`'s dark tiles to `Card` with `tone="dark"` only where the tile earns it; the rest become `surface` or `warm` on cream.
- [x] Replace every `style={{}}` colour with a utility; leave only runtime-computed values.
- [x] Retire the `.type-*` classes in these files.
- [x] Verify at 375, 768, 1280.
- [x] Commit.

---

## What Task 1 uncovered — read this before starting any page

Three of the four defects home surfaced were the system's, not the page's. Expect the same ratio on every page: budget for system fixes, not just migration.

**`@layer` decides who wins, not specificity.** `app/globals.css` had its base element block unlayered, and unlayered CSS beats every layered rule. `:where(h1,h2,h3,h4) { color: inherit }` was silently defeating `text-*` on every heading site-wide — the hero shipped at 1.63:1 contrast and passed every automated gate. Fixed in `a7c2c8e`. If a utility "does nothing", check for an unlayered rule before doubting the utility.

**The legacy radius tokens collide with Tailwind's radius scale.** `tokens.css` defines `--radius-sm/md/lg/xl` at `:root`, and Tailwind v4's `rounded-sm/md/lg/xl` read those same variable names. So `rounded-xl` resolves to `32px`, not Tailwind's `12px`. Use the system's own `rounded-card` (26px) and `rounded-card-sm` (18px), or arbitrary values. This trap disappears when `tokens.css` goes in Task 7.

**mint is an on-dark colour only.** It is 1.19:1 on cream — invisible. Anything mint that lands on a light ground must become `text-green`.

**The legacy `ghost` Button variant has a transparent border.** On a light ground it renders as bare text with no button affordance. Use `outline` on light, `primary` on dark.

**`--color-muted` moved to `#5f6e67`** (was `#78877f`, which failed at 3.34:1 on cream). Both `theme.css` and compat's `--teal-500` carry it. Do not reintroduce the lighter value.

### System gaps still open

These will be hit again. Fixing the primitive beats patching each page:

- **`Tag` has no on-dark tone.** Home has 16 hand-rolled pills because of it, several on dark grounds. Add the tone before a page needs pills on dark again.
- **`Card` has no padding prop.** Its padding is fixed at 34px, too roomy for compact cards, so compact cards get hand-rolled from `rounded-card-sm bg-card shadow-soft`. Add the prop and those stop being bespoke.
- **`Logo` is unused** — the navbar still renders a raw `<img>`. Task 6.
- **`NumberReel` now exists** (`8099e56`) for large display figures, and rolls its digits on scroll. Use it for any big number; home has twelve.

### Task 2: Services

**Files:** `app/services/page.tsx`, `app/services/[slug]/page.tsx`, `components/services/ServiceEditorialHero.tsx`, `ServiceSystemMap.tsx`, `ServiceStatsEditorial.tsx`, `components/sections/ServiceTimeline.tsx`, `IconGrid.tsx`

Five of the seventeen dark sections live here. `ServiceStatsEditorial` is the natural home for `Stat`.

### Task 3: Work

**Files:** `app/work/page.tsx`, `app/work/[slug]/page.tsx`, `components/sections/CaseStudyCovers.tsx`, and the case-study section components

The results section on `--teal-900` becomes cards. Metrics become `Stat`.

### Task 4: About, Process, Pricing

**Files:** `app/about/page.tsx`, `app/process/page.tsx`, `app/pricing/page.tsx`, `components/sections/DarkProcess.tsx`, `PurchaseFAQ.tsx`

Pricing's highlighted middle tier currently inverts to a dark ground; it becomes a `Card` with a stronger elevation instead. `DarkProcess` is the section whose name is its own argument — it needs the most thought.

### Task 5: Contact and Resources

**Files:** `app/contact/page.tsx`, `app/resources/page.tsx`

The contact form is the first real consumer of `Input`.

### Task 6: Chrome and shared sections

**Files:** `components/ui/Navbar.tsx`, `components/sections/CTABanner.tsx`, `components/pages/PageHero.tsx`, `components/sections/SplitSection.tsx`, the footer

Deliberately last. `PageHero` renders on every subpage, so migrating it earlier would force its design before the pages that use it are settled.

### Task 7: Remove the scaffolding

- [ ] Confirm no file references a legacy token: `grep -r "var(--teal-\|var(--cloud-\|var(--mint-\|var(--ink-700\|type-page-title\|type-section-title\|type-card-title\|type-lead\|type-body\|type-caption\|type-eyebrow" apps/atrium.website` returns nothing.
- [ ] Delete `packages/ui/src/compat.css` and its import and export entry.
- [ ] Delete the legacy `:root` alias block and the `.type-*` rules from `app/globals.css`.
- [ ] Repoint `components/ui/{Button,Eyebrow}.tsx` from `@atrium/ui/legacy` to `@atrium/ui`, or delete them and import the primitives directly.
- [ ] Delete `packages/ui/src/legacy/`, `legacy.ts`, its export entry, and `packages/ui/src/tokens/tokens.css`.
- [ ] Full build of both apps.

## Risks

**The compat layer hides mistakes.** A file that still references `--teal-800` looks correct because compat repaints it. The only reliable check that a file is actually migrated is the grep in Task 7, not the rendered result. Run it per task, scoped to that task's files.

**`PageHero` couples every subpage.** It is migrated last on purpose. Until then, subpages keep a dark hero while their bodies turn warm. That intermediate state is expected and should not be "fixed" ahead of Task 6.

**Seventeen dark sections is the real work.** Retiring the alternating dark/light rhythm removes the device the site currently uses to separate sections. Each one needs a replacement — card grouping, spacing, or a hairline — not just a background swap. This is the part of the plan most likely to need a second pass.
