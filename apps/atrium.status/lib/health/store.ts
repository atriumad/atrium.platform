import { Redis } from "@upstash/redis"
import type { Incident, MonitorRun } from "./types"

/**
 * Where check history lives.
 *
 * Vercel has no persistent disk, so the deployed app needs an external store.
 * Upstash is used over its REST API, which works from any runtime. When the
 * credentials are absent — local development, a preview without env — the app
 * falls back to an in-memory store so it still runs unconfigured. That fallback
 * is per-process and dies with it, which is fine locally and useless in
 * production: `store().kind` is surfaced in the UI so the difference is never
 * invisible.
 */

const PREFIX = "atrium"
const RUNS_KEPT = 3000 // ~10 days at one check every 5 minutes
const INCIDENT_LOG_KEPT = 200

export interface HealthStore {
  readonly kind: "upstash" | "memory"
  /**
   * Take a short-lived exclusive lock. Used so that many people opening the
   * dashboard at once trigger one sweep between them, not one each.
   * Returns false when someone else holds it.
   */
  acquireLock(name: string, ttlSeconds: number): Promise<boolean>
  recordRuns(runs: MonitorRun[]): Promise<void>
  latest(monitorIds: string[]): Promise<Record<string, MonitorRun | null>>
  history(monitorId: string, limit?: number): Promise<MonitorRun[]>
  openIncidents(monitorIds: string[]): Promise<Incident[]>
  saveIncident(incident: Incident): Promise<void>
  resolveIncident(incident: Incident): Promise<void>
  incidentLog(limit?: number): Promise<Incident[]>
}

const runKey = (id: string) => `${PREFIX}:monitor:${id}:runs`
const lastKey = (id: string) => `${PREFIX}:monitor:${id}:last`
const incidentKey = (id: string) => `${PREFIX}:incident:${id}`
const lockKey = (name: string) => `${PREFIX}:lock:${name}`
const INCIDENT_LOG = `${PREFIX}:incidents:log`

class UpstashStore implements HealthStore {
  readonly kind = "upstash" as const
  constructor(private readonly redis: Redis) {}

  async acquireLock(name: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(lockKey(name), Date.now(), {
      nx: true,
      ex: ttlSeconds,
    })
    return result === "OK"
  }

  async recordRuns(runs: MonitorRun[]): Promise<void> {
    if (runs.length === 0) return
    const pipeline = this.redis.pipeline()
    for (const run of runs) {
      pipeline.set(lastKey(run.monitorId), run)
      pipeline.lpush(runKey(run.monitorId), run)
      pipeline.ltrim(runKey(run.monitorId), 0, RUNS_KEPT - 1)
    }
    await pipeline.exec()
  }

  async latest(monitorIds: string[]): Promise<Record<string, MonitorRun | null>> {
    if (monitorIds.length === 0) return {}
    const values = await this.redis.mget<Array<MonitorRun | null>>(
      ...monitorIds.map((id) => lastKey(id)),
    )
    return Object.fromEntries(monitorIds.map((id, index) => [id, values[index] ?? null]))
  }

  async history(monitorId: string, limit = RUNS_KEPT): Promise<MonitorRun[]> {
    return (await this.redis.lrange<MonitorRun>(runKey(monitorId), 0, limit - 1)) ?? []
  }

  async openIncidents(monitorIds: string[]): Promise<Incident[]> {
    if (monitorIds.length === 0) return []
    const values = await this.redis.mget<Array<Incident | null>>(
      ...monitorIds.map((id) => incidentKey(id)),
    )
    return values.filter((incident): incident is Incident => Boolean(incident))
  }

  async saveIncident(incident: Incident): Promise<void> {
    await this.redis.set(incidentKey(incident.monitorId), incident)
  }

  async resolveIncident(incident: Incident): Promise<void> {
    const pipeline = this.redis.pipeline()
    pipeline.del(incidentKey(incident.monitorId))
    pipeline.lpush(INCIDENT_LOG, incident)
    pipeline.ltrim(INCIDENT_LOG, 0, INCIDENT_LOG_KEPT - 1)
    await pipeline.exec()
  }

  async incidentLog(limit = 50): Promise<Incident[]> {
    return (await this.redis.lrange<Incident>(INCIDENT_LOG, 0, limit - 1)) ?? []
  }
}

/** Survives hot reloads in dev the same way a Prisma client has to. */
const globalMemory = globalThis as unknown as {
  __atriumHealthMemory?: {
    runs: Map<string, MonitorRun[]>
    incidents: Map<string, Incident>
    log: Incident[]
    locks: Map<string, number>
  }
}

class MemoryStore implements HealthStore {
  readonly kind = "memory" as const
  private get state() {
    globalMemory.__atriumHealthMemory ??= {
      runs: new Map(),
      incidents: new Map(),
      log: [],
      locks: new Map(),
    }
    return globalMemory.__atriumHealthMemory
  }

  async acquireLock(name: string, ttlSeconds: number): Promise<boolean> {
    const now = Date.now()
    const heldUntil = this.state.locks.get(name) ?? 0
    if (heldUntil > now) return false
    this.state.locks.set(name, now + ttlSeconds * 1000)
    return true
  }

  async recordRuns(runs: MonitorRun[]): Promise<void> {
    for (const run of runs) {
      const existing = this.state.runs.get(run.monitorId) ?? []
      this.state.runs.set(run.monitorId, [run, ...existing].slice(0, RUNS_KEPT))
    }
  }

  async latest(monitorIds: string[]): Promise<Record<string, MonitorRun | null>> {
    return Object.fromEntries(
      monitorIds.map((id) => [id, this.state.runs.get(id)?.[0] ?? null]),
    )
  }

  async history(monitorId: string, limit = RUNS_KEPT): Promise<MonitorRun[]> {
    return (this.state.runs.get(monitorId) ?? []).slice(0, limit)
  }

  async openIncidents(monitorIds: string[]): Promise<Incident[]> {
    return monitorIds
      .map((id) => this.state.incidents.get(id))
      .filter((incident): incident is Incident => Boolean(incident))
  }

  async saveIncident(incident: Incident): Promise<void> {
    this.state.incidents.set(incident.monitorId, incident)
  }

  async resolveIncident(incident: Incident): Promise<void> {
    this.state.incidents.delete(incident.monitorId)
    this.state.log = [incident, ...this.state.log].slice(0, INCIDENT_LOG_KEPT)
  }

  async incidentLog(limit = 50): Promise<Incident[]> {
    return this.state.log.slice(0, limit)
  }
}

let cached: HealthStore | null = null

export function store(): HealthStore {
  if (cached) return cached
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  cached =
    url && token ? new UpstashStore(new Redis({ url, token })) : new MemoryStore()
  return cached
}

export function storageIsDurable(): boolean {
  return store().kind === "upstash"
}
