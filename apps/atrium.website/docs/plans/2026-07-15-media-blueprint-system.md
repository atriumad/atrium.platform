# Media Blueprint System Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two to four art-directed, replaceable media moments to every Atrium website page without requiring final photography, video, or dashboard assets today.

**Architecture:** Introduce a typed `MediaBlueprint` data contract and one reusable renderer with five visual variants. Planned blueprints render branded abstract compositions plus a production brief; real media uses the same contract and layout with `src`, `alt`, and optional `poster`. Page-level sections compose the primitive without duplicating placeholder markup.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, CSS Modules, Bun test, Next Image.

---

### Task 1: Define the media contract and validation

**Files:**
- Create: `apps/atrium.website/lib/media-blueprints.ts`
- Create: `apps/atrium.website/lib/media-blueprints.test.ts`

**Step 1: Write the failing contract tests**

Create tests with `bun:test` covering:

```ts
import { describe, expect, test } from 'bun:test'
import { blueprintLabel, isRealMedia, type MediaBlueprint } from './media-blueprints'

describe('media blueprints', () => {
  test('recognizes a planned blueprint', () => {
    const item: MediaBlueprint = {
      kind: 'cinematic',
      assetType: 'photo',
      code: 'PHOTO 01',
      title: 'Kitchen in motion',
      direction: 'Candid dinner service, warm light, hands and steam',
      ratio: '16:9',
    }
    expect(isRealMedia(item)).toBe(false)
    expect(blueprintLabel(item)).toBe('PHOTO 01 · 16:9')
  })

  test('recognizes real media', () => {
    const item: MediaBlueprint = {
      kind: 'cinematic',
      assetType: 'photo',
      code: 'PHOTO 01',
      title: 'Kitchen in motion',
      direction: 'Dinner service',
      ratio: '16:9',
      src: '/media/kitchen.jpg',
      alt: 'Chef plating during dinner service',
    }
    expect(isRealMedia(item)).toBe(true)
  })
})
```

**Step 2: Run the tests and verify failure**

Run:

```bash
cd apps/atrium.website && bun test lib/media-blueprints.test.ts
```

Expected: FAIL because `media-blueprints.ts` does not exist.

**Step 3: Implement the discriminated media contract**

Create:

```ts
export type BlueprintKind = 'cinematic' | 'collage' | 'device' | 'dashboard' | 'process'
export type BlueprintAssetType = 'photo' | 'video' | 'reel' | 'dashboard' | 'illustration'
export type BlueprintRatio = '16:9' | '4:3' | '3:4' | '1:1' | '9:16' | 'wide'

type BlueprintBase = {
  kind: BlueprintKind
  assetType: BlueprintAssetType
  code: string
  title: string
  direction: string
  ratio: BlueprintRatio
  className?: string
}

export type PlannedMediaBlueprint = BlueprintBase & {
  src?: never
  alt?: never
  poster?: never
}

export type RealMediaBlueprint = BlueprintBase & {
  src: string
  alt: string
  poster?: string
}

export type MediaBlueprint = PlannedMediaBlueprint | RealMediaBlueprint

export function isRealMedia(item: MediaBlueprint): item is RealMediaBlueprint {
  return typeof item.src === 'string' && item.src.length > 0
}

export function blueprintLabel(item: MediaBlueprint) {
  return `${item.code} · ${item.ratio}`
}
```

**Step 4: Run tests and TypeScript**

Run:

```bash
cd apps/atrium.website
bun test lib/media-blueprints.test.ts
bun run typecheck
```

Expected: 2 tests pass and TypeScript exits successfully.

**Step 5: Commit**

```bash
git add apps/atrium.website/lib/media-blueprints.ts apps/atrium.website/lib/media-blueprints.test.ts
git commit -m "feat(website): define media blueprint contract"
```

---

### Task 2: Build the five blueprint variants

**Files:**
- Create: `apps/atrium.website/components/media/MediaBlueprint.tsx`
- Create: `apps/atrium.website/components/media/MediaBlueprint.module.css`
- Create: `apps/atrium.website/components/media/MediaBlueprintSection.tsx`
- Create: `apps/atrium.website/app/media-blueprints/page.tsx`

**Step 1: Create the renderer shell**

`MediaBlueprint.tsx` must:

- accept `item: MediaBlueprint` and optional `priority`;
- map ratios to stable aspect classes;
- render `next/image` for real photos, illustrations, or dashboards;
- render `<video controls playsInline preload="metadata">` for real video/reel media;
- render the planned composition when `src` is absent;
- expose production metadata as visible text;
- avoid `role="img"` for planned compositions;
- use an empty alt only when a real asset is explicitly decorative.

Use this interface:

```tsx
type Props = {
  item: MediaBlueprint
  priority?: boolean
  showBrief?: boolean
}
```

The planned state structure should include:

```tsx
<figure className={`${styles.frame} ${styles[item.kind]} ${styles[ratioClass]}`}>
  <div className={styles.visual} aria-hidden="true">
    <span className={styles.cropMark} />
    <span className={styles.orbit} />
    <span className={styles.subjectPlane} />
  </div>
  <figcaption className={styles.brief}>
    <span>{blueprintLabel(item)}</span>
    <strong>{item.title}</strong>
    <span>{item.direction}</span>
  </figcaption>
</figure>
```

Each `kind` must visibly differ:

- `cinematic`: one deep atmospheric plane with crop guides;
- `collage`: three offset frames and contact-sheet numbering;
- `device`: bounded 9:16 frame plus two channel fragments;
- `dashboard`: chart lines, report cards, and a data-grid rhythm;
- `process`: four sequential frames with functional numbering.

**Step 2: Implement CSS and reduced motion**

Use Atrium variables only. Include:

```css
@media (prefers-reduced-motion: reduce) {
  .frame *, .frame *::before, .frame *::after {
    animation: none !important;
    transform: none !important;
  }
}
```

Requirements:

- no horizontal overflow at 390px;
- metadata moves below the visual on mobile;
- visible focus is inherited for linked wrappers;
- no animation may hide initial content;
- avoid generic image icons and gray skeletons.

**Step 3: Create the shared section wrapper**

`MediaBlueprintSection.tsx` accepts:

```ts
type Props = {
  eyebrow?: string
  headline?: ReactNode
  body?: string
  items: MediaBlueprint[]
  tone?: 'light' | 'dark'
  layout?: 'feature' | 'pair' | 'triptych'
}
```

Use semantic headings, `Eyebrow`, and page tokens. A feature layout gives the first item more area; pair and triptych remain balanced.

**Step 4: Add the internal reference route**

Create `/media-blueprints` with:

- `metadata.robots = { index: false, follow: false }`;
- all five planned variants;
- one example with `showBrief={false}`;
- labels for ratios and intended usage;
- no site navigation changes.

**Step 5: Verify component gallery**

Run:

```bash
cd apps/atrium.website
bun run lint
bun run typecheck
bun run dev
```

Inspect `/media-blueprints` at 390, 768, 1024, and 1440px. Expected: no overflow, metadata remains readable, variants are visibly distinct.

**Step 6: Commit**

```bash
git add apps/atrium.website/components/media apps/atrium.website/app/media-blueprints/page.tsx
git commit -m "feat(website): add media blueprint renderer"
```

---

### Task 3: Add visual anchors to the homepage

**Files:**
- Create: `apps/atrium.website/lib/media/home.ts`
- Modify: `apps/atrium.website/app/page.tsx`
- Modify: `apps/atrium.website/components/sections/GrowthEngineDiagram.tsx`

**Step 1: Define home media direction**

Create four blueprints:

```ts
export const homeMedia: MediaBlueprint[] = [
  {
    kind: 'collage', assetType: 'photo', code: 'PHOTO SET 01', ratio: 'wide',
    title: 'Inside the kitchen, not inside a stock library',
    direction: 'Chef plating, team exchange, dining room energy, hands in motion; candid warm service light',
  },
  {
    kind: 'process', assetType: 'illustration', code: 'SYSTEM 01', ratio: '16:9',
    title: 'The Atrium Growth Engine in motion',
    direction: 'Brand foundation feeding Generate, Convert, Retain and the measurement loop',
  },
  {
    kind: 'dashboard', assetType: 'dashboard', code: 'REPORT 01', ratio: '4:3',
    title: 'One operating view',
    direction: 'Revenue, campaigns, email, social, Google and reviews in a presentation-ready monthly report',
  },
  {
    kind: 'device', assetType: 'reel', code: 'REEL SET 01', ratio: '9:16',
    title: 'One shoot, many channel outputs',
    direction: 'Reel, carousel, Google photo, email crop and paid-social variation from one production day',
  },
]
```

**Step 2: Place three anchor sections**

- Place the hospitality collage after `AudiencePaths` and before `BentoGrid`.
- Integrate the process blueprint with `GrowthEngineDiagram` instead of creating a second duplicate Growth Engine section.
- Place dashboard + device as a pair before `StatsStrip`.
- Keep the existing 3D hero unchanged.

**Step 3: Verify homepage rhythm**

Run typecheck and inspect `/` at desktop/mobile. Expected: editorial-only sections never exceed two consecutive long text sections without a visual anchor.

**Step 4: Commit**

```bash
git add apps/atrium.website/lib/media/home.ts apps/atrium.website/app/page.tsx apps/atrium.website/components/sections/GrowthEngineDiagram.tsx
git commit -m "feat(website): add homepage media anchors"
```

---

### Task 4: Add media architecture to services

**Files:**
- Create: `apps/atrium.website/lib/media/services.ts`
- Modify: `apps/atrium.website/app/services/page.tsx`
- Modify: `apps/atrium.website/app/services/[slug]/page.tsx`
- Modify: `apps/atrium.website/components/services/ServiceEditorialHero.tsx`
- Modify: `apps/atrium.website/components/services/ServiceBento.tsx`
- Modify: `apps/atrium.website/components/services/RelatedCase.tsx`
- Modify: `apps/atrium.website/lib/services.ts`

**Step 1: Extend service data with visual direction**

Add to `Service`:

```ts
media: {
  hero: MediaBlueprint
  deliverable: MediaBlueprint
  process: MediaBlueprint
}
```

Every service must define real production direction based on its subject. Examples:

- Brand Strategy: mood board, brand touchpoints, positioning map.
- Film & Photo: on-location BTS, contact sheet, six-angle dish sequence.
- Social Content: archetype feed, reel sequence, campaign crops.
- Paid Media: organic proof to paid campaign dashboard.
- Google SEO: before/after profile and local-search map.
- Reputation: review response flow and sentiment dashboard.
- Email/SMS: lifecycle flow and attributed-order report.
- Analytics: direct/influence ROI report and campaign timeline.

Do not use generic “marketing image” directions.

**Step 2: Upgrade the service hub**

Add:

- a capability collage after the hero;
- a process blueprint near Generate/Convert/Retain;
- a reporting blueprint before the final CTA.

**Step 3: Upgrade the service template**

- Add the service hero blueprint inside `ServiceEditorialHero` as a split layout on desktop and stacked layout on mobile.
- Replace the faux browser artwork in `ServiceThesis` or the weakest decorative block with the service deliverable blueprint.
- Let `ServiceBento` render planned media in its feature card rather than only printing `coverAlt` in a pill.
- Add the process blueprint near `ServiceTimelineEditorial`.
- Use the mapped case cover inside `RelatedCase`.

**Step 4: Verify all eleven service routes**

Run:

```bash
cd apps/atrium.website && bun run build
```

Expected: all 11 service slugs build. Inspect representative Generate, Convert, and Retain routes at desktop/mobile.

**Step 5: Commit**

```bash
git add apps/atrium.website/lib/media/services.ts apps/atrium.website/lib/services.ts apps/atrium.website/app/services apps/atrium.website/components/services
git commit -m "feat(website): add service media blueprints"
```

---

### Task 5: Migrate work covers, galleries, reels, and results

**Files:**
- Modify: `apps/atrium.website/lib/work.ts`
- Modify: `apps/atrium.website/app/work/page.tsx`
- Modify: `apps/atrium.website/app/work/[slug]/page.tsx`
- Modify: `apps/atrium.website/components/work/CaseGallery.tsx`
- Modify: `apps/atrium.website/components/sections/WorkGrid.tsx`

**Step 1: Add typed case-study media**

Replace ad hoc gallery placeholders with:

```ts
media: {
  cover: MediaBlueprint
  gallery: MediaBlueprint[]
  reels?: MediaBlueprint[]
  results?: MediaBlueprint
}
```

Keep existing real gallery URLs compatible by converting them to real `MediaBlueprint` items.

**Step 2: Create case-specific shot plans**

Each case gets:

- one cover direction;
- three to five gallery directions;
- reels only when the story includes video/social production;
- a dashboard/result blueprint only when the case has metrics or reporting evidence.

Directions must reference the actual case narrative in `lib/work.ts`.

**Step 3: Replace work index blocks**

Use `study.media.cover` in featured and grid cards. Preserve client, result headline, and links. Remove the numbered solid-color tile as the primary visual.

**Step 4: Replace detail placeholders**

- `CaseMedia` renders `media.cover`.
- `CaseGallery` consumes `MediaBlueprint[]`.
- Reels use `device` blueprints in 9:16.
- Results blueprint sits adjacent to metrics without fabricating data.

**Step 5: Verify ten cases**

Run build and inspect a case with metrics, one without metrics, and one with reels. Expected: no route assumes media exists beyond the typed planned state.

**Step 6: Commit**

```bash
git add apps/atrium.website/lib/work.ts apps/atrium.website/app/work apps/atrium.website/components/work apps/atrium.website/components/sections/WorkGrid.tsx
git commit -m "feat(website): art-direct case study media"
```

---

### Task 6: Add restrained anchors to secondary pages

**Files:**
- Create: `apps/atrium.website/lib/media/pages.ts`
- Modify: `apps/atrium.website/app/about/page.tsx`
- Modify: `apps/atrium.website/app/pricing/page.tsx`
- Modify: `apps/atrium.website/app/process/page.tsx`
- Modify: `apps/atrium.website/app/resources/page.tsx`
- Modify: `apps/atrium.website/app/contact/page.tsx`
- Modify: `apps/atrium.website/components/sections/CTABanner.tsx`
- Modify: `apps/atrium.website/components/sections/SplitSection.tsx`

**Step 1: Define secondary-page blueprints**

Create two or three items per page:

- About: founder portrait, production team, multi-location collage.
- Pricing: scope/proposal, monthly cadence, example report.
- Process: 28-day storyboard, shoot day, activation/reporting handoff.
- Resources: guide cover system, playbook spread.
- Contact: diagnostic table, first-cycle planning board.

**Step 2: Replace generic CTA artwork**

Allow `CTABanner` to accept optional `media?: MediaBlueprint`. Keep `coverAlt` temporarily for compatibility, then migrate all consumers. When media is present, render the blueprint rather than the generic ampersand card.

**Step 3: Replace bracket placeholders in SplitSection**

Allow `SplitSection` to receive `media?: MediaBlueprint`. Remove visible square-bracket placeholder copy after all consumers are migrated.

**Step 4: Add page anchors**

Use 2–3 anchors per secondary page. Pricing and contact remain quieter than home/work: prefer pair or feature layouts, not dense collages.

**Step 5: Verify routes**

Inspect `/about`, `/pricing`, `/process`, `/resources`, and `/contact` at 390 and 1440px. Confirm text and media alternate naturally and no page becomes a continuous gallery.

**Step 6: Commit**

```bash
git add apps/atrium.website/lib/media/pages.ts apps/atrium.website/app/about apps/atrium.website/app/pricing apps/atrium.website/app/process apps/atrium.website/app/resources apps/atrium.website/app/contact apps/atrium.website/components/sections/CTABanner.tsx apps/atrium.website/components/sections/SplitSection.tsx
git commit -m "feat(website): add media anchors to secondary pages"
```

---

### Task 7: Accessibility, responsive QA, and repository verification

**Files:**
- Modify as needed: `apps/atrium.website/components/media/*`
- Modify: `apps/atrium.website/docs/pending-work.md`
- Modify after code changes: `graphify-out/*`

**Step 1: Run automated checks**

```bash
cd apps/atrium.website
bun test lib/media-blueprints.test.ts
bun run lint
bun run typecheck
bun run build
```

Expected: all tests and checks pass; build includes all static service and work routes plus `/media-blueprints`.

**Step 2: Run responsive QA**

Inspect at 390, 768, 1024, and 1440px:

- `/`
- `/services`
- `/services/brand-strategy`
- `/services/email-sms`
- `/work`
- `/work/taco-naco`
- `/about`
- `/pricing`
- `/process`
- `/resources`
- `/contact`
- `/media-blueprints`

Check:

- no horizontal overflow;
- no production metadata collisions;
- no real-media claims in planned states;
- keyboard focus remains visible for linked media;
- mobile collages reduce or reorder intentionally;
- editorial and visual sections remain balanced.

**Step 3: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`. Expected: all blueprint content remains visible, no parallax or looping animation runs, and video never autoplays.

**Step 4: Update project documentation**

Update `apps/atrium.website/docs/pending-work.md`:

- mark the Media Blueprint system and page rollout complete;
- preserve the real-asset acquisition work under `[ASSET]`;
- document that adding final media now requires data changes only.

**Step 5: Update the knowledge graph**

Run:

```bash
graphify update .
```

Expected: graph rebuilt with Media Blueprint component and page relationships.

**Step 6: Final commit**

```bash
git add apps/atrium.website graphify-out
git commit -m "feat(website): complete media blueprint rollout"
```

