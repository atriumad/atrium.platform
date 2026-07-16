# Case Study Covers Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace every case-study cover placeholder with a shared composition made from a static Cloudinary photograph, a dark overlay, and the client logo or name centered above it.

**Architecture:** Store canonical cover metadata on `CaseStudy`, resolve safe fallbacks in a small pure helper, and render every surface through one `CaseCover` component. The home page, work archive, case hero, and next-case preview keep their existing geometry while delegating all visual cover behavior to the shared component.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, `next/image`, Cloudinary loader, Bun test runner, Biome, Turborepo.

---

### Task 1: Add and test canonical cover metadata

**Files:**
- Modify: `apps/atrium.website/lib/work.ts:14-34`
- Create: `apps/atrium.website/lib/work.test.ts`

**Step 1: Write the failing resolver tests**

Create `apps/atrium.website/lib/work.test.ts` with focused cases for explicit media, gallery fallback, and missing media:

```ts
import { describe, expect, test } from 'bun:test'
import { type CaseStudy, getCaseCover } from './work'

const study = {
  slug: 'sample',
  client: 'Sample Client',
  category: 'Restaurant',
  serviceTags: [],
  resultHeadline: 'Result',
  story: [],
  metrics: [],
  order: 1,
} satisfies CaseStudy

describe('getCaseCover', () => {
  test('prefers explicit cover metadata', () => {
    expect(getCaseCover({
      ...study,
      coverImageId: 'clients/sample/cover',
      coverLogo: '/logos/clients/sample.svg',
      coverPosition: 'center 35%',
      galleryIds: ['clients/sample/gallery'],
    })).toEqual({
      imageId: 'clients/sample/cover',
      logo: '/logos/clients/sample.svg',
      position: 'center 35%',
    })
  })

  test('falls back to the first gallery image', () => {
    expect(getCaseCover({ ...study, galleryIds: ['clients/sample/gallery'] }).imageId)
      .toBe('clients/sample/gallery')
  })

  test('returns an empty image fallback without throwing', () => {
    expect(getCaseCover(study)).toEqual({ imageId: undefined, logo: undefined, position: 'center' })
  })
})
```

**Step 2: Run the test to verify it fails**

Run: `bun test apps/atrium.website/lib/work.test.ts`

Expected: FAIL because `getCaseCover` and cover fields do not exist.

**Step 3: Add the metadata and resolver**

Extend `CaseStudy` in `apps/atrium.website/lib/work.ts`:

```ts
coverImageId?: string
coverLogo?: string
coverPosition?: string
```

Add the resolver below the type:

```ts
export function getCaseCover(study: CaseStudy) {
  return {
    imageId: study.coverImageId ?? study.galleryIds?.[0],
    logo: study.coverLogo,
    position: study.coverPosition ?? 'center',
  }
}
```

Populate explicit `coverImageId` values from the existing Cloudinary photo IDs and add the logo paths already present in `apps/atrium.website/public/logos/clients/`. Use the first suitable static photo for Taco Naco, T’ÄHÄ, and Aahaa. Add the available Hotel Kansas City and Town Company logos; leave unavailable logo and photo fields undefined so the approved fallbacks remain truthful rather than inventing assets.

**Step 4: Run the test to verify it passes**

Run: `bun test apps/atrium.website/lib/work.test.ts`

Expected: PASS for all three resolver cases.

**Step 5: Commit**

```bash
git add apps/atrium.website/lib/work.ts apps/atrium.website/lib/work.test.ts
git commit -m "feat(website): add case cover metadata"
```

### Task 2: Build the shared cover component

**Files:**
- Create: `apps/atrium.website/components/work/CaseCover.tsx`
- Reference: `apps/atrium.website/components/media/CldImage.tsx`
- Reference: `apps/atrium.website/lib/work.ts`

**Step 1: Create the component contract**

Create a server-compatible component accepting `study`, `className`, and `priority`:

```tsx
import Image from 'next/image'
import CldImage from '@/components/media/CldImage'
import { type CaseStudy, getCaseCover } from '@/lib/work'

type Props = {
  study: CaseStudy
  className?: string
  priority?: boolean
}

export default function CaseCover({ study, className = '', priority = false }: Props) {
  const cover = getCaseCover(study)

  return (
    <div
      className={`relative isolate h-full w-full overflow-hidden bg-[var(--teal-900)] ${className}`}
      aria-label={`${study.client} case study cover`}
      role="img"
    >
      {cover.imageId && (
        <CldImage
          publicId={cover.imageId}
          alt={`${study.client} campaign photograph`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          style={{ objectPosition: cover.position }}
        />
      )}

      <div className="absolute inset-0 z-10 bg-black/45" aria-hidden="true" />

      <div className="absolute inset-0 z-20 flex items-center justify-center p-8 md:p-12">
        {cover.logo ? (
          <div className="relative h-20 w-[min(58%,20rem)] md:h-24">
            <Image
              src={cover.logo}
              alt=""
              fill
              sizes="20rem"
              className="object-contain brightness-0 invert"
            />
          </div>
        ) : (
          <span className="max-w-[16ch] text-center text-3xl font-medium leading-tight text-white md:text-5xl">
            {study.client}
          </span>
        )}
      </div>
    </div>
  )
}
```

If `role="img"` plus the nested image creates duplicated announcements in browser testing, make the photo decorative (`alt=""`) and retain the concise wrapper label as the single accessible name.

**Step 2: Run static verification**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: PASS with no `ImageProps`, import, or `CaseStudy` errors.

**Step 3: Commit**

```bash
git add apps/atrium.website/components/work/CaseCover.tsx
git commit -m "feat(website): add shared case cover"
```

### Task 3: Replace covers on the work archive and case pages

**Files:**
- Modify: `apps/atrium.website/app/work/page.tsx:1-36`
- Modify: `apps/atrium.website/app/work/[slug]/page.tsx:1-97`

**Step 1: Replace the work archive placeholder**

Import `CaseCover` and replace the theme-based body of `CaseVisual` with:

```tsx
return (
  <CaseCover
    study={study}
    priority={featured}
    className={`rounded-[var(--radius-bento)] lg:aspect-auto ${
      featured
        ? 'aspect-[16/10] min-h-[24rem] lg:min-h-[32rem]'
        : index % 2 === 0
          ? 'aspect-[16/10] lg:min-h-[30rem]'
          : 'aspect-[4/3] lg:min-h-[30rem]'
    }`}
  />
)
```

Delete `defaultVisualTheme` and `visualThemes`; the shared component owns visual fallback behavior.

**Step 2: Replace the case hero and next-case placeholder**

Import `CaseCover` in `apps/atrium.website/app/work/[slug]/page.tsx`. Replace `CaseMedia` with a small geometry wrapper around the shared component:

```tsx
function CaseMedia({ study, compact = false }: { study: CaseStudy; compact?: boolean }) {
  return (
    <CaseCover
      study={study}
      priority={!compact}
      className={`rounded-[var(--radius-bento)] ${
        compact
          ? 'min-h-[20rem] md:min-h-[32rem]'
          : 'aspect-[4/3] min-h-[25rem] lg:aspect-auto lg:min-h-[38rem]'
      }`}
    />
  )
}
```

Remove `visualThemes`, `getVisualColor`, and the unused `offset` parameter. This updates both `CaseHero` and `NextCasePreview` through their existing `CaseMedia` calls.

**Step 3: Verify types and lint**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: PASS.

Run: `bunx biome check apps/atrium.website/app/work/page.tsx 'apps/atrium.website/app/work/[slug]/page.tsx' apps/atrium.website/components/work/CaseCover.tsx`

Expected: PASS with no unused declarations or formatting errors.

**Step 4: Commit**

```bash
git add apps/atrium.website/app/work/page.tsx 'apps/atrium.website/app/work/[slug]/page.tsx'
git commit -m "feat(website): apply covers to work pages"
```

### Task 4: Reuse case-study data and covers on the home page

**Files:**
- Modify: `apps/atrium.website/app/page.tsx:1-30`
- Modify: `apps/atrium.website/components/sections/WorkGrid.tsx:1-75`

**Step 1: Remove duplicated cover data from home**

Import `caseStudies` and derive the five selected cases by slug:

```ts
const selectedWorkSlugs = ['taco-naco', 'taha', 'aahaa', 'hotel-kc', 'grand-coffee']

const selectedWork = selectedWorkSlugs
  .map(slug => caseStudies.find(study => study.slug === slug))
  .filter((study): study is CaseStudy => Boolean(study))
```

This makes the case-study store the source of truth for image, logo, href, and client name.

**Step 2: Update `WorkGrid` props and render the shared cover**

Replace the duplicated `Project` cover contract with a lightweight presentation entry:

```ts
export type Project = {
  study: CaseStudy
  result: string
  orientation: 'horizontal' | 'vertical' | 'square'
}
```

Alternatively, if the current home layout still needs independently authored result and orientation copy, build that metadata beside the slug list and attach the resolved `study`. In the visual frame render:

```tsx
<CaseCover
  study={project.study}
  className={aspectMap[project.orientation]}
/>
```

Use `project.study.slug`, `project.study.client`, and `project.study.order` for the link, text, key, and number. Remove the placeholder forest background and oversized number from the image frame.

**Step 3: Verify client-component compatibility**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: PASS, including the server-to-client serialization of the plain `CaseStudy` data.

Run: `bunx biome check apps/atrium.website/app/page.tsx apps/atrium.website/components/sections/WorkGrid.tsx`

Expected: PASS.

**Step 4: Commit**

```bash
git add apps/atrium.website/app/page.tsx apps/atrium.website/components/sections/WorkGrid.tsx
git commit -m "feat(website): apply case covers on home"
```

### Task 5: Run full verification and visual QA

**Files:**
- Verify: `apps/atrium.website/app/page.tsx`
- Verify: `apps/atrium.website/app/work/page.tsx`
- Verify: `apps/atrium.website/app/work/[slug]/page.tsx`
- Verify: `apps/atrium.website/components/work/CaseCover.tsx`

**Step 1: Run the focused tests**

Run: `bun test apps/atrium.website/lib/work.test.ts apps/atrium.website/lib/cloudinary.test.ts`

Expected: PASS.

**Step 2: Run project checks**

Run: `bun run --cwd apps/atrium.website typecheck`

Expected: PASS.

Run: `bun run --cwd apps/atrium.website lint`

Expected: PASS or only pre-existing issues documented separately.

Run: `bun run --cwd apps/atrium.website build`

Expected: successful Next.js production build with `/`, `/work`, and all `/work/[slug]` routes generated.

**Step 3: Inspect desktop and mobile renders**

Start the site with `bun run dev:website`. Capture and inspect at least:

- `/` at 1440 px and 390 px widths.
- `/work` at 1440 px and 390 px widths.
- `/work/taco-naco` at 1440 px and 390 px widths.
- One case without explicit media to verify the neutral fallback.

Confirm the photo crop, 45% overlay, centered logo scale, white logo contrast, text fallback, hover zoom, keyboard focus, and absence of layout shift.

**Step 4: Fix only cover-specific findings and rerun checks**

Keep adjustments inside `CaseCover` or explicit per-case `coverPosition` values. Do not alter unrelated typography, layout, or current user changes.

**Step 5: Commit verification fixes if needed**

```bash
git add apps/atrium.website/components/work/CaseCover.tsx apps/atrium.website/lib/work.ts
git commit -m "fix(website): polish case cover presentation"
```

### Task 6: Refresh the project knowledge graph

**Files:**
- Update: `graphify-out/`

**Step 1: Update graph artifacts**

Run: `graphify update .`

Expected: the new `CaseCover` component and its relationships to home, work archive, case hero, and next-case preview appear in the graph.

**Step 2: Confirm the relationship**

Run: `graphify query "¿Dónde se usa CaseCover y qué datos resuelven sus imágenes y logotipos?"`

Expected: results include `CaseCover.tsx`, `work.ts`, `app/page.tsx`, `app/work/page.tsx`, and `app/work/[slug]/page.tsx`.

**Step 3: Commit graph artifacts only if the repository tracks them for this change**

```bash
git add graphify-out
git commit -m "chore: refresh codebase graph for case covers"
```

