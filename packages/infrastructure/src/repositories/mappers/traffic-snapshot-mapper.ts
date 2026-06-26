import type { TrafficSnapshot, TrafficSource } from "@atrium/domain"
import type { Prisma, TrafficSnapshot as PrismaTrafficSnapshot } from "@prisma/client"

type TrafficSnapshotRow = PrismaTrafficSnapshot

export const trafficSnapshotMapper = {
  toDomain(row: TrafficSnapshotRow): TrafficSnapshot {
    return {
      id: row.id,
      locationId: row.locationId,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      sessions: row.sessions,
      users: row.users,
      source: row.source as TrafficSource,
    }
  },

  toPersistence(snapshot: TrafficSnapshot): Prisma.TrafficSnapshotUncheckedCreateInput {
    return {
      id: snapshot.id,
      locationId: snapshot.locationId,
      periodStart: snapshot.periodStart,
      periodEnd: snapshot.periodEnd,
      sessions: snapshot.sessions,
      users: snapshot.users,
      source: snapshot.source,
    }
  },
}
