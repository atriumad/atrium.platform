# Grader UI simplification

## Goal

Make `apps/grader` feel like a focused public diagnostic tool for restaurants: a short prompt, real restaurant autocomplete, animated scan timeline, and a final result with a complete-report CTA.

## Scope

- Keep the grader as an independent app in `apps/grader`.
- Preserve the existing free-first open data API flow.
- Remove the cached/demo preview from the first screen.
- Use solid colors only, with no gradients.
- Use Instrument-style display typography and Inter Tight-style body typography through app-level font stacks.

## Steps

1. Replace the current two-column preview UI with a minimal search stage.
2. Move optional rating/review inputs behind restaurant selection.
3. Run the diagnostic request while showing a multi-step timeline.
4. Show the report only after the scan finishes.
5. Add a clear `Get complete report` button in the final state.
6. Verify typecheck, lint, tests, build, and local HTTP rendering.
