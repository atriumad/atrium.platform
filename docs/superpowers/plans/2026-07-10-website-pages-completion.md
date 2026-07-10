# Website Pages Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the remaining website pages (`/work` + 10 case studies, `/about`, `/pricing`, `/resources`, `/contact`) and remove the dead `/process` link, so the site is complete with no broken internal links.

**Architecture:** Follow the existing pattern exactly — routes under `app/`, content in typed data files under `lib/`, presentation in small section components under `components/`. Imagery = descriptive color/alt-text placeholders (no `<img>`; all real media is Dropbox-only). Reuse the existing section/UI component library; add small new components only where the shape is genuinely new (case-study detail sections, pricing tiers).

**Tech Stack:** Next.js (app router; **breaking-changed fork** — see Global Constraints), React, TypeScript, Tailwind, CSS-var design tokens, GSAP (already wired via `@/lib/gsap`), `@atrium/ui` (Button, Eyebrow).

## Global Constraints

- **Next.js is a modified fork.** `apps/atrium.website/AGENTS.md`: read `node_modules/next/dist/docs/` before writing any route/`generateStaticParams`/`generateMetadata` code. Mirror `app/services/[slug]/page.tsx`: dynamic routes take `params: Promise<{ slug: string }>` and `await` it.
- **Content source of truth:** `apps/atrium.website/docs/Atrium_Website-V1.md`. A cleaned, base64/link-stripped copy is at `scratchpad/content-clean.md` (search by `# <CLIENT>` headings). Transcribe copy **verbatim** (fix only obvious markdown-escape artifacts like `\+`, `\-`, `\|`, smart quotes).
- **No new dependencies.** Use only what the app already imports.
- **Design tokens only** for color — valid vars: `--color-accent`, `--color-primary`, `--color-primary-900`, `--color-forest`, `--color-forest-2`, `--color-surface`, `--color-surface-alt`, `--color-background`, `--color-foreground`, `--color-text-light`, `--color-text-dark`, `--color-border-subtle`, `--surface-page`, `--surface-sunken`. No hardcoded hex in new code.
- **Button variants** available: `primary`, `ghost`, `ghostLight`, `mint`, `home`. `Button href=` for links.
- **Imagery placeholder pattern:** colored tile + descriptive alt string (see `components/sections/WorkGrid.tsx` and `CTABanner.tsx` cover block). Never reference Dropbox URLs.
- **Verification gate (this app has NO test harness — do not add one).** Each integration task runs, from `apps/atrium.website/`:
  - `bun run typecheck` → expect no errors
  - `bun run lint` → expect no errors (Biome)
  - `bun run build` → expect success, and the new route(s) listed in output
  - plus a dev-server render check where noted.
- **Commit after each task.** Conventional commits, scope `website`.

---

### Task 1: Case-study data model + content (`lib/work.ts`)

**Files:**
- Create: `apps/atrium.website/lib/work.ts`

**Interfaces:**
- Produces:
  - `export type CaseMetric = { number: string; label: string }`
  - `export type HowStep = { title: string; body: string }`
  - `export type ScopeGroup = { label: string; items: string[] }`
  - `export type CaseQuote = { text: string; name: string; role: string; placeholder?: boolean }`
  - `export type CaseStudy = { slug: string; client: string; location?: string; category: string; serviceTags: string[]; resultHeadline: string; intro?: string; story: string[]; metrics: CaseMetric[]; howWeDidIt?: HowStep[]; scope?: ScopeGroup[]; quote?: CaseQuote; takeaway?: string; order: number }`
  - `export const caseStudies: CaseStudy[]` (exactly 10, ordered by `order`)
  - `export function getCaseStudy(slug: string): CaseStudy | undefined`

**The 10 case studies** (slug · client · order) — transcribe each from `scratchpad/content-clean.md`:

| order | slug | client | source heading | shape |
|---|---|---|---|---|
| 1 | `taco-naco` | Taco Naco KC | `# TACO NACO` | metrics + story |
| 2 | `taha` | T'ÄHÄ Mexican Kitchen | `# T'ÄHÄ Mexican Kitchen` | metrics + howWeDidIt |
| 3 | `aahaa` | Aahaa Modern Indian Cuisine | `# AAHA` | metrics + howWeDidIt + scope |
| 4 | `don-chuys` | Don Chuy's Fresh Méx & Cantina | `# DCOP` | metrics + howWeDidIt |
| 5 | `old-shawnee-pizza` | Old Shawnee Pizza | `# OSPZ` | metrics + howWeDidIt + scope + takeaway |
| 6 | `chick-in-waffle` | Chick-in Waffle | `# CHWF` | metrics + howWeDidIt + scope |
| 7 | `jerusalem-cafe` | Jerusalem Café | `# JECA` | metrics + howWeDidIt + scope + takeaway |
| 8 | `grand-coffee` | Grand Coffee | `# GRCO` | narrative (no metrics; pillars → howWeDidIt) |
| 9 | `hotel-kc` | Hotel Kansas City | `# HOTEL KANSAS CITY` | narrative (challenge/solution/outcomes) |
| 10 | `town-company` | The Town Company | `# TOWN CO` | narrative |

**Field-mapping rules (apply per client):**
- `resultHeadline` = the big bold metric/positioning line under the client name (e.g. T'ÄHÄ → "5.24M+ impressions. Sold-out Michelin dinners. Zero paid ads."; DCOP → "+839% impressions. +302% Instagram growth. +595% customer actions."). For narrative ones use the subtitle (Hotel KC → "Elevating a Historic Property Through Cinematic Storytelling").
- `intro` = the lead paragraph(s) directly under the headline (1 short string).
- `story` = the "THE STORY" / challenge→strategy→outcome prose as an array of paragraphs. For narrative shape, concatenate Challenge + Solution into `story`.
- `metrics` = "RESULTS AT A GLANCE" numbers, pick the **3–6 strongest** (number + label). Grand Coffee has none → `metrics: []`. Hotel KC → single `{ number: '250K+', label: 'estimated audience reach' }` plus deliverables-as-metrics if useful.
- `howWeDidIt` = the "HOW WE DID IT" subsections (title + body). Grand Coffee → use its 4 Brand Pillars as HowSteps.
- `scope` = "SCOPE OF WORK" / "SERVICES PROVIDED" columns.
- `quote` = only **Taco Naco** has one, and it is a placeholder → `{ text: '[Client quote pending]', name: 'Fernanda', role: 'Owner, Taco Naco KC', placeholder: true }`. All others omit `quote`.
- `serviceTags` = from the doc's "Service tags" line, else infer from scope (e.g. `['Brand Strategy','Content','Social','Google','Reputation','Analytics']`).
- `takeaway` = the "THE TAKEAWAY" / closing line where present.

**Two complete worked examples** (copy these verbatim into the array; transcribe the other 8 the same way):

```ts
// order 2 — metric-heavy shape
{
  slug: 'taha',
  client: 'T’ÄHÄ Mexican Kitchen',
  location: 'Kansas City, MO',
  category: 'Fine Dining · Full-Service Engagement',
  serviceTags: ['Brand Strategy', 'Content', 'Social', 'PR', 'Email & SMS', 'Google'],
  resultHeadline: 'Sold-out Michelin dinners. 5.24M+ impressions. Zero paid ads.',
  intro:
    'No paid ads. No celebrity backing. No existing audience. Just strategy, content, and a multi-step funnel — and we sold out Michelin-star dinners, built a 30% email open rate, and turned a restaurant into a brand that creators choose to be associated with.',
  story: [
    'Every campaign ran a full cycle: awareness content to build anticipation, PR outreach to earned media, email sequences to convert interest into reservations, and CTAs embedded at every touchpoint. The result was consistent, predictable reservation flow — not random spikes.',
  ],
  metrics: [
    { number: '5.24M+', label: 'total impressions (+544% period over period)' },
    { number: '30%', label: 'email open rate — 2× industry average' },
    { number: '4+', label: 'sold-out events — organic only, zero paid ads' },
    { number: '537K', label: 'Google Business reach (+508% YoY)' },
    { number: '217K+', label: 'cross-platform reach on one offer ($1 Oysters)' },
    { number: '43.2K', label: 'GBP action clicks (+193%) — calls, maps, website' },
  ],
  howWeDidIt: [
    { title: 'We built a multi-step funnel — not just posts', body: 'Awareness content, PR outreach, email sequences, and CTAs at every touchpoint produced consistent, predictable reservation flow.' },
    { title: 'PR + email sold out Michelin-star events with no paid spend', body: 'For the Mar & Tierra collaboration with Chef Alberto Ferruz (2 Michelin Stars, BonAmb, Spain) — the first event of its caliber in Kansas City — targeted PR, a carousel campaign, Story countdowns, and a multi-step email sequence sold out both nights. Same for the T’ÄHÄ Takeover series.' },
    { title: 'One offer. Every platform. Compounding reach.', body: 'The $1 Oysters Wednesday campaign generated 33K+ impressions on Instagram, 33K+ on TikTok, plus Facebook and Stories reach — compounding week over week into the Plaza’s most-anticipated weekly standing.' },
    { title: 'We built a brand creators want to belong to', body: 'Creators visited specifically to shoot content — drawn by the aesthetic and culinary prestige — generating an estimated 100K+ additional impressions at zero production cost.' },
    { title: 'We created the tagline — and it stuck', body: '“Crafting Mexican Excellence” was originated by Atrium and now appears across all channels, printed menus, event materials, and in-house signage.' },
  ],
  order: 2,
},
```

```ts
// order 9 — narrative shape
{
  slug: 'hotel-kc',
  client: 'Hotel Kansas City',
  category: 'Hospitality · Cinematic Content',
  serviceTags: ['Film & Photo', 'Brand Film', 'Social Content'],
  resultHeadline: 'Elevating a historic property through cinematic storytelling',
  story: [
    'Hotel Kansas City needed content that differentiated the property beyond traditional hospitality marketing. Rather than competing on amenities, the goal was to position the hotel as a cultural and experiential destination.',
    'We developed a story-driven content campaign centered on atmosphere, architecture, and the guest experience. Through a cinematic hero film, social-first edits, and visual storytelling assets, we transformed the hotel’s identity into a compelling brand narrative.',
  ],
  metrics: [
    { number: '250K+', label: 'estimated audience reach' },
    { number: '2-day', label: 'production shoot' },
    { number: '10+', label: 'films & social cuts delivered' },
  ],
  howWeDidIt: [
    { title: 'A destination, not a place to stay', body: 'Positioned Hotel Kansas City as a destination through atmosphere and architecture-led storytelling.' },
    { title: 'An evergreen content library', body: 'Created reusable assets for social, web, and paid media, extending campaign reach across platforms.' },
  ],
  takeaway:
    'A premium content ecosystem that strengthened brand perception, increased content versatility, and showcased the unique character of Hotel Kansas City.',
  order: 9,
},
```

- [ ] **Step 1:** Read `node_modules/next/dist/docs/` index only if needed later; for this pure-TS task no route APIs are used. Open `scratchpad/content-clean.md`.
- [ ] **Step 2:** Create `lib/work.ts` with the types + `getCaseStudy` + the two worked examples above.
- [ ] **Step 3:** Transcribe the remaining 8 case studies into `caseStudies`, applying the field-mapping rules. Keep `caseStudies` sorted by `order` 1..10.
- [ ] **Step 4:** From `apps/atrium.website/` run `bun run typecheck`. Expected: no errors.
- [ ] **Step 5:** Quick integrity check — run: `cd apps/atrium.website && bunx tsx -e "import {caseStudies,getCaseStudy} from './lib/work'; const s=caseStudies.map(c=>c.slug); if(caseStudies.length!==10) throw new Error('need 10, got '+caseStudies.length); if(new Set(s).size!==10) throw new Error('dup slug'); for(const c of caseStudies){ if(!c.resultHeadline||!c.story.length) throw new Error('missing fields: '+c.slug);} console.log('OK',s.join(','))"`. Expected: `OK taco-naco,taha,...`.
- [ ] **Step 6:** Commit.

```bash
git add apps/atrium.website/lib/work.ts && git commit -m "feat(website): case study data model and content"
```

---

### Task 2: Case-study detail section components

**Files:**
- Create: `apps/atrium.website/components/work/CaseStudyHero.tsx`
- Create: `apps/atrium.website/components/work/CaseStudyStory.tsx`
- Create: `apps/atrium.website/components/work/CaseStudyResults.tsx`
- Create: `apps/atrium.website/components/work/CaseStudyHow.tsx`
- Create: `apps/atrium.website/components/work/CaseStudyScope.tsx`
- Create: `apps/atrium.website/components/work/CaseStudyQuote.tsx`
- Create: `apps/atrium.website/components/work/NextCaseStudy.tsx`

**Interfaces:**
- Consumes (Task 1): `CaseStudy`, `CaseMetric`, `HowStep`, `ScopeGroup`, `CaseQuote`.
- Produces (each default-exports a component):
  - `CaseStudyHero({ study }: { study: CaseStudy })`
  - `CaseStudyStory({ story }: { story: string[] })`
  - `CaseStudyResults({ metrics }: { metrics: CaseMetric[] })` — renders nothing if `metrics.length === 0`
  - `CaseStudyHow({ steps }: { steps: HowStep[] })`
  - `CaseStudyScope({ scope }: { scope: ScopeGroup[] })`
  - `CaseStudyQuote({ quote }: { quote: CaseQuote })`
  - `NextCaseStudy({ next }: { next: { slug: string; client: string; resultHeadline: string } })`

**Design rules:** server components unless they need GSAP/state (these are static → no `'use client'`). Use `Eyebrow`, `Button` from `@/components/ui/*`. Reuse token classes/patterns from `StatsStrip` (metrics), `DarkProcess` (numbered steps), `WorkGrid` (hero tile). Section padding `px-6 md:px-12 py-20 md:py-28`, `max-w-6xl mx-auto`.

- [ ] **Step 1:** Create `CaseStudyHero.tsx`. Layout: eyebrow = `study.category`; H1 = `study.resultHeadline` (serif-italic accent optional via `<em>` not needed here); `study.intro` paragraph; service-tag pills (`study.serviceTags`) as small rounded chips using `--color-surface-alt`; a colored placeholder cover tile (`aspect-[16/9]`, `--color-forest`) with alt text `${study.client} — hero`. Background `--surface-page`.

```tsx
import Eyebrow from '@/components/ui/Eyebrow'
import type { CaseStudy } from '@/lib/work'

export default function CaseStudyHero({ study }: { study: CaseStudy }) {
  return (
    <section className="px-6 md:px-12 pt-28 md:pt-36 pb-16 md:pb-20" style={{ background: 'var(--surface-page)' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-5 max-w-3xl">
          <Eyebrow>{study.category}</Eyebrow>
          <h1 className="text-4xl md:text-6xl font-medium leading-tight tracking-tight">{study.resultHeadline}</h1>
          {study.intro && <p className="text-base md:text-lg leading-relaxed" style={{ opacity: 0.7 }}>{study.intro}</p>}
          <div className="flex flex-wrap gap-2 mt-1">
            {study.serviceTags.map((t) => (
              <span key={t} className="text-xs font-medium rounded-full px-3 py-1.5" style={{ background: 'var(--color-surface-alt)', opacity: 0.85 }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="aspect-[16/9] w-full rounded-2xl flex items-end p-6" style={{ background: 'var(--color-forest)' }} aria-label={`${study.client} — hero`}>
          <span className="text-sm" style={{ color: 'var(--color-text-light)', opacity: 0.5 }}>{study.client} — hero image</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2:** Create `CaseStudyStory.tsx` — eyebrow "THE STORY", paragraphs from `story[]`, `--color-surface` bg, prose `max-w-2xl` text-base leading-relaxed.
- [ ] **Step 3:** Create `CaseStudyResults.tsx` — `if (!metrics.length) return null`. Eyebrow "RESULTS", grid `md:grid-cols-3` of big `--color-accent` numbers + labels (mirror `StatsStrip` styling), `--color-primary` bg + `--color-text-light`.
- [ ] **Step 4:** Create `CaseStudyHow.tsx` — eyebrow "HOW WE DID IT", numbered cards mirroring `DarkProcess` step cards (number chip + title + body), on `--color-surface`.
- [ ] **Step 5:** Create `CaseStudyScope.tsx` — eyebrow "SCOPE OF WORK", each `ScopeGroup` = column with `label` heading + `items` list.
- [ ] **Step 6:** Create `CaseStudyQuote.tsx` — large serif-italic pull quote + name/role; if `quote.placeholder`, render name/role muted.
- [ ] **Step 7:** Create `NextCaseStudy.tsx` — "NEXT CASE STUDY" eyebrow + `next.client` + `next.resultHeadline` + `Button href={/work/${next.slug}}`.
- [ ] **Step 8:** From `apps/atrium.website/` run `bun run typecheck` and `bun run lint`. Expected: no errors.
- [ ] **Step 9:** Commit.

```bash
git add apps/atrium.website/components/work && git commit -m "feat(website): case study detail section components"
```

---

### Task 3: Case-study detail route (`/work/[slug]`)

**Files:**
- Create: `apps/atrium.website/app/work/[slug]/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`caseStudies`, `getCaseStudy`), Task 2 (all section components), `CTABanner`.

- [ ] **Step 1:** Read `app/services/[slug]/page.tsx` (already in repo) as the exact template for `generateStaticParams` + `generateMetadata` + `params: Promise<{slug}>` + `notFound()`.
- [ ] **Step 2:** Create the route. `generateStaticParams` → `caseStudies.map(c => ({ slug: c.slug }))`. `generateMetadata` → title `${study.client} — Atrium`, description `study.intro ?? study.resultHeadline`. Compute `next` = the case study with the following `order` (wrap 10→1).
- [ ] **Step 3:** Compose sections in order: `CaseStudyHero` → `CaseStudyStory` → `CaseStudyResults` → `CaseStudyHow` (if `howWeDidIt`) → `CaseStudyScope` (if `scope`) → `CaseStudyQuote` (if `quote`) → `NextCaseStudy` → `CTABanner` (eyebrow "LET'S WORK TOGETHER", headline `<>Your restaurant, <em>next</em></>`, body "…", cta "Let's Talk", ctaHref "/contact", coverAlt "…").
- [ ] **Step 4:** `bun run typecheck` + `bun run lint`. Expected: no errors.
- [ ] **Step 5:** `bun run build`. Expected: success; build output lists `/work/[slug]` prerendered for all 10 slugs.
- [ ] **Step 6:** `bun run dev`, open `http://localhost:3000/work/taha` and `/work/grand-coffee` (no-metrics case). Verify both render, no console errors, metrics section absent on grand-coffee.
- [ ] **Step 7:** Commit.

```bash
git add apps/atrium.website/app/work/'[slug]'/page.tsx && git commit -m "feat(website): case study detail route"
```

---

### Task 4: Work index route (`/work`)

**Files:**
- Create: `apps/atrium.website/app/work/page.tsx`
- Create: `apps/atrium.website/components/work/WorkIndexGrid.tsx`

**Interfaces:**
- Consumes: Task 1 (`caseStudies`), `Eyebrow`, `CTABanner`.
- Produces: `WorkIndexGrid({ studies }: { studies: CaseStudy[] })`.

- [ ] **Step 1:** Create `WorkIndexGrid.tsx` — mirror `components/sections/WorkGrid.tsx` visuals (numbered colored tile alternating `--color-forest`/`--color-forest-2`, client, `resultHeadline` as the result line, hover lift, `rounded-2xl`), each card `Link href={/work/${study.slug}}`. Derive card number from `order` (`String(order).padStart(2,'0')`). Assign orientation by index cycling `['horizontal','vertical','square']` to match the existing look, or use a fixed `aspect-[4/3]` — pick fixed `aspect-[4/3]` for a uniform index grid.
- [ ] **Step 2:** Create `app/work/page.tsx`: static. Hero (eyebrow "OUR WORK", H1 "Our Work", body "Hospitality only. Results first."). `<WorkIndexGrid studies={[...caseStudies].sort((a,b)=>a.order-b.order)} />`. Closing `CTABanner` → `/contact`. `metadata` export title "Our Work — Atrium".
- [ ] **Step 3:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: no errors; `/work` prerendered.
- [ ] **Step 4:** Dev check `http://localhost:3000/work` — 10 cards, each links to a detail page.
- [ ] **Step 5:** Commit.

```bash
git add apps/atrium.website/app/work/page.tsx apps/atrium.website/components/work/WorkIndexGrid.tsx && git commit -m "feat(website): work index page"
```

---

### Task 5: About page (`/about`)

**Files:**
- Create: `apps/atrium.website/lib/about.ts`
- Create: `apps/atrium.website/app/about/page.tsx`
- Create: `apps/atrium.website/components/about/TeamBento.tsx`
- Create: `apps/atrium.website/components/about/TeamHero.tsx`

**Interfaces:**
- Produces: `lib/about.ts` exports `aboutContent` with `{ founder: {...}, teamNote: string, hero: {...} }` (typed inline); `TeamBento({ content })`, `TeamHero({ hero })`.

Content (from doc `# ABOUT`):
- Founder (Carlos): role "Creative Director & Founder"; bio "Carlos has been inside the kitchens, on the shoots, and behind the dashboards for 15+ hospitality brands across KC and beyond."; goToFor "Brand Strategy, Creative Direction, and Performance Systems."; quote `[placeholder — mark it]` "Why hospitality: the intersection of creativity and data."; location "Kansas City, with a production team spanning Cuba and the US."; brands "Taco Naco KC, Aahaa, T'ÄHÄ, Hotel KC, Grand Coffee, +10 more."
- teamNote: "Litzabel — Marketing Coordinator · Cuba Production Team · key team members."
- hero: eyebrow "OUR TEAM"; headline `When we say "hospitality-native," <em>we mean it</em>`; body "Our team lives inside the industry. Kansas City home base, production team in Cuba, strategy and creative under one roof."; pills `['Kansas City, MO','Production hub in Cuba','15+ active brand partnerships','Hospitality since day one']`; coverAlt "team on location — restaurant shoot BTS, wide shot".

- [ ] **Step 1:** Create `lib/about.ts` with the content object above (mark the founder quote `placeholder: true`).
- [ ] **Step 2:** Create `TeamBento.tsx` — bento layout (reuse the grid feel of `components/sections/BentoGrid.tsx`): large founder photo-placeholder card (left) + specialty card ("THE GO-TO FOR:") + quote card ("IN CARLOS'S WORDS") + location card ("DIALING IN FROM") + brands card ("BRANDS CARLOS HAS WORKED ON"). Photo card = colored placeholder tile w/ alt.
- [ ] **Step 3:** Create `TeamHero.tsx` — split hero: eyebrow + serif-accent headline (render `<em>` via `dangerouslySetInnerHTML`-free approach: store headline as `{ pre: 'When we say "hospitality-native,"', em: 'we mean it' }`) + body + glass pills row + cover placeholder. Reuse `CTABanner`'s glass-pill/placeholder styling idiom.
- [ ] **Step 4:** Create `app/about/page.tsx`: `<TeamHero hero={aboutContent.hero} />` then `<TeamBento content={aboutContent} />` (+ teamNote line). `metadata` title "About — Atrium".
- [ ] **Step 5:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: `/about` prerendered.
- [ ] **Step 6:** Dev check `http://localhost:3000/about`.
- [ ] **Step 7:** Commit.

```bash
git add apps/atrium.website/lib/about.ts apps/atrium.website/app/about apps/atrium.website/components/about && git commit -m "feat(website): about page"
```

---

### Task 6: Pricing page (`/pricing`)

**Files:**
- Create: `apps/atrium.website/lib/pricing.ts`
- Create: `apps/atrium.website/components/sections/PricingTiers.tsx`
- Create: `apps/atrium.website/app/pricing/page.tsx`

**Interfaces:**
- Produces: `lib/pricing.ts` → `export type PricingTier = { name: string; tagline: string; includes: string[]; featured?: boolean }` + `export const pricingTiers: PricingTier[]`; `PricingTiers({ tiers }: { tiers: PricingTier[] })`.

Content (from doc `# PRICING`):
- Foundation — "Strategy, content, social. The essentials." — [Brand strategy, Monthly content production, Social management, Google optimization, Monthly reporting]
- Growth (`featured: true`) — "+ Paid, email, SMS, reputation. Ready to scale." — [Everything in Foundation, Email & SMS, Paid media, Reputation management, CRM setup]
- Full System — "Everything. Dashboard, automations, dedicated team." — [Everything in Growth, Custom dashboard, Advanced automations, Dedicated strategy team, Multi-location]
- All custom pricing. CTA "Let's Talk" → `/contact`.

- [ ] **Step 1:** Create `lib/pricing.ts` with the 3 tiers (`Growth` featured).
- [ ] **Step 2:** Create `PricingTiers.tsx` — 3-column responsive cards (`md:grid-cols-3`), featured card emphasized (`--color-forest` bg + accent border), each: name, tagline, includes checklist, "All custom pricing" line, `Button href="/contact"` "Let's Talk". Tokenized only.
- [ ] **Step 3:** Create `app/pricing/page.tsx` — hero (eyebrow "PRICING", H1 `<>Simple pricing, <em>built around you</em></>`, body "Every restaurant is different. Every plan is custom. Here's where we start."), `<PricingTiers tiers={pricingTiers} />`, closing `CTABanner`. `metadata` title "Pricing — Atrium".
- [ ] **Step 4:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: `/pricing` prerendered.
- [ ] **Step 5:** Dev check `http://localhost:3000/pricing`.
- [ ] **Step 6:** Commit.

```bash
git add apps/atrium.website/lib/pricing.ts apps/atrium.website/components/sections/PricingTiers.tsx apps/atrium.website/app/pricing && git commit -m "feat(website): pricing page"
```

---

### Task 7: Resources page (`/resources`)

**Files:**
- Create: `apps/atrium.website/app/resources/page.tsx`
- Create: `apps/atrium.website/components/sections/ResourceList.tsx`

**Interfaces:**
- Produces: `ResourceList({ title, items, hrefAll }: { title: string; items: string[]; hrefAll?: string })`.

Content (from doc `# RESOURCES`):
- Blog: "Views Don't Pay the Bills", "The 5 Photos Every Restaurant Needs (That Aren't Food)", "Why the Creative Cart Is Dead", "Your Google Profile Is Your New Front Door", "One Campaign That Moved the Needle"
- Guides: "UGC Guide for Restaurant Creators", "The Restaurant Owner's Guide to Email ROI", "Google Business Profile Checklist"
- Customer Stories: single card linking to `/work`.

- [ ] **Step 1:** Create `ResourceList.tsx` — section with eyebrow `title` + non-navigating cards (titles only), muted "Coming soon" tag on Blog/Guides; Customer Stories card is a `Link href="/work"`.
- [ ] **Step 2:** Create `app/resources/page.tsx` — hero (eyebrow "RESOURCES", H1 "Resources", body "Guides, playbooks, and the thinking behind the work."), three `ResourceList` sections (Blog, Guides, Customer Stories → `/work`). `metadata` title "Resources — Atrium".
- [ ] **Step 3:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: `/resources` prerendered.
- [ ] **Step 4:** Dev check `http://localhost:3000/resources`.
- [ ] **Step 5:** Commit.

```bash
git add apps/atrium.website/app/resources apps/atrium.website/components/sections/ResourceList.tsx && git commit -m "feat(website): resources listing page"
```

---

### Task 8: Contact page (`/contact`)

**Files:**
- Create: `apps/atrium.website/app/contact/page.tsx`
- Create: `apps/atrium.website/components/sections/ContactForm.tsx`

**Interfaces:**
- Produces: `ContactForm()` — `'use client'`, presentational form (no backend).

- [ ] **Step 1:** Create `ContactForm.tsx` (`'use client'`): fields Name, Restaurant, Email, Message + submit `Button`. `onSubmit` calls `e.preventDefault()` and shows an inline "Thanks — we'll be in touch." success state (local `useState`). Add a clear top comment: `// TODO(client): wire to backend (Formspree/Resend). Currently presentational only.` Inputs styled with tokens (`--color-border-subtle`, `--color-surface-alt`).
- [ ] **Step 2:** Create `app/contact/page.tsx` — hero (eyebrow "CONTACT", H1 `<>Let's <em>talk</em></>`, body "The team you call when you need help yesterday."). Two columns: left = contact methods with **placeholder** values wrapped in an obvious comment — `hello@atrium.example` / `+1 (000) 000-0000` / "Kansas City, MO" and a `// TODO(client): replace placeholder contact details`; right = `<ContactForm />`. `metadata` title "Contact — Atrium".
- [ ] **Step 3:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: `/contact` prerendered.
- [ ] **Step 4:** Dev check `http://localhost:3000/contact` — submit shows success state, no console errors.
- [ ] **Step 5:** Commit.

```bash
git add apps/atrium.website/app/contact apps/atrium.website/components/sections/ContactForm.tsx && git commit -m "feat(website): contact page (presentational form)"
```

---

### Task 9: Remove dead `/process` CTA from home

**Files:**
- Modify: `apps/atrium.website/components/sections/DarkProcess.tsx` (make `cta`/`ctaHref` optional)
- Modify: `apps/atrium.website/app/page.tsx` (drop `cta`/`ctaHref` props on `DarkProcess`)

**Interfaces:**
- Changes `DarkProcess` Props: `cta?: string; ctaHref?: string`; render the CTA `<div>` only when both are present.

- [ ] **Step 1:** In `DarkProcess.tsx`, change Props to `cta?: string` and `ctaHref?: string`, and wrap the CTA button block: `{cta && ctaHref && (<div className="mt-2"><Button href={ctaHref} variant="ghostLight">{cta}</Button></div>)}`.
- [ ] **Step 2:** In `app/page.tsx`, remove the `cta="See the process"` and `ctaHref="/process"` lines from the `<DarkProcess ... />` usage.
- [ ] **Step 3:** Grep for remaining dead links: run `grep -rn "/process" apps/atrium.website/app apps/atrium.website/components`. Expected: no matches.
- [ ] **Step 4:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: no errors.
- [ ] **Step 5:** Commit.

```bash
git add apps/atrium.website/components/sections/DarkProcess.tsx apps/atrium.website/app/page.tsx && git commit -m "fix(website): remove dead /process CTA from home"
```

---

### Task 10: Link-integrity sweep + full build

**Files:** none (verification task); fixes only if broken.

- [ ] **Step 1:** Collect internal hrefs: run `grep -rhoE "href=[\"'\\{]?[\"']?/[a-z][a-z0-9/-]*" apps/atrium.website/app apps/atrium.website/components | grep -oE "/[a-z][a-z0-9/-]*" | sort -u`.
- [ ] **Step 2:** Confirm every internal route in that list resolves to a built page: `/`, `/services`, `/services/*`, `/work`, `/work/*` (10 slugs), `/about`, `/pricing`, `/resources`, `/contact`. Any leftover (`/process`, `/work/<unbuilt-slug>`) is a defect — fix its source (repoint or remove).
- [ ] **Step 3:** Verify homepage `selectedWork` hrefs match built slugs (`/work/taco-naco`, `/work/taha`, `/work/aahaa`, `/work/hotel-kc`, `/work/grand-coffee` all exist). Update `app/page.tsx` `selectedWork` hrefs to the new slugs if any differ.
- [ ] **Step 4:** From `apps/atrium.website/`: `bun run build`. Expected: success; output lists all new routes.
- [ ] **Step 5:** Commit any fixes.

```bash
git add -A apps/atrium.website && git commit -m "fix(website): internal link integrity sweep"
```

---

### Task 11: Visual QA pass

**Files:** fixes only, across new pages/components.

- [ ] **Step 1:** `bun run dev`. In the browser, walk every new route at desktop **and** mobile width (≤430px): `/work`, all 10 `/work/*`, `/about`, `/pricing`, `/resources`, `/contact`.
- [ ] **Step 2:** For each, check: no horizontal overflow; spacing/rhythm consistent with `/services`; token colors correct in section transitions; hero/nav overlap OK (fixed navbar height); pills/cards wrap cleanly; placeholder tiles have alt/label text; CTA banners consistent.
- [ ] **Step 3:** Fix issues found (spacing, wrapping, contrast, missing responsive classes). Keep changes tokenized and within the new components.
- [ ] **Step 4:** `bun run typecheck` + `bun run lint` + `bun run build`. Expected: clean.
- [ ] **Step 5:** Commit.

```bash
git add -A apps/atrium.website && git commit -m "fix(website): visual QA adjustments across new pages"
```

---

## Self-Review

**Spec coverage:**
- `/work` index (10 studies) → Task 4 ✓
- `/work/[slug]` (10 case studies, conditional sections) → Tasks 1–3 ✓
- `/about` (team bento + hero) → Task 5 ✓
- `/pricing` (3 tiers) → Task 6 ✓
- `/resources` (listing stub) → Task 7 ✓
- `/contact` (form UI + placeholders) → Task 8 ✓
- Remove `/process` CTA → Task 9 ✓
- New data files `lib/work.ts`/`about.ts`/`pricing.ts` → Tasks 1/5/6 ✓
- No dead links, build green, visual QA → Tasks 10/11 ✓
- Imagery placeholders / tokens / Next fork constraint → Global Constraints, enforced per task ✓

**Placeholder scan:** Product-level placeholders (contact details, founder/Taco Naco quotes) are explicit, marked, and are deliberate spec decisions — not plan gaps. The 8 non-worked-example case studies are transcription-from-source with exact headings + mapping rules + 2 full worked examples, not "TODO".

**Type consistency:** `CaseStudy`/`CaseMetric`/`HowStep`/`ScopeGroup`/`CaseQuote` defined in Task 1; consumed with identical names/shapes in Tasks 2–4. `PricingTier` defined and consumed in Task 6. `getCaseStudy` used in Task 3. `NextCaseStudy` prop shape matches fields present on `CaseStudy`.

**Note on TDD:** This app has no test harness and no frontend unit tests; per repo convention the verification cycle is typecheck + Biome lint + `next build` (prerender proof) + dev-server render, applied at every task. Adding a test runner is out of scope.
