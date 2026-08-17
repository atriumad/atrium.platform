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

## Endpoints

| Route | What it does |
| --- | --- |
| `GET /api/health` | Machine-readable status of the whole estate. Public-safe, CORS open. |
| `GET,POST /api/cron/check` | Runs the sweep. Requires `CRON_SECRET` when set. |
| `POST /api/monitors/probe` | Re-runs one monitor by id. Ids only, never URLs. |
| `GET,POST /api/checks` | Local-only turbo runner. Answers 501 in a deployment. |

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
