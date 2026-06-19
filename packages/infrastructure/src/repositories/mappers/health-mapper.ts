import type { HealthTrend, LocationHealth } from "@atrium/domain"
import type { Prisma } from "@prisma/client"

type HealthRow = Prisma.LocationHealthGetPayload<{}>

export const healthMapper = {
  toDomain(row: HealthRow): LocationHealth {
    return {
      id: row.id,
      locationId: row.locationId,
      computedAt: row.computedAt,
      score: row.score,
      dimensions: {
        revenue: row.revenue,
        reputation: row.reputation,
        traffic: row.traffic,
        retention: row.retention,
      },
      trend: row.trend as HealthTrend,
    }
  },

  toPersistence(health: LocationHealth): Prisma.LocationHealthUncheckedCreateInput {
    return {
      id: health.id,
      locationId: health.locationId,
      computedAt: health.computedAt,
      score: health.score,
      revenue: health.dimensions.revenue,
      reputation: health.dimensions.reputation,
      traffic: health.dimensions.traffic,
      retention: health.dimensions.retention,
      trend: health.trend,
    }
  },
}
