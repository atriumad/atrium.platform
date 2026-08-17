import type { SystemDefinition } from "@/lib/health/types"

export const googlePlaces: SystemDefinition = {
  id: "google-places",
  name: "Google Places API v1",
  category: "third-party",
  criticality: "high",
  summary: "Every piece of business data in a grader scan — and the only paid call per scan.",
  overview: `Autocomplete, place details, nearby benchmark, reputation summary and photo media all
come from Places v1. \`lib/open-data-places.ts\` reads like a provider-neutral layer but delegates
100% to Google; there is no second source. If Places is unavailable or out of quota, a scan cannot
produce a report.`,
  sections: [
    {
      title: "Cost shape",
      body: `Each scan makes several billable calls: one autocomplete session, one details lookup,
one nearby search, and one photo resolution per image shown. Field masks are kept minimal in
\`lib/google-places-client.ts\` specifically to hold the per-call cost down — widening a mask is a
pricing decision, not a refactor.`,
    },
    {
      title: "Why it is not monitored automatically",
      body: `Any request that would prove the API is healthy is a billable request. Rather than pay
for a heartbeat every ten minutes, this system is documented and left unmonitored — the grader's own
scan failures are the real signal, and quota lives in the Google Cloud console.`,
    },
  ],
  runbook: [
    {
      symptom: "Scans fail at the business-data step",
      check: "Google Cloud console → APIs & Services → Places API quota and billing status.",
      fix: "Raise quota or fix billing. There is no fallback provider to switch to.",
    },
    {
      symptom: "Costs climbing unexpectedly",
      check: "Whether GRADER_GOOGLE_DAILY_LIMIT / MONTHLY_LIMIT are set — unset means uncapped.",
      fix: "Set both and consider moving the counters to Upstash so they survive cold starts.",
    },
  ],
  links: [{ label: "Google Cloud console", href: "https://console.cloud.google.com/apis" }],
  monitors: [
    {
      id: "google-places-api",
      label: "Places API",
      meaning: "No grader scan can produce business data.",
      url: "https://places.googleapis.com/v1/places:searchText",
      enabled: false,
      disabledReason:
        "Every request that would prove health is billable. Watch quota in the Google Cloud console instead.",
    },
  ],
  tags: ["google", "paid", "grader"],
}
