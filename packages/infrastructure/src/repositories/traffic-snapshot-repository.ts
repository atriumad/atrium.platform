import type { TrafficSnapshot, TrafficSnapshotRepository } from "@atrium/domain"
import type { DateRange } from "@atrium/shared"
import type { PrismaClient } from "@prisma/client"
import { trafficSnapshotMapper } from "./mappers/traffic-snapshot-mapper"

export class PrismaTrafficSnapshotRepository implements TrafficSnapshotRepository {
  constructor(private prisma: PrismaClient) {}

  async save(snapshot: TrafficSnapshot): Promise<void> {
    const data = trafficSnapshotMapper.toPersistence(snapshot)
    await this.prisma.trafficSnapshot.upsert({
      where: { id: snapshot.id },
      create: data,
      update: data,
    })
  }

  async findByLocation(locationId: string, range: DateRange): Promise<TrafficSnapshot[]> {
    const rows = await this.prisma.trafficSnapshot.findMany({
      where: {
        locationId,
        periodStart: { gte: range.start, lt: range.end },
      },
      orderBy: { periodStart: "desc" },
    })
    return rows.map(trafficSnapshotMapper.toDomain)
  }
}
