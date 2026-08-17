import type { SystemDefinition } from "@/lib/health/types"

const PROD = process.env.NEXT_PUBLIC_GRADER_URL ?? ""

export const atriumGrader: SystemDefinition = {
  id: "atrium-grader",
  name: "Restaurant Growth Grader",
  category: "app",
  criticality: "high",
  owner: "Atrium",
  workspace: "@atrium/grader",
  summary: "Lead-gen tool: scans a restaurant and returns a scored growth report.",
  overview: `A single page and six route handlers. A visitor searches for their restaurant, picks
it from Google Autocomplete, and the scan fans out across four providers in parallel. The output is
a scored report with an LLM-written narrative on top of it.

This is the only app in the estate that spends money per request — every scan costs Google Places
calls plus one LLM completion — which makes its budget guard as important as its uptime.`,
  sections: [
    {
      title: "What one scan actually does",
      body: `\`POST /api/grader\` orchestrates:

- **Business data** — Google Places v1: details, opening hours, categories.
- **Website** — PageSpeed Insights (Lighthouse) plus a direct fetch of the restaurant's HTML.
- **Benchmark** — Google \`searchNearby\` for comparable venues in the area.
- **Reputation** — the Places reputation summary (rating, review count).
- **Social** — ScrapeCreators, only when a profile is confidently detected. Skipped otherwise, and the report says so.
- **Narrative** — one LLM completion that turns the numbers into prose.

Every step reports its own confidence and is recorded in the scan evidence, so a partial scan is
still a usable report rather than a silent hole.`,
    },
    {
      title: "Outbound safety",
      body: `The website scanner fetches URLs a stranger typed, so \`lib/safe-fetch.ts\` sits in
front of it: http(s) only, private / loopback / link-local addresses rejected, response body size
capped, hard timeout. This is the one place in the estate where SSRF is a live risk, and it is
guarded deliberately.`,
    },
    {
      title: "Cost control — and why it is currently off",
      body: `\`lib/providers/business-provider.ts\` counts Google Places calls against a daily and a
monthly ceiling. Both ceilings come from env vars. Neither is set, so \`recordGooglePlacesUsage\`
returns before it counts anything and the guard is a no-op.

Even once set, the counters live in process memory: they reset on every cold start and do not hold
across serverless instances. Treat them as a speed bump, not a budget.`,
    },
    {
      title: "Rate limiting",
      body: `\`middleware.ts\` limits per IP with an in-memory counter, with the same caveat — one
instance, one counter. The file itself flags the fix: an Upstash-backed limiter before this runs
multi-region. The status app already has an Upstash connection it could share.`,
    },
    {
      title: "Choosing the narrative model",
      body: `\`GRADER_AI_PROVIDER\` selects the provider at request time: \`openrouter\` (default),
\`google\`, or \`anthropic\`. Each needs its own key. Selecting \`anthropic\` today throws at model
init because \`ANTHROPIC_API_KEY\` is not set anywhere — the narrative then returns null and the
report renders without prose instead of failing loudly.`,
    },
  ],
  runbook: [
    {
      symptom: "Scans return but every report is missing its narrative",
      check: "GRADER_AI_PROVIDER and the matching key in the deployment environment.",
      fix: "Set the provider's key, or switch GRADER_AI_PROVIDER back to openrouter.",
    },
    {
      symptom: "Scans fail at the business-data step",
      check: "The Google Places monitor, then the Google Cloud console for quota or billing.",
      fix: "Restore quota. There is no fallback provider — despite the name, lib/open-data-places.ts is Google only.",
    },
    {
      symptom: "Unexpected Google bill",
      check: "GRADER_GOOGLE_DAILY_LIMIT and GRADER_GOOGLE_MONTHLY_LIMIT — if unset, nothing was ever capped.",
      fix: "Set both, and move the counters to Upstash so they survive restarts.",
    },
    {
      symptom: "Social section always empty",
      check: "SCRAPECREATORS_API_KEY; the social route 503s without it.",
      fix: "Set the key. The report is designed to degrade here, so this fails quietly by design.",
    },
  ],
  dependsOn: ["google-places", "google-pagespeed", "scrapecreators", "llm-providers"],
  env: [
    {
      name: "GOOGLE_PLACES_API_KEY",
      where: "apps/atrium.grader/.env",
      purpose: "Auth for every Google Places call.",
      status: "set",
    },
    {
      name: "PAGESPEED_API_KEY",
      where: "apps/atrium.grader/.env",
      purpose: "Gates and authenticates the PageSpeed audit.",
      status: "set",
    },
    {
      name: "SCRAPECREATORS_API_KEY",
      where: "apps/atrium.grader/.env",
      purpose: "Auth for social scraping.",
      status: "set",
    },
    {
      name: "OPENROUTER_API_KEY",
      where: "apps/atrium.grader/.env",
      purpose: "Default narrative provider.",
      status: "set",
    },
    {
      name: "GOOGLE_GENERATIVE_AI_API_KEY",
      where: "apps/atrium.grader/.env",
      purpose: "Narrative provider when GRADER_AI_PROVIDER=google.",
      status: "set",
    },
    {
      name: "ANTHROPIC_API_KEY",
      where: "read at lib/report-agent.ts:156",
      purpose: "Narrative provider when GRADER_AI_PROVIDER=anthropic.",
      status: "missing",
      note: "In neither .env nor .env.example. Selecting anthropic throws at model init and the narrative silently returns null.",
    },
    {
      name: "GRADER_GOOGLE_DAILY_LIMIT",
      where: "apps/atrium.grader/.env.example",
      purpose: "Per-day cap on Google Places calls.",
      status: "missing",
      note: "Unset, so the spend guard never counts. Both limits must be set for it to engage.",
    },
    {
      name: "GRADER_GOOGLE_MONTHLY_LIMIT",
      where: "apps/atrium.grader/.env.example",
      purpose: "Per-month cap on Google Places calls.",
      status: "missing",
    },
    {
      name: "GRADER_BUSINESS_PROVIDER",
      where: "apps/atrium.grader/.env",
      purpose: "Intended osm|google|auto switch.",
      status: "dead",
      note: "No code reads it. Setting it changes nothing.",
    },
    {
      name: "WEBSITE_AUDIT_PROVIDER",
      where: "apps/atrium.grader/.env",
      purpose: "Intended basic|pagespeed switch.",
      status: "dead",
      note: "No code reads it.",
    },
  ],
  entryPoints: [
    { label: "Scan orchestration", path: "apps/atrium.grader/app/api/grader/route.ts" },
    { label: "Google Places client", path: "apps/atrium.grader/lib/google-places-client.ts" },
    { label: "Narrative model selection", path: "apps/atrium.grader/lib/report-agent.ts" },
    { label: "SSRF guard", path: "apps/atrium.grader/lib/safe-fetch.ts" },
    { label: "Spend guard", path: "apps/atrium.grader/lib/providers/business-provider.ts" },
  ],
  monitors: PROD
    ? [
        {
          id: "grader-home",
          label: "Grader page",
          meaning: "The lead-gen funnel is closed.",
          url: PROD,
          expectStatus: [200],
          degradedAboveMs: 2000,
        },
        {
          id: "grader-search",
          label: "Search endpoint",
          meaning: "Visitors cannot find their restaurant, so no scan can start.",
          url: `${PROD}/api/grader/search`,
          method: "GET",
          // GET on a POST-only handler is the cheap liveness signal: 405 proves
          // the route is deployed without spending a Google call.
          expectStatus: [405, 400],
          degradedAboveMs: 2000,
        },
      ]
    : [
        {
          id: "grader-home",
          label: "Grader page",
          meaning: "The lead-gen funnel is closed.",
          url: "https://example.invalid",
          enabled: false,
          disabledReason:
            "Set NEXT_PUBLIC_GRADER_URL to the deployed grader URL to turn this monitor on.",
        },
      ],
  tags: ["next", "lead-gen", "paid-apis"],
}
