# Editorial Value Metrics — Design

## Intent

Atrium's value metrics should read as proof, not supporting copy. Every number must feel like a confident business outcome: large enough to stop the scroll, specific enough to earn trust, and quiet enough in its surrounding treatment that the number remains the focal point.

## Direction

Use an editorial, high-contrast system inspired by the supplied reference:

- monumental serif numerals paired with restrained sans-serif explanations;
- large jumps in scale rather than cards, badges, gradients, or decorative effects;
- thin horizontal rules to organize the rhythm;
- generous whitespace and asymmetric number/copy placement;
- light and dark variants drawn from Atrium's existing palette;
- a concise section introduction that frames the metrics as business proof;
- subtle upward entrance choreography with staggered timing.

## Component coverage

The system applies to every value-metric family:

1. Homepage `StatsStrip`.
2. Service-page `ServiceStatsEditorial`.
3. Case-study `ResultsSection`.
4. Page-level hero statistics in `PageHero`, where the same visual hierarchy is expressed in a more compact format.

## Responsive behavior

Desktop layouts use two-column metric rows so the description and numeral balance each other across a divider. Alternating placement may create editorial rhythm without affecting reading order. Mobile layouts stack each item with the numeral first, preserve a dramatic but bounded type scale, and retain dividers and generous vertical spacing.

## Accessibility and motion

Body copy must retain readable contrast on every surface. Decorative animation must respect `prefers-reduced-motion` through the project's GSAP setup and must never hide content if JavaScript is unavailable. Semantic heading order remains page-specific; values and explanations remain ordinary text content rather than animated counters.

## Success criteria

- Metrics become the dominant visual moment of their sections.
- The four contexts feel like one family without becoming identical templates.
- The design remains readable at 390px and balanced at 1440px.
- No nested cards, glass effects, generic gradients, or gratuitous motion are introduced.

