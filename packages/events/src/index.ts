export * from "./ai"
export * from "./analytics"
export * from "./crm"
export * from "./reputation"
export * from "./sales"

import type { AiEvent } from "./ai"
import type { AnalyticsEvent } from "./analytics"
import type { CrmEvent } from "./crm"
import type { ReputationEvent } from "./reputation"
import type { SalesEvent } from "./sales"

export type DomainEvent =
  | SalesEvent
  | ReputationEvent
  | CrmEvent
  | AnalyticsEvent
  | AiEvent

export function isSalesEvent(e: DomainEvent): e is SalesEvent {
  return e.type.startsWith("sales.")
}

export function isReputationEvent(e: DomainEvent): e is ReputationEvent {
  return e.type.startsWith("reputation.")
}

export function isCrmEvent(e: DomainEvent): e is CrmEvent {
  return e.type.startsWith("crm.")
}

export function isAnalyticsEvent(e: DomainEvent): e is AnalyticsEvent {
  return e.type.startsWith("analytics.")
}

export function isAiEvent(e: DomainEvent): e is AiEvent {
  return e.type.startsWith("ai.")
}
