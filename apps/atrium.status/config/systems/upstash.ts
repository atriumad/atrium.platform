import type { SystemDefinition } from "@/lib/health/types"

export const upstash: SystemDefinition = {
  id: "upstash",
  name: "Upstash Redis",
  category: "infrastructure",
  criticality: "high",
  owner: "Atrium",
  summary: "The durable store behind this dashboard — every check run, uptime figure and incident.",
  overview: `Serverless Redis over HTTP. It holds everything this app knows: the run history each
uptime percentage is recomputed from, the open and closed incidents, and the short lock that stops
ten simultaneous page views from firing ten sweeps.

It was the one load-bearing dependency in the estate with no monitor of its own, which is a strange
blind spot for a status board: the store going away does not turn anything red, it quietly turns the
history into fiction.`,
  sections: [
    {
      title: "What breaks without it",
      body: `\`lib/health/store.ts\` falls back to an in-memory store rather than failing. The app
keeps sweeping and the dashboard keeps rendering — but on serverless every invocation gets its own
memory, so nothing accumulates. Uptime and incidents become noise shaped like data.

That fallback is deliberate (a missing credential should not take the board down) and it is why the
dashboard shows a panel whenever the store is not durable. Read that panel as an outage of this
system even when every monitor here is green.`,
    },
    {
      title: "Why the checks look indirect",
      body: `Neither monitor here touches our database, and that is on purpose.

The REST API is probed **without credentials**. A 401 proves Upstash is answering; sending a real
token from a status page would put a live credential in an outbound request on every sweep for no
extra information.

The status feed is Upstash's own view of Upstash, which catches the case the liveness check cannot:
the API answering while the service behind it is degraded.`,
    },
  ],
  runbook: [
    {
      symptom: "The dashboard shows the in-memory panel",
      check: "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the Vercel project.",
      fix: "Set both and redeploy. History before that point is gone; it was never written.",
    },
    {
      symptom: "Liveness is down but the status feed says operational",
      check: "Whether the outage is ours — network egress from Vercel, or a wrong region.",
      fix: "Retry from another network before escalating to the vendor.",
    },
    {
      symptom: "Uptime numbers jump around",
      check: "Whether the store has been flipping between Upstash and memory across deploys.",
      fix: "Confirm the credentials are set for every environment, not just production.",
    },
  ],
  links: [
    { label: "Console", href: "https://console.upstash.com" },
    { label: "Status page", href: "https://status.upstash.com" },
  ],
  monitors: [
    {
      id: "upstash-liveness",
      label: "REST API reachable",
      meaning: "Check history, uptime and incidents stop being recorded.",
      url: "https://api.upstash.com/v2/redis/databases",
      // Unauthenticated on purpose: the refusal is the signal. A service that
      // rejects an anonymous caller is a service that is answering, and a real
      // outage shows up as a 5xx or a timeout instead.
      expectStatus: [401, 403],
      degradedAboveMs: 2500,
    },
    {
      id: "upstash-status-feed",
      label: "Vendor status",
      meaning: "Upstash is reporting a problem on their side before it reaches us.",
      // Statuspage serves this to anyone, free and unmetered. `indicator` is
      // "none" when all is well and "minor" / "major" / "critical" otherwise, so
      // requiring the healthy value turns their incident board into a monitor.
      url: "https://status.upstash.com/api/v2/status.json",
      expectStatus: [200],
      expectBodyIncludes: '"indicator":"none"',
      degradedAboveMs: 3000,
    },
  ],
  tags: ["storage", "redis", "load-bearing"],
}
