import type { PeriodType, RevenueSnapshot, RevenueSnapshotRepository } from "@atrium/domain"
import type { PrismaClient } from "@prisma/client"
import { revenueSnapshotMapper } from "./mappers/revenue-snapshot-mapper"

export class PrismaRevenueSnapshotRepository implements RevenueSnapshotRepository {
  constructor(private prisma: PrismaClient) {}

  async save(snapshot: RevenueSnapshot): Promise<void> {
    const data = revenueSnapshotMapper.toPersistence(snapshot)
    await this.prisma.revenueSnapshot.upsert({
      where: { id: snapshot.id },
      create: data,
      update: data,
    })
  }

  async findByLocation(
    locationId: string,
    periodType: PeriodType,
  ): Promise<RevenueSnapshot[]> {
    const rows = await this.prisma.revenueSnapshot.findMany({
      where: { locationId, periodType },
      orderBy: { periodStart: "desc" },
    })
    return rows.map(revenueSnapshotMapper.toDomain)
  }
}
