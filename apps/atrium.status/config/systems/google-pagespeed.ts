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
      id: "pagespeed-liveness",
      label: "PageSpeed API reachable",
      meaning: "Google is not answering at all — grader reports lose their Lighthouse scores.",
      url: "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed",
      // Unauthenticated on purpose. The rejection *is* the signal: an endpoint
      // that refuses an anonymous caller is an endpoint that is answering. A
      // real outage looks like a 5xx or a timeout, neither of which is in the
      // expected list. Costs nothing and consumes no quota, which is what lets
      // this run every sweep against an API that bills per call.
      //
      // 429 is what an anonymous caller gets here: the shared unauthenticated
      // quota is already spent, which still proves the service is serving. 400
      // and 403 are accepted too, since which refusal Google picks is not
      // something to depend on.
      expectStatus: [429, 400, 403, 401],
      degradedAboveMs: 3000,
    },
    {
      id: "pagespeed-api",
      label: "PageSpeed audit run",
      meaning: "Grader reports lose their Lighthouse scores.",
      url: "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed",
      enabled: false,
      disabledReason:
        "A real probe costs a full Lighthouse run and counts against quota, so it stays off. The liveness check above covers the outage case for free; quota is watched in the Google Cloud console.",
    },
  ],
  tags: ["google", "grader", "performance"],
}
