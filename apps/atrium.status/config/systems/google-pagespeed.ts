import type { SystemDefinition } from "@/lib/health/types"

export const googlePagespeed: SystemDefinition = {
  id: "google-pagespeed",
  name: "PageSpeed Insights",
  category: "third-party",
  criticality: "normal",
  summary: "Lighthouse scores for the website half of a grader scan.",
  overview: `The grader runs a restaurant's site through PageSpeed Insights and pairs the result
with its own HTML fetch. The provider version string a scan reports —
\`pagespeed-v1+website-html-v1\` — records both halves.

PageSpeed is slow by nature: a cold Lighthouse run can take 20-30 seconds. The grader wraps it in a
timeout and reports the website step as degraded rather than failing the whole scan when it does not
come back in time.`,
  sections: [
    {
      title: "Failure mode",
      body: `Quota exhaustion returns a 429 and the website step downgrades its confidence; the scan
still completes with the direct HTML fetch alone. A user sees a report with a thinner performance
section, not an error — another quiet degradation worth watching from here.`,
    },
  ],
  runbook: [
    {
      symptom: "Website section of reports is consistently thin",
      check: "PAGESPEED_API_KEY presence and the API's quota in the Google Cloud console.",
      fix: "Set or rotate the key. Without a key the audit is skipped entirely rather than run anonymously.",
    },
  ],
  monitors: [
    {
      id: "pagespeed-api",
      label: "PageSpeed API",
      meaning: "Grader reports lose their Lighthouse scores.",
      url: "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed",
      enabled: false,
      disabledReason:
        "A real probe costs a full Lighthouse run and counts against quota. Quota is watched in the Google Cloud console.",
    },
  ],
  tags: ["google", "grader", "performance"],
}
