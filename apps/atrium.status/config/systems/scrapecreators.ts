import type { SystemDefinition } from "@/lib/health/types"

export const scrapecreators: SystemDefinition = {
  id: "scrapecreators",
  name: "ScrapeCreators",
  category: "third-party",
  criticality: "low",
  summary: "Public social profile data for the optional social step of a grader scan.",
  overview: `The only optional provider in a scan. \`app/api/grader/social/route.ts\` returns 503
without a key, and the scan records the social step as \`skipped\` with low confidence rather than
failing. Reports are explicitly designed to be valid without it — "Confirmed social profile data"
appears in \`missingCriticalData\` and the narrative works around it.`,
  sections: [
    {
      title: "Detection first, scrape second",
      body: `\`lib/social-name-search.ts\` tries to identify the right handle before anything is
scraped, so a wrong-profile match is rarer than a missing one. When detection is not confident, the
step is skipped — a wrong social profile in a sales report is worse than no social profile.`,
    },
  ],
  runbook: [
    {
      symptom: "Social section never appears",
      check: "SCRAPECREATORS_API_KEY, then the vendor dashboard for credit balance.",
      fix: "Top up or rotate the key. Nothing else in the estate depends on this vendor.",
    },
  ],
  monitors: [
    {
      id: "scrapecreators-liveness",
      label: "ScrapeCreators reachable",
      meaning: "The vendor is not answering — grader reports lose their social section.",
      url: "https://api.scrapecreators.com/v1/instagram/profile",
      // Unauthenticated on purpose. The rejection *is* the signal: an endpoint
      // that refuses an anonymous caller is an endpoint that is answering. A
      // real outage looks like a 5xx or a timeout, neither of which is in the
      // expected list. Costs nothing and consumes no quota, which is what lets
      // this run every sweep against an API that bills per call.
      //
      // A real endpoint rather than the bare host: the host answers even when
      // the API behind it does not, so probing `/` would go green through an
      // outage. Without a key this returns 401 and spends no credits.
      expectStatus: [401, 403],
      degradedAboveMs: 3000,
    },
    {
      id: "scrapecreators-api",
      label: "ScrapeCreators authenticated call",
      meaning: "Grader reports lose their social section — reports still complete.",
      url: "https://api.scrapecreators.com",
      enabled: false,
      disabledReason:
        "An authenticated request consumes paid credits, so it stays off. The liveness check above covers the outage case for free; credit balance is watched in the vendor dashboard.",
    },
  ],
  tags: ["social", "grader", "optional"],
}
