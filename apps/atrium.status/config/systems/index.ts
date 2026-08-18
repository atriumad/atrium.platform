import type { MonitorDefinition, SystemDefinition } from "@/lib/health/types"
import { atriumCdn } from "./atrium-cdn"
import { atriumGrader } from "./atrium-grader"
import { atriumStatus } from "./atrium-status"
import { atriumWebsite } from "./atrium-website"
import { calCom } from "./cal-com"
import { clientChickInWaffle } from "./client-chick-in-waffle"
import { cloudinary } from "./cloudinary"
import { googlePagespeed } from "./google-pagespeed"
import { googlePlaces } from "./google-places"
import { llmProviders } from "./llm-providers"
import { postgres } from "./postgres"
import { scrapecreators } from "./scrapecreators"
import { upstash } from "./upstash"

/**
 * The registry. Adding a system is: one file next to this one, one line here.
 * `_template.ts` is the starting point and is deliberately not registered.
 */
export const SYSTEMS: SystemDefinition[] = [
  atriumWebsite,
  atriumGrader,
  atriumStatus,
  atriumCdn,
  upstash,
  postgres,
  cloudinary,
  googlePlaces,
  googlePagespeed,
  scrapecreators,
  llmProviders,
  calCom,
  clientChickInWaffle,
]

/**
 * Catches the mistakes that would otherwise show up as silently wrong history:
 * a duplicated monitor id overwrites another monitor's storage key, and a
 * dangling dependency draws an edge to nothing.
 */
function validate(systems: SystemDefinition[]): void {
  const systemIds = new Set<string>()
  const monitorIds = new Set<string>()

  for (const system of systems) {
    if (systemIds.has(system.id)) {
      throw new Error(`Duplicate system id "${system.id}" in the registry.`)
    }
    systemIds.add(system.id)

    for (const monitor of system.monitors) {
      if (monitorIds.has(monitor.id)) {
        throw new Error(
          `Duplicate monitor id "${monitor.id}" (in ${system.id}). Monitor ids are storage keys and must be unique.`,
        )
      }
      monitorIds.add(monitor.id)
      if (monitor.enabled === false && !monitor.disabledReason) {
        throw new Error(
          `Monitor "${monitor.id}" is disabled without a disabledReason. A silent gap is worse than a documented one.`,
        )
      }
    }
  }

  for (const system of systems) {
    for (const dependency of system.dependsOn ?? []) {
      if (!systemIds.has(dependency)) {
        throw new Error(`System "${system.id}" depends on unknown system "${dependency}".`)
      }
    }
  }
}

validate(SYSTEMS)

export function getSystem(id: string): SystemDefinition | undefined {
  return SYSTEMS.find((system) => system.id === id)
}

export type MonitorWithSystem = { monitor: MonitorDefinition; system: SystemDefinition }

export function allMonitors(): MonitorWithSystem[] {
  return SYSTEMS.flatMap((system) => system.monitors.map((monitor) => ({ monitor, system })))
}

export function enabledMonitors(): MonitorWithSystem[] {
  return allMonitors().filter(({ monitor }) => monitor.enabled !== false)
}

export function findMonitor(id: string): MonitorWithSystem | undefined {
  return allMonitors().find(({ monitor }) => monitor.id === id)
}

/** Systems that name this one in their dependsOn — i.e. who breaks when it does. */
export function dependents(id: string): SystemDefinition[] {
  return SYSTEMS.filter((system) => (system.dependsOn ?? []).includes(id))
}
