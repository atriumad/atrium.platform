# Website Pages Completion — Design

**Date:** 2026-07-10
**App:** `apps/atrium.website`
**Goal:** Build the remaining pages so the site is complete and has no dead nav/home links, then do a visual QA pass. Content source of truth: `apps/atrium.website/docs/Atrium_Website-V1.md`.

## Context

The website currently ships: `/` (home), `/services`, `/services/[slug]` (12 services). Everything else referenced by the navbar, footer, and homepage is a dead link: `/work`, `/work/[slug]`, `/about`, `/pricing`, `/resources`, `/contact`, plus a stray `/process` link on the home page.

Architecture already in place (follow it exactly):
- Pages compose **section components**; content lives in **typed data files** (`lib/services.ts` is the model).
- Imagery uses **descriptive color/alt-text placeholders** (all real media is Dropbox-only). `WorkGrid` is the reference — colored tiles, no `<img>`.
- Styling: Tailwind + CSS-var design tokens (`var(--color-*)`, `var(--surface-*)`).
- `apps/atrium.website/AGENTS.md`: this Next.js has breaking changes — read `node_modules/next/dist/docs/` before writing route/`generateStaticParams`/`generateMetadata` code. Mirror the existing `/services/[slug]/page.tsx` conventions (async `params: Promise<{slug}>`).

## Decisions (locked with user)

1. **`/work` index:** show only the **10 case studies that have real content**. No "coming soon" placeholders. The 6 clients without content (Palacana, Foxx, KC Jazz, Tacos Borrachos, Pigwich, FFRB) are omitted.
2. **`/process`:** remove the "See the process" CTA from the `DarkProcess` block on the home page (no `/process` page).
3. **`/contact`:** build a contact page with brand headline + a form UI (no backend wired) + placeholder email/phone the user fills later.
4. **`/resources`:** listing stub — 3 sections (Blog / Guides / Customer Stories) as cards using the titles from the doc. No article detail pages.

## Pages

### 1. `/work` — Case Studies index
- Hero: eyebrow "OUR WORK", headline "Our Work", body "Hospitality only. Results first."
- Grid of 10 case-study cards (reuse `WorkGrid` visual language: number, client, one-line result, colored tile, hover lift). Link → `/work/[slug]`.
- Closing CTA banner ("Let's Talk" → `/contact`).

### 2. `/work/[slug]` — Case Study detail
New data model in `lib/work.ts`:

```ts
export type CaseMetric = { number: string; label: string }
export type CaseStudy = {
  slug: string
  client: string
  location?: string
  category: string            // e.g. "Full-Service Engagement"
  serviceTags: string[]
  resultHeadline: string      // hero headline
  intro?: string              // hero sub / lead
  story: string[]             // paragraphs (challenge → strategy → outcome)
  metrics: CaseMetric[]       // 3–8 big numbers
  howWeDidIt?: { title: string; body: string }[]
  scope?: { label: string; items: string[] }[]
  quote?: { text: string; name: string; role: string }  // optional; placeholder if none
  takeaway?: string
  order: number               // controls index ordering
}
```

Page section flow (reuse/extend existing editorial components where possible):
`Hero (cover placeholder + client + resultHeadline + serviceTags)` → `Story (rich text block)` → `Results (metrics grid — reuse StatsStrip/ServiceStatsEditorial styling)` → `How We Did It (optional numbered/step list)` → `Scope (optional two-column list)` → `Quote (optional pull quote)` → `Next case study` → CTA banner.

Not every case study has every section — render conditionally. Two content shapes exist and both map onto this model:
- **Metric-heavy** (T'ÄHÄ, Aahaa, DCOP, OSPZ, CHWF, JECA, Taco Naco): full metrics + How We Did It + scope.
- **Narrative** (Hotel KC, Town Company, Grand Coffee): challenge/solution/deliverables/outcomes → mapped into `story` + `metrics` (Hotel KC has "250K+ reach"; Grand Coffee has no hard metrics → skip metrics, use brand pillars as `howWeDidIt`).

The 10 slugs + result headlines come verbatim from the doc (`scratchpad/content-clean.md` lines ~1090–1748). Quotes: only Taco Naco has a named (placeholder) quote in the doc → use a clearly-marked placeholder; others omit the quote section.

### 3. `/about`
- **Team bento** (reuse `BentoGrid`/`TestimonialBento` visual language): Carlos card (Creative Director & Founder + bio), specialty card ("THE GO-TO FOR…"), quote card (placeholder quote — marked), location card ("Kansas City, production team spanning Cuba and the US"), brands card ("Taco Naco KC, Aahaa, T'ÄHÄ, Hotel KC, Grand Coffee, +10 more"). Team note: Litzabel (Marketing Coordinator) + Cuba Production Team.
- **Global Team hero**: eyebrow "OUR TEAM", headline "When we say 'hospitality-native,' *we mean it*", body + glass pills ("Kansas City, MO · Production hub in Cuba · 15+ active brand partnerships · Hospitality since day one"), cover placeholder.
- Content in `lib/about.ts`.

### 4. `/pricing`
- 3 tiers from doc: **Foundation**, **Growth**, **Full System** — each with tagline + includes list. All custom pricing. CTA "Let's Talk" → `/contact`.
- Content in `lib/pricing.ts`. New `PricingTiers` section component (3-column cards, tokenized).

### 5. `/resources`
- Listing stub. 3 sections as card groups using doc titles:
  - **Blog:** Views Don't Pay the Bills · The 5 Photos Every Restaurant Needs (That Aren't Food) · Why the Creative Cart Is Dead · Your Google Profile Is Your New Front Door · One Campaign That Moved the Needle
  - **Guides:** UGC Guide for Restaurant Creators · The Restaurant Owner's Guide to Email ROI · Google Business Profile Checklist
  - **Customer Stories:** links back to `/work`.
- Cards are non-navigating (no article routes) except Customer Stories → `/work`.

### 6. `/contact`
- Brand headline (e.g. "Let's talk" / "The team you call when you need help yesterday"), short body, contact methods with **placeholder** email/phone, and a form UI (name / restaurant / message / submit) that is presentational only (no backend). Clearly comment placeholders so the user can fill real values + wire a backend later.

### 7. Home page edit
- Remove the `cta`/`ctaHref` ("See the process" → `/process`) from the `DarkProcess` usage in `app/page.tsx` (and make those props optional in the component if not already).

## Components — reuse vs. new

**Reuse:** `HeroSection`-style hero patterns, `WorkGrid`, `BentoGrid`, `TestimonialBento`, `StatsStrip`/`ServiceStatsEditorial`, `CTABanner`, `Eyebrow`, `Button`, `Footer`, `Navbar`, `LogoTicker`.

**New (small, focused, one job each):**
- `components/work/CaseStudyHero.tsx`, `CaseStudyStory.tsx`, `CaseStudyResults.tsx`, `CaseStudyHow.tsx`, `CaseStudyScope.tsx`, `CaseStudyQuote.tsx`, `NextCaseStudy.tsx` (or a compact subset if some collapse naturally).
- `components/sections/PricingTiers.tsx`
- `components/about/*` if the bento needs about-specific cards; otherwise reuse `BentoGrid`.
- `app/work/page.tsx`, `app/work/[slug]/page.tsx`, `app/about/page.tsx`, `app/pricing/page.tsx`, `app/resources/page.tsx`, `app/contact/page.tsx`.

## Data flow
`lib/work.ts` exports `caseStudies: CaseStudy[]` + `getCaseStudy(slug)`, mirroring `lib/services.ts` (`services` + `getService`). `/work/[slug]` uses `generateStaticParams` over the 10 slugs and `generateMetadata` from the case study. `/about`, `/pricing`, `/resources`, `/contact` are static.

## Testing / verification
- `bun run build` (or repo build) green for `apps/atrium.website`.
- Typecheck + Biome lint pass.
- Dev server: every new route renders, no dead internal links remain (grep `href` set matches built routes). Then a visual QA pass (browser) across all pages for layout/token consistency, and fix issues found.

## Out of scope
- Real media/images (Dropbox assets), contact-form backend, resources article pages, the 6 case studies without content, COMING V2 features (Digital On Point, portals), and any redesign of already-shipped home/services pages beyond the single `DarkProcess` CTA removal.
