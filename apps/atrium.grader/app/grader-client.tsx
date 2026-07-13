"use client"

import type { DiagnosticStepResult, RestaurantGrowthReport } from "@atrium/application"
import { Button } from "@atrium/ui"
import { gsap } from "gsap"
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

const loadingScenes = [
  {
    kind: "informative",
    id: "studio",
    image: "/slide-1.png",
    imageTone: "photo",
    badges: ["growth", "studio"],
    cards: [
      { label: "creative", body: "Social content that converts followers into regulars." },
      { label: "market", body: "Local SEO that puts you on the map before they're hungry." },
      { label: "signal", body: "Data signals that show you exactly where to grow next." },
    ],
  },
  {
    kind: "informative",
    id: "forest",
    image: "/slide-2.png",
    imageTone: "photo",
    badges: ["local", "social"],
    cards: [
      { label: "content", body: "Reels, posts & stories—published for you, every week." },
      { label: "growth", body: "Turn local intent searches into real walk-in customers." },
      { label: "proof", body: "Reviews that build trust before the first visit." },
    ],
  },
  {
    kind: "informative",
    id: "mark",
    image: "/slide-3.png",
    imageTone: "photo",
    badges: ["brand", "audit"],
    cards: [
      { label: "identity", body: "A visual brand that stands out on every platform." },
      { label: "system", body: "Consistent look from storefront to scroll to DM." },
      { label: "handoff", body: "Ready-to-run creative assets delivered in 2 weeks." },
    ],
  },
  {
    kind: "client",
    id: "taha",
    image: "/slide-4.png",
    imageTone: "photo",
    client: "T'ähä Mexican Kitchen",
    summary: "Improved local awareness for T'ähä Mexican Kitchen with social content and search visibility.",
    badges: ["client reference", "local growth"],
    stats: [
      { value: "5.24M+", label: "impressions (+544%)" },
      { value: "30%", label: "email open rate" },
    ],
  },
  {
    kind: "client",
    id: "doncucy",
    image: "/slide-5.png",
    imageTone: "photo",
    client: "Don Chuy's",
    summary: "Improved social demand for Don Chuy's with stronger creative rhythm and audience signals.",
    badges: ["client reference", "social growth"],
    stats: [
      { value: "+839%", label: "total impressions" },
      { value: "+302%", label: "instagram growth" },
    ],
  },
] as const

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

const loadingSceneDurationMs = 7000
const loadingSceneExitDurationMs = 760

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
          <LoadingStage />
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

function SignalStrip() {
  const signals = [
    { label: "Findability", value: "Can guests find you?" },
    { label: "Action path", value: "Can they order or book?" },
    { label: "Demand proof", value: "Do you look active?" },
  ]

  return (
    <div className="mt-6 grid w-full max-w-[760px] grid-cols-1 gap-2 sm:grid-cols-3">
      {signals.map((signal, index) => (
        <div
          className="group/signal relative overflow-hidden rounded-[14px] border border-[#cfdcdd] bg-white/76 px-4 py-3 shadow-[0_1px_2px_rgb(7_47_52_/_5%),0_8px_24px_rgb(7_47_52_/_6%)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#6fa39f] hover:shadow-[0_12px_40px_rgb(7_47_52_/_14%)]"
          key={signal.label}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <span className="absolute right-3 top-3 size-2 rounded-full bg-[#8fe6c2] shadow-[0_0_0_5px_rgb(143_230_194_/_18%)] transition-transform duration-200 ease-out group-hover/signal:scale-125" />
          <p className="pr-5 text-[0.68rem] font-bold uppercase leading-none tracking-[0.18em] text-[#2c6168]">
            {signal.label}
          </p>
          <strong className="mt-2 block text-sm font-semibold leading-tight text-[#072f34]">
            {signal.value}
          </strong>
        </div>
      ))}
    </div>
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
        <SignalStrip />
      </div>

      <form className={`search-form group ${selectedPlace ? "search-form--ready" : ""}`} onSubmit={handleSubmit}>
        <input
          aria-label="Restaurant"
          aria-autocomplete="list"
          aria-controls="restaurant-suggestions"
          aria-expanded={!compact && suggestions.length > 0}
          aria-haspopup="listbox"
          autoComplete="off"
          className="search-input transition-[border-color,box-shadow,transform] duration-200 ease-out focus-visible:scale-[1.01]"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Restaurant name and city"
          role="combobox"
          type="text"
          value={query}
        />
        {selectedPlace && (
          <button
            className="search-button transition-[transform,box-shadow,filter] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:hover:translate-y-0 disabled:active:scale-100"
            disabled={loading || searching}
            type="submit"
          >
            Scan
          </button>
        )}
      </form>

      {!compact && suggestions.length > 0 && (
        <div className="suggestion-list" id="restaurant-suggestions" role="listbox">
          {suggestions.map((suggestion) => (
            <button
              className="suggestion-item transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7a823]"
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
        <p className="inline-message inline-message--neutral">Searching restaurants...</p>
      )}

      {!compact && searchError && <p className="inline-message inline-message--error">{searchError}</p>}

      {selectedPlace && !compact && (
        <div className="selected-inline">
          <div className={`selected-media ${selectedPlace.photoUrl ? "selected-media--photo" : "selected-media--fallback"}`}>
            {selectedPlace.photoUrl ? (
              /* biome-ignore lint/performance/noImgElement: Google Place photos are dynamic proxied media and must bypass Next image optimization. */
              <img alt={`${selectedPlace.name} restaurant`} src={selectedPlace.photoUrl} />
            ) : (
              <span>Loaded restaurant</span>
            )}
          </div>
          <div className="selected-place-copy">
            <strong>{selectedPlace.name}</strong>
            {selectedSummary && <small>{selectedSummary}</small>}
            <span className="mt-2 inline-flex w-fit items-center rounded-full border border-[#6fa39f]/40 bg-[#e4faf1] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#072f34]">
              Restaurant match
            </span>
          </div>
        </div>
      )}

      {!compact && error && <p className="inline-message inline-message--error">{error}</p>}
    </div>
  )
}

function LoadingStage() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const collageRef = useRef<HTMLDivElement | null>(null)
  const scene = loadingScenes[sceneIndex] ?? loadingScenes[0]
  const step = scanSteps[stepIndex] ?? scanSteps[0]

  useEffect(() => {
    const root = collageRef.current
    if (!root) return

    root.dataset.loadingScene = scene.id

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      const timeout = window.setTimeout(() => {
        setSceneIndex((current) => (current + 1) % loadingScenes.length)
      }, loadingSceneDurationMs)
      return () => window.clearTimeout(timeout)
    }

    const context = gsap.context(() => {
      const photo = root.querySelector<HTMLElement>(".loading-collage-photo")
      const photoTargets = photo ? [photo] : []
      const pieces = gsap.utils.toArray<HTMLElement>(".loading-card, .loading-badge", root)
      const floatTargets = [...photoTargets, ...pieces]
      const floatDuration = Math.max(1.8, (loadingSceneDurationMs - loadingSceneExitDurationMs - 1900) / 2000)

      gsap.set(root, { autoAlpha: 0, filter: "blur(10px)", scale: 0.988, y: 16 })
      gsap.set(photoTargets, { autoAlpha: 0, filter: "blur(14px)", rotation: 1.5, scale: 0.965, y: 22 })
      gsap.set(pieces, { autoAlpha: 0, filter: "blur(8px)", scale: 0.94, y: 24 })

      const timeline = gsap.timeline({ defaults: { overwrite: "auto" } })
      timeline
        .to(root, { autoAlpha: 1, duration: 0.72, ease: "power4.out", filter: "blur(0px)", scale: 1, y: 0 })
        .to(photoTargets, { autoAlpha: 1, duration: 0.86, ease: "power4.out", filter: "blur(0px)", rotation: -2, scale: 1, y: 0 }, "<0.08")
        .to(pieces, {
          autoAlpha: 1,
          duration: 0.78,
          ease: "power4.out",
          filter: "blur(0px)",
          scale: 1,
          stagger: { each: 0.075, from: "edges" },
          y: 0,
        }, "<0.16")
        .to(floatTargets, {
          duration: floatDuration,
          ease: "sine.inOut",
          stagger: { amount: 0.28, from: "center" },
          y: (index) => (photo && index === 0 ? -8 : -6),
        }, ">0.18")
        .to(floatTargets, {
          duration: floatDuration,
          ease: "sine.inOut",
          stagger: { amount: 0.28, from: "center" },
          y: 0,
        })
        .to(pieces, {
          autoAlpha: 0,
          duration: loadingSceneExitDurationMs / 1000,
          ease: "power2.in",
          filter: "blur(8px)",
          scale: 0.97,
          stagger: { each: 0.035, from: "end" },
          y: -14,
        })
        .to(photoTargets, { autoAlpha: 0, duration: 0.64, ease: "power2.in", filter: "blur(10px)", rotation: -3, scale: 0.985, y: -16 }, "<")
        .to(root, { autoAlpha: 0, duration: 0.64, ease: "power2.in", filter: "blur(9px)", scale: 0.992, y: -10 }, "<")
        .add(() => {
          setSceneIndex((current) => (current + 1) % loadingScenes.length)
        })
    }, root)

    return () => context.revert()
  }, [scene.id])

  // Cycle sub-steps within each main step
  // Brief (last step) uses longer interval so it doesn't loop visibly
  useEffect(() => {
    const details = scanSteps[stepIndex]?.details
    if (!details) return
    const isBrief = stepIndex === scanSteps.length - 1
    const interval = isBrief ? 2600 : 1700
    let current = 0
    let cancelled = false
    const cycle = async () => {
      while (!cancelled) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, interval))
        if (cancelled) break
        current = (current + 1) % details.length
        setSubIndex(current)
      }
    }
    void cycle()
    return () => { cancelled = true }
  }, [stepIndex])

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
          setSubIndex(0)
          setStepIndex(current)
        } else {
          break
        }
      }
    }

    void advance()
    return () => { cancelled = true }
  }, [])

  return (
    <section
      aria-label={`Atrium report loading: ${step.status}`}
      aria-live="polite"
      className="scan-loading-stage loading-collage-stage"
      role="status"
    >
      <div className="loading-collage" key={scene.id} ref={collageRef}>
        <div className={`loading-collage-media loading-collage-media--${scene.kind}`}>
          <div className={`loading-collage-photo loading-collage-photo--${scene.imageTone}`}>
            {/* biome-ignore lint/performance/noImgElement: Loading-state art is a rotating design-system asset and does not need Next image optimization. */}
            <img alt="" src={scene.image} />
          </div>

          {scene.kind === "informative" ? (
            <>
              <div className="loading-card loading-card--text loading-card--a">
                <span>{scene.cards[0]?.label}</span>
                <p>{scene.cards[0]?.body}</p>
              </div>

              <div className="loading-card loading-card--text loading-card--c">
                <span>{scene.cards[1]?.label}</span>
                <p>{scene.cards[1]?.body}</p>
              </div>

              <div className="loading-card loading-card--text loading-card--e">
                <span>{scene.cards[2]?.label}</span>
                <p>{scene.cards[2]?.body}</p>
              </div>
            </>
          ) : (
            <>
              <div className="loading-card loading-card--text loading-card--client loading-card--a">
                <span>{scene.client}</span>
                <p>{scene.summary}</p>
              </div>

              <div className="loading-card loading-card--metric loading-card--b">
                <span>{scene.stats[0]?.label}</span>
                <strong>{scene.stats[0]?.value}</strong>
              </div>

              <div className="loading-card loading-card--metric loading-card--d">
                <span>{scene.stats[1]?.label}</span>
                <strong>{scene.stats[1]?.value}</strong>
              </div>
            </>
          )}

          <span className="loading-badge loading-badge--a">{scene.badges[0]}</span>
          <span className="loading-badge loading-badge--b">{scene.badges[1]}</span>
        </div>
      </div>

      <div className="loading-progress" aria-hidden="true">
        {scanSteps.map((s, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending"
          return (
            <div key={s.id} className={`loading-step loading-step--${state}`}>
              <div className="loading-step-dot">
                {i < stepIndex && <span aria-hidden="true" className="loading-step-check" />}
              </div>
              <span className="loading-step-label">{s.label}</span>
            </div>
          )
        })}
      </div>

      <p className="loading-step-sub" key={`${stepIndex}-${subIndex}`}>
        {scanSteps[stepIndex]?.details[subIndex]}
      </p>
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
  const scoreWidth = `${Math.max(0, Math.min(100, report.overallScore))}%`
  const missingDataWarning = missingCriticalData.length > 0
    ? `Missing data can change the read: ${missingCriticalData.slice(0, 3).join(", ")}.`
    : null
  const displayHeadline = publicReportText(report.executiveSummary.headline)
  const displaySummary = publicReportText(report.executiveSummary.summary)
  const displayPrimaryLeak = publicReportText(primaryLeak)
  const displayRootCause = publicReportText(rootCause)
  const displayWhyItMatters = publicReportText(whyItMatters)
  const displayFirstMove = publicReportText(firstMove)

  return (
    <section className="diagnostic-stage diagnostic-stage--ready gap-4 md:gap-5">
      <article className="w-full overflow-hidden rounded-[18px] border border-[rgb(7_47_52_/_12%)] bg-white/[0.94] shadow-[0_18px_60px_rgb(7_47_52_/_10%)]">
        <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="flex flex-col justify-between gap-6 border-b border-[rgb(7_47_52_/_10%)] bg-[var(--surface-dark)] p-5 text-white lg:border-b-0 lg:border-r lg:p-6">
            <div>
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--mint-400)]">
                <span aria-label="Atrium" className="diagnostic-brand-wordmark" role="img" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase text-[var(--mint-300)]">Growth score</p>
              <strong className="mt-2 block font-[var(--font-display)] text-[5rem] font-bold leading-none tabular-nums">
                {report.overallScore}
              </strong>
              <small className="mt-2 block text-sm font-semibold text-[var(--mint-300)]">{scoreSignal}</small>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.14]" aria-hidden="true">
                <span className={`block h-full rounded-full ${scoreBarClass(tone)}`} style={{ width: scoreWidth }} />
              </div>
            </div>
            <div className="grid gap-2 text-xs font-semibold text-[var(--cloud-300)]">
              <span>{confidenceCopy(report.confidence)}</span>
              <span>Free directional diagnostic</span>
            </div>
          </aside>

          <div className="p-5 md:p-7">
            <header className="border-b border-[rgb(7_47_52_/_10%)] pb-6">
              <p className="text-sm font-semibold text-[var(--teal-500)]">{publicReportText(report.business.address)}</p>
              <h1 className="mt-2 text-balance font-[var(--font-display)] text-4xl font-bold leading-[1.02] text-[var(--text-strong)] md:text-6xl">
                {publicReportText(report.business.name)}
              </h1>
              <h2 className="mt-5 max-w-[760px] text-balance font-[var(--font-serif)] text-3xl italic leading-[1.08] text-[var(--teal-700)] md:text-5xl">
                {displayHeadline}
              </h2>
              <p className="mt-4 max-w-[720px] text-base leading-7 text-[var(--text-body)] md:text-lg">
                {displaySummary}
              </p>
            </header>

            <section className="grid gap-5 border-b border-[rgb(7_47_52_/_10%)] py-6 lg:grid-cols-[minmax(0,1fr)_310px]">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--teal-500)]">Primary leak</p>
                <h3 className="mt-3 text-balance font-[var(--font-display)] text-3xl font-bold leading-[1.06] text-[var(--text-strong)] md:text-4xl">
                  {displayPrimaryLeak}
                </h3>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--teal-500)]">Root cause</span>
                    <p className="mt-2 text-base leading-7 text-[var(--text-body)]">{displayRootCause}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--teal-500)]">Why it matters</span>
                    <p className="mt-2 text-base leading-7 text-[var(--text-body)]">{displayWhyItMatters}</p>
                  </div>
                </div>
              </div>

              <aside className="rounded-[14px] border border-[rgb(247_168_35_/_34%)] bg-[var(--amber-200)] p-5 text-[var(--text-on-amber)]">
                <p className="text-xs font-bold uppercase text-[var(--teal-700)]">First move</p>
                <h3 className="mt-3 text-balance font-[var(--font-display)] text-2xl font-bold leading-[1.08]">
                  {displayFirstMove}
                </h3>
                <a
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgb(7_47_52_/_18%)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none"
                  href={contactHref}
                  rel={opensNewTab ? "noreferrer" : undefined}
                  target={opensNewTab ? "_blank" : undefined}
                >
                  Review the full plan
                </a>
              </aside>
            </section>

            <section className="grid gap-5 border-b border-[rgb(7_47_52_/_10%)] py-6 lg:grid-cols-[minmax(220px,0.45fr)_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--teal-500)]">30-day plan</p>
                <h3 className="mt-3 text-balance font-[var(--font-display)] text-2xl font-bold leading-[1.08] text-[var(--text-strong)]">
                  Fix the closest leak first.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{publicReportText(report.estimatedLostOpportunity)}</p>
              </div>

              <ol className="grid gap-2">
                {thirtyDayPlan.map((step, index) => (
                  <li className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-t border-[rgb(7_47_52_/_10%)] py-3 first:border-t-0 first:pt-0" key={step}>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[var(--mint-300)] text-sm font-bold text-[var(--teal-800)]">
                      {index + 1}
                    </span>
                    <p className="self-center text-base font-semibold leading-6 text-[var(--text-strong)]">{publicReportText(step)}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid gap-2 py-6 sm:grid-cols-2 lg:grid-cols-5">
              {scoreEntries.map((insight) => (
                <article className="rounded-[12px] bg-[var(--cloud-200)] p-3" key={insight.category}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-[var(--text-strong)]">{insight.label}</span>
                    <strong className="text-2xl font-bold leading-none text-[var(--teal-800)]">{insight.score}</strong>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{publicReportText(insight.businessImpact)}</p>
                </article>
              ))}
            </section>

            <details className="group border-t border-[rgb(7_47_52_/_10%)] pt-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-[var(--font-display)] text-xl font-bold text-[var(--text-strong)]">Supporting evidence</span>
                <span className="flex size-9 items-center justify-center rounded-full border border-[rgb(7_47_52_/_14%)] text-xl font-semibold text-[var(--teal-800)] transition-transform duration-150 ease-out group-open:rotate-45 motion-reduce:transition-none">
                  +
                </span>
              </summary>

              <div className="mt-5 grid gap-5">
                <div className="grid gap-3 md:grid-cols-3">
                  {evidenceHighlights.map((highlight) => (
                    <div className="rounded-[12px] bg-[var(--mint-200)] p-4" key={highlight}>
                      <span className="text-xs font-bold uppercase text-[var(--teal-500)]">Signal</span>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-strong)]">{publicReportText(highlight)}</p>
                    </div>
                  ))}
                  {missingDataWarning ? (
                    <div className="rounded-[12px] bg-[var(--amber-200)] p-4">
                      <span className="text-xs font-bold uppercase text-[var(--teal-700)]">Limitation</span>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-strong)]">{publicReportText(missingDataWarning)}</p>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {report.diagnosticSteps.map((step) => (
                    <DiagnosticEvidenceCard key={step.id} step={step} />
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </article>

      <div className="flex w-full flex-col gap-2 rounded-[12px] bg-white/60 p-4 text-sm leading-6 text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
        <span>Directional free scan. Confirm with first-party business data before major spend.</span>
        {missingCriticalData.length ? <span>Missing: {missingCriticalData.slice(0, 2).map(publicReportText).join(", ")}</span> : null}
      </div>

      <div className="result-actions">
        <Button variant="outline" onClick={onReset} type="button">
          Scan another restaurant
        </Button>
      </div>
    </section>
  )
}

function DiagnosticEvidenceCard({ step }: { step: DiagnosticStepResult }) {
  const foundSignals = Array.from(new Set(step.found)).slice(0, 4).map(publicReportText)
  const missingSignals = Array.from(new Set(step.missing)).slice(0, 4).map(publicReportText)
  const limitation = publicReportText(diagnosticStepLimitation(step))

  return (
    <article className="rounded-[14px] border border-[rgb(7_47_52_/_10%)] bg-white/[0.82] p-4 shadow-[0_1px_2px_rgb(7_47_52_/_4%)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--teal-500)]">{diagnosticStepTitle(step.id)}</p>
          <strong className="mt-1 block text-base font-bold text-[var(--text-strong)]">{diagnosticStatusCopy(step.status)}</strong>
        </div>
        <span className="rounded-full border border-[rgb(7_47_52_/_12%)] px-3 py-1 text-xs font-bold text-[var(--teal-700)]">
          {stepConfidenceCopy(step.confidence)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase text-[var(--teal-500)]">Signal group</dt>
          <dd className="mt-1 text-sm leading-6 text-[var(--text-body)]">{diagnosticStepTitle(step.id)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase text-[var(--teal-500)]">Checked</dt>
          <dd className="mt-1 text-sm leading-6 text-[var(--text-body)]">{step.checked.slice(0, 3).map(publicReportText).join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[12px] bg-[var(--mint-200)] p-3">
          <span className="text-xs font-bold uppercase text-[var(--teal-500)]">Found</span>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-[var(--text-body)]">
            {foundSignals.length > 0
              ? foundSignals.map((signal) => <li key={signal}>{signal}</li>)
              : <li>No confirmed signals in this step.</li>}
          </ul>
        </div>
        <div className="rounded-[12px] bg-[var(--cloud-200)] p-3">
          <span className="text-xs font-bold uppercase text-[var(--teal-500)]">Missing</span>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-[var(--text-body)]">
            {missingSignals.length > 0
              ? missingSignals.map((signal) => <li key={signal}>{signal}</li>)
              : <li>No major missing signal flagged.</li>}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{limitation}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
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

function scoreSignalCopy(tone: ScoreTone) {
  if (tone === "high") return "Strong base"
  if (tone === "medium") return "Watch zone"
  return "Leak alert"
}

function scoreBarClass(tone: ScoreTone) {
  if (tone === "high") return "bg-[var(--mint-500)]"
  if (tone === "medium") return "bg-[var(--amber-400)]"
  return "bg-[var(--amber-600)]"
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
