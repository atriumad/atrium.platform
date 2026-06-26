import type { Alert, AlertRepository } from "@atrium/domain"
import type { PrismaClient } from "@prisma/client"
import { alertMapper } from "./mappers/alert-mapper"

export class PrismaAlertRepository implements AlertRepository {
  constructor(private prisma: PrismaClient) {}

  async save(alert: Alert): Promise<void> {
    const data = alertMapper.toPersistence(alert)
    await this.prisma.alert.create({ data })
  }

  async findActive(tenantId: string): Promise<Alert[]> {
    const rows = await this.prisma.alert.findMany({
      where: { tenantId, acknowledgedAt: null },
    })
    return rows.map(alertMapper.toDomain)
  }

  async acknowledge(alertId: string, at: Date): Promise<void> {
    await this.prisma.alert.update({
      where: { id: alertId },
      data: { acknowledgedAt: at },
    })
  }
}
