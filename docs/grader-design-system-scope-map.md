# Restaurant Growth Grader - design-system scope map

Last reviewed: 2026-06-29

Este documento usa `docs/design-system/` como referencia de producto y diseño para definir que puede construir hoy el grader, que debe mostrarse como estimacion direccional y que pertenece a una version completa con datos conectados.

La referencia principal es `docs/design-system/Restaurant Growth Diagnostic.dc.html`. Ese prototipo no es solo visual: describe la ambicion completa del sistema. La version actual del grader todavia no tiene todos esos datos, por eso la UI y el copy deben diferenciar datos observados, inferencias y datos pendientes.

## Principio de producto

El grader debe sentirse como un diagnostico de crecimiento, no como un numero aislado.

Cada card del reporte debe responder cuatro preguntas:

| Pregunta | Debe mostrar |
| --- | --- |
| Que revisamos | Campo, fuente y estado del analisis |
| Que encontramos | Hechos observados o senales detectadas |
| Que significa para el negocio | Impacto practico en ordenes, reservas, llamadas, confianza o visibilidad |
| Como lo arregla Atrium | Primera accion concreta y el tipo de sistema que construimos |

Regla central: si un dato no viene de una fuente real, la UI no debe presentarlo como hecho. Puede aparecer como "estimacion", "baseline neutral", "direccion", "pendiente de conectar" o "se verifica en el reporte completo".

## Reglas visuales del design-system

| Decision | Referencia | Uso en grader |
| --- | --- | --- |
| Paleta | Deep Teal `#072F34`, Mint `#B5F2DB`, Cloud `#E4EEF0`, Amber `#F7A823` | Mantener campos planos con contraste fuerte. Amber para alertas/oportunidad, mint para progreso/fortaleza, teal para estructura. |
| Tipografia | Inter Tight para UI, Instrument Serif italic para enfasis, Nimora solo wordmark, script solo acentos | Reporte con titulares claros, una frase serif italic por bloque maximo. Evitar exceso decorativo. |
| Layout | Campos solidos, cards de 14px, paneles de 22px, pills | Usar cards por modulo de analisis, no cards anidadas. El reporte debe parecer una pieza compartible. |
| Motion | 220ms, ease-out, fade/rise suave, sin bounce ni spin | Animar entrada de cards, barras y conteos; evitar animaciones largas que simulen analisis falso. |
| Iconografia | Marca tipografica, lucide para UI, sin emoji | Reemplazar emoji en estados por iconos o labels sobrios. |
| Copy | Humano, directo, especifico, results-obsessed | Traducir scores a impacto comercial sin claims de revenue no soportados. |

## Vision del prototipo

El prototipo del design-system muestra estas areas:

| Area del prototipo | Promesa de producto |
| --- | --- |
| Hero ejecutivo | Score general, ubicacion, categoria, rating, reviews, revenue, market share y oportunidad |
| What we scanned | Menu, website, socials, reviews, competitors y fuentes usadas |
| Five engines of growth | Scores de acquisition, conversion, retention, reputation y content |
| Market | Trade area, hogares, demanda local, reach organico estimado |
| Competitors | Comparativa directa contra 3 competidores |
| Social & Content | Cadencia, formatos, share of voice, contenido y oportunidades |
| Growth stack | Ads, email, SMS, GBP, Maps, POS, website y reporting |
| Leaks | Problemas priorizados con impacto economico |
| Compounding plan | Oferta, canales, impresiones, reservas, opt-ins y revenue extra |
| Prescription | Plan por fases: stop the bleed, build the engine, scale acquisition |

Esa vision es correcta como norte. La version actual solo puede construir una parte de forma honesta con datos publicos.

## Cobertura actual por datos

| Modulo del reporte | Estado | Datos actuales | Como mostrarlo |
| --- | --- | --- | --- |
| Identidad del negocio | Listo | Nombre, categoria, direccion, website si existe, provider | Card de negocio con fuente y confianza. |
| Score general | Listo | `overallScore` calculado desde discovery, website, reputation, conversion y social si existe | Mostrar numero + interpretacion: bajo, moderado, alto riesgo. Nunca dejarlo solo. |
| Data quality | Listo | Provider, `hasWebsite`, `hasReputation`, `hasSocial`, `missingCriticalData` | Mostrar una banda "este scan usa..." para explicar limitaciones sin asustar. |
| Discovery / listing | Listo parcial | Completeness del perfil publico, website, categoria, direccion; Google puede aportar rating/reviews si esta activo | Mostrar como "public listing coverage", no como ranking real. |
| Website | Listo | HTML inicial: viewport, menu, order, reservations, tel, schema, meta, load time | Card fuerte con checklist y barra de completitud. |
| Website Lighthouse | Listo si provider activo | PageSpeed mobile/desktop: performance, accessibility, best practices, SEO, Web Vitals basicos | Mostrar solo si `WEBSITE_AUDIT_PROVIDER=pagespeed`. Si no, decir "basic HTML scan". |
| Conversion | Listo parcial | CTA primario, ordering, reservations, tracking pixel, click-to-call | Traducir a "friccion antes de ordenar/reservar/llamar". No afirmar conversion rate. |
| Reputation | Parcial | Rating y review count desde Google si activo; manual si se envia; baseline neutral si no hay fuente | Si no hay fuente, mostrar "needs confirmation". No inventar temas de reviews. |
| Negative reviews | Estimacion | `recentNegativeReviewCount` se estima desde rating/review count | Etiquetar como riesgo estimado, no como reviews leidas. |
| Unanswered reviews | Bloqueado | Hoy casi siempre `0`; no hay review text/reply provider | No mostrar como hecho hasta conectar review provider. |
| Local benchmark | Parcial | Nearby OSM businesses, website/phone/hours distribution, `localRank` heuristico | Mostrar como "nearby open-data benchmark", no como Google Maps ranking. |
| Social | Parcial | Handles detectados desde website/name search + ScrapeCreators para IG/FB/TikTok si hay API key | Mostrar solo cuando hay handles y datos. Si no, "not enough public social data". |
| Competitors | Parcial | Competidores cercanos por OSM, sin rating, revenue, ads ni social real | Puede existir como contexto limitado. No hacer head-to-head completo todavia. |
| Executive summary | Listo | `businessImpact`, `executiveSummary`, issues, recommendations, `nextBestAction` | Usarlo como traduccion principal del score a negocio. |
| Atrium fix | Listo | `scoreInterpretation[].atriumFix` y recommendations | Mostrar una accion clara por modulo. |

## Lo que se puede construir ahora

Estas piezas pueden pasar a UI de producto sin nuevos providers:

| Pieza | Datos | Copy recomendado |
| --- | --- | --- |
| Hero de entrada | Busqueda + negocio seleccionado | "Scan" como accion unica. Ocultar complejidad hasta tener restaurante. |
| Report shell fijo | `diagnosticSteps`, `scoreInterpretation`, `dataQuality` | Layout fijo por areas; el contenido interno cambia segun datos. |
| Score ejecutivo | `overallScore`, `businessImpact`, `estimatedLostOpportunity` | "El score indica cuanta friccion encontramos antes de que un guest ordene, reserve o llame." |
| Cards por modulo | `diagnosticSteps[].checked/found/missing/assumptions` | Mostrar fuente, progreso, hallazgos, faltantes y confianza. |
| Barras de completitud | website signals, profile completeness, conversion checks | Barras simples y labels concretos: "5/7 website signals". |
| Impacto por score | `scoreInterpretation[].businessImpact` | Traducir a ordenes/reservas/llamadas/confianza sin cifras economicas falsas. |
| Plan Atrium | `recommendations`, `atriumPlan` | "Primero arreglamos el leak que bloquea accion; luego conectamos medicion." |
| Disclaimer de datos | `dataQuality.missingCriticalData` | "Free scan: public signals only. Full report verifies POS, CRM and analytics." |

## Lo que debe mostrarse como direccional

Estas areas pueden aparecer si el copy deja claro que son inferencias:

| Area | Por que es direccional | Regla de copy |
| --- | --- | --- |
| Local rank | El `localRank` actual no viene de Google Maps, sale de benchmark abierto | Usar "estimated visibility heuristic", no "Maps rank". |
| Demand leaks | Se infiere desde friccion y ausencia de senales | Usar "likely losing demand", no "lost $X". |
| Negative review risk | Se estima desde rating/review count | Usar "estimated negative-review risk", no temas especificos. |
| Competitor advantage | Solo sabemos parte de listing/website/phone/hours | Usar "nearby businesses may be easier to find". |
| Social activity | Depende de deteccion de handles y API | Mostrar confianza y provider. No penalizar si el handle no esta confirmado. |

## Lo que no se debe afirmar todavia

Estas claims aparecen en el prototipo, pero hoy no estan soportadas por datos actuales:

| Claim del prototipo | Falta |
| --- | --- |
| Revenue anual, revenue perdido o revenue extra | POS, ticket promedio, margen, volumen, atribucion |
| Market share / local demand share | Fuente de demanda local, trade area, competencia validada |
| "Maps top-3" o porcentaje de busquedas invisibles | Rank tracking real por keywords y ubicaciones |
| "Service slow appears 41x" | Review text provider + NLP de temas |
| Review response rate | Fuente de reviews con owner replies |
| Ads running / not running | Meta Ads, Google Ads o pixel/ad library conectado |
| Email list size, SMS list size, opt-ins | CRM, POS, email/SMS provider |
| Reservations + orders | Reservas/order provider o analytics/event tracking |
| Share of social voice | Social listening / competitor social provider |
| Delivery app performance | DoorDash/UberEats/Toast/ChowNow data |
| POS capturing data | Integracion POS o input manual confirmado |

Estas piezas pueden mantenerse en el design-system como vision comercial, pero en la app deben estar bloqueadas, ocultas o marcadas como "available in full audit".

## Campos que deberia exponer el backend para la UI

El backend ya tiene gran parte de esto, pero la UI deberia consumirlo de forma mas directa.

| Campo UI | Fuente actual | Estado |
| --- | --- | --- |
| Card title | `diagnosticSteps[].id` + labels UI | Listo |
| Source label | `diagnosticSteps[].source` | Listo |
| Confidence | `diagnosticSteps[].confidence` | Listo |
| Progress numerator | `found.length` / (`checked.length`) | Listo |
| Missing count | `missing.length` | Listo |
| Assumptions | `assumptions` | Listo |
| Score by area | `scores[category]` | Listo |
| Impact sentence | `scoreInterpretation[].businessImpact` | Listo |
| Atrium fix | `scoreInterpretation[].atriumFix` | Listo |
| Current provider | `dataQuality.provider` | Listo |
| Missing critical data | `dataQuality.missingCriticalData` | Listo |
| Lighthouse metrics | `website.lighthouse` in score details only | Parcial: expose richer metrics if UI needs them |
| Provider errors | `diagnosticSteps[].errors` | Estructura lista, pocos errores poblados |

## Propuesta de estructura de reporte

La UI deberia mantener layout fijo y contenido variable:

1. Executive hero
   - Business name, category, location, provider/confidence.
   - Overall score + plain-language impact.
   - Data-quality note.

2. Scan proof strip
   - Public listing, website, benchmark, reputation, social.
   - Cada item con estado: complete, partial, skipped.

3. Growth engines
   - Discovery, website, reputation, conversion, social.
   - Score, short meaning, impact, Atrium fix.

4. Evidence cards
   - Checked, found, missing, assumptions.
   - Barras de progreso por modulo.

5. Business translation
   - Highest-risk leak.
   - Estimated lost opportunity as qualitative tier.
   - Next best action.

6. Atrium prescription
   - 30-day first fix.
   - What we would connect in the full audit.
   - CTA to verify private data.

## Provider roadmap

| Prioridad | Provider / input | Desbloquea |
| --- | --- | --- |
| P0 | PageSpeed Insights / Lighthouse | Website mobile + desktop audit real, sin invadir al negocio |
| P0 | Google Places configurable | Ratings, review count, mejor search, profile data mas confiable |
| P1 | Manual reputation fallback | Permite reputacion honesta cuando Google no esta activo |
| P1 | Review provider with text/replies | Temas de reviews, respuesta, sentiment, review velocity |
| P1 | Confirmed social handles | Menos falsos positivos, mejor confianza social |
| P2 | GA4 / Search Console optional | Trafico, conversion events, search queries |
| P2 | POS / reservation / order provider | Revenue, orders, reservations, ticket size |
| P2 | Meta/Google ads optional | Paid acquisition, spend, ROAS, tracking gaps |
| P3 | Rank tracking provider | Maps top-3, keyword visibility, geo-grid |

## Criterios de aceptacion para la UI

- Ninguna card puede mostrar un numero sin traducirlo a consecuencia de negocio.
- Cada score debe tener fuente y confianza visible.
- Si falta data critica, el reporte debe decirlo sin sonar roto.
- Revenue y market share no aparecen como hechos en el free scan.
- El copy debe usar "guest", "orders", "reservations", "calls", "trust", "visibility" como traducciones de negocio.
- Los claims de Atrium deben enfocarse en sistemas que podemos construir: profile coverage, website action paths, review engine, social cadence, tracking, CRM/POS verification.
- La experiencia debe sentirse compartible: campos solidos, contraste fuerte, barras simples, pocas sombras y motion sobrio.

