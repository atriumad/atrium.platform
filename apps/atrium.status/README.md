# @atrium/status — agency system health

Two surfaces, deliberately kept apart:

- **Status** (`/`, `/incidents`) — live health of every agency system. A cron runs
  every monitor on a schedule and stores the results; pages only read.
- **Systems** (`/systems`) — the documentation. One page per system: what it is,
  how it works, what it depends on, what to do when it breaks.
- **Repo** (`/repo`) — the engineering view of the monorepo. Structure comes from
  a build-time snapshot; the check results come from a committed snapshot.

```bash
bun run dev:status        # from the repo root → http://localhost:3030
```

## Adding a system

1. Copy `config/systems/_template.ts` to `config/systems/<id>.ts`.
2. Fill in the documentation and the monitors.
3. Add one line to `config/systems/index.ts`.

That is the whole procedure. The dashboard, the system page, the cron, the uptime
maths and `/api/health` all pick it up with no further changes.

The registry refuses to load — loudly, at import time — on a duplicate system id,
a duplicate monitor id, a monitor disabled without a reason, or a dependency on a
system that does not exist. Monitor ids are storage keys: renaming one starts its
history over.

## How checks run

`/api/cron/check` runs every enabled monitor in parallel, classifies each result
(`up` / `degraded` / `down`), writes it to Upstash, and opens or closes an
incident when the status flips. It is the only thing that writes.

- **Degraded** is slower than the monitor's `degradedAboveMs`. It never opens an
  incident — it is a warning, not an outage.
- **Paused** is a monitor with `enabled: false`. It always carries a
  `disabledReason`, which the dashboard shows instead of a false green.
- A page view never probes inline. It can schedule a sweep *after* the response
  when the stored data is older than `SWEEP_STALE_AFTER_MINUTES`, guarded by a
  lock so concurrent viewers cause one sweep between them.
- "Check now" runs a single monitor and records it, without touching incidents.

## Watching an API you pay per call for

Three of the vendor APIs bill per request, so probing them properly costs money
every sweep. They are still watched, using the same trick the grader's search
endpoint uses: **the refusal is the signal.**

An unauthenticated request to a paid endpoint comes back 401, 403 or 429. Any of
those proves the service is answering — a real outage is a 5xx or a timeout, and
neither is in the expected list. It costs nothing and consumes no quota, so it
can run every sweep.

| Vendor | Probe | Healthy |
| --- | --- | --- |
| Google Places | `POST`-only endpoint, called anonymously | 403 |
| Google PageSpeed | anonymous run request | 429 (the shared anonymous quota) |
| ScrapeCreators | a real endpoint, no key | 401 |
| Upstash | REST API, no token | 401 |

What this does **not** tell you: that your key is valid, that quota is left, or
that credits are topped up. Those stay in the vendor console, and the billable
monitors remain in the registry as `enabled: false` with that written down.

The second free source is the vendor's own status page. Anything on Statuspage
serves `/api/v2/status.json` to anyone, and `"indicator":"none"` is the healthy
value — so `expectBodyIncludes` turns their incident board into a monitor. That
catches what liveness cannot: the API answering while the service behind it is
degraded. Upstash is wired up this way; add the same pair to any vendor that
publishes one.

## Scheduling

Vercel's Hobby plan allows one cron **per day** — a deploy is rejected outright
with a more frequent expression. Three layers cover that:

| Layer | Where | Frequency |
| --- | --- | --- |
| Vercel Cron | `vercel.json` | daily (the Hobby ceiling) |
| Stale-triggered sweep | dashboard view, `GET /api/health` | on demand, at most every `SWEEP_STALE_AFTER_MINUTES` |
| GitHub Actions heartbeat | `.github/workflows/status-sweep.yml` | every 10 minutes |

The workflow needs two repository secrets — `STATUS_URL` (no trailing slash) and
`CRON_SECRET` — under Settings → Secrets and variables → Actions. The repo is
public, so those Actions minutes are free.

On a Pro plan: put the real schedule back in `vercel.json` and delete the
workflow.

## Alerting

Without a webhook configured this app is a dashboard: it detects an outage and
waits for somebody to open the page. The dashboard says so, in a panel, rather
than being quiet about being quiet.

Set `SLACK_WEBHOOK_URL` to a Slack incoming webhook. Slack only, on purpose —
one channel that definitely works beats two that half do.

**It only speaks on transitions** — a system going down, and coming back. A
system that has been down for a day is not news, and re-sending it is how people
learn to filter these out.

**It never throws.** A revoked webhook or a hanging request must not turn a sweep
that measured and recorded everything correctly into a failed one. Sends are
caught and logged; the sweep still returns its result.

### Creating the webhook

1. Go to <https://api.slack.com/apps> and **Create New App → From scratch**.
   Name it something like `Atrium status`, pick the workspace.
2. In the sidebar, **Incoming Webhooks**, and turn **Activate Incoming Webhooks**
   on.
3. **Add New Webhook to Workspace** at the bottom, choose the channel the alerts
   should land in, and **Allow**.
4. Copy the URL it gives you — `https://hooks.slack.com/services/T…/B…/…`. That
   whole string is the secret; anyone holding it can post to the channel.
5. Put it in Vercel as `SLACK_WEBHOOK_URL` (all environments), and in your local
   `.env` if you want to test from a dev server.

One webhook is bound to one channel. To move the alerts elsewhere, add a new
webhook for that channel and replace the value.

### Proving it works

```bash
# is it configured? sends nothing
curl -H "Authorization: Bearer $CRON_SECRET" "$STATUS_URL/api/alerts/test"
# send a real test message
curl -X POST -H "Authorization: Bearer $CRON_SECRET" "$STATUS_URL/api/alerts/test"
```

It is behind `CRON_SECRET` because it posts to a channel people read.

## False positives

A single failed request is not an outage. One dropped packet, one cold start
that overran the timeout, one DNS hiccup — each of those used to open an incident
and leave a permanent dent in the 30-day uptime number.

So a failing check is retried before the sweep records a verdict, and only a
monitor that fails every attempt is recorded as down. The retry is immediate, so
a real outage is still caught on the pass that finds it: the filter costs a
second, not a sweep interval. `attempts` is stored on each run, so a `down` says
whether it was confirmed or seen once.

Degraded is deliberately not retried — it is a warning about a system that is
working, and retrying would double the load on something already struggling.

| Variable | Default | Effect |
| --- | --- | --- |
| `MONITOR_ATTEMPTS` | 2 | Total tries per check, so 2 means one retry. |
| `MONITOR_RETRY_BACKOFF_MS` | 1200 | Pause between attempts. |
| `MONITOR_SWEEPS_BEFORE_INCIDENT` | 1 | Consecutive failing sweeps needed to open an incident, on top of the retries. Raise it if a flapping dependency starts paging people; at 2 detection costs one extra sweep interval. |

## Endpoints

| Route | What it does |
| --- | --- |
| `GET /api/health` | Machine-readable status of the whole estate. Public-safe, CORS open. |
| `GET,POST /api/cron/check` | Runs the sweep. Requires `CRON_SECRET` when set. |
| `POST /api/monitors/probe` | Re-runs one monitor by id. Ids only, never URLs. |
| `GET,POST /api/checks` | Local-only turbo runner. Answers 501 in a deployment. |
| `GET,POST /api/alerts/test` | GET reports the configured channels. POST sends a real test alert. Requires `CRON_SECRET` when set. |

## Deploying to Vercel

**Project settings**

- Root Directory: `apps/atrium.status`
- Framework preset: Next.js (build and install commands can stay default —
  `bun run build` already regenerates the repo snapshot first)
- Include files outside the root directory: **on** (the snapshot script walks the
  monorepo at build time)

**Environment variables** — see `.env.example`:

| Variable | Required | Why |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | yes | Without it, history is in-memory and resets on every cold start. The dashboard says so in a banner. |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Same. |
| `CRON_SECRET` | yes | Vercel sends it as a Bearer token; without it set, the sweep endpoint would be open to anyone in production. |
| `NEXT_PUBLIC_WEBSITE_URL` | to monitor the site | No default: `atrium.agency` does not resolve today, and pointing monitors at it would keep the board red forever. |
| `NEXT_PUBLIC_GRADER_URL` | to monitor the grader | Its monitors stay paused until this is set. |
| `NEXT_PUBLIC_STATUS_URL` | to self-monitor | Lets the app watch its own `/api/health` from outside. |
| `NEXT_PUBLIC_CLIENT_CHWF_URL` | per client site | One variable per client monitor. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | optional | Defaults to the current cloud; only used to build the probe URL. |

**Cron** — see [Scheduling](#scheduling) above. `vercel.json` is set to daily so
a Hobby deploy is accepted; the GitHub Actions heartbeat provides the real
cadence.

**After the first deploy**, trigger one sweep manually so the board has data:

```bash
curl -X POST https://<your-status-url>/api/cron/check \
  -H "Authorization: Bearer $CRON_SECRET"
```

## What cannot run in a deployment

Running `turbo` needs the working tree and the toolchain, neither of which exists
in a serverless function. So:

- The **run buttons** on `/repo` only appear in local development.
- The deployed page shows `data/checks.json`, refreshed on demand with
  `bun run status:snapshot` from the repo root and committed.
- `data/repo-snapshot.generated.json` is regenerated by every build, so the
  structure, the git commit and the bundled Markdown always match the deploy.
  It is gitignored on purpose.
