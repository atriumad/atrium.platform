"use client"

import type { RestaurantGrowthReport, RestaurantGrowthScores } from "@atrium/application"
import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"

const scanSteps = [
  {
    title: "Open data",
    detail: "Resolving the public listing, address, and restaurant category.",
  },
  {
    title: "Website scan",
    detail: "Checking menu, ordering, reservations, phone visibility, and schema.",
  },
  {
    title: "Local benchmark",
    detail: "Comparing nearby restaurant density and discovery signals.",
  },
  {
    title: "Reputation layer",
    detail: "Blending available review context with the baseline you provide.",
  },
  {
    title: "Growth brief",
    detail: "Ranking leaks by urgency and preparing the next action.",
  },
]

type GraderResponse = {
  report?: RestaurantGrowthReport
  error?: string
}

type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
  description: string
  source: "openstreetmap"
}

type SearchResponse = {
  suggestions?: PlaceSuggestion[]
  error?: string
}

type ScanPhase = "search" | "loading" | "result"
type ScoreTone = "low" | "medium" | "high"

const scoreLabels: Record<keyof RestaurantGrowthScores, string> = {
  discovery: "Discovery",
  website: "Website",
  reputation: "Reputation",
  conversion: "Conversion",
}

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

    const request = fetch("/api/grader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId: selectedPlace.placeId,
      }),
    })

    try {
      for (let i = 0; i < scanSteps.length; i += 1) {
        setScanStep(i)
        await delay(i === 0 ? 320 : 540)
      }

      const res = await request
      const body = await res.json() as GraderResponse

      if (!res.ok || !body.report) {
        setError(body.error ?? "Unable to run diagnostic")
        return
      }

      setReport(body.report)
    } catch {
      setError("Unable to run diagnostic")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`grader-page grader-page--${phase}`}>
      <section className={`grader-stage workflow-stage ${phase !== "search" ? "workflow-stage--pinned" : ""}`}>
        <SearchStage
          compact={phase !== "search"}
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

        {loading && <ScanStatusCards activeIndex={scanStep} />}
        {!loading && report && <ResultStage report={report} onReset={resetFlow} />}
      </section>
    </main>
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
  return (
    <div className={`search-module ${compact ? "search-module--compact" : ""}`}>
      <div className="search-lockup">
        <p className="micro-label">Atrium growth grader</p>
        <h1 className="display-title">
          Find the <span className="title-serif">leaks</span> before <span className="title-serif">guests</span> do.
        </h1>
      </div>

      <form className="search-form" onSubmit={onSearch}>
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
        <button className="search-button" disabled={loading || searching || query.trim().length < 3} type="submit">
          {searching ? "Searching" : "Search"}
        </button>
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
        <div className="selected-panel">
          <div className="selected-place">
            <span className="selected-kicker">Selected</span>
            <strong>{selectedPlace.name}</strong>
            {selectedSummary && <small>{selectedSummary}</small>}
          </div>

          <button className="primary-cta" onClick={onRunDiagnostic} type="button">
            Scan restaurant
          </button>
        </div>
      )}

      {!compact && error && <p className="inline-message inline-message--error">{error}</p>}
    </div>
  )
}

function ScanStatusCards({
  activeIndex,
}: {
  activeIndex: number
}) {
  return (
    <div aria-live="polite" className="status-grid" role="status">
      {scanSteps.map((step, index) => {
        const status = index < activeIndex ? "complete" : index === activeIndex ? "active" : "pending"

        return (
          <article className={`status-card status-card--${status}`} key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </article>
        )
      })}
    </div>
  )
}

function ResultStage({
  onReset,
  report,
}: {
  onReset: () => void
  report: RestaurantGrowthReport
}) {
  const topIssue = report.issues[0]
  const nextRecommendation = report.recommendations[0]
  const tone = scoreTone(report.overallScore)

  return (
    <section className="result-stage">
      <article className={`result-card result-card--${tone}`}>
        <div className="result-grid">
          <div className="score-block">
            <span>Score</span>
            <strong>{report.overallScore}</strong>
            <small>{confidenceCopy(report.confidence)}</small>
          </div>

          <div className="result-copy">
            <p className="micro-label">Report ready</p>
            <h1 className="display-title display-title--compact">
              <span className="title-serif">{report.business.name}</span>
            </h1>
            <p className="result-address">{report.business.address}</p>
          </div>
        </div>

        <div className="score-list">
          {(Object.entries(report.scores) as [keyof RestaurantGrowthScores, number][]).map(([key, value]) => (
            <div className={`score-row score-row--${scoreTone(value)}`} key={key}>
              <span>{scoreLabels[key]}</span>
              <strong>{value}</strong>
              <div aria-hidden="true" className={`solid-meter solid-meter--${scoreTone(value)}`}>
                <span style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="finding-grid">
          <ResultFinding
            label="Top issue"
            title={topIssue?.message ?? "No major issue found"}
            body={topIssue?.impact ?? "The diagnostic did not flag a severe growth leak."}
          />
          <ResultFinding
            label="Next action"
            title={nextRecommendation?.title ?? "Keep improving the highest-friction signal"}
            body={nextRecommendation?.action ?? report.nextBestAction}
          />
          <ResultFinding
            label="Opportunity"
            title={report.estimatedLostOpportunity}
            body={report.nextBestAction}
          />
        </div>
      </article>

      <AgencyCta report={report} />
      <div className="result-actions">
        <button className="secondary-cta" onClick={onReset} type="button">
          Scan another restaurant
        </button>
      </div>
    </section>
  )
}

function AgencyCta({ report }: { report: RestaurantGrowthReport }) {
  const contactHref = buildAgencyContactHref(report)
  const opensNewTab = !contactHref.startsWith("mailto:")

  return (
    <section className="agency-cta">
      <div className="agency-cta-copy">
        <p>Agency follow-up</p>
        <h2>
          Turn this scan into a restaurant growth plan.
        </h2>
        <span>
          Atrium can review the leaks, prioritize the first 30 days, and show what we would implement for {report.business.name}.
        </span>
      </div>
      <a className="agency-cta-link" href={contactHref} rel={opensNewTab ? "noreferrer" : undefined} target={opensNewTab ? "_blank" : undefined}>
        Contact the agency
      </a>
    </section>
  )
}

function ResultFinding({
  body,
  label,
  title,
}: {
  body: string
  label: string
  title: string
}) {
  return (
    <article className="finding-block">
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  )
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
      `Address: ${report.business.address}`,
      "",
      `Please contact me about the restaurant marketing service.`,
    ].join("\n"),
  )

  return `mailto:hello@atrium.agency?subject=${subject}&body=${body}`
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
