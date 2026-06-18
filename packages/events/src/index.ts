export * from "./sales"
export * from "./reputation"
export * from "./crm"
export * from "./analytics"
export * from "./ai"

import type { SalesEvent } from "./sales"
import type { ReputationEvent } from "./reputation"
import type { CrmEvent } from "./crm"
import type { AnalyticsEvent } from "./analytics"
import type { AiEvent } from "./ai"

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
