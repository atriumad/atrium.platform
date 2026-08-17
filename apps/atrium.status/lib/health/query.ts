import { allMonitors, dependents, getSystem, SYSTEMS } from "@/config/systems"
import { store } from "./store"
import type {
  Incident,
  MonitorDefinition,
  MonitorRun,
  MonitorStatus,
  SystemDefinition,
} from "./types"
import { worstStatus } from "./types"
import { type Bucket, buckets, type UptimeSummary, uptime, WINDOW_MS } from "./uptime"

/**
 * The read side. Pages call this and nothing else — they never run a monitor,
 * never write, and never talk to the store directly.
 */

export type MonitorView = {
  monitor: MonitorDefinition
  system: SystemDefinition
  last: MonitorRun | null
  status: MonitorStatus
  uptime24h?: UptimeSummary
  uptime30d?: UptimeSummary
  timeline?: Bucket[]
  history?: MonitorRun[]
}

export type SystemView = {
  system: SystemDefinition
  status: MonitorStatus
  monitors: MonitorView[]
  checkedAt: string | null
  openIncidents: Incident[]
}

export type Overview = {
  systems: SystemView[]
  openIncidents: Incident[]
  recentIncidents: Incident[]
  lastCheckedAt: string | null
  storeKind: "upstash" | "memory"
  counts: Record<MonitorStatus, number>
}

function statusOf(monitor: MonitorDefinition, last: MonitorRun | null): MonitorStatus {
  if (monitor.enabled === false) return "paused"
  return last?.status ?? "unknown"
}

function newest(runs: Array<MonitorRun | null>): string | null {
  const times = runs
    .filter((run): run is MonitorRun => Boolean(run))
    .map((run) => run.at)
    .sort()
  return times.at(-1) ?? null
}

/** Dashboard data: one store read for the latest runs, plus open incidents. */
export async function overview(): Promise<Overview> {
  const healthStore = store()
  const monitors = allMonitors()
  const ids = monitors.map(({ monitor }) => monitor.id)

  const [latest, open, log] = await Promise.all([
    healthStore.latest(ids),
    healthStore.openIncidents(ids),
    healthStore.incidentLog(12),
  ])

  const counts: Record<MonitorStatus, number> = {
    up: 0,
    degraded: 0,
    down: 0,
    paused: 0,
    unknown: 0,
  }

  const systems: SystemView[] = SYSTEMS.map((system) => {
    const views: MonitorView[] = system.monitors.map((monitor) => {
      const last = latest[monitor.id] ?? null
      const status = statusOf(monitor, last)
      counts[status] += 1
      return { monitor, system, last, status }
    })

    // Paused monitors must not drag a system to "unknown" — a system whose only
    // live check is green is green.
    const live = views.map((view) => view.status).filter((status) => status !== "paused")

    return {
      system,
      status: live.length > 0 ? worstStatus(live) : "paused",
      monitors: views,
      checkedAt: newest(views.map((view) => view.last)),
      openIncidents: open.filter((incident) => incident.systemId === system.id),
    }
  })

  return {
    systems,
    openIncidents: open,
    recentIncidents: log,
    lastCheckedAt: newest(Object.values(latest)),
    storeKind: healthStore.kind,
    counts,
  }
}

export type SystemDetail = {
  view: SystemView
  dependencies: SystemView[]
  dependents: SystemDefinition[]
  incidents: Incident[]
}

/** Per-system page: adds history, uptime windows and the timeline per monitor. */
export async function systemDetail(id: string): Promise<SystemDetail | null> {
  const system = getSystem(id)
  if (!system) return null

  const healthStore = store()
  const ids = system.monitors.map((monitor) => monitor.id)

  const [latest, open, histories, log] = await Promise.all([
    healthStore.latest(ids),
    healthStore.openIncidents(ids),
    Promise.all(system.monitors.map((monitor) => healthStore.history(monitor.id, 3000))),
    healthStore.incidentLog(100),
  ])

  const monitors: MonitorView[] = system.monitors.map((monitor, index) => {
    const history = histories[index] ?? []
    const last = latest[monitor.id] ?? null
    return {
      monitor,
      system,
      last,
      status: statusOf(monitor, last),
      uptime24h: uptime(history, "24h"),
      uptime30d: uptime(history, "30d"),
      timeline: buckets(history, 48, WINDOW_MS["24h"]),
      history: history.slice(0, 20),
    }
  })

  const live = monitors.map((view) => view.status).filter((status) => status !== "paused")

  const view: SystemView = {
    system,
    status: live.length > 0 ? worstStatus(live) : "paused",
    monitors,
    checkedAt: newest(monitors.map((monitor) => monitor.last)),
    openIncidents: open,
  }

  const dependencyIds = system.dependsOn ?? []
  const all = await overview()

  return {
    view,
    dependencies: all.systems.filter((candidate) => dependencyIds.includes(candidate.system.id)),
    dependents: dependents(system.id),
    incidents: [...open, ...log.filter((incident) => incident.systemId === system.id)],
  }
}

/** Shape served by /api/health — the machine-readable version of the dashboard. */
export async function healthPayload() {
  const data = await overview()
  return {
    status: worstStatus(
      data.systems.map((system) => system.status).filter((status) => status !== "paused"),
    ),
    checkedAt: data.lastCheckedAt,
    durable: data.storeKind === "upstash",
    counts: data.counts,
    systems: data.systems.map((system) => ({
      id: system.system.id,
      name: system.system.name,
      category: system.system.category,
      status: system.status,
      checkedAt: system.checkedAt,
      monitors: system.monitors.map((monitor) => ({
        id: monitor.monitor.id,
        label: monitor.monitor.label,
        status: monitor.status,
        httpStatus: monitor.last?.httpStatus ?? null,
        latencyMs: monitor.last?.latencyMs ?? null,
        at: monitor.last?.at ?? null,
        error: monitor.last?.error ?? null,
      })),
    })),
    openIncidents: data.openIncidents,
  }
}
