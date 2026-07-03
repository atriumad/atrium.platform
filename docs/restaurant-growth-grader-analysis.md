# Restaurant Growth Grader - analisis actual del servicio

Last reviewed: 2026-06-29

Este documento describe que analiza hoy el Restaurant Growth Grader, que datos usa, que asume, que no esta obteniendo bien y donde debemos mejorar para desarrollo interno y onboarding.

## Resumen ejecutivo

El grader actual no ejecuta seis analisis independientes en tiempo real. La UI muestra seis pasos, pero el backend hace una sola request a `POST /api/grader`, arma un perfil del restaurante, calcula cuatro scores base y opcionalmente agrega social.

Flujo real:

```txt
User search
  -> POST /api/grader/search
  -> OSM/Nominatim suggestions
  -> user selects place
  -> POST /api/grader
  -> OSM/Nominatim lookup
  -> website scan + local benchmark
  -> gradeRestaurantGrowth(profile)
  -> optional social auto-detect + ScrapeCreators scan
  -> final report JSON
```

Punto importante: la animacion de progreso en `apps/grader/app/grader-client.tsx` es presentacional. El frontend corre una secuencia de delays mientras la request del reporte esta en vuelo. No recibe estado real por paso desde el backend.

## Archivos principales

| Area | Archivo |
| --- | --- |
| UI y pasos visibles | `apps/grader/app/grader-client.tsx` |
| Search route | `apps/grader/app/api/grader/search/route.ts` |
| Report route | `apps/grader/app/api/grader/route.ts` |
| Provider selector | `apps/grader/lib/open-data-places.ts` |
| OSM/Nominatim lookup | `apps/grader/lib/osm-client.ts` |
| Google Places client | `apps/grader/lib/google-places-client.ts` |
| Website scanner | `apps/grader/lib/website-scanner.ts` |
| Local benchmark | `apps/grader/lib/local-benchmark.ts` |
| Place helpers | `apps/grader/lib/place-utils.ts` |
| Social auto-detect | `apps/grader/lib/auto-detect-social.ts` |
| Social handle parser | `apps/grader/lib/social-detector.ts` |
| Social name search | `apps/grader/lib/social-name-search.ts` |
| Social API scan | `apps/grader/lib/scrape-creators.ts` |
| Core scoring | `packages/application/src/diagnostics/restaurant-growth-grader.ts` |
| Social scoring | `packages/application/src/diagnostics/social-health-scorer.ts` |

## Provider selection actual

`apps/grader/lib/open-data-places.ts` selecciona provider usando `GRADER_BUSINESS_PROVIDER`.

Modos soportados:

- `osm` o env vacio: usa OpenStreetMap/Nominatim.
- `google`: exige `GOOGLE_PLACES_API_KEY` y usa Google Places.
- `auto`: usa Google Places solo si existe `GOOGLE_PLACES_API_KEY`; si no, cae a OSM.

Eso significa:

- Google Places ya no esta apagado por constante; esta controlado por config.
- En el path OSM no tenemos ratings ni reviews reales.
- En el path OSM la reputacion solo entra si el request incluye `reputation.rating` y `reputation.reviewCount`.
- En el path Google podemos recibir `rating` y `userRatingCount`, pero no review text ni owner replies.
- La UI actual no envia reputacion manual; envia solo `{ placeId }`.

Resultado practico: si el entorno no habilita Google Places y la UI no envia reputacion manual, el score de reputacion queda en baseline neutral porque no tenemos datos reales de reputacion.

## Pasos visibles vs analisis real

| Paso UI | Score/backend relacionado | Que revisa hoy | Fuente actual | Limitacion principal |
| --- | --- | --- | --- | --- |
| Open data | `discovery`, `openData` details | Listing, categoria, direccion, website, completitud basica | OSM/Nominatim | OSM puede estar incompleto o desactualizado |
| Website scan | `website`, parte de `conversion` | HTML publico, menu, order, reservation, phone, schema, meta description, load time | GET directo al website | No renderiza JS, no hace crawl, usa regex simples |
| Local benchmark | `discovery`, `benchmark` details | Competidores cercanos y si tienen website/phone/hours | Overpass API, radio 1200m | No mide ranking real ni demanda |
| Reputation layer | `reputation` | Rating, review count, negativos estimados, reviews sin responder | Manual si viene en request; Google si se habilita | Hoy casi siempre unavailable en OSM |
| Social audit | `social` opcional | Instagram, Facebook, TikTok, actividad, completeness, engagement | Website links, IG/TikTok name search, ScrapeCreators | Solo corre con `SCRAPECREATORS_API_KEY` y handles detectables |
| Growth brief | Derived report | Traduce scores a impacto, issues, recomendaciones y plan | Output combinado del scorer | No agrega nuevos datos, no estima revenue real |

## Search: `POST /api/grader/search`

Entrada:

```json
{ "query": "restaurant name city" }
```

Comportamiento:

- Si `query.trim().length < 3`, devuelve `suggestions: []`.
- Usa `searchRestaurantPlaces(query)`.
- Como Google esta apagado, llama `searchOsmPlaces`.
- Nominatim recibe:
  - `q`
  - `format=jsonv2`
  - `addressdetails=1`
  - `extratags=1`
  - `namedetails=1`
  - `dedupe=1`
  - `limit=8`
- Filtra food places:
  - `amenity`: restaurant, cafe, bar, fast_food, pub, food_court, ice_cream
  - `shop=bakery`
  - lugares con `cuisine` y OSM id
- Devuelve maximo 6 suggestions.

Datos devueltos al frontend:

```ts
type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
  description: string
  source: "google" | "openstreetmap"
}
```

Gaps:

- No hay ranking por probabilidad de match real.
- No hay validacion de marca/cadena/location para evitar seleccionar un negocio equivocado.
- No hay fallback si OSM no tiene el restaurante.
- No hay Google Places activo, aunque el client existe.

## Report: `POST /api/grader`

Entrada actual desde UI:

```json
{ "placeId": "osm:node:123" }
```

La route tambien acepta:

```json
{
  "placeId": "osm:node:123",
  "reputation": {
    "rating": 4.5,
    "reviewCount": 1200
  }
}
```

Pero la UI actual no envia ese objeto.

Comportamiento:

1. Valida `placeId`.
2. Llama `getRestaurantGrowthProfileFromPlace(placeId, reputation)`.
3. Ejecuta `gradeRestaurantGrowth(profile)`.
4. Si no hay `SCRAPECREATORS_API_KEY`, devuelve el report base.
5. Si hay key, intenta `autoDetectSocial(profile.websiteUrl, profile.name)`.
6. Si no detecta handles, devuelve el report base.
7. Si detecta handles, llama `scanSocialProfiles(handles)`.
8. Calcula `scoreSocialHealth`.
9. Agrega `social` al report y recalcula overall con 5 categorias de 20% cada una.

## Perfil de crecimiento que alimenta el scorer

El dominio espera este shape:

```ts
type RestaurantGrowthProfile = {
  id: string
  name: string
  category: string
  address: string
  websiteUrl: string | null
  googleRating: number
  googleReviewCount: number
  recentNegativeReviewCount: number
  unansweredReviewCount: number
  reputationDataSource?: "google" | "manual" | "open-data" | "unavailable"
  profileCompleteness: number
  localRank: number | null
  competitorAverageRating: number | null
  website: RestaurantWebsiteSignals
  conversion: RestaurantConversionSignals
}
```

En el path OSM actual:

- `googleRating` viene de input manual o `0`.
- `googleReviewCount` viene de input manual o `0`.
- `recentNegativeReviewCount` es estimado desde rating/review count, no desde reviews reales.
- `unansweredReviewCount` siempre es `0`.
- `reputationDataSource` es `manual` o `unavailable`.
- `competitorAverageRating` siempre es `null`.
- `localRank` no es ranking de Google; es una heuristica derivada del benchmark OSM.

## Open data

Modulo: `apps/grader/lib/osm-client.ts`

Que obtiene:

- Nombre.
- Categoria/tipo.
- Direccion/display name.
- Website desde tags: `website`, `contact:website`, `url`, `homepage`.
- Phone desde tags: `phone`, `contact:phone`.
- Hours desde `opening_hours`.
- Cuisine si existe.

Profile completeness:

```txt
name
address/display name
type
website
phone
opening_hours
```

Score impact:

- Discovery usa `profileCompleteness * 45`.
- Tambien suma `localRankScore` y `reviewVolumeScore`.

Gaps:

- OSM no garantiza website/phone/hours.
- El dato puede ser comunitario, incompleto o viejo.
- La categoria puede ser generica.
- No hay verificacion de que el website pertenezca al restaurante.

## Website scan

Modulo: `apps/grader/lib/website-scanner.ts`

Comportamiento:

- Si no hay website, devuelve `emptyWebsiteSignals`.
- Hace GET al website con timeout de 4 segundos.
- Si el response no es OK, devuelve empty signals con el load time medido.
- Lee HTML y busca senales con regex.

Signals:

| Signal | Como se detecta |
| --- | --- |
| `hasMobileFriendlyLayout` | `<meta name="viewport">` |
| `hasMenu` | palabra `menu` en HTML lowercase |
| `hasOnlineOrdering` | `order online`, `online ordering`, `/order`, `delivery`, `takeout`, `toasttab`, `doordash`, `ubereats`, `chownow`, `clover`, `squareup` |
| `hasReservations` | `reservation`, `reservations`, `book a table`, `book now`, `opentable`, `resy` |
| `hasPhoneVisible` | `href="tel:` |
| `hasLocationSchema` | JSON-LD, schema.org restaurant/localbusiness markers |
| `hasMetaDescription` | `<meta name="description">` |
| `loadTimeMs` | Date.now before/after fetch |

Website score:

```txt
7 checklist signals * 12 points = up to 84
speed score = 16, 9, or 3
```

Speed:

- `<= 2500ms`: 16 points
- `<= 4000ms`: 9 points
- `> 4000ms`: 3 points

Gaps:

- No renderiza JavaScript.
- No sigue multiples paginas internas.
- No inspecciona menu PDFs si no estan en el HTML inicial.
- No usa parser HTML estructurado.
- Puede detectar falso positivo por texto escondido, scripts o tracking snippets.
- No valida mobile real, solo viewport meta.
- No corre Lighthouse/Core Web Vitals.
- No identifica si botones estan above the fold.
- No diferencia first-party ordering de third-party ordering.

## Conversion scan

Modulo: `apps/grader/lib/place-utils.ts`

Conversion no tiene un crawler propio. Se deriva de website signals y del phone del listing.

```ts
hasPrimaryCta =
  website.hasOnlineOrdering ||
  website.hasReservations ||
  website.hasPhoneVisible ||
  hasPhone

hasOnlineOrderingCta = website.hasOnlineOrdering
hasReservationCta = website.hasReservations
hasTrackingPixel = false
hasClickToCall = website.hasPhoneVisible || hasPhone
```

Conversion score:

```txt
5 checks * 20 points
```

Gaps:

- `hasTrackingPixel` siempre es false.
- Si OSM tiene phone, el conversion score puede mejorar aunque el website no tenga click-to-call visible.
- No sabemos si un CTA es visible, usable o funciona.
- No validamos checkout/order/reservation completion.
- No hay analytics, events, calls, bookings, orders ni attribution.

## Local benchmark

Modulo: `apps/grader/lib/local-benchmark.ts`

Comportamiento:

- Usa Overpass API.
- Busca en radio de 1200m.
- Incluye:
  - restaurant
  - cafe
  - bar
  - fast_food
  - pub
  - food_court
  - ice_cream
  - bakery
- Excluye el selected place.
- Solo cuenta competidores con `name`.

Benchmark output:

```ts
type LocalBenchmark = {
  competitorCount: number
  competitorsWithWebsite: number
  competitorsWithPhone: number
  competitorsWithHours: number
}
```

`deriveLocalRank`:

- Si hay menos de 3 competidores, `localRank = null`.
- Si el restaurante tiene website y pocos competidores tienen website, rank 3.
- Si tiene website y la share de websites es intermedia, rank 6.
- Si no tiene website y muchos competidores si, rank 12.
- Si no tiene website y muchos competidores tienen phone, rank 10.
- Default rank 8.

Gaps:

- No es un ranking real de Google, Maps, SEO o delivery marketplaces.
- No mide review count, rating, popularity, foot traffic, ads, social demand o revenue.
- El radio fijo de 1200m puede ser incorrecto para barrios densos o suburbios.
- La categoria de competidores es amplia; puede comparar restaurantes con cafes, bars o bakeries.
- Si Overpass falla, el benchmark queda vacio silenciosamente.

## Reputation layer

Modulo: `packages/application/src/diagnostics/restaurant-growth-grader.ts`

Scoring:

Si reputacion es unknown:

```txt
reputation score = 62
```

Si hay rating/review count:

```txt
ratingScore = rating / 5 * 65
volumeScore = reviewVolumeScore(reviewCount)
negativePenalty = min(18, recentNegativeReviewCount)
unansweredPenalty = min(12, unansweredReviewCount / reviewCount * 60)
competitorAdjustment = clamp((rating - competitorAverageRating) * 10, -8, 8)
```

Review volume score:

- `>= 250`: 20
- `>= 100`: 14
- `>= 30`: 8
- else: 3

Gaps actuales:

- OSM no trae rating ni review count.
- La UI no captura rating manual.
- Google Places esta apagado.
- `recentNegativeReviewCount` se estima por formula, no por review text real.
- `unansweredReviewCount` siempre es `0` en providers actuales.
- `competitorAverageRating` es `null`.
- No hay review recency real.
- No hay sentiment real.

## Social audit

Modulos:

- `apps/grader/lib/auto-detect-social.ts`
- `apps/grader/lib/social-detector.ts`
- `apps/grader/lib/social-name-search.ts`
- `apps/grader/lib/scrape-creators.ts`
- `packages/application/src/diagnostics/social-health-scorer.ts`

Condiciones para correr:

- `SCRAPECREATORS_API_KEY` debe existir.
- `autoDetectSocial` debe encontrar al menos un handle.

Deteccion:

- Website scrape:
  - Extrae `href`.
  - Instagram: primer `instagram.com/{handle}` que no sea post/reel/story/explore/etc.
  - Facebook: primer URL de page que no sea share/dialog/plugin/login.
  - TikTok: primer `tiktok.com/@{handle}`.
- Instagram name search:
  - Usa endpoint web topsearch de Instagram.
  - Match por username/full_name vs business name.
- TikTok name search:
  - Usa endpoint web search de TikTok.
  - Match por unique_id/nickname vs business name.

ScrapeCreators:

- Instagram:
  - `/v1/instagram/profile`
  - `/v2/instagram/user/posts`
- Facebook:
  - `/v1/facebook/profile`
  - `/v1/facebook/profile/posts`
- TikTok:
  - `/v1/tiktok/profile`
  - `/v3/tiktok/profile/videos`

Social platform scoring:

```txt
presence: 25 if account exists
completeness: bio 10 + profile pic 8 + link 7
activity: 25 if >= 8 posts in last 30 days, 18 if >= 4, 10 if >= 1
engagement: based on avg likes+comments / followers
```

Overall social weights:

- Instagram: 40%
- Facebook: 35%
- TikTok: 25%

When social is added:

- Base overall changes from 4 categories at 25% each to 5 categories at 20% each.

Gaps:

- If no `SCRAPECREATORS_API_KEY`, no social scan.
- If no handle is detected, no social score appears.
- Facebook is only found from website links; no Facebook name search exists.
- Instagram/TikTok public search endpoints can fail, rate-limit or change.
- Handle match confidence is simple string matching.
- ScrapeCreators response shape may drift.
- Missing account and API error both become low/absent platform data.
- No audience geography, content quality, saves, shares, reach, story activity, link clicks or conversions.

## Growth brief and report translation

Modulo: `packages/application/src/diagnostics/restaurant-growth-grader.ts`

The report is derived from scores:

- `issues`
- `opportunities`
- `recommendations`
- `businessImpact`
- `executiveSummary`
- `estimatedLostOpportunity`
- `nextBestAction`
- `confidence`

Important distinction:

- `estimatedLostOpportunity` is qualitative copy, not a revenue estimate.
- `businessImpact` translates risk level into likely business effect, but does not use POS, CRM, ticket size, margin, conversion rate or ad spend.
- `confidence` is based only on website and reputation availability:
  - high: website + reputation
  - medium: website or reputation
  - low: neither

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

This means the same restaurant can get a different overall score depending on whether social handles/API data are available.

## Known data quality issues

### P0 - Misleading progress model

The UI suggests step-by-step analysis, but backend progress is not observable. We should either:

- make the UI clear that these are stages being prepared from one scan, or
- implement a backend diagnostic pipeline that emits step results.

Recommended fix:

- Create a server-side orchestrator that returns structured `DiagnosticStepResult[]`.
- Add evidence, source, confidence and error per step.
- Consider streaming progress via SSE or polling a scan id if analysis becomes slower.

### P0 - Reputation is usually unavailable

Current OSM flow has no rating/review data, and the UI does not send manual reputation. The score defaults to 62.

Recommended fix:

- Enable Google Places behind an env flag or config, not a hardcoded false.
- Add manual reputation input when Google is unavailable.
- Store `reputationDataSource` in the report UI.
- Show "neutral baseline" clearly when reputation is unavailable.

### P0 - Google Places client exists but is disabled

The code has `GOOGLE_PLACES_API_KEY` support, but `USE_GOOGLE_PLACES = false`.

Recommended fix:

- Replace constant with env var, for example `GRADER_PROVIDER=google|osm`.
- Add tests for provider selection.
- Decide cost/rate-limit behavior before production.

### P1 - Website scanner is too shallow

The scanner reads one HTML response and uses regex.

Recommended fix:

- Use an HTML parser.
- Follow redirects and normalize canonical URL.
- Crawl a small set of internal links: home, menu, order, reservation, contact.
- Extract phone numbers from text and links.
- Parse JSON-LD instead of regex matching.
- Separate "detected text" from "usable CTA".
- Add evidence snippets per signal.

### P1 - Conversion score is derived, not measured

Conversion uses website flags plus listing phone. It does not validate actual flows.

Recommended fix:

- Track CTA location and URL.
- Validate order/reservation links resolve.
- Detect third-party providers separately.
- Add tracking pixel detection for Meta, Google, TikTok, GA4, GTM.
- Add "conversion confidence" separate from score.

### P1 - Local benchmark is not a true benchmark

The current benchmark counts OSM competitors and derives a fake local rank.

Recommended fix:

- Rename internal concept from `localRank` to `localVisibilityHeuristic` unless real rank is connected.
- Add provider-specific benchmark objects.
- Compare category-matched competitors only.
- Add competitor website/profile completeness distribution.
- Later connect Maps/Search provider for actual local visibility.

### P1 - Social detection is fragile

Social audit depends on website links, public platform search and ScrapeCreators.

Recommended fix:

- Let user confirm/correct handles before scoring.
- Add confidence per detected handle.
- Keep API error separate from "account does not exist".
- Add Facebook search fallback.
- Do not penalize social if handle detection confidence is low.

### P2 - No persistence or raw evidence

The report is generated and returned, but raw inputs are not persisted.

Recommended fix:

- Store scan request, provider responses, normalized profile, step evidence and final report.
- Add a debug view for internal review.
- Make reports reproducible by versioning scoring model and provider payload.

## Recommended internal data contract

Add a diagnostic pipeline result like:

```ts
type DiagnosticStepResult = {
  id: "openData" | "website" | "benchmark" | "reputation" | "social" | "brief"
  status: "complete" | "partial" | "skipped" | "failed"
  source: string
  confidence: "low" | "medium" | "high"
  checked: string[]
  found: string[]
  missing: string[]
  assumptions: string[]
  errors: string[]
  rawEvidenceRef?: string
}
```

The final report should include:

```ts
type RestaurantGrowthReport = {
  // existing fields
  diagnosticSteps: DiagnosticStepResult[]
  dataQuality: {
    provider: "osm" | "google" | "manual" | "mixed"
    hasWebsite: boolean
    hasReputation: boolean
    hasSocial: boolean
    missingCriticalData: string[]
  }
}
```

This lets the UI say exactly what happened instead of implying that all steps had equal evidence.

## Suggested next implementation order

1. Replace hardcoded provider flag with env config and document provider behavior.
2. Add manual reputation input or enable Google Places for reputation.
3. Add diagnostic step results to the API response.
4. Show step source, confidence and limitation in the UI from backend data, not hardcoded UI copy.
5. Persist scan evidence for internal debugging.
6. Upgrade website scanner to structured HTML parsing and evidence snippets.
7. Split `localRank` into a clearly named heuristic until real rank data exists.
8. Improve social detection with manual confirmation and explicit error states.

## Tests to add

Provider/data tests:

- OSM lookup with no reputation returns `reputationDataSource: "unavailable"`.
- Manual reputation changes reputation score and confidence.
- Google provider can be enabled by config and returns rating/review count.
- Website scanner does not mark menu/order from irrelevant text.
- Website scanner captures phone numbers from `tel:` and visible text.
- Overpass failure produces partial benchmark status, not silent confidence.
- Social API error differs from missing account.
- Social unavailable does not silently change overall score expectations.

Report/UI tests:

- UI step cards render backend step status instead of hardcoded assumptions.
- Report shows "neutral baseline" when reputation is unavailable.
- Report shows source and limitation for each score category.
- Overall score calculation is stable with and without social.
