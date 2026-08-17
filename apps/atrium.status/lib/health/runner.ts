import { allMonitors, enabledMonitors, findMonitor } from "@/config/systems"
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

export async function runMonitor(
  monitor: MonitorDefinition,
  systemId: string,
): Promise<MonitorRun> {
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

  for (const run of runs) {
    const existing = openByMonitor.get(run.monitorId)

    if (run.status === "down" && !existing) {
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

  return { runs, opened, resolved, durationMs: Date.now() - startedAt }
}

/** Runs one monitor on demand without touching incident state. */
export async function probe(monitorId: string): Promise<MonitorRun | null> {
  const target = findMonitor(monitorId)
  if (!target) return null
  const run = await runMonitor(target.monitor, target.system.id)
  await store().recordRuns([run])
  return run
}

/** Every monitor id in the registry, enabled or not. */
export function monitorIds(): string[] {
  return allMonitors().map(({ monitor }) => monitor.id)
}
