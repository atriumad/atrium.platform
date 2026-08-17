import type { MonitorRun, MonitorStatus } from "./types"

/**
 * Uptime and trend maths, computed from the stored runs rather than kept as a
 * counter — a counter drifts the moment a write is lost, a recomputation cannot.
 */

export type Window = "24h" | "7d" | "30d"

export const WINDOW_MS: Record<Window, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
}

export type UptimeSummary = {
  window: Window
  /** 0-100, or null when nothing was recorded in the window */
  percent: number | null
  checks: number
  failures: number
  /** ms, mean over successful checks */
  averageLatencyMs: number | null
  worstLatencyMs: number | null
}

/** Paused runs are excluded: a monitor nobody ran is not a monitor that failed. */
function counted(runs: MonitorRun[]): MonitorRun[] {
  return runs.filter((run) => run.status !== "paused" && run.status !== "unknown")
}

export function uptime(runs: MonitorRun[], window: Window, now = Date.now()): UptimeSummary {
  const cutoff = now - WINDOW_MS[window]
  const inWindow = counted(runs).filter((run) => Date.parse(run.at) >= cutoff)

  if (inWindow.length === 0) {
    return {
      window,
      percent: null,
      checks: 0,
      failures: 0,
      averageLatencyMs: null,
      worstLatencyMs: null,
    }
  }

  const failures = inWindow.filter((run) => run.status === "down").length
  const healthy = inWindow.filter((run) => run.status !== "down")
  const latencies = healthy.map((run) => run.latencyMs)

  return {
    window,
    percent: ((inWindow.length - failures) / inWindow.length) * 100,
    checks: inWindow.length,
    failures,
    averageLatencyMs:
      latencies.length > 0
        ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
        : null,
    worstLatencyMs: latencies.length > 0 ? Math.max(...latencies) : null,
  }
}

export type Bucket = {
  /** ISO timestamp of the bucket start */
  at: string
  status: MonitorStatus
  checks: number
}

/**
 * Compresses runs into fixed buckets for the timeline bars. The worst status in
 * a bucket wins, so a single outage inside an otherwise healthy hour still shows.
 */
export function buckets(runs: MonitorRun[], count: number, spanMs: number, now = Date.now()): Bucket[] {
  const size = spanMs / count
  const start = now - spanMs
  const out: Bucket[] = []

  for (let index = 0; index < count; index += 1) {
    const from = start + index * size
    const to = from + size
    const slice = counted(runs).filter((run) => {
      const at = Date.parse(run.at)
      return at >= from && at < to
    })

    let status: MonitorStatus = "unknown"
    if (slice.length > 0) {
      status = slice.some((run) => run.status === "down")
        ? "down"
        : slice.some((run) => run.status === "degraded")
          ? "degraded"
          : "up"
    }

    out.push({ at: new Date(from).toISOString(), status, checks: slice.length })
  }

  return out
}

export function formatPercent(percent: number | null): string {
  if (percent === null) return "—"
  // 100% should read as 100%, not 100.00%, but 99.9 must not round up to 100.
  if (percent === 100) return "100%"
  return `${Math.floor(percent * 100) / 100}%`
}

export function formatRelative(iso: string | null, now = Date.now()): string {
  if (!iso) return "never"
  const diff = now - Date.parse(iso)
  if (Number.isNaN(diff)) return "unknown"
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function formatDuration(fromIso: string, toIso: string | null, now = Date.now()): string {
  const end = toIso ? Date.parse(toIso) : now
  const minutes = Math.max(1, Math.round((end - Date.parse(fromIso)) / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest ? `${hours}h ${rest}m` : `${hours}h`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}
