import { allMonitors, enabledMonitors, findMonitor } from "@/config/systems"
import { announce } from "./alerts"
import { store } from "./store"
import type { Incident, MonitorDefinition, MonitorRun, MonitorStatus } from "./types"

/**
 * Executes monitors and turns the results into runs and incidents.
 *
 * The runner is the only thing in the app that makes outbound requests, and the
 * cron is the only thing that calls it on a schedule. Pages never probe: what a
 * page shows is what the last scheduled run measured.
 */

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_DEGRADED_MS = 2500

/**
 * A single failed request is not an outage. One dropped packet, one cold start
 * that overran the timeout, one DNS hiccup — each of those used to open an
 * incident and leave a permanent dent in the 30-day uptime number.
 *
 * So a failing attempt is retried before the sweep records a verdict. Only a
 * monitor that fails every attempt is recorded as down. The retry is immediate
 * (a short backoff, not another sweep), so a real outage is still caught on the
 * pass that finds it — the filter costs a second, not ten minutes.
 *
 * `ATTEMPTS` counts the total tries, so 2 means one retry.
 */
const ATTEMPTS = Math.max(1, Number(process.env.MONITOR_ATTEMPTS ?? 2))
const RETRY_BACKOFF_MS = Math.max(0, Number(process.env.MONITOR_RETRY_BACKOFF_MS ?? 1200))

/**
 * How many consecutive failing sweeps it takes to open an incident, on top of
 * the per-sweep retries. 1 means the sweep that confirms a failure also opens
 * the incident, which is what the retry above makes safe. Raise it if a flapping
 * dependency starts paging people.
 */
const SWEEPS_BEFORE_INCIDENT = Math.max(1, Number(process.env.MONITOR_SWEEPS_BEFORE_INCIDENT ?? 1))

const FAILING: MonitorStatus[] = ["down"]
const isFailing = (status: MonitorStatus) => FAILING.includes(status)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function classify(
  monitor: MonitorDefinition,
  httpStatus: number | null,
  latencyMs: number,
  body: string | null,
): { status: MonitorStatus; error?: string } {
  if (httpStatus === null) return { status: "down", error: "no response" }

  const expected = monitor.expectStatus ?? [200]
  if (!expected.includes(httpStatus)) {
    return { status: "down", error: `HTTP ${httpStatus}, expected ${expected.join(" or ")}` }
  }

  if (monitor.expectBodyIncludes && !(body ?? "").includes(monitor.expectBodyIncludes)) {
    return {
      status: "down",
      error: `body did not contain "${monitor.expectBodyIncludes}"`,
    }
  }

  if (latencyMs > (monitor.degradedAboveMs ?? DEFAULT_DEGRADED_MS)) {
    return { status: "degraded", error: `slow: ${latencyMs}ms` }
  }

  return { status: "up" }
}

/** One request. No retry logic here — `runMonitor` owns that. */
async function attempt(monitor: MonitorDefinition, systemId: string): Promise<MonitorRun> {
  const at = new Date().toISOString()

  if (monitor.enabled === false) {
    return {
      monitorId: monitor.id,
      systemId,
      status: "paused",
      httpStatus: null,
      latencyMs: 0,
      at,
      ...(monitor.disabledReason ? { error: monitor.disabledReason } : {}),
    }
  }

  const startedAt = Date.now()
  try {
    const response = await fetch(monitor.url, {
      method: monitor.method ?? "GET",
      headers: { "user-agent": "atrium-status/1.0", ...monitor.headers },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(monitor.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    })

    // Only read the body when a check depends on it. Otherwise drain and
    // discard, so the socket closes without keeping the bytes around.
    let body: string | null = null
    if (monitor.expectBodyIncludes) {
      body = await response.text().catch(() => "")
    } else {
      await response.arrayBuffer().catch(() => undefined)
    }

    const latencyMs = Date.now() - startedAt
    const { status, error } = classify(monitor, response.status, latencyMs, body)
    return {
      monitorId: monitor.id,
      systemId,
      status,
      httpStatus: response.status,
      latencyMs,
      at,
      ...(error ? { error } : {}),
    }
  } catch (error) {
    return {
      monitorId: monitor.id,
      systemId,
      status: "down",
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      at,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Runs one monitor to a verdict: the first attempt that does not fail wins, and
 * a monitor that fails every attempt reports the last failure. `attempts` is
 * recorded on the run so the dashboard can say a result was confirmed rather
 * than seen once.
 */
export async function runMonitor(
  monitor: MonitorDefinition,
  systemId: string,
): Promise<MonitorRun> {
  let last = await attempt(monitor, systemId)
  if (!isFailing(last.status)) return { ...last, attempts: 1 }

  for (let tries = 2; tries <= ATTEMPTS; tries++) {
    await sleep(RETRY_BACKOFF_MS)
    const next = await attempt(monitor, systemId)
    if (!isFailing(next.status)) return { ...next, attempts: tries }
    last = next
  }

  return { ...last, attempts: ATTEMPTS }
}

export type SweepResult = {
  runs: MonitorRun[]
  opened: Incident[]
  resolved: Incident[]
  durationMs: number
}

/**
 * Runs every enabled monitor, persists the results, and reconciles incidents.
 * An incident opens the first time a monitor is down and closes the first time
 * it is healthy again — degraded on its own is a warning, not an incident.
 */
export async function sweep(): Promise<SweepResult> {
  const startedAt = Date.now()
  const targets = enabledMonitors()

  const runs = await Promise.all(
    targets.map(({ monitor, system }) => runMonitor(monitor, system.id)),
  )

  const healthStore = store()
  await healthStore.recordRuns(runs)

  // Ask about every monitor in the registry, not only the ones just run: a
  // monitor that was paused or deleted while an incident was open would
  // otherwise leave that incident open forever with nothing left to close it.
  const open = await healthStore.openIncidents(monitorIds())
  const openByMonitor = new Map(open.map((incident) => [incident.monitorId, incident]))
  const sweptIds = new Set(runs.map((run) => run.monitorId))

  const opened: Incident[] = []
  const resolved: Incident[] = []

  for (const incident of open) {
    if (sweptIds.has(incident.monitorId)) continue
    const closed: Incident = {
      ...incident,
      endedAt: new Date().toISOString(),
      cause: `${incident.cause} (monitor is no longer running)`,
    }
    await healthStore.resolveIncident(closed)
    resolved.push(closed)
  }

  // Recent history per monitor, only as deep as the threshold needs. Asked for
  // once here rather than inside the loop.
  const recent =
    SWEEPS_BEFORE_INCIDENT > 1
      ? await historyByMonitor(healthStore, runs, SWEEPS_BEFORE_INCIDENT)
      : new Map<string, MonitorRun[]>()

  for (const run of runs) {
    const existing = openByMonitor.get(run.monitorId)

    if (isFailing(run.status) && !existing) {
      // The run already survived its retries. This is the second gate: the
      // failure also has to have persisted across the last N sweeps. At the
      // default of 1 the retry is the only filter and this is a no-op.
      const confirmed =
        SWEEPS_BEFORE_INCIDENT === 1 ||
        (recent.get(run.monitorId) ?? [])
          .slice(0, SWEEPS_BEFORE_INCIDENT - 1)
          .every((previous) => isFailing(previous.status))

      if (!confirmed) continue

      const incident: Incident = {
        id: `${run.monitorId}-${run.at}`,
        monitorId: run.monitorId,
        systemId: run.systemId,
        startedAt: run.at,
        endedAt: null,
        severity: "down",
        cause: run.error ?? "check failed",
      }
      await healthStore.saveIncident(incident)
      opened.push(incident)
      continue
    }

    if (run.status === "up" && existing) {
      const closed: Incident = { ...existing, endedAt: run.at }
      await healthStore.resolveIncident(closed)
      resolved.push(closed)
    }
  }

  const result: SweepResult = { runs, opened, resolved, durationMs: Date.now() - startedAt }

  // Alerts are the last thing and they never throw: a broken webhook must not
  // turn a recorded sweep into a failed one.
  await announce(result)

  return result
}

/**
 * How old the last sweep may be before a page view refreshes it in the
 * background. Vercel's Hobby plan only allows one cron a day, so on that plan
 * this is what actually keeps the board current: whoever looks at it refreshes
 * it. A real scheduler still matters for catching an outage nobody is watching.
 */
export const STALE_AFTER_MS =
  Number(process.env.SWEEP_STALE_AFTER_MINUTES ?? 10) * 60 * 1000

/**
 * Sweeps only when the stored data is older than `maxAgeMs`, and only if it
 * wins a short lock — ten people opening the dashboard at once cause one sweep
 * between them, not ten. Returns null when it decided not to run.
 */
export async function sweepIfStale(maxAgeMs = STALE_AFTER_MS): Promise<SweepResult | null> {
  const healthStore = store()
  const latest = await healthStore.latest(monitorIds())

  const newest = Object.values(latest)
    .filter((run): run is MonitorRun => Boolean(run))
    .reduce((max, run) => Math.max(max, Date.parse(run.at)), 0)

  if (Date.now() - newest < maxAgeMs) return null

  // Hold the lock for the staleness window (capped), so a failed sweep cannot
  // pin the lock open for long.
  const ttlSeconds = Math.min(600, Math.max(30, Math.ceil(maxAgeMs / 1000)))
  if (!(await healthStore.acquireLock("sweep", ttlSeconds))) return null

  return sweep()
}

/** Runs one monitor on demand without touching incident state. */
export async function probe(monitorId: string): Promise<MonitorRun | null> {
  const target = findMonitor(monitorId)
  if (!target) return null
  const run = await runMonitor(target.monitor, target.system.id)
  await store().recordRuns([run])
  return run
}

/**
 * The stored runs for each monitor that just failed, newest first, with the run
 * from this sweep dropped. `recordRuns` has already written it, so it would
 * otherwise count itself toward its own confirmation.
 */
async function historyByMonitor(
  healthStore: ReturnType<typeof store>,
  runs: MonitorRun[],
  depth: number,
): Promise<Map<string, MonitorRun[]>> {
  const failing = runs.filter((run) => isFailing(run.status))
  const entries = await Promise.all(
    failing.map(async (run) => {
      const history = await healthStore.history(run.monitorId, depth + 1)
      return [run.monitorId, history.filter((previous) => previous.at !== run.at)] as const
    }),
  )
  return new Map(entries)
}

/** Every monitor id in the registry, enabled or not. */
export function monitorIds(): string[] {
  return allMonitors().map(({ monitor }) => monitor.id)
}
