# Restaurant Growth Grader - analisis actual del servicio

Last reviewed: 2026-07-09

Este documento describe el scope actual del Restaurant Growth Grader despues del cambio a Google-only para business data y ScrapeCreators para social.

## Resumen ejecutivo

El grader usa Google Places como unica fuente de datos de negocio. No hay fallback secundario. Si `GOOGLE_PLACES_API_KEY` no existe, search y report devuelven un error de configuracion.

Flujo real:

```txt
User search
  -> POST /api/grader/search
  -> Google Places Autocomplete + Details
  -> user selects google:* placeId
  -> POST /api/grader
  -> Google Places Details
  -> website scan
  -> gradeRestaurantGrowth(profile)
  -> structured scan evidence + scanId
  -> optional frontend follow-up: ScrapeCreators social scan + narrative enrichment
  -> final report JSON
```

La animacion de progreso en `apps/atrium.grader/app/grader-client.tsx` sigue siendo presentacional. El resultado final si renderiza evidencia real por paso desde `report.diagnosticSteps`.

## Contrato actual

- `POST /api/grader` devuelve `scanId`, `report` y `meta`.
- `RestaurantGrowthReport` incluye `scoringVersion: "restaurant-growth-v2"`.
- `RestaurantGrowthReport` incluye `providerVersions` para business data, website, benchmark, reputation y social.
- `RestaurantGrowthReport` incluye `diagnosticSteps` con status, source, confidence, found, missing, assumptions y errors.
- `RestaurantGrowthReport` incluye `dataQuality` con provider efectivo y datos criticos faltantes.
- El server emite logs estructurados `"[grader-scan]"` y `"[grader-scan-error]"`.
- Si `GRADER_SCAN_STORE=file` y no es production, se guarda evidencia completa en `.tmp/grader-scans/{scanId}.json`.

Pendiente:

- Persistencia durable en DB.
- Debug route interna autenticada.
- Raw provider payloads completos para replay.
- Progress real por SSE/polling mientras corre el scan.

## Archivos principales

| Area | Archivo |
| --- | --- |
| UI y pasos visibles | `apps/atrium.grader/app/grader-client.tsx` |
| Search route | `apps/atrium.grader/app/api/grader/search/route.ts` |
| Report route | `apps/atrium.grader/app/api/grader/route.ts` |
| Google business wrapper | `apps/atrium.grader/lib/open-data-places.ts` |
| Google Places client | `apps/atrium.grader/lib/google-places-client.ts` |
| Website scanner | `apps/atrium.grader/lib/website-scanner.ts` |
| Place helpers | `apps/atrium.grader/lib/place-utils.ts` |
| Social auto-detect | `apps/atrium.grader/lib/auto-detect-social.ts` |
| Social handle parser | `apps/atrium.grader/lib/social-detector.ts` |
| Social name search | `apps/atrium.grader/lib/social-name-search.ts` |
| ScrapeCreators scan | `apps/atrium.grader/lib/scrape-creators.ts` |
| Core scoring | `packages/application/src/diagnostics/restaurant-growth-grader.ts` |
| Social scoring | `packages/application/src/diagnostics/social-health-scorer.ts` |

## Providers

### Business data

Google Places is required:

```env
GOOGLE_PLACES_API_KEY=""
GRADER_GOOGLE_DAILY_LIMIT=""
GRADER_GOOGLE_MONTHLY_LIMIT=""
```

Supported inputs:

```json
{ "placeId": "google:google-place-id" }
```

Unsupported inputs:

- Any non-`google:*` place id.
- Manual reputation input in the public route.
- Business lookup without `GOOGLE_PLACES_API_KEY`.

### Social data

ScrapeCreators is the social provider:

```env
SCRAPECREATORS_API_KEY=""
```

Social enrichment happens after the base report from the client:

1. `POST /api/grader/social`
2. `autoDetectSocial(websiteUrl, name, address)`
3. `scanSocialProfiles(handles)`
4. `scoreSocialHealth(socialScan)`
5. `mergeSocialIntoReport(report, socialHealth)`

If ScrapeCreators is not configured or handles cannot be detected, the base report remains valid and `social` stays missing in `dataQuality`.

## Search

`POST /api/grader/search`

Input:

```json
{ "query": "restaurant name city" }
```

Behavior:

- If `query.trim().length < 3`, returns `suggestions: []` without calling Google.
- Calls Google Places Autocomplete.
- Fetches minimal Google Place details for display name/address.
- Uses field masks to control payload and cost.
- Returns max 6 suggestions.

Frontend shape:

```ts
type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
  description: string
  source: "google"
}
```

## Report

`POST /api/grader`

Input:

```json
{ "placeId": "google:google-place-id" }
```

Behavior:

1. Validates `placeId`.
2. Requires `GOOGLE_PLACES_API_KEY`.
3. Loads Google Place Details.
4. Scans the attached website when present.
5. Optionally runs PageSpeed if `PAGESPEED_API_KEY` exists.
6. Executes `gradeRestaurantGrowth(profile)`.
7. Stores/logs scan evidence with `scanId`.
8. Returns `{ scanId, report, meta }`.

## Diagnostic steps

| Step | Source today | Limitation |
| --- | --- | --- |
| Google listing | Google Places Details | Google does not expose all business profile quality fields. |
| Website audit | Initial website HTML fetch, optional PageSpeed | Basic scan does not render JavaScript or crawl internal pages. |
| Market layer | Not connected | No rank, nearby competitor, or true local visibility claim yet. |
| Reputation | Google Places rating and review count | No review text, owner replies, recency, or sentiment. |
| Social handles | ScrapeCreators after auto-detection | Depends on detected handles and public platform availability. |
| Action plan | Scoring model translation | No POS, CRM, margin, ticket size, CAC, or private analytics. |

## Current scoring model

Without social:

```txt
overallScore =
  discovery * 0.25
  + website * 0.25
  + reputation * 0.25
  + conversion * 0.25
```

With social:

```txt
overallScore =
  discovery * 0.20
  + website * 0.20
  + reputation * 0.20
  + conversion * 0.20
  + social * 0.20
```

## Next implementation order

1. Add manual confirmation/correction for detected social handles.
2. Add durable scan persistence and an authenticated internal debug view.
3. Upgrade website scanner to parser + small crawl + evidence snippets.
4. Connect Google Nearby/Text Search for a real local benchmark layer.
5. Add real progress via SSE or polling `scanId` if scan latency grows.
6. Add raw provider payload references to `diagnosticSteps` once storage exists.
