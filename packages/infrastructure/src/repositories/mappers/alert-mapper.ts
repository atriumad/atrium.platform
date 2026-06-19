import type { Alert, AlertSeverity, AlertType } from "@atrium/domain"
import type { Prisma } from "@prisma/client"

type AlertRow = Prisma.AlertGetPayload<{}>

export const alertMapper = {
  toDomain(row: AlertRow): Alert {
    return {
      id: row.id,
      tenantId: row.tenantId,
      locationId: row.locationId,
      type: row.type as AlertType,
      severity: row.severity as AlertSeverity,
      payload: row.payload as unknown as Record<string, unknown>,
      triggeredAt: row.triggeredAt,
      acknowledgedAt: row.acknowledgedAt,
    }
  },

  toPersistence(alert: Alert): Prisma.AlertUncheckedCreateInput {
    return {
      id: alert.id,
      tenantId: alert.tenantId,
      locationId: alert.locationId,
      type: alert.type,
      severity: alert.severity,
      payload: alert.payload as unknown as Prisma.JsonNullValueInput,
      triggeredAt: alert.triggeredAt,
      acknowledgedAt: alert.acknowledgedAt,
    }
  },
}
