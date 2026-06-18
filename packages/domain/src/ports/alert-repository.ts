import type { Alert } from "../entities/alert"

export interface AlertRepository {
  save(alert: Alert): Promise<void>
  findActive(tenantId: string): Promise<Alert[]>
  acknowledge(alertId: string, at: Date): Promise<void>
}
