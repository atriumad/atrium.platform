# Film & Photo Bento Visual Prototype

**Date:** 2026-07-20  
**Status:** Approved  
**Scope:** `/services/film-photo` bento section only

## Objective

Turn the Film & Photo bento from a repeated text-card layout into a visual proof of Atrium's production system. The prototype must show restaurant owners how one shoot becomes a reusable content library while preserving the candid, disposable-camera language established by the service thesis photography.

## Audience and tone

The primary audience is restaurant owners and general prospective Atrium clients. They should understand the production value without needing photography or marketing expertise.

The visual tone combines:

- Real US hospitality environments.
- Warm direct-flash documentary photography.
- Visible grain, amber highlights, and deep teal shadows.
- Clear editorial graphics that explain process and reuse.
- Short, purposeful motion that resolves into readable static compositions.

## Selected approach

Use a hybrid media system:

- **Higgsfield** produces source photographs and one short BTS clip.
- **Remotion** composes the focal transformation sequence and the short film-strip sequence.
- **React/CSS/SVG** handles the before/after wipe and contact-sheet reveal.
- Only the focal card behaves as a dominant video. Other cards use lightweight motion and settle into static end states.

This approach gives the page cinematic personality without shipping a wall of autoplaying video or hydrating all bento copy.

## Bento treatments

### 1. Shoot once, use everywhere

The tall feature card becomes the emotional anchor.

- Begin with a 3–4 second Higgsfield BTS clip of a photographer shooting a chef plating food in a real restaurant kitchen.
- Remotion transitions the footage into six recognizable outputs: Reel, carousel, story, Google photo, website hero, and paid ad.
- The full sequence lasts 7–9 seconds and ends on a readable six-format layout.
- The title and supporting copy remain visible outside the busiest portion of the media.
- A poster frame reproduces the final layout for reduced motion, slow connections, and failed video playback.

### 2. The appetizer that changed a brand

Show the same appetizer photographed two ways.

- Generate one base dish and a reference-consistent alternate treatment.
- The first state uses flat direct flash and weaker depth.
- The second uses controlled diffusion, deeper shadows, and a more distinctive editorial direction.
- A vertical wipe reveals the transformation once when the card enters the viewport.
- Pointer users may scrub the comparison; touch users receive a large accessible control.
- Reduced-motion mode renders the final side-by-side comparison immediately.

### 3. Different photos of every item

Build a six-frame contact sheet of the same taco plate.

- Required angles: hero, cut/detail, steam, hand reaching, table context, ingredient close-up.
- Use a reference image to keep the dish and styling consistent across generations.
- Cells reveal in a short stagger using opacity and transform only.
- Each frame gets a plain label so owners understand why the angle exists.
- The final state remains visible and fully understandable without motion.

### 4. Photos of no food

Use a short Remotion film strip to show atmosphere and team culture.

- Four moments: team laughter, bar at golden hour, table reset, front door opening.
- Present them as tactile 35mm frames with restrained horizontal movement.
- The sequence lasts approximately six seconds, plays once in viewport, and stops on a balanced four-frame composition.
- Avoid captions burned into the generated photography; labels belong to the interface layer.

## Asset plan

Store source and rendered media under:

```text
apps/atrium.website/public/media/services/film-photo/bento/
```

Suggested structure:

```text
bento/
├── source/
│   ├── bts-kitchen.mp4
│   ├── appetizer-flat.jpg
│   ├── appetizer-directed.jpg
│   ├── contact-01-hero.jpg
│   ├── contact-02-cut.jpg
│   ├── contact-03-steam.jpg
│   ├── contact-04-hand.jpg
│   ├── contact-05-table.jpg
│   ├── contact-06-ingredient.jpg
│   ├── culture-team.jpg
│   ├── culture-bar.jpg
│   ├── culture-table.jpg
│   └── culture-door.jpg
├── shoot-once-poster.jpg
├── shoot-once.webm
├── shoot-once.mp4
├── culture-strip-poster.jpg
├── culture-strip.webm
└── culture-strip.mp4
```

Generated source should remain available so individual shots can be replaced without regenerating the full composition.

## Component architecture

Keep `ServiceBento` as a Server Component. Introduce small visual children rather than turning the whole section into a client component.

Proposed components:

```text
ServiceBento
├── BentoMediaFrame
├── ShootOnceVisual
├── BeforeAfterVisual.client
├── ContactSheetVisual.client
└── CultureFilmStripVisual
```

`ShootOnceVisual` and `CultureFilmStripVisual` render pre-produced videos with posters; Remotion is used during asset production rather than shipped as a browser dependency. The comparison and contact sheet use narrowly scoped client components.

Extend `BentoCard` with an optional discriminated visual definition rather than inferring behavior from array position:

```ts
type BentoVisual =
  | { kind: 'video'; src: string; webmSrc?: string; poster: string; alt: string }
  | { kind: 'comparison'; before: string; after: string; alt: string }
  | { kind: 'contact-sheet'; frames: Array<{ src: string; alt: string; label: string }> }
  | { kind: 'film-strip'; src: string; webmSrc?: string; poster: string; alt: string }
```

The existing `coverAlt` remains available during migration but should no longer render as visible placeholder text.

## Motion behavior

- Trigger once when at least roughly 35% of the visual enters the viewport.
- Pause videos when they leave the viewport or the document becomes hidden.
- Use muted, `playsInline`, `preload="none"`, and posters.
- Animate transform, opacity, clip-path, and SVG attributes only; do not animate layout dimensions.
- Use smooth exponential deceleration without bounce or elastic easing.
- Under `prefers-reduced-motion: reduce`, skip autoplay and display final poster/static states.
- Do not require hover to understand any message.

## Responsive behavior

- Desktop retains an asymmetric editorial grid with one tall focal card.
- Four-card layouts receive an explicit grid; no implicit third-row placement.
- Tablet reduces visual density but preserves media next to its explanation.
- Mobile stacks cards in narrative order and replaces tall fixed minimum heights with media-specific aspect ratios.
- Phone controls and comparison handles use touch targets of at least 44px.

## Accessibility

- Informative images and video posters receive meaningful alt text.
- Decorative film grain and frame chrome are hidden from assistive technology.
- Video contains no unique spoken content; card text communicates the full point.
- The before/after control is keyboard accessible and exposes its current value.
- Contact-sheet labels remain visible without animation.
- Reduced-motion and data-saving users receive static equivalents.

## Performance budget

- One dominant video plus one smaller film-strip video.
- Serve WebM first with MP4 fallback.
- Target each video below roughly 2.5 MB when visual quality allows.
- Lazy-load all media because the bento sits below the fold.
- Use `next/image` with explicit `sizes` for stills.
- Do not ship Remotion Player, Three.js, or a general animation runtime for pre-rendered sequences.

## Failure handling

- Video failure falls back to the poster without leaving an empty card.
- Missing optional visual data falls back to the existing text-card treatment.
- Incomplete contact-sheet frames render the available images without broken cells.
- Generated assets are reviewed for anatomy, invented typography, brand marks, and screen artifacts before integration.

## Verification

- Production build and TypeScript pass.
- Test desktop, tablet, and 390px mobile layouts.
- Test `prefers-reduced-motion` and browser data-saving behavior.
- Confirm video pause/resume and tab visibility behavior.
- Confirm keyboard operation of the before/after control.
- Verify static fallbacks by disabling autoplay and temporarily breaking a video URL.
- Check that all four cards remain understandable with JavaScript disabled.

## Success criteria

- A restaurant owner can explain the value of all four cards after scanning the section once.
- The section feels like production evidence, not an agency dashboard template.
- Motion clarifies reuse, transformation, and sequence rather than decorating the cards.
- The page remains fast and fully understandable under reduced motion.
- The architecture can later support other services without forcing every service into the same media pattern.
