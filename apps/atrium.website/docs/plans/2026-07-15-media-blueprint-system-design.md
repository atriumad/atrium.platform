# Media Blueprint System — Design

**Date:** 2026-07-15  
**Status:** Approved  
**Scope:** Entire Atrium marketing website

## Intent

The website currently communicates through strong editorial typography and structured copy, but it lacks enough visual evidence and breathing room. The goal is to introduce planned media moments now, before final photography, video, campaign assets, and dashboards are available.

These moments must not look like broken images or generic gray placeholders. They should work as intentional art direction: visually useful today, operationally useful when planning production, and replaceable without rebuilding page layouts later.

## Approved direction

Use a hybrid placeholder system called **Media Blueprint**.

Each blueprint combines:

- an abstract, brand-aligned visual composition;
- a discreet production label such as `PHOTO 01`, `REEL 02`, or `REPORT 01`;
- a concise asset brief describing subject, framing, light, motion, or data;
- a stable aspect ratio and layout role;
- an optional real media source that replaces the abstract layer later.

The site should use two to four visual anchor moments per page. Visual density remains deliberate rather than continuous: editorial sections still provide rhythm, while media moments become proof, atmosphere, or explanation.

## Visual language

The system extends the current Atrium design language:

- Deep teal, cloud, mint, charcoal, and amber remain the core palette.
- Instrument Serif remains the expressive display voice.
- Inter Tight remains the body and interface voice.
- Atmospheric gradients, grain, translucent layers, crop marks, and restrained linework create depth.
- Production metadata behaves like a contact sheet or creative director's board, not application chrome.
- Placeholders never use generic image icons, gray skeletons, or visible `[placeholder]` copy.
- One visual treatment carries each composition; effects are not stacked gratuitously.

## Blueprint variants

### Cinematic

Wide photography or video anchor for restaurant environments, people, food, and production. Uses depth, light falloff, crop guides, and a restrained production brief.

### Collage

Three to five coordinated frames for campaign systems, teams, case-study breadth, or multi-location storytelling. Supports mixed ratios without becoming a generic masonry gallery.

### Device

Vertical reels, social posts, email, CRM, or mobile flows shown in purposeful device-like frames. The frame remains secondary to the content plan.

### Dashboard

Reporting, attribution, campaign timelines, channel comparisons, and operational evidence. Uses abstract chart geometry until real screenshots exist.

### Process

Storyboard or sequential media for the 28-day cycle, production days, activation, and reporting. Sequence numbering is functional because order carries meaning.

## Component architecture

Create a reusable `MediaBlueprint` renderer backed by structured data.

```ts
type MediaBlueprint = {
  kind: 'cinematic' | 'collage' | 'device' | 'dashboard' | 'process'
  assetType: 'photo' | 'video' | 'reel' | 'dashboard' | 'illustration'
  code: string
  title: string
  direction: string
  ratio: '16:9' | '4:3' | '3:4' | '1:1' | '9:16' | 'wide'
  src?: string
  alt?: string
  poster?: string
}
```

When `src` is absent, the component renders the hybrid art-direction state. When `src` exists, the real media replaces the abstract visual while preserving ratio, placement, caption, and optional production metadata.

Complex compositions use small wrapper components around the same primitive rather than duplicating placeholder markup across pages.

## Site distribution

### Home

- Preserve the existing 3D hero.
- Add an on-location hospitality collage near the problem/benefit narrative.
- Strengthen the Growth Engine with a visual system moment.
- Add a dashboard/reporting blueprint near measurement proof.

### Services hub

- Capability mosaic showing production, systems, and channel outputs.
- Generate → Convert → Retain visual flow.
- Reporting or attribution artifact.

### Service detail

- Service-specific hero media.
- One visualized deliverable or platform artifact.
- Related-case media anchor.
- Process or measurement visual depending on the service.

### Work index and case studies

- Visual covers for every case.
- Existing gallery and reel areas migrate to Media Blueprint.
- Dashboard/results compositions support measurable outcomes.
- Final assets replace blueprints without structural changes.

### About

- Founder portrait.
- Team working and production on location.
- Distributed-team or location collage.

### Pricing

- Scope/proposal artifact.
- Monthly cadence or deliverables board.
- Example reporting output.

### Process

- 28-day storyboard.
- Shoot-day visual.
- Activation sequence.
- Reporting handoff.

### Resources

- Editorial cover system for guides, playbooks, and future articles.

### Contact

- Diagnostic table or workshop scene.
- First-cycle planning artifact.

## Responsive behavior

- Mobile preserves the visual hierarchy rather than shrinking desktop collages.
- Collages may reduce frame count or reorder intentionally at 390px.
- Production metadata wraps below media when an overlay would reduce legibility.
- Wide and cinematic ratios receive mobile-specific minimum heights.
- Device blueprints remain bounded and never create horizontal overflow.

## Motion

- Cinematic layers may use restrained parallax.
- Collage frames may reveal as one coordinated sequence.
- Dashboard elements may draw or rise subtly without simulating fabricated live data.
- Process frames may advance through restrained staggered motion.
- All content remains visible without JavaScript.
- `prefers-reduced-motion` removes transforms and autoplay behavior.

## Accessibility

- A blueprint without real media is not announced as a real photograph or screenshot.
- Its production brief remains visible text when it carries planning value.
- Real media requires meaningful `alt`; decorative media uses an empty alt.
- Real video must provide controls, captions where speech exists, and a poster.
- Color and metadata retain readable contrast across every blueprint variant.

## Verification

- Add an internal `/media-blueprints` reference page or equivalent development gallery.
- Test all variants at 390, 768, 1024, and 1440 pixels.
- Verify no horizontal overflow and no metadata collisions.
- Verify reduced-motion behavior.
- Run website lint, TypeScript, and production build.
- Update Graphify after implementation.

## Success criteria

- Every major page gains two to four intentional visual anchors.
- The site feels illustrative and experiential without pretending temporary art is final client media.
- Every placeholder doubles as a useful production brief.
- Replacing a blueprint with final media does not require rebuilding layout.
- Editorial typography and visual media feel balanced rather than competitive.
