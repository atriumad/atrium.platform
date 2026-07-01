# Atrium Site — UI Kit

A high-fidelity recreation of Atrium's marketing website, built from the design
system's own primitives (`Button`, `Chip`, `Card`, `Badge`, `Logo`, `Highlight`,
`Eyebrow`, `ScriptAccent`, `Input`).

## Run
Open `index.html`. It loads `styles.css`, the compiled `_ds_bundle.js`, React +
Babel, and Lucide (icons), then mounts the kit's section components.

## Files
- `index.html` — interactive app shell. Holds state for the **work filter**
  (chips filter the gallery) and the **contact form** (chip-select interest →
  submit → success state).
- `AtriumKit.jsx` — chrome: `Icon` (Lucide wrapper), `AtriumHeader`
  (sticky, responsive burger), `AtriumHero` (deep-teal, α watermark, marker +
  script headline, service chips), `AtriumFooter`.
- `AtriumSections.jsx` — `AtriumServices` (4 color-led cards), `AtriumMarquee`
  (amber "THE EXPERIENCE ERA" scroller), `AtriumWork` (filterable gallery),
  `AtriumContact` (form with success state).

## Notes
- Kit section components export to `window`; primitives are read from
  `window.AtriumDesignSystem_31d170`.
- Portfolio tiles are tonal brand fields (teal/mint/amber) with the α mark — no
  fabricated photography. Swap in real imagery / `<image-slot>`s for production.
- Icons are **Lucide** (substitution — the identity ships no UI icon set).
