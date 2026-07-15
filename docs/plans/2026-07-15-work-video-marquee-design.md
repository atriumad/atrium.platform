# Work Case Study Video Marquee

## Goal

Replace the placeholder reel strip on individual `/work/[slug]` pages with a reusable, Cloudinary-backed video marquee. T’ÄHÄ is the first case study with real video content; case studies without configured videos should not render the section.

## Data model

Extend `CaseStudy` with an optional `videoIds: string[]` field, parallel to the existing `galleryIds` field. Store Cloudinary public IDs without a leading slash or `.mp4` extension so URL generation remains centralized in `lib/cloudinary.ts`.

The initial T’ÄHÄ entry contains the 15 supplied versioned public IDs. Future case studies can opt into the same section by adding their own `videoIds` array.

## Component integration

`ReelsSection` on the case-study route will return `null` when `study.videoIds` is absent or empty. When videos exist, it retains the existing editorial heading and renders `VideoMarquee` with those IDs instead of placeholder cards.

`VideoMarquee` remains responsible for resolving Cloudinary URLs, laying out vertical 9:16 cards, duplicating the sequence for seamless movement, and applying the curved perspective effect.

## Performance and accessibility

Cloudinary supplies optimized MP4 URLs and first-frame poster images. Videos stay muted, looping, inline, non-interactive, and decorative. Playback is limited to cards near the viewport so the duplicated marquee does not decode every video simultaneously.

The marquee honors `prefers-reduced-motion` by disabling continuous translation while retaining a readable static layout. Responsive card sizing keeps the reel presentation useful on mobile and desktop.

## Verification

Add or update focused tests for Cloudinary public-ID normalization and data presence where practical. Run the website type/lint checks and production build, then inspect the T’ÄHÄ case page and a case without videos to confirm conditional rendering, responsive layout, poster delivery, and playback behavior.
