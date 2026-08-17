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
flips. Vercel Cron calls it on a schedule; the request is rejected unless it carries
\`CRON_SECRET\`.

Nothing else writes. The pages only read, so a page view never triggers a probe — the numbers you
see are what the last scheduled run measured.`,
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
      where: "Vercel project env",
      purpose: "Shared secret the cron endpoint requires.",
      status: "missing",
      note: "Vercel sends it as a Bearer token on scheduled invocations.",
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
      url: `${process.env.NEXT_PUBLIC_STATUS_URL ?? "http://localhost:3030"}/api/health`,
      expectStatus: [200],
      enabled: Boolean(process.env.NEXT_PUBLIC_STATUS_URL),
      disabledReason:
        "Set NEXT_PUBLIC_STATUS_URL to the deployed status URL so the app can watch itself from the outside.",
      degradedAboveMs: 2000,
    },
  ],
  tags: ["next", "observability"],
}
