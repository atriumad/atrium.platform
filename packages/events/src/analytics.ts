import type { LocationHealth, PeriodType, RevenueSnapshot } from "@atrium/domain"

export type RevenueRecomputedEvent = {
  readonly type: "analytics.revenue.recomputed"
  readonly payload: {
    readonly locationId: string
    readonly period: PeriodType
    readonly snapshot: RevenueSnapshot
  }
}

export type HealthRecomputedEvent = {
  readonly type: "analytics.health.recomputed"
  readonly payload: {
    readonly locationId: string
    readonly health: LocationHealth
  }
}

export type AnalyticsEvent = RevenueRecomputedEvent | HealthRecomputedEvent
