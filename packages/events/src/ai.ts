import type { AlertType, AlertSeverity, Recommendation } from "@atrium/domain"

export type AnomalyDetectedEvent = {
  readonly type: "ai.anomaly.detected"
  readonly payload: {
    readonly tenantId: string
    readonly locationId: string
    readonly anomalyType: AlertType
    readonly severity: AlertSeverity
    readonly description: string
    readonly data: Record<string, unknown>
  }
}

export type RecommendationCreatedEvent = {
  readonly type: "ai.recommendation.created"
  readonly payload: {
    readonly tenantId: string
    readonly recommendation: Recommendation
  }
}

export type AiEvent = AnomalyDetectedEvent | RecommendationCreatedEvent
