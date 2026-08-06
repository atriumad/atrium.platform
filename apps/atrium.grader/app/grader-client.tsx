"use client"

import type { DiagnosticStepResult, RestaurantGrowthReport } from "@atrium/application"
import { Button, Eyebrow, Meter, Stat } from "@atrium/ui"
import type { FormEvent, SVGProps } from "react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { NarrativeData } from "@/lib/report-merger"
import { mergeNarrativeIntoReport, mergeSocialIntoReport } from "@/lib/report-merger"

type ReportMeta = {
  profile: {
    websiteUrl: string | null
    name: string
    [key: string]: unknown
  }
  googleMeta: unknown
  localBenchmark?: unknown
}

type GraderResponse = {
  scanId?: string
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

const scanSteps = [
  {
    id: "listing", label: "Listing", status: "Checking public listing",
    details: [
      "Checking public listing",
      "Reading business name, category, address, and website fields",
      "Estimating listing completeness",
      "Normalizing the business profile",
    ],
  },
  {
    id: "website", label: "Website", status: "Running website audit",
    details: [
      "Running website audit",
      "Checking menu, ordering, reservation, and phone signals",
      "Reading local schema and meta description",
      "Capturing available speed signals",
    ],
  },
  {
    id: "benchmark", label: "Market", status: "Estimating local benchmark",
    details: [
      "Preparing local benchmark layer",
      "Keeping rank claims separate from directional signals",
      "Flagging benchmark limitations",
      "Marking missing market data clearly",
    ],
  },
  {
    id: "reputation", label: "Reviews", status: "Checking reputation availability",
    details: [
      "Checking reputation availability",
      "Reading rating and review count when available",
      "Applying a neutral baseline if reviews are unavailable",
      "Separating verified data from assumptions",
    ],
  },
  {
    id: "social", label: "Social", status: "Checking social handles",
    details: [
      "Checking social handles",
      "Looking for public Instagram, Facebook, and TikTok signals",
      "Separating detected profiles from missing profiles",
      "Capturing social data limitations",
    ],
  },
  {
    id: "brief", label: "Plan", status: "Building action plan",
    details: [
      "Building action plan",
      "Calculating the growth score",
      "Identifying the highest-risk leak",
      "Translating findings into the first fix",
    ],
  },
] as const

type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
  description: string
  source: "google"
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
        setSearchError(result.error ?? (result.suggestions.length === 0 ? "No matching restaurant found" : null))
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
        setSearchError("No matching restaurant found")
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

    try {
      const res = await fetch("/api/grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: selectedPlace.placeId }),
      })

      const body = await res.json() as GraderResponse

      if (!res.ok || !body.report) {
        setError(body.error ?? "Unable to run diagnostic")
        return
      }

      // Social evidence must be merged before the agent writes the final narrative.
      let finalReport = body.report

      if (body.meta) {
        const { profile, googleMeta, localBenchmark } = body.meta

        const socialResult = await fetch("/api/grader/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ websiteUrl: profile.websiteUrl, name: profile.name, address: profile.address }),
        })
          .then((r) => r.json() as Promise<SocialResponse>)
          .catch(() => ({ socialHealth: undefined }) as SocialResponse)

        if (socialResult.socialHealth) {
          finalReport = mergeSocialIntoReport(finalReport, socialResult.socialHealth)
        }

        const narrativeResult = await fetch("/api/grader/narrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            googleMeta,
            localBenchmark,
            report: finalReport,
          }),
        })
          .then((r) => r.json() as Promise<NarrativeResponse>)
          .catch(() => ({ narrative: null }) as NarrativeResponse)

        if (narrativeResult.narrative) {
          finalReport = mergeNarrativeIntoReport(finalReport, narrativeResult.narrative)
        }
      }

      setReport(finalReport)
    } catch {
      setError("Unable to run diagnostic")
    } finally {
      setLoading(false)
    }
  }

  const shellPhaseClass = phase === "search"
    ? "items-start bg-[image:radial-gradient(760px_460px_at_22%_8%,rgba(63,174,120,.16),transparent_60%),radial-gradient(720px_480px_at_84%_88%,rgba(243,193,80,.16),transparent_58%)] text-ink"
    : phase === "loading"
      ? "items-center bg-[image:radial-gradient(760px_460px_at_22%_8%,rgba(63,174,120,.16),transparent_60%),radial-gradient(720px_480px_at_84%_88%,rgba(243,193,80,.16),transparent_58%)] pt-[clamp(18px,2vw,28px)] text-ink max-[760px]:pt-[18px]"
      : "items-start pt-[clamp(18px,2vw,28px)] max-[760px]:pt-[18px]"

  const stageClass = phase === "search"
    ? "mt-[clamp(88px,18svh,168px)] w-[min(100%,1200px)] justify-items-center gap-[26px] max-[900px]:mt-[clamp(64px,14svh,120px)] max-[760px]:mt-[clamp(58px,12svh,92px)] max-[760px]:w-full max-[760px]:gap-[18px]"
    : "mt-0 w-full justify-items-stretch gap-4"

  return (
    <main
      className={`relative isolate grid min-h-[100svh] grid-rows-[1fr_auto] justify-items-center gap-7 overflow-auto bg-cream p-[clamp(20px,3vw,36px)] transition-[padding] duration-[900ms] ease-atrium max-[760px]:overflow-visible max-[760px]:px-5 max-[760px]:py-[18px] ${shellPhaseClass}`}
    >
      <section
        className={`grid animate-stage-rise will-change-[margin-top,transform] [transition:gap_900ms_var(--ease-atrium),margin-top_980ms_var(--ease-atrium),transform_980ms_var(--ease-atrium)] motion-reduce:animate-none motion-reduce:transition-none ${stageClass}`}
      >
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
          <LoadingStage name={selectedPlace.name} />
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
    <footer className="flex w-[min(100%,960px)] flex-wrap items-center justify-between gap-x-[18px] gap-y-2 border-t border-line pt-4 text-[0.84rem] leading-[1.45] text-muted max-[760px]:justify-center max-[760px]:text-center">
      <span className="font-medium text-ink">Powered by Atrium</span>
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
    <div className="flex w-full flex-col items-center gap-[22px] text-center text-ink max-[560px]:gap-[18px]">
      <div className="flex animate-rise flex-col items-center motion-reduce:animate-none">
        <DotPattern className="mb-2.5 h-5 w-[90px] text-[rgba(13,47,51,.14)]" cr={1.05} height={22} width={22} />
        <Eyebrow>Atrium Growth Grader</Eyebrow>
        <h1 className="mx-0 mb-0 mt-4 max-w-[16ch] font-sans text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none tracking-[-0.015em] max-[560px]:max-w-[14ch] max-[560px]:text-[clamp(2.05rem,9vw,2.8rem)]">
          Find the <em className="font-serif font-normal italic text-green">leaks</em> before <em className="font-serif font-normal italic text-green">guests</em> do.
        </h1>
        <p className="mx-0 mb-0 mt-[18px] max-w-[52ch] text-[1.06rem] text-body max-[560px]:mt-3.5 max-[560px]:text-[0.98rem]">A free 30-second scan of your restaurant's online growth — discovery, website, reputation, and social — with the first fix to make.</p>
      </div>

      <form
        className="mt-1.5 flex w-[min(100%,620px)] animate-rise items-center gap-3 rounded-full border border-transparent bg-card px-6 py-4 shadow-soft transition-[box-shadow,transform,border-color] duration-200 ease-atrium focus-within:-translate-y-px focus-within:border-[rgba(63,174,120,.4)] focus-within:shadow-float motion-reduce:animate-none motion-reduce:transition-none max-[560px]:gap-2.5 max-[560px]:px-[18px] max-[560px]:py-3.5"
        onSubmit={handleSubmit}
      >
        <span className="flex flex-none text-muted" aria-hidden="true">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6.2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M13.6 13.6 18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <input
          aria-label="Restaurant"
          aria-autocomplete="list"
          aria-controls="restaurant-suggestions"
          aria-expanded={!compact && suggestions.length > 0}
          aria-haspopup="listbox"
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-[1.08rem] text-ink outline-none placeholder:text-muted max-[560px]:text-base"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Restaurant name and city"
          role="combobox"
          type="text"
          value={query}
        />
      </form>

      {!compact && !selectedPlace && suggestions.length === 0 && !searchError && (
        <div className="flex animate-rise flex-wrap justify-center gap-x-2.5 gap-y-2 motion-reduce:animate-none">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-[15px] py-[7px] text-[0.82rem] font-medium text-body shadow-soft before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-fill before:content-['']">Free</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-[15px] py-[7px] text-[0.82rem] font-medium text-body shadow-soft before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-fill before:content-['']">~30-second scan</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-[15px] py-[7px] text-[0.82rem] font-medium text-body shadow-soft before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-fill before:content-['']">No signup</span>
        </div>
      )}

      {!compact && suggestions.length > 0 && (
        <div
          className="w-[min(100%,620px)] animate-rise-sm overflow-hidden rounded-card-sm bg-card text-left shadow-soft motion-reduce:animate-none"
          id="restaurant-suggestions"
          role="listbox"
        >
          {suggestions.map((suggestion) => (
            <button
              className="flex w-full cursor-pointer flex-col gap-0.5 border-t border-line bg-transparent px-[22px] py-[15px] text-left font-sans transition-colors duration-150 first:border-t-0 hover:bg-off-white max-[560px]:px-[18px] max-[560px]:py-3.5"
              key={suggestion.placeId}
              onClick={() => onChooseSuggestion(suggestion)}
              role="option"
              type="button"
            >
              <strong className="text-base font-medium text-ink">{suggestion.name}</strong>
              <small className="text-[0.85rem] text-muted">{suggestion.address}</small>
            </button>
          ))}
        </div>
      )}

      {!compact && searching && suggestions.length === 0 && (
        <p className="m-0 text-[0.9rem] text-muted">Searching restaurants…</p>
      )}

      {!compact && searchError && <p className="m-0 text-[0.9rem] text-error">{searchError}</p>}

      {selectedPlace && !compact && (
        <button
          className="group flex w-[min(100%,620px)] animate-rise-sm cursor-pointer items-center gap-[18px] rounded-3xl border border-transparent bg-card px-5 py-[18px] text-left font-sans text-ink shadow-soft transition-[transform,box-shadow,border-color] duration-[180ms] ease-atrium hover:border-[rgba(63,174,120,.45)] hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-green-fill disabled:cursor-default disabled:opacity-60 disabled:shadow-soft motion-reduce:animate-none motion-reduce:transition-none max-[560px]:gap-3.5 max-[560px]:rounded-[20px] max-[560px]:p-4"
          type="button"
          onClick={onRunDiagnostic}
          disabled={loading || searching}
        >
          <div className="flex h-[70px] w-[70px] flex-none items-center justify-center overflow-hidden rounded-2xl bg-green-soft font-serif text-[1.9rem] italic text-green-ink max-[560px]:h-14 max-[560px]:w-14 max-[560px]:rounded-[14px] max-[560px]:text-2xl">
            {selectedPlace.photoUrl ? (
              /* biome-ignore lint/performance/noImgElement: Google Place photos are dynamic proxied media and must bypass Next image optimization. */
              <img className="h-full w-full object-cover" alt={`${selectedPlace.name} restaurant`} src={selectedPlace.photoUrl} />
            ) : (
              <span>{selectedPlace.name.trim().charAt(0).toUpperCase() || "•"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-green before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-fill before:content-['']">Selected</span>
            <strong className="mt-1.5 block text-[1.15rem] font-medium text-ink max-[560px]:text-[1.05rem]">{selectedPlace.name}</strong>
            {selectedSummary && <small className="text-[0.9rem] text-body">{selectedSummary}</small>}
          </div>
          <span
            className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-green-soft text-green-ink transition-[background-color,color] duration-[180ms] ease-atrium group-hover:bg-green-fill group-hover:text-white motion-reduce:transition-none max-[560px]:h-10 max-[560px]:w-10"
            aria-hidden="true"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      )}

      {!compact && error && <p className="m-0 text-[0.9rem] text-error">{error}</p>}
    </div>
  )
}

function LoadingStage({ name }: { name: string }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)

  useEffect(() => {
    const durations = [4400, 4800, 4600, 4800, 5000, 5600]
    let current = 0
    let cancelled = false

    const advance = async () => {
      while (!cancelled) {
        const duration = durations[current] ?? 3000
        await new Promise<void>((resolve) => window.setTimeout(resolve, duration))
        if (cancelled) break
        if (current < scanSteps.length - 1) {
          current += 1
          setStepIndex(current)
          setSubIndex(0)
        } else {
          break
        }
      }
    }

    void advance()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const details = scanSteps[stepIndex]?.details ?? []
    if (details.length <= 1) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const interval = window.setInterval(() => {
      setSubIndex((current) => (current + 1) % details.length)
    }, 1500)

    return () => window.clearInterval(interval)
  }, [stepIndex])

  const step = scanSteps[stepIndex] ?? scanSteps[0]
  const activeSub = step.details[subIndex] ?? step.details[0]
  const progressPct = Math.min(100, (stepIndex / scanSteps.length) * 100 + (stepIndex < scanSteps.length ? 6 : 0))

  return (
    <section
      aria-label={`Atrium report loading: ${step.status}`}
      aria-live="polite"
      className="mx-auto w-[min(100%,560px)] rounded-card bg-card px-[34px] py-9 text-left font-sans text-ink shadow-soft max-[560px]:rounded-[22px] max-[560px]:px-5 max-[560px]:py-[26px]"
      role="status"
    >
      <Eyebrow className="flex items-center gap-2 before:h-[7px] before:w-[7px] before:animate-pulse-soft before:rounded-full before:bg-green-fill before:content-[''] motion-reduce:before:animate-none">Growth scan in progress</Eyebrow>
      <h1 className="mx-0 mb-0 mt-3 font-sans text-[1.7rem] font-medium tracking-[-0.01em] max-[560px]:text-[1.4rem]">{name}</h1>

      <div className="mb-[26px] mt-[22px] h-1.5 overflow-hidden rounded-full bg-track-soft">
        <span
          className="block h-full w-0 rounded-full bg-green-fill transition-[width] duration-[800ms] ease-atrium motion-reduce:transition-none"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="m-0 list-none p-0">
        {scanSteps.map((s, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending"
          const dotTone = state === "done" ? "bg-green-fill" : state === "active" ? "bg-green-soft" : "bg-track-soft"
          const lineTone = state === "done" ? "bg-green-fill" : "bg-track-soft"
          const labelTone = state === "done"
            ? "text-ink"
            : state === "active"
              ? "font-semibold text-ink"
              : "text-muted-soft"
          return (
            <li className="group grid grid-cols-[34px_1fr] gap-4 max-[560px]:grid-cols-[30px_1fr] max-[560px]:gap-3" key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`relative flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full transition-[background-color] duration-300 ease-atrium motion-reduce:transition-none ${dotTone}`}>
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full bg-pending ${state === "pending" ? "" : "hidden"}`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute -inset-[3px] animate-spin-slow rounded-full border-2 border-transparent border-r-green-fill border-t-green-fill motion-reduce:animate-none ${state === "active" ? "" : "hidden"}`}
                  />
                  <svg
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 text-white ${state === "done" ? "" : "hidden"}`}
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                  </svg>
                </div>
                <div className={`my-1 w-0.5 flex-1 rounded-sm transition-[background-color] duration-500 ease-atrium group-last:hidden motion-reduce:transition-none ${lineTone}`} />
              </div>
              <div className="pb-[22px] max-[560px]:pb-[18px]">
                <div className={`text-[1.05rem] font-medium transition-colors duration-300 ease-atrium motion-reduce:transition-none max-[560px]:text-base ${labelTone}`}>{s.label}</div>
                {state === "active" && (
                  <div className="mt-1 min-h-[1.1em] animate-fade-in text-[0.86rem] text-muted-soft motion-reduce:animate-none" key={activeSub}>{activeSub}</div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mx-0 mb-0 mt-2 text-center text-[0.85rem] text-muted-soft">Takes about 30 seconds — we check discovery, website, reputation &amp; social.</p>
      <span className="visually-hidden">{step.status}</span>
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
  const thirtyDayPlan = planItems.slice(0, 3)
  const missingCriticalData = report.dataQuality?.missingCriticalData ?? []
  const contactHref = buildAgencyContactHref(report)
  const opensNewTab = !contactHref.startsWith("mailto:")
  const scoreSignal = scoreSignalCopy(tone)
  const highestRiskLeak = report.issues[0]?.message ?? "No severe demand leak was found in this scan."
  const primaryLeak = report.executiveSummary.primaryLeak ?? highestRiskLeak
  const rootCause = report.executiveSummary.rootCause ?? report.executiveSummary.priority
  const whyItMatters = report.executiveSummary.whyItMatters ?? report.businessImpact.explanation
  const firstMove = report.executiveSummary.firstMove ?? primaryPlanItem
  const evidenceHighlights = reportEvidenceHighlights(report)
  const scoreEntries = topScoreEntries(report)
  const headerStats = report.scoreInterpretation.slice(0, 4)
  // Literal hex: the ring is painted from JS into a conic-gradient, outside Tailwind's reach.
  const gaugeColor = tone === "high" ? "#3fae78" : tone === "medium" ? "#f3c150" : "#e08a5b"
  const rootRef = useRef<HTMLElement>(null)
  const missingDataWarning = missingCriticalData.length > 0
    ? `Missing data can change the read: ${missingCriticalData.slice(0, 3).join(", ")}.`
    : null
  const displayHeadline = publicReportText(report.executiveSummary.headline)
  const displaySummary = publicReportText(report.executiveSummary.summary)
  const displayPrimaryLeak = publicReportText(primaryLeak)
  const displayRootCause = publicReportText(rootCause)
  const displayWhyItMatters = publicReportText(whyItMatters)
  const displayFirstMove = publicReportText(firstMove)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.classList.add("atr-anim")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const easeOut = (t: number) => 1 - (1 - t) ** 3
    const countUp = (el: HTMLElement) => {
      const target = Number.parseInt(el.dataset.count ?? "0", 10)
      if (reduce) { el.textContent = String(target); return }
      let start: number | null = null
      const tick = (ts: number) => {
        if (start === null) start = ts
        const t = Math.min(1, (ts - start) / 1100)
        el.textContent = String(Math.round(target * easeOut(t)))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    const runGauge = (g: HTMLElement) => {
      const target = Number.parseFloat(g.dataset.p ?? "0")
      const color = g.dataset.color ?? "#fff"
      const ring = g.querySelector<HTMLElement>(".atr-ring")
      if (!ring) return
      const paint = (p: number) => {
        ring.style.background = `conic-gradient(${color} 0 ${p}%, rgba(255,255,255,0.12) ${p}% 100%)`
      }
      if (reduce) { paint(target); return }
      let start: number | null = null
      const tick = (ts: number) => {
        if (start === null) start = ts
        const t = Math.min(1, (ts - start) / 1300)
        paint(target * easeOut(t))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    const activate = (el: Element) => {
      el.classList.add("in")
      el.querySelectorAll<HTMLElement>(".atr-fill[data-w]").forEach((f, i) => {
        const w = f.dataset.w ?? "0%"
        if (reduce) { f.style.width = w } else { window.setTimeout(() => { f.style.width = w }, 120 + i * 110) }
      })
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n, i) => {
        window.setTimeout(() => countUp(n), 120 + i * 110)
      })
      const g = el.querySelector<HTMLElement>(".rg-gauge")
      if (g) window.setTimeout(() => runGauge(g), 200)
    }
    const els = Array.from(root.querySelectorAll<HTMLElement>(".atr-reveal"))
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(activate)
      return
    }
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          activate(en.target)
          io.unobserve(en.target)
        }
      }
    // Threshold stays at 0 so cards taller than the viewport still reveal on small screens.
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" })
    for (const el of els) io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={rootRef}
      className="atr-report mx-auto flex w-full max-w-[1080px] flex-col gap-5 text-left font-sans leading-[1.5] text-ink max-[560px]:gap-3.5"
    >
      <div className="atr-reveal grid grid-cols-[1fr_360px] items-stretch gap-5 max-[980px]:grid-cols-[1fr_minmax(280px,320px)] max-[700px]:grid-cols-[1fr]">
        <div className="flex flex-col justify-center rounded-card bg-card px-[34px] py-[38px] shadow-soft max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]">
          <Eyebrow className="flex flex-wrap items-center gap-1.5">
            <span>Growth diagnostic</span>
            <span aria-hidden="true">·</span>
            {shortAddress(publicReportText(report.business.address))}
          </Eyebrow>
          <h1 className="m-0 break-words text-[clamp(1.95rem,4.6vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.02em]">{publicReportText(report.business.name)}</h1>
          <h2 className="m-0 max-w-[22ch] font-serif text-[clamp(1.5rem,2.6vw,2.05rem)] font-normal italic leading-[1.22] tracking-[-0.02em] text-green">{displayHeadline}</h2>
          {headerStats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {headerStats.map((entry) => (
                <Stat key={entry.category} label={entry.label} tone={statTone(entry.status)} value={entry.score} />
              ))}
            </div>
          )}
          <p className={`max-w-[48ch] border-t border-line pt-6 text-[1.02rem] leading-[1.62] text-body ${headerStats.length > 0 ? "mt-2.5" : "mt-[26px]"}`}>{displaySummary}</p>
        </div>

        <aside className="flex flex-col justify-between rounded-card bg-dark p-[30px] text-white shadow-soft max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]">
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.35rem] italic">atrium</span>
            <span className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-mint">Growth score</span>
          </div>
          <div
            className="rg-gauge relative mx-auto mb-1.5 mt-[22px] h-[186px] w-[186px] max-[980px]:h-[164px] max-[980px]:w-[164px]"
            data-p={report.overallScore}
            data-color={gaugeColor}
          >
            <div className="atr-ring" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[4.4rem] font-medium leading-[0.9] tracking-[-0.03em] text-white max-[980px]:text-[3.6rem]" data-count={report.overallScore}>0</div>
              <div className="mt-0.5 text-[0.72rem] font-semibold tracking-[0.1em] text-white/55">/ 100</div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-[7px] self-center rounded-full px-3.5 py-1.5 text-[0.82rem] font-semibold before:h-[7px] before:w-[7px] before:animate-pulse-soft before:rounded-full before:content-[''] motion-reduce:before:animate-none ${tagToneClass(tone)}`}>{scoreSignal}</span>
          <div className="mt-[22px] flex flex-wrap justify-center gap-2.5 border-t border-white/[.14] pt-3.5 text-[0.76rem] text-white/55">
            <span>{confidenceCopy(report.confidence)}</span>
            <span aria-hidden="true">·</span>
            <span>Directional scan</span>
          </div>
        </aside>
      </div>

      <div className="atr-reveal grid grid-cols-[1fr_380px] items-stretch gap-5 max-[980px]:grid-cols-[1fr_minmax(280px,320px)] max-[700px]:grid-cols-[1fr]">
        <div className="rounded-card bg-card p-[34px] shadow-soft max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]">
          <Eyebrow>Primary leak</Eyebrow>
          <h2 className="m-0 max-w-[16ch] text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.02em]">{displayPrimaryLeak}</h2>
          <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[22px] max-[560px]:mt-5 max-[560px]:gap-3.5">
            <div className="rounded-card-sm bg-cream p-5 max-[560px]:p-4"><span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-green">Root cause</span><p className="mx-0 mb-0 mt-2 text-[0.95rem] text-body">{displayRootCause}</p></div>
            <div className="rounded-card-sm bg-cream p-5 max-[560px]:p-4"><span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-green">Why it matters</span><p className="mx-0 mb-0 mt-2 text-[0.95rem] text-body">{displayWhyItMatters}</p></div>
          </div>
        </div>
        <aside className="flex flex-col gap-6 rounded-card bg-amber-soft p-[30px] shadow-soft max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]">
          <div>
            <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-amber-ink">First move</p>
            <h3 className="mx-0 mb-0 mt-3.5 text-[1.3rem] font-medium leading-[1.3] tracking-[-0.02em]">{displayFirstMove}</h3>
          </div>
          <Button
            className="self-start"
            href={contactHref}
            rel={opensNewTab ? "noreferrer" : undefined}
            target={opensNewTab ? "_blank" : undefined}
            variant="primary"
          >
            Review the full plan →
          </Button>
        </aside>
      </div>

      <div className="atr-reveal rounded-card bg-card p-[34px] shadow-soft max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-5">
          <div>
            <Eyebrow>30-day plan</Eyebrow>
            <h2 className="m-0 text-2xl font-medium tracking-[-0.02em]">Fix the closest leak first.</h2>
          </div>
          <p className="m-0 max-w-[40ch] text-[0.92rem] text-muted">{publicReportText(report.estimatedLostOpportunity)}</p>
        </div>
        {thirtyDayPlan.map((step, index) => (
          <div className="group flex items-start gap-[18px] border-t border-line py-5 max-[560px]:gap-3.5 max-[560px]:py-4" key={step}>
            <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-green-soft text-[0.95rem] font-medium text-green-ink transition-transform duration-200 ease-atrium group-hover:-rotate-6 group-hover:scale-[1.08] motion-reduce:transition-none">{index + 1}</div>
            <p className="mx-0 mb-0 mt-1.5 text-[1.05rem] font-medium leading-[1.35]">{publicReportText(step)}</p>
          </div>
        ))}
      </div>

      <div className="atr-reveal rounded-card bg-card p-[34px] shadow-soft max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]">
        <div className="mb-[22px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Signal by signal</Eyebrow>
            <h2 className="m-0 max-w-[16ch] text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.02em]">Where growth is <em className="font-serif font-normal italic text-green">leaking.</em></h2>
          </div>
          <p className="m-0 max-w-[40ch] text-[0.92rem] text-muted">Each score maps a step from discovery to repeat business.</p>
        </div>
        {scoreEntries.map((insight) => (
          <Meter
            key={insight.category}
            description={publicReportText(insight.businessImpact)}
            label={insight.label}
            tone={insight.score >= 80 ? "hi" : insight.score >= 60 ? "mid" : "lo"}
            value={insight.score}
          />
        ))}
      </div>

      <details className="atr-reveal group rounded-card bg-card px-[34px] py-[26px] shadow-soft max-[980px]:px-7 max-[980px]:py-[22px] max-[560px]:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
          <h3 className="m-0 text-[1.3rem] font-medium leading-[1.18] tracking-[-0.02em]">Supporting evidence</h3>
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-cream text-2xl text-ink transition-transform duration-200 ease-atrium group-open:rotate-45 motion-reduce:transition-none">+</span>
        </summary>
        <div className="mt-[22px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
            {evidenceHighlights.map((highlight) => (
              <div className="rounded-card-sm bg-cream p-5 max-[560px]:p-4" key={highlight}><span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-green">Signal</span><p className="mx-0 mb-0 mt-2 text-[0.95rem] text-body">{publicReportText(highlight)}</p></div>
            ))}
            {missingDataWarning ? (
              <div className="rounded-card-sm bg-amber-soft p-5 max-[560px]:p-4"><span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-amber-ink">Limitation</span><p className="mx-0 mb-0 mt-2 text-[0.95rem] text-body">{publicReportText(missingDataWarning)}</p></div>
            ) : null}
          </div>
          <div className="mt-[22px] grid grid-cols-1 gap-x-8 gap-y-2 min-[900px]:grid-cols-2">
            {report.diagnosticSteps.map((step) => (
              <DiagnosticEvidenceCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      </details>

      <div className="atr-reveal flex flex-wrap justify-between gap-4 px-1.5 py-1 text-[0.82rem] text-muted">
        <span>Directional free scan. Confirm with first-party business data before major spend.</span>
        {missingCriticalData.length ? <span>Missing: {missingCriticalData.slice(0, 2).map(publicReportText).join(", ")}</span> : null}
      </div>

      <div className="atr-reveal mt-1.5 flex justify-center">
        <Button onClick={onReset} variant="secondary">Scan another restaurant</Button>
      </div>
    </section>
  )
}

function DiagnosticEvidenceCard({ step }: { step: DiagnosticStepResult }) {
  const foundSignals = Array.from(new Set(step.found)).slice(0, 4).map(publicReportText)
  const missingSignals = Array.from(new Set(step.missing)).slice(0, 4).map(publicReportText)
  const limitation = publicReportText(diagnosticStepLimitation(step))

  return (
    <article className="border-t border-line py-9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase leading-[1.2] tracking-[0.18em] text-green">{diagnosticStepTitle(step.id)}</p>
          <strong className="mt-3 block text-[clamp(1.125rem,1.5vw,1.375rem)] font-normal leading-[1.5] tracking-[-0.012em] text-ink">{diagnosticStatusCopy(step.status)}</strong>
        </div>
        <span className="border border-line px-3 py-1 text-sm leading-[1.55] tracking-[-0.004em] text-ink">
          {stepConfidenceCopy(step.confidence)}
        </span>
      </div>

      <dl className="mt-7 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase leading-[1.2] tracking-[0.18em] text-green">Signal group</dt>
          <dd className="mt-2 text-sm leading-[1.55] tracking-[-0.004em] text-body">{diagnosticStepTitle(step.id)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase leading-[1.2] tracking-[0.18em] text-green">Checked</dt>
          <dd className="mt-2 text-sm leading-[1.55] tracking-[-0.004em] text-body">{step.checked.slice(0, 3).map(publicReportText).join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div className="border-t border-line pt-5">
          <span className="text-xs font-medium uppercase leading-[1.2] tracking-[0.18em] text-green">Found</span>
          <ul className="mt-3 grid gap-1 text-sm leading-[1.55] tracking-[-0.004em] text-body">
            {foundSignals.length > 0
              ? foundSignals.map((signal) => <li key={signal}>{signal}</li>)
              : <li>No confirmed signals in this step.</li>}
          </ul>
        </div>
        <div className="border-t border-line pt-5">
          <span className="text-xs font-medium uppercase leading-[1.2] tracking-[0.18em] text-green">Missing</span>
          <ul className="mt-3 grid gap-1 text-sm leading-[1.55] tracking-[-0.004em] text-body">
            {missingSignals.length > 0
              ? missingSignals.map((signal) => <li key={signal}>{signal}</li>)
              : <li>No major missing signal flagged.</li>}
          </ul>
        </div>
      </div>

      <p className="mt-7 text-sm leading-[1.55] tracking-[-0.004em] text-muted">{limitation}</p>
      <p className="mt-4 text-sm leading-[1.55] tracking-[-0.004em] text-body">
        <strong>What Atrium would fix:</strong> {publicReportText(diagnosticStepFix(step.id))}
      </p>
    </article>
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

function publicReportText(value: string): string {
  return value
    .replace(/\bGoogle listing\b/gi, "listing")
    .replace(/\bGoogle Places\b/gi, "public listing")
    .replace(/\bGoogle Maps\b/gi, "local map")
    .replace(/\bGoogle\b/gi, "public listing")
    .replace(/\bScrapeCreators\b/gi, "social scan")
    .replace(/\bPageSpeed Insights\b/gi, "speed audit")
    .replace(/\bPageSpeed\b/gi, "speed audit")
    .replace(/\bLighthouse\b/gi, "speed audit")
    .replace(/\bWebsite HTML fetch\b/gi, "website scan")
    .replace(/\bHTML response\b/gi, "website response")
    .replace(/\bpublic listing listing\b/gi, "listing")
}

function topScoreEntries(report: RestaurantGrowthReport) {
  return report.scoreInterpretation.slice(0, 5)
}

function statTone(
  status: RestaurantGrowthReport["scoreInterpretation"][number]["status"],
): "good" | "warn" | "bad" {
  if (status === "healthy") return "good"
  if (status === "watch") return "warn"
  return "bad"
}

function shortAddress(address: string): string {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean)
  const withoutCountry = parts.filter((part) => !(
    part.toLowerCase() === "usa" || part.toLowerCase() === "united states" || part.toLowerCase() === "us"
  ))

  if (withoutCountry.length >= 2) {
    const city = withoutCountry[withoutCountry.length - 2]
    const stateZip = withoutCountry[withoutCountry.length - 1]
    const stateMatch = stateZip?.match(/^[A-Za-z]{2}\b/)
    if (city && stateMatch) return `${city}, ${stateMatch[0].toUpperCase()}`
    if (city) return city
  }

  return withoutCountry[withoutCountry.length - 1] ?? address
}

function reportEvidenceHighlights(report: RestaurantGrowthReport): readonly string[] {
  const agentHighlights = report.executiveSummary.evidenceHighlights
  if (agentHighlights?.length) return agentHighlights.slice(0, 4)

  return [
    report.issues[0]?.message,
    report.nextBestAction,
    report.estimatedLostOpportunity,
  ].filter((item): item is string => Boolean(item))
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

function tagToneClass(tone: ScoreTone) {
  if (tone === "high") return "bg-[rgba(63,174,120,.18)] text-mint before:bg-green-fill"
  if (tone === "medium") return "bg-[rgba(243,193,80,.16)] text-amber before:bg-amber"
  return "bg-[rgba(224,138,91,.18)] text-red-tint before:bg-red-fill"
}

function scoreSignalCopy(tone: ScoreTone) {
  if (tone === "high") return "Strong base"
  if (tone === "medium") return "Watch zone"
  return "Leak alert"
}

function diagnosticStepTitle(id: DiagnosticStepResult["id"]) {
  const titles: Record<DiagnosticStepResult["id"], string> = {
    openData: "Business profile",
    website: "Website path",
    benchmark: "Market position",
    reputation: "Reputation",
    social: "Social presence",
    brief: "Action plan",
  }

  return titles[id]
}

function diagnosticStatusCopy(status: DiagnosticStepResult["status"]) {
  if (status === "complete") return "Complete"
  if (status === "partial") return "Partial"
  if (status === "skipped") return "Skipped"
  return "Failed"
}

function stepConfidenceCopy(confidence: DiagnosticStepResult["confidence"]) {
  if (confidence === "high") return "High confidence"
  if (confidence === "medium") return "Medium confidence"
  return "Low confidence"
}

function diagnosticStepLimitation(step: DiagnosticStepResult) {
  return step.assumptions[0] ?? step.errors[0] ?? "This step is directional and should be confirmed with connected first-party data."
}

function diagnosticStepFix(id: DiagnosticStepResult["id"]) {
  const fixes: Record<DiagnosticStepResult["id"], string> = {
    openData: "Clean up listing fields, category coverage, and public profile completeness.",
    website: "Repair the owned website path so guests can find menus, order, reserve, or call quickly.",
    benchmark: "Connect a real local benchmark before making visibility or ranking claims.",
    reputation: "Build review generation and response workflows around verified review data.",
    social: "Find or create the core social profiles and tie content cadence to offers and local demand.",
    brief: "Prioritize the first fix and sequence the next 30 days around the highest-risk leak.",
  }

  return fixes[id]
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
