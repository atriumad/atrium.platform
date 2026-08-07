# Website Design System Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/atrium.website` on the design system defined in `packages/ui` — components, typography, colour and layout patterns — page by page, each page finished before the next begins.

**Depth:** Redesign, not reskin. Sections adopt the grader's language: cards with large radii on warm ground, headings at weight 400 with a serif-italic accent, pills, and hierarchy expressed through cards rather than alternating dark blocks.

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
| `.type-section-title` | `text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em]` |
| `.type-card-title` | `text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15]` |
| `.type-lead` | `text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body` |
| `.type-body` | `text-base leading-relaxed text-body` |
| `.type-caption` | `text-[0.875rem] text-muted` |
| `.type-eyebrow` | the `Eyebrow` primitive |

The serif accent is `<em className="font-serif italic text-green">`, once per section.

**Colour.** `--teal-800` / `--text-strong` become `text-ink`; `--text-muted` / `--teal-500` become `text-muted`; `--ink-700` / `--text-body` become `text-body`; `--surface-page` becomes `bg-cream`; `--cloud-100` / `--surface-card` become `bg-card`; `--mint-400` becomes `text-mint` or `bg-mint`; `--amber-500` becomes `bg-amber`; borders become `border-line`.

**Dark sections become cards.** The seventeen sections currently on `--teal-800` / `--teal-900` grounds are the substance of this redesign. Each becomes either a `Card` on cream, or a full-bleed cream section whose hierarchy comes from cards rather than from an inverted ground. Where a dark ground genuinely earns its place — a single hero or a closing CTA — use `<Card tone="dark">` and switch its eyebrows to `tone="on-dark"`. Do not leave a dark section reading mint-on-teal.

**Components.** `<button>` and `<a>`-styled-as-button become `Button`. Bordered boxes become `Card`. Pills and labels become `Tag`. Form fields become `Input`. Numeric callouts become `Stat`. Score or progress bars become `Meter`. Internal navigation keeps its `TransitionLink` / `TransitionCTA` wrapper; the primary CTA stays a plain `Button` because it points at Cal.com externally.

**Per-task verification.** Every task ends with a browser check at 375, 768 and 1280: no horizontal overflow, no unstyled element, no mint-on-cream or ink-on-ink contrast failure, and every interactive element reachable and visibly focused.

---

### Task 1: Home

**Files:** `app/page.tsx`, `components/sections/HeroSection.tsx`, `components/sections/BrandMarquee.tsx`, `components/sections/BentoGrid.tsx`, `components/sections/AudiencePaths.tsx`, `components/sections/WorkGrid.tsx`, `components/sections/GrowthEngineDiagram.tsx`

The home page is the reference for every page after it. Decisions made here — how a dark hero resolves, how the bento grid becomes cards, how the marquee sits on cream — become the pattern the rest of the plan follows.

- [ ] Migrate the hero: retire `.type-page-title`, apply the heading scale, keep one serif-italic accent, replace the CTA pair with `Button` (`primary` external, `secondary` internal wrapped in `TransitionCTA`).
- [ ] Convert `BentoGrid`'s dark tiles to `Card` with `tone="dark"` only where the tile earns it; the rest become `surface` or `warm` on cream.
- [ ] Replace every `style={{}}` colour with a utility; leave only runtime-computed values.
- [ ] Retire the `.type-*` classes in these files.
- [ ] Verify at 375, 768, 1280.
- [ ] Commit.

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
