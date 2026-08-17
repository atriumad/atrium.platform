import type { SystemDefinition } from "@/lib/health/types"

export const atriumStatus: SystemDefinition = {
  id: "atrium-status",
  name: "Status app",
  category: "app",
  criticality: "normal",
  workspace: "@atrium/status",
  summary: "This app: the health of every agency system, plus the documentation for each one.",
  overview: `Two surfaces, deliberately kept apart. **Status** is live and autonomous: a cron hits
one endpoint, every monitor runs, results and incidents land in Upstash. **Systems** is the
documentation: what each thing is, how it works, what to do when it breaks.

Nothing here is hand-updated to stay current. The only file a human maintains is the system's own
definition, and adding a system is one file.`,
  sections: [
    {
      title: "Adding a system",
      body: `1. Copy \`config/systems/_template.ts\` to \`config/systems/<id>.ts\`.
2. Fill in the documentation and the monitors.
3. Add one line to \`config/systems/index.ts\`.

That is the whole procedure. The dashboard, the per-system page, the cron, the uptime maths and the
public JSON API all pick it up with no further changes. Monitor ids must be unique across all
systems — they are the storage keys — and the registry validates that at import time.`,
    },
    {
      title: "How checks actually run",
      body: `\`/api/cron/check\` runs every enabled monitor in parallel, classifies each result as
up / degraded / down, writes the run to Upstash, and opens or closes an incident when the status
flips. The request is rejected unless it carries \`CRON_SECRET\`.

A page view never probes directly. What it can do is notice the stored data has gone stale and
schedule a sweep *after* the response is sent — so looking at the board can refresh it, but never
slows it down, and the numbers on screen are always the ones that were measured.`,
    },
    {
      title: "Scheduling, and the Hobby-plan problem",
      body: `Vercel's Hobby plan allows exactly one cron a day, which is a report, not a health
check. Three layers cover it, in increasing order of reliability:

1. **Vercel Cron**, daily, from \`vercel.json\`. It is the floor, and it is what Hobby permits.
2. **Stale-triggered sweeps.** Opening the dashboard or calling \`GET /api/health\` refreshes the
   data in the background when the last sweep is older than \`SWEEP_STALE_AFTER_MINUTES\`
   (10 by default). A short lock in Upstash means ten people opening the page cause one sweep
   between them, not ten.
3. **A GitHub Actions heartbeat** at \`.github/workflows/status-sweep.yml\`, every 10 minutes,
   calling the same endpoint with the same secret. The repository is public, so those minutes are
   free. It needs two repository secrets: \`STATUS_URL\` and \`CRON_SECRET\`.

Layer 2 alone keeps the board honest for anyone looking at it. Layer 3 is what catches an outage
while nobody is looking, which is the only reason a status page exists. On a Pro plan, set the real
schedule in \`vercel.json\` and delete the workflow.`,
    },
    {
      title: "Storage",
      body: `Upstash Redis over its REST API, which works from any runtime:

- \`atrium:monitor:{id}:last\` — the most recent run
- \`atrium:monitor:{id}:runs\` — a capped list used for uptime and the sparklines
- \`atrium:incident:{monitorId}\` — the currently open incident, when there is one
- \`atrium:incidents:log\` — closed incidents, newest first

Without Upstash credentials the app falls back to an in-memory store so local development works
unconfigured. That store is per-process and disappears on restart, which is fine locally and useless
in production — the deployment must have the credentials.`,
    },
    {
      title: "What is local-only",
      body: `The repo view runs \`turbo\` to typecheck, lint, test and build workspaces on demand.
That cannot work on Vercel — there is no toolchain and no working tree in a serverless function — so
those endpoints refuse outside development. The deployed app shows the snapshot committed by
\`bun run checks:snapshot\` instead, with the commit and timestamp it came from.`,
    },
  ],
  runbook: [
    {
      symptom: "Every monitor reads 'unknown'",
      check: "Whether the cron has ever run: /api/cron/check in the Vercel logs, and UPSTASH_REDIS_REST_URL / _TOKEN.",
      fix: "Set the Upstash credentials and CRON_SECRET, then trigger the cron once manually.",
    },
    {
      symptom: "Cron returns 401",
      check: "CRON_SECRET in the deployment environment against the value Vercel sends.",
      fix: "Set CRON_SECRET in Vercel; the schedule in vercel.json is what invokes it.",
    },
    {
      symptom: "A monitor is red but the system is fine",
      check: "Its expectStatus — some endpoints legitimately answer 403 or 405.",
      fix: "Widen expectStatus in that system's definition. A monitor that cries wolf is worse than no monitor.",
    },
  ],
  env: [
    {
      name: "UPSTASH_REDIS_REST_URL",
      where: "Vercel project env",
      purpose: "Where run history and incidents are stored.",
      status: "missing",
      note: "Without it the app silently uses an in-memory store that resets on every cold start.",
    },
    {
      name: "UPSTASH_REDIS_REST_TOKEN",
      where: "Vercel project env",
      purpose: "Auth for the same.",
      status: "missing",
    },
    {
      name: "CRON_SECRET",
      where: "Vercel project env + GitHub repository secret",
      purpose: "Shared secret the sweep endpoint requires.",
      status: "missing",
      note: "Vercel sends it as a Bearer token on scheduled invocations; the GitHub Actions heartbeat sends the same value.",
    },
    {
      name: "SWEEP_STALE_AFTER_MINUTES",
      where: "Vercel project env",
      purpose: "How old the data may get before a page view refreshes it in the background.",
      status: "missing",
      note: "Defaults to 10. Lower means fresher and more outbound requests; higher means a quieter board that can be behind.",
    },
    {
      name: "NEXT_PUBLIC_WEBSITE_URL / NEXT_PUBLIC_GRADER_URL",
      where: "Vercel project env",
      purpose: "Production URLs the monitors point at.",
      status: "missing",
      note: "The website falls back to https://atrium.agency; the grader monitor stays paused until its URL is set.",
    },
  ],
  entryPoints: [
    { label: "System registry", path: "apps/atrium.status/config/systems/index.ts" },
    { label: "Monitor runner", path: "apps/atrium.status/lib/health/runner.ts" },
    { label: "Storage adapters", path: "apps/atrium.status/lib/health/store.ts" },
    { label: "Cron endpoint", path: "apps/atrium.status/app/api/cron/check/route.ts" },
  ],
  monitors: [
    {
      id: "status-self",
      label: "Status API",
      meaning: "This dashboard is down, so nothing else is being watched either.",
      url: `${(process.env.NEXT_PUBLIC_STATUS_URL ?? "http://localhost:3030").replace(/\/$/, "")}/api/health`,
      expectStatus: [200],
      enabled: Boolean(process.env.NEXT_PUBLIC_STATUS_URL),
      disabledReason:
        "Set NEXT_PUBLIC_STATUS_URL to the deployed status URL so the app can watch itself from the outside.",
      degradedAboveMs: 2000,
    },
  ],
  tags: ["next", "observability"],
}
