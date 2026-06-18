export type AlertType =
  | "revenue_drop"
  | "review_spike"
  | "traffic_anomaly"
  | "low_rating"
  | "churn_risk"

export type AlertSeverity = "info" | "warning" | "critical"

export type Alert = {
  readonly id: string
  readonly tenantId: string
  readonly locationId: string | null
  readonly type: AlertType
  readonly severity: AlertSeverity
  readonly payload: Record<string, unknown>
  readonly triggeredAt: Date
  readonly acknowledgedAt: Date | null
}
