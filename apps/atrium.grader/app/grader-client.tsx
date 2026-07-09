"use client"

import type { RestaurantGrowthReport } from "@atrium/application"
import { Button } from "@atrium/ui"
import { gsap } from "gsap"
import type { CSSProperties, FormEvent, SVGProps } from "react"
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
    id: "locate", label: "Business", status: "Locating your business on Google Maps",
    details: [
      "Locating your business on Google Maps",
      "Verifying listing status & ownership",
      "Checking name, address & phone (NAP)",
      "Matching category & attributes",
    ],
  },
  {
    id: "google", label: "Google", status: "Pulling visibility, ratings & reviews",
    details: [
      "Reading star rating & review count",
      "Measuring review velocity & recency",
      "Checking local search visibility",
      "Analyzing competitor positioning",
    ],
  },
  {
    id: "web", label: "Web", status: "Scanning website and local citations",
    details: [
      "Testing page load speed",
      "Scanning on-page SEO signals",
      "Auditing local citation consistency",
      "Checking mobile & Core Web Vitals",
    ],
  },
  {
    id: "social", label: "Social", status: "Checking Instagram, Facebook & TikTok",
    details: [
      "Finding Instagram profile & followers",
      "Checking Facebook page & engagement",
      "Scanning TikTok presence & reach",
      "Measuring post frequency & consistency",
    ],
  },
  {
    id: "brief", label: "Brief", status: "Building your personalized growth brief",
    details: [
      "Calculating overall growth score",
      "Benchmarking against category average",
      "Identifying highest-impact opportunities",
      "Drafting personalized recommendations",
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

      // Steps 2+3 run in parallel — keep loading until all resolve
      let finalReport = body.report

      if (body.meta) {
        const { profile, googleMeta } = body.meta

        const [socialResult, narrativeResult] = await Promise.all([
          fetch("/api/grader/social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ websiteUrl: profile.websiteUrl, name: profile.name, address: profile.address }),
          })
            .then((r) => r.json() as Promise<SocialResponse>)
            .catch(() => ({ socialHealth: undefined }) as SocialResponse),

          fetch("/api/grader/narrative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile,
              googleMeta,
              scores: finalReport.scores,
              overallScore: finalReport.overallScore,
              issues: finalReport.issues,
              recommendations: finalReport.recommendations,
            }),
          })
            .then((r) => r.json() as Promise<NarrativeResponse>)
            .catch(() => ({ narrative: null }) as NarrativeResponse),
        ])

        if (socialResult.socialHealth) {
          finalReport = mergeSocialIntoReport(finalReport, socialResult.socialHealth)
        }
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
              /* biome-ignore lint/performance/noImgElement: Google Place photos are dynamic proxied media and must bypass Next image optimization. */
              <img alt={`${selectedPlace.name} restaurant`} src={selectedPlace.photoUrl} />
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
    const durations = [5200, 5400, 5400, 5600, 6000]
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
  const nextPlanItems = planItems.slice(1, 4)
  const missingCriticalData = report.dataQuality?.missingCriticalData ?? []
  const contactHref = buildAgencyContactHref(report)
  const opensNewTab = !contactHref.startsWith("mailto:")
  const scoreSignal = scoreSignalCopy(tone)

  return (
    <section className="diagnostic-stage diagnostic-stage--ready">
      <article className={`diagnostic-hero-panel diagnostic-hero-panel--${tone}`}>
        <div className="diagnostic-brand-row">
          <div className="diagnostic-brand-lockup">
            <span aria-label="Atrium" className="diagnostic-brand-wordmark" role="img" />
            <span>Growth Grader</span>
          </div>
          <div className="diagnostic-report-tags">
            <span>Restaurant Growth Diagnostic</span>
            <span>{confidenceCopy(report.confidence)}</span>
          </div>
        </div>

        <div className="diagnostic-hero-grid">
          <div className="diagnostic-score-block">
            <span>Growth score</span>
            <strong>{report.overallScore}</strong>
            <small>{scoreSignal}</small>
            <div aria-hidden="true" className="diagnostic-meter" style={{ "--diagnostic-progress": "100%" } as CSSProperties}>
              <span />
            </div>
          </div>

          <div className="diagnostic-summary-block">
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
                <div className="score-translation-metric">
                  <span>{insight.label}</span>
                  <strong>{insight.score}</strong>
                </div>
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
        <Button variant="outline" onClick={onReset} type="button">
          Scan another restaurant
        </Button>
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
