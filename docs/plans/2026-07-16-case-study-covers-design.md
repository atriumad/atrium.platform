# Case Study Covers Design

## Objective

Create one recognizable cover treatment for every case-study entry point across the Atrium website: a static client photograph from Cloudinary, a dark translucent overlay, and the client's logo centered over the image.

## Scope

The treatment applies wherever a case study is represented by a cover, including:

- Selected-work cards on the home page.
- Featured and archive entries on `/work`.
- The next-case preview inside individual case-study pages.
- Future case-study links that adopt the shared cover component.

Galleries, video marquees, and editorial media inside a case study keep their existing presentation.

## Data Model

Each `CaseStudy` owns its cover configuration. The base fields are:

- `coverImageId`: the Cloudinary public ID of the selected static photograph.
- `coverLogo`: the local path to the client's transparent logo asset.
- Optional image-position metadata for photographs that need a crop adjustment.

The first implementation can use an existing gallery photograph as the default cover source while keeping the explicit cover field as the canonical selection. If a logo asset is unavailable, the component renders the client name as a temporary centered wordmark so every case still receives the complete cover treatment.

## Component Design

A shared `CaseCover` component will render the full composition:

1. A responsive Cloudinary image fills the available frame with `object-fit: cover`.
2. A black overlay sits above the photograph at approximately 45% opacity.
3. The client logo is centered horizontally and vertically with `object-fit: contain` and responsive maximum dimensions.
4. On interactive cards, only the photograph receives a subtle scale-up on hover. The overlay and logo remain fixed and readable.

The parent surface controls aspect ratio, minimum height, border radius, and link behavior. This lets home, `/work`, and next-case layouts retain their current geometry while sharing the same visual language.

## Accessibility

- The photograph receives descriptive alternative text tied to the client and case-study context.
- The centered logo is decorative because the surrounding link already provides the client and destination name.
- Text fallback remains readable against the overlay.
- Existing keyboard focus treatment on each linked card is preserved.
- Motion remains limited to the current short hover transition and respects the surrounding interaction model.

## Failure and Fallback Behavior

- Missing logo: render the client name as a centered text wordmark.
- Missing explicit cover image: use the first available `galleryId`.
- Missing all usable media: retain a neutral branded background with the client logo or name, avoiding a broken image.
- Cloudinary remains the single source for photographic covers; local files are reserved for lightweight transparent logo assets.

## Verification

Verify all cover surfaces at desktop and mobile widths, checking:

- Image crop and loading behavior.
- Overlay consistency and logo contrast.
- Logo sizing across wide, square, and tall marks.
- Fallback behavior for cases without a local logo.
- Hover, keyboard focus, and link destinations.
- Type checking, linting, and the website production build.

