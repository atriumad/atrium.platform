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
      id: "scrapecreators-api",
      label: "ScrapeCreators API",
      meaning: "Grader reports lose their social section — reports still complete.",
      url: "https://api.scrapecreators.com",
      enabled: false,
      disabledReason: "Requests consume paid credits. Balance is watched in the vendor dashboard.",
    },
  ],
  tags: ["social", "grader", "optional"],
}
