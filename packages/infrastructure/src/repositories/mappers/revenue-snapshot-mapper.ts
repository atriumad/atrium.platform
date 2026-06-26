import type { PeriodType, RevenueSnapshot } from "@atrium/domain"
import { type Currency, money } from "@atrium/shared"
import type { Prisma, RevenueSnapshot as PrismaRevenueSnapshot } from "@prisma/client"

type RevenueSnapshotRow = PrismaRevenueSnapshot

export const revenueSnapshotMapper = {
  toDomain(row: RevenueSnapshotRow): RevenueSnapshot {
    return {
      id: row.id,
      locationId: row.locationId,
      periodType: row.periodType as PeriodType,
      periodStart: row.periodStart,
      totalRevenue: money(row.totalRevenue, row.currency as Currency),
      orderCount: row.orderCount,
      avgTicket: money(row.avgTicket, row.currency as Currency),
    }
  },

  toPersistence(snapshot: RevenueSnapshot): Prisma.RevenueSnapshotUncheckedCreateInput {
    return {
      id: snapshot.id,
      locationId: snapshot.locationId,
      periodType: snapshot.periodType,
      periodStart: snapshot.periodStart,
      totalRevenue: snapshot.totalRevenue.amount,
      currency: snapshot.totalRevenue.currency,
      orderCount: snapshot.orderCount,
      avgTicket: snapshot.avgTicket.amount,
    }
  },
}
