/**
 * The vocabulary the whole status app is built on.
 *
 * A *system* is anything the agency depends on: one of our apps, a piece of
 * infrastructure, a third-party API, or a client site. A system carries its own
 * documentation and zero or more *monitors*. A monitor is one concrete thing
 * that can be checked from the outside, on a schedule, without a human.
 *
 * Adding a system is one file in `config/systems/` plus one line in its
 * `index.ts`. Nothing else in the app needs to change.
 */

export type SystemCategory = "app" | "infrastructure" | "third-party" | "client"

export const CATEGORY_LABELS: Record<SystemCategory, string> = {
  app: "Our apps",
  infrastructure: "Infrastructure",
  "third-party": "Third parties",
  client: "Client sites",
}

/** How much the agency feels it when this system is down. */
export type Criticality = "critical" | "high" | "normal" | "low"

export type MonitorDefinition = {
  /** stable, unique across all systems — it is the storage key */
  id: string
  label: string
  /** what a user actually loses when this check fails */
  meaning: string
  url: string
  method?: "GET" | "HEAD"
  /** any of these counts as up. Defaults to [200] */
  expectStatus?: number[]
  /** additionally require this string in the body */
  expectBodyIncludes?: string
  /** hard abort. Defaults to 10000 */
  timeoutMs?: number
  /** slower than this and the monitor reports degraded instead of up */
  degradedAboveMs?: number
  headers?: Record<string, string>
  /** false = documented but never called (costs money, needs a secret, no URL yet) */
  enabled?: boolean
  /** required whenever enabled is false, so the gap is never silent */
  disabledReason?: string
}

export type DocSection = {
  title: string
  /** markdown */
  body: string
}

export type RunbookStep = {
  symptom: string
  check: string
  fix: string
}

export type EnvRequirement = {
  name: string
  where: string
  purpose: string
  status: "set" | "missing" | "dead" | "script-only"
  note?: string
}

export type SystemDefinition = {
  id: string
  name: string
  category: SystemCategory
  criticality: Criticality
  /** one line, used in lists and cards */
  summary: string
  /** markdown: what it is and why it exists */
  overview: string
  /** the long-form documentation, rendered in order */
  sections?: DocSection[]
  /** what to do when a monitor goes red */
  runbook?: RunbookStep[]
  /** ids of systems this one needs to work */
  dependsOn?: string[]
  /** monorepo package name when the system lives in this repo */
  workspace?: string
  env?: EnvRequirement[]
  entryPoints?: Array<{ label: string; path: string }>
  links?: Array<{ label: string; href: string }>
  monitors: MonitorDefinition[]
  owner?: string
  tags?: string[]
}

export type MonitorStatus = "up" | "degraded" | "down" | "paused" | "unknown"

export type MonitorRun = {
  monitorId: string
  systemId: string
  status: MonitorStatus
  httpStatus: number | null
  latencyMs: number
  /** ISO timestamp */
  at: string
  error?: string
}

export type Incident = {
  id: string
  monitorId: string
  systemId: string
  startedAt: string
  endedAt: string | null
  /** worst status seen while it was open */
  severity: Exclude<MonitorStatus, "up" | "unknown" | "paused">
  cause: string
}

/** Rolled up from every monitor a system owns. */
export type SystemStatus = {
  systemId: string
  status: MonitorStatus
  checkedAt: string | null
  monitors: Array<{
    monitor: MonitorDefinition
    last: MonitorRun | null
  }>
}

export const STATUS_ORDER: Record<MonitorStatus, number> = {
  down: 0,
  degraded: 1,
  unknown: 2,
  paused: 3,
  up: 4,
}

/** The worst status wins — one dead monitor makes the system red. */
export function worstStatus(statuses: MonitorStatus[]): MonitorStatus {
  if (statuses.length === 0) return "unknown"
  return statuses.reduce((worst, current) =>
    STATUS_ORDER[current] < STATUS_ORDER[worst] ? current : worst,
  )
}
