# Restaurant Growth Grader Design

## Goal

Build Atrium's first usable product surface as a public restaurant growth grader. A user enters a restaurant name, selects the matching business, and receives a clear diagnostic report with scores, risks, opportunities, and recommended marketing actions.

This is the highest priority because it validates the core logic before the full dashboard exists. The same diagnostic engine will later feed account health, alerts, recommendations, reports, and the agency version of Atrium.

## Product Strategy

Atrium starts with a restaurant-first MVP but keeps an agency-ready architecture.

MVP positioning:

> Atrium helps restaurants understand the health of their business, detect risks, and turn scattered digital signals into clear marketing actions.

Future agency positioning:

> Atrium helps marketing agencies operate, analyze, and report growth for their full hospitality client portfolio from one system.

The grader is the entry point for both. It works as a lead magnet, a diagnostic product, and the first version of Atrium's business intelligence logic.

## Core Flow

```txt
Restaurant name
  -> business resolution
  -> public business profile
  -> website scan
  -> reputation scan
  -> local discovery scan
  -> conversion scan
  -> score calculation
  -> recommendations
  -> report
  -> signup/demo CTA
```

For the first free-first implementation, the data source is OpenStreetMap-derived public business data, a lightweight website scan, local competitor benchmarking, and optional manual reputation inputs. The module boundaries should make it straightforward to add paid or connected providers later without making them required for the MVP.

## Score Model

The grader returns an overall score from 0 to 100 and four sub-scores:

- Discovery: local visibility, business profile completeness, search readiness.
- Website: site quality, mobile readiness, technical SEO, clear menu/reservation/ordering paths.
- Reputation: optional rating and review count when entered manually or later connected through a provider.
- Conversion: calls to action, ordering/reservation links, phone visibility, tracking readiness.

Each scan also returns:

- top issues,
- top opportunities,
- recommended actions,
- estimated lost opportunity,
- next best action,
- confidence level.

## Architecture

Create a reusable diagnostic module in `packages/application`:

```txt
packages/application/src/diagnostics/
  restaurant-growth-grader.ts
  restaurant-growth-grader.test.ts
```

Expose it from `packages/application/src/index.ts`.

The grader is its own app in the monorepo. Keep the data provider inside `apps/grader` and keep score logic in `packages/application`; this lets the public grader evolve independently from the authenticated webapp while still sharing the diagnostic engine. Later, move providers behind ports and persist scan results.

Add a route handler:

```txt
apps/grader/app/api/grader/route.ts
apps/grader/app/api/grader/route.test.ts
apps/grader/app/api/grader/search/route.ts
apps/grader/app/api/grader/search/route.test.ts
apps/grader/lib/open-data-places.ts
```

Add the public page:

```txt
apps/grader/app/page.tsx
apps/grader/app/grader-client.tsx
```

The UI should be functional and premium enough to demo, but the priority is the diagnostic flow and reusable logic.

## Non-Goals For This Iteration

- No Google Analytics OAuth.
- No Google Search Console OAuth.
- No Google Business Profile manager OAuth.
- No authenticated Google Analytics/Search Console/Business Profile OAuth.
- No paid Places provider required for the MVP.
- No paid data provider integration.
- No persistence.
- No full dashboard redesign.

## Future Integrations

Once the grader behavior is validated, add integrations in this order:

1. OpenStreetMap/Nominatim business search and lookup.
2. Website scanner for metadata, links, mobile, schema, and conversion paths.
3. Overpass local competitor benchmark.
4. Manual reputation fields with confidence scoring.
5. Optional paid Places provider.
6. Google Analytics OAuth.
7. Google Search Console OAuth.
8. Business Profile manager OAuth.
9. POS/order import.

## Acceptance Criteria

- A user can run `bun run dev:grader`, open the grader app root, search/select a restaurant, and run a scan.
- The scan calls `/api/grader`.
- The API returns a deterministic diagnostic report from open business data, website signals, local benchmark signals, and optional manual reputation data.
- The diagnostic scoring is covered by tests.
- The route handler has at least one behavior test.
- The page displays overall score, four sub-scores, issues, opportunities, recommendations, and CTA.
- `bun run typecheck`, `bun run lint`, and relevant tests pass.
