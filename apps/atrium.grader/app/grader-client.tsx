"use client"

import type { RestaurantGrowthReport } from "@atrium/application"
import type { CSSProperties, FormEvent, SVGProps } from "react"
import { useEffect, useId, useMemo, useState } from "react"
import type { NarrativeData } from "@/lib/report-merger"
import { mergeNarrativeIntoReport, mergeSocialIntoReport } from "@/lib/report-merger"

const scanSteps = [
  {
    id: "openData",
    area: "open",
    kicker: "Listing",
    title: "Open data",
    detail: "Confirming the public listing, category, address, website, and profile completeness.",
    runningDetail: "We verify the public profile, category, address, website presence, and basic completeness.",
    source: "Open restaurant listing",
    limit: "No private CRM or sales data",
    signals: ["Listing accuracy", "Website found", "Profile gaps"],
    scoreKey: "discovery",
    detailKey: "openData",
  },
  {
    id: "website",
    area: "website",
    kicker: "Web audit",
    title: "Website scan",
    detail: "Checking whether ready-to-buy guests can find the menu, order, reserve, or call.",
    runningDetail: "We inspect the public website for the action paths a guest needs before spending money.",
    source: "Public website signals",
    limit: "No analytics or checkout data",
    signals: ["Menu access", "Ordering path", "Call path"],
    scoreKey: "website",
    detailKey: "website",
  },
  {
    id: "benchmark",
    area: "benchmark",
    kicker: "Market",
    title: "Local benchmark",
    detail: "Comparing discovery strength against nearby restaurant signals.",
    runningDetail: "We compare visible local discovery signals, not revenue, ticket size, or ad spend.",
    source: "Local discovery context",
    limit: "Directional, not a sales comp",
    signals: ["Local visibility", "Competitor density", "Owned presence"],
    scoreKey: "discovery",
    detailKey: "benchmark",
  },
  {
    id: "reputation",
    area: "reputation",
    kicker: "Trust",
    title: "Reputation layer",
    detail: "Reading trust signals that affect whether guests choose this restaurant or compare alternatives.",
    runningDetail: "We read public trust signals that influence whether a guest feels safe choosing the restaurant.",
    source: "Rating/review context",
    limit: "Depends on available reputation data",
    signals: ["Rating baseline", "Review volume", "Response risk"],
    scoreKey: "reputation",
    detailKey: "reputation",
  },
  {
    id: "social",
    area: "social",
    kicker: "Social proof",
    title: "Social audit",
    detail: "Looking for public Instagram, Facebook, and TikTok signals when social data is available.",
    runningDetail: "We look for social proof and activity that can turn attention into demand.",
    source: "Public social profiles",
    limit: "Requires detectable handles",
    signals: ["Presence", "Activity", "Engagement"],
    scoreKey: "social",
    detailKey: "social",
  },
  {
    id: "brief",
    area: "brief",
    kicker: "Plan",
    title: "Growth brief",
    detail: "Translating the numbers into business impact, first priority, and how Atrium would fix it.",
    runningDetail: "We translate the weak signals into a first action plan, with clear assumptions.",
    source: "Combined audit signals",
    limit: "Free scan, not a full strategy",
    signals: ["Demand leak", "First fix", "30-day plan"],
    detailKey: "brief",
  },
] as const

type ReportMeta = {
  profile: {
    websiteUrl: string | null
    name: string
    [key: string]: unknown
  }
  googleMeta: unknown
}

type GraderResponse = {
  report?: RestaurantGrowthReport
  meta?: ReportMeta
  error?: string
}

type SocialResponse = {
  socialHealth: RestaurantGrowthReport["socialHealth"]
}

type NarrativeResponse = {
  narrative: NarrativeData | null
}

type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
  description: string
  source: "google" | "openstreetmap"
  photoUrl?: string | null
  photoAttribution?: string | null
}

type SearchResponse = {
  suggestions?: PlaceSuggestion[]
  error?: string
}

type ScanPhase = "search" | "loading" | "result"
type ScoreTone = "low" | "medium" | "high"

async function requestRestaurantSuggestions(
  searchQuery: string,
  signal?: AbortSignal,
): Promise<{ error?: string; suggestions: PlaceSuggestion[] }> {
  const res = await fetch("/api/grader/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: searchQuery }),
    signal: signal ?? null,
  })

  const body = await res.json() as SearchResponse

  if (!res.ok) {
    return {
      error: body.error ?? "Unable to search restaurants",
      suggestions: [],
    }
  }

  return { suggestions: body.suggestions ?? [] }
}

export function GraderClient() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null)
  const [report, setReport] = useState<RestaurantGrowthReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanStep, setScanStep] = useState(0)

  const phase: ScanPhase = loading ? "loading" : report ? "result" : "search"

  const selectedSummary = useMemo(() => {
    if (!selectedPlace) return null
    return selectedPlace.address || selectedPlace.description
  }, [selectedPlace])

  useEffect(() => {
    const searchQuery = query.trim()

    if (phase !== "search" || selectedPlace) return

    if (searchQuery.length < 3) {
      setSuggestions([])
      setSearchError(null)
      setSearching(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setSearching(true)
      setSearchError(null)

      try {
        const result = await requestRestaurantSuggestions(searchQuery, controller.signal)

        if (controller.signal.aborted) return

        setSuggestions(result.suggestions)
        setSearchError(result.error ?? (result.suggestions.length === 0 ? "No matching restaurants found in open data" : null))
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
          setSearchError("Unable to search restaurants")
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false)
        }
      }
    }, 320)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [phase, query, selectedPlace])

  function handleQueryChange(value: string) {
    setQuery(value)
    setSelectedPlace(null)
    setReport(null)
    setError(null)
    setSearchError(null)
  }

  function chooseSuggestion(suggestion: PlaceSuggestion) {
    setSelectedPlace(suggestion)
    setQuery(suggestion.name)
    setSuggestions([])
    setReport(null)
    setError(null)
    setSearchError(null)
  }

  function resetFlow() {
    setReport(null)
    setError(null)
    setSearchError(null)
    setSuggestions([])
    setSelectedPlace(null)
    setQuery("")
    setScanStep(0)
  }

  async function searchRestaurants(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    if (query.trim().length < 3) {
      setSuggestions([])
      setSearchError("Write at least 3 characters")
      return
    }

    setSearching(true)
    setSearchError(null)
    setError(null)
    setSelectedPlace(null)
    setReport(null)

    try {
      const result = await requestRestaurantSuggestions(query.trim())

      if (result.error) {
        setSuggestions(result.suggestions)
        setSearchError(result.error)
        return
      }

      const nextSuggestions = result.suggestions
      setSuggestions(nextSuggestions)
      if (nextSuggestions.length === 0) {
        setSearchError("No matching restaurants found in open data")
      }
    } catch {
      setSuggestions([])
      setSearchError("Unable to search restaurants")
    } finally {
      setSearching(false)
    }
  }

  async function runDiagnostic() {
    if (!selectedPlace) return

    setLoading(true)
    setError(null)
    setReport(null)
    setSearchError(null)
    setScanStep(0)

    try {
      // Step 1: profile + grade (deterministic, fast)
      const step1Promise = fetch("/api/grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: selectedPlace.placeId }),
      })

      // Animate first 4 scan steps while Step 1 fetches
      for (let i = 0; i < 4; i += 1) {
        setScanStep(i)
        await delay(i === 0 ? 800 : 700)
      }

      const res = await step1Promise
      const body = await res.json() as GraderResponse

      if (!res.ok || !body.report) {
        setError(body.error ?? "Unable to run diagnostic")
        return
      }

      // Show base report immediately — user can start reading
      setReport(body.report)
      setLoading(false)

      // Steps 2+3 run in parallel as background enrichment
      if (body.meta) {
        const { profile, googleMeta } = body.meta
        const baseReport = body.report

        void Promise.all([
          // Step 2: social scan
          fetch("/api/grader/social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ websiteUrl: profile.websiteUrl, name: profile.name }),
          })
            .then((r) => r.json() as Promise<SocialResponse>)
            .then(({ socialHealth }) => {
              if (socialHealth) {
                setReport((prev) => prev ? mergeSocialIntoReport(prev, socialHealth) : prev)
              }
            })
            .catch(() => null),

          // Step 3: AI narrative
          fetch("/api/grader/narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile,
              googleMeta,
              scores: baseReport.scores,
              overallScore: baseReport.overallScore,
              issues: baseReport.issues,
              recommendations: baseReport.recommendations,
            }),
          })
            .then((r) => r.json() as Promise<NarrativeResponse>)
            .then(({ narrative }) => {
              if (narrative) {
                setReport((prev) => prev ? mergeNarrativeIntoReport(prev, narrative) : prev)
              }
            })
            .catch(() => null),
        ])
      }
    } catch {
      setError("Unable to run diagnostic")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`grader-page grader-page--${phase}`}>
      <section className={`grader-stage workflow-stage ${phase !== "search" ? "workflow-stage--report" : ""}`}>
        {phase === "search" && (
          <SearchStage
            compact={false}
            error={error}
            loading={loading}
            onChooseSuggestion={chooseSuggestion}
            onQueryChange={handleQueryChange}
            onRunDiagnostic={runDiagnostic}
            onSearch={searchRestaurants}
            query={query}
            searchError={searchError}
            searching={searching}
            selectedPlace={selectedPlace}
            selectedSummary={selectedSummary}
            suggestions={suggestions}
          />
        )}

        {loading && selectedPlace && (
          <LoadingStage
            activeIndex={scanStep}
            selectedPlace={selectedPlace}
          />
        )}
        {!loading && report && (
          <ReportStage
            onReset={resetFlow}
            report={report}
          />
        )}
      </section>
      <SiteFooter />
    </main>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>Powered by Atrium</span>
      <span>© 2026 Atrium. All rights reserved.</span>
    </footer>
  )
}

function SearchStage({
  compact,
  error,
  loading,
  onChooseSuggestion,
  onQueryChange,
  onRunDiagnostic,
  onSearch,
  query,
  searchError,
  searching,
  selectedPlace,
  selectedSummary,
  suggestions,
}: {
  compact: boolean
  error: string | null
  loading: boolean
  onChooseSuggestion: (suggestion: PlaceSuggestion) => void
  onQueryChange: (value: string) => void
  onRunDiagnostic: () => void
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  query: string
  searchError: string | null
  searching: boolean
  selectedPlace: PlaceSuggestion | null
  selectedSummary: string | null
  suggestions: PlaceSuggestion[]
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (selectedPlace) {
      onRunDiagnostic()
      return
    }

    void onSearch(event)
  }

  return (
    <div className={`search-module ${compact ? "search-module--compact" : ""}`}>
      <div className="search-lockup">
        <DotPattern className="search-dot-pattern" cr={1.05} height={22} width={22} />
        <p className="micro-label">Atrium Growth Grader</p>
        <h1 className="display-title">
          Find the <span className="title-serif">leaks</span> before <br /> <span className="title-serif title-serif--delayed">guests</span> do.
        </h1>
      </div>

      <form className={`search-form ${selectedPlace ? "search-form--ready" : ""}`} onSubmit={handleSubmit}>
        <input
          aria-label="Restaurant"
          aria-autocomplete="list"
          aria-controls="restaurant-suggestions"
          aria-expanded={!compact && suggestions.length > 0}
          aria-haspopup="listbox"
          autoComplete="off"
          className="search-input"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Restaurant name and city"
          role="combobox"
          type="text"
          value={query}
        />
        {selectedPlace && (
          <button className="search-button" disabled={loading || searching} type="submit">
            Scan
          </button>
        )}
      </form>

      {!compact && suggestions.length > 0 && (
        <div className="suggestion-list" id="restaurant-suggestions" role="listbox">
          {suggestions.map((suggestion) => (
            <button
              className="suggestion-item"
              key={suggestion.placeId}
              onClick={() => onChooseSuggestion(suggestion)}
              role="option"
              type="button"
            >
              <span>{suggestion.name}</span>
              <small>{suggestion.address}</small>
            </button>
          ))}
        </div>
      )}

      {!compact && searching && suggestions.length === 0 && (
        <p className="inline-message inline-message--neutral">Searching open restaurant data...</p>
      )}

      {!compact && searchError && <p className="inline-message inline-message--error">{searchError}</p>}

      {selectedPlace && !compact && (
        <div className="selected-inline">
          <div className={`selected-media ${selectedPlace.photoUrl ? "selected-media--photo" : "selected-media--fallback"}`}>
            {selectedPlace.photoUrl ? (
              <>
                {/* biome-ignore lint/performance/noImgElement: Google Place photos are dynamic proxied media and must bypass Next image optimization. */}
                <img alt={`${selectedPlace.name} restaurant`} src={selectedPlace.photoUrl} />
                {selectedPlace.photoAttribution && (
                  <span className="selected-photo-credit">Photo: {selectedPlace.photoAttribution}</span>
                )}
              </>
            ) : (
              <span>Loaded restaurant</span>
            )}
          </div>
          <div className="selected-place-copy">
            <strong>{selectedPlace.name}</strong>
            {selectedSummary && <small>{selectedSummary}</small>}
          </div>
        </div>
      )}

      {!compact && error && <p className="inline-message inline-message--error">{error}</p>}
    </div>
  )
}

function LoadingStage({
  activeIndex,
  selectedPlace,
}: {
  activeIndex: number
  selectedPlace: PlaceSuggestion
}) {
  const activeStep = scanSteps[activeIndex] ?? scanSteps[0]
  if (!activeStep) return null

  const progress = Math.min(96, Math.round(((activeIndex + 0.72) / scanSteps.length) * 100))
  const loadingAction = loadingActionCopy(activeStep, selectedPlace)

  return (
    <section aria-live="polite" className="scan-loading-stage" role="status">
      <article className="scan-loading-card">
        <div className="scan-loading-brand">
          <span className="diagnostic-wordmark">atrium</span>
          <span>Building diagnostic</span>
        </div>

        <div className="scan-loading-body">
          <p className="micro-label">Scanning {selectedPlace.name}</p>
          <h1>Preparando el reporte.</h1>
          <span>{selectedPlace.address || selectedPlace.description}</span>

          <div className="diagnostic-live-line scan-loading-line">
            <span>{loadingAction}</span>
            <span aria-hidden="true" className="loading-dots">
              <i />
              <i />
              <i />
            </span>
          </div>

          <p>
            Estamos leyendo señales públicas primero. El layout final aparece solo cuando el scan tenga datos suficientes para explicar el resultado.
          </p>

          <div className="scan-loading-meter">
            <div aria-hidden="true" className="diagnostic-meter" style={{ "--diagnostic-progress": `${progress}%` } as CSSProperties}>
              <span />
            </div>
            <span>{progress}% · Step {activeIndex + 1} of {scanSteps.length}</span>
          </div>
        </div>
      </article>
    </section>
  )
}

function ReportStage({
  onReset,
  report,
}: {
  onReset: () => void
  report: RestaurantGrowthReport
}) {
  const tone = scoreTone(report.overallScore)
  const planItems = report.executiveSummary.atriumPlan
  const primaryPlanItem = planItems[0] ?? "Validate the weakest leak with a deeper audit."
  const nextPlanItems = planItems.slice(1, 4)
  const missingCriticalData = report.dataQuality?.missingCriticalData ?? []
  const contactHref = buildAgencyContactHref(report)
  const opensNewTab = !contactHref.startsWith("mailto:")

  return (
    <section className="diagnostic-stage diagnostic-stage--ready">
      <article className={`diagnostic-hero-panel diagnostic-hero-panel--${tone}`}>
        <div className="diagnostic-brand-row">
          <span className="diagnostic-wordmark">atrium</span>
          <span>Restaurant Growth Diagnostic</span>
        </div>

        <div className="diagnostic-hero-grid">
          <div className="diagnostic-score-block">
            <span>Growth score</span>
            <strong>{report.overallScore}</strong>
            <small>{confidenceCopy(report.confidence)}</small>
            <div aria-hidden="true" className="diagnostic-meter" style={{ "--diagnostic-progress": "100%" } as CSSProperties}>
              <span />
            </div>
          </div>

          <div className="diagnostic-summary-block">
            <p className="micro-label">Report ready</p>
            <h1>{report.business.name}</h1>
            <span>{report.business.address}</span>
            <h2>{report.executiveSummary.headline}</h2>
            <p>{report.executiveSummary.summary}</p>
          </div>
        </div>

        <div className="diagnostic-truth-bar">
          <span>Uses public discovery, website, reputation, and social signals.</span>
          <span>No POS, ticket size, CAC, margin, CRM, or private analytics in the free scan.</span>
          {missingCriticalData.length ? (
            <span>Missing: {missingCriticalData.slice(0, 2).join(", ")}</span>
          ) : null}
        </div>
      </article>

      <div className="diagnostic-report-grid">
        <section className={`diagnostic-panel diagnostic-panel--impact diagnostic-panel--${report.businessImpact.level}`}>
          <p className="micro-label">What the score means</p>
          <h2>{report.businessImpact.headline}</h2>
          <p>{report.businessImpact.explanation}</p>
          <strong>{report.estimatedLostOpportunity}</strong>
        </section>

        <section className="diagnostic-panel diagnostic-panel--translation">
          <p className="micro-label">Score translation</p>
          <h2>Where demand is leaking</h2>
          <div className="score-translation-list">
            {report.scoreInterpretation.slice(0, 5).map((insight) => (
              <div className={`score-translation-row score-translation-row--${insight.status}`} key={insight.category}>
                <span>{insight.label}</span>
                <strong>{insight.score}</strong>
                <p>{insight.businessImpact}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="diagnostic-panel diagnostic-panel--plan">
          <div className="diagnostic-plan-intro">
            <div className="diagnostic-plan-head">
              <p className="micro-label">How Atrium solves it</p>
              <span>30-day start</span>
            </div>
            <h2>Stop the leak closest to revenue.</h2>
            <div className="diagnostic-plan-focus">
              <span>First move</span>
              <strong>{primaryPlanItem}</strong>
            </div>
            <a className="diagnostic-cta-link" href={contactHref} rel={opensNewTab ? "noreferrer" : undefined} target={opensNewTab ? "_blank" : undefined}>
              Get the complete plan
            </a>
          </div>

          <ol className="diagnostic-plan-steps">
            {nextPlanItems.map((step, index) => (
              <li className="diagnostic-plan-step" key={step}>
                <span>{index + 2}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="result-actions">
        <button className="secondary-cta" onClick={onReset} type="button">
          Scan another restaurant
        </button>
      </div>
    </section>
  )
}

type DotPatternProps = SVGProps<SVGSVGElement> & {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
}

function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId()
  const patternId = `${id}-dot-pattern`

  return (
    <svg
      aria-hidden="true"
      className={["dot-pattern", className].filter(Boolean).join(" ")}
      focusable="false"
      {...props}
    >
      <defs>
        <pattern height={height} id={patternId} patternUnits="userSpaceOnUse" width={width} x={x} y={y}>
          <circle cx={cx} cy={cy} fill="currentColor" r={cr} />
        </pattern>
      </defs>
      <rect fill={`url(#${patternId})`} height="100%" width="100%" />
    </svg>
  )
}

function loadingActionCopy(
  step: typeof scanSteps[number],
  selectedPlace: PlaceSuggestion | null,
) {
  const listingSource = selectedPlace?.source === "google"
    ? "Leyendo data de Google"
    : "Leyendo data pública del restaurante"

  const copy: Record<typeof scanSteps[number]["id"], string> = {
    openData: listingSource,
    website: "Revisando website, menú y rutas de acción",
    benchmark: "Comparando señales locales visibles",
    reputation: "Revisando rating y reviews disponibles",
    social: "Buscando señales sociales públicas",
    brief: "Traduciendo hallazgos en un plan de crecimiento",
  }

  return copy[step.id]
}

function confidenceCopy(confidence: RestaurantGrowthReport["confidence"]) {
  if (confidence === "high") return "High confidence"
  if (confidence === "medium") return "Medium confidence"
  return "Directional scan"
}

function scoreTone(score: number): ScoreTone {
  if (score >= 80) return "high"
  if (score >= 60) return "medium"
  return "low"
}

function buildAgencyContactHref(report: RestaurantGrowthReport) {
  const configuredUrl = process.env.NEXT_PUBLIC_GRADER_CONTACT_URL

  if (configuredUrl) {
    return configuredUrl
  }

  const subject = encodeURIComponent(`Restaurant growth plan for ${report.business.name}`)
  const body = encodeURIComponent(
    [
      `Hi Atrium,`,
      "",
      `I scanned ${report.business.name} and would like to review the growth plan.`,
      `Score: ${report.overallScore}`,
      `Summary: ${report.executiveSummary.headline}`,
      `Priority: ${report.executiveSummary.priority}`,
      `Address: ${report.business.address}`,
      "",
      `Please contact me about the complete restaurant growth plan.`,
    ].join("\n"),
  )

  return `mailto:dev@tbsadvertising.com?subject=${subject}&body=${body}`
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
