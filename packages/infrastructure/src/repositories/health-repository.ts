import type { HealthRepository } from "@atrium/domain"
import type { LocationHealth } from "@atrium/domain"
import type { PrismaClient } from "@prisma/client"
import { healthMapper } from "./mappers/health-mapper"

export class PrismaHealthRepository implements HealthRepository {
  constructor(private prisma: PrismaClient) {}

  async save(health: LocationHealth): Promise<void> {
    const data = healthMapper.toPersistence(health)
    await this.prisma.locationHealth.upsert({
      where: { id: data.id! },
      create: data,
      update: data,
    })
  }

  async findLatest(locationId: string): Promise<LocationHealth | null> {
    const row = await this.prisma.locationHealth.findFirst({
      where: { locationId },
      orderBy: { computedAt: "desc" },
    })
    return row ? healthMapper.toDomain(row) : null
  }

  async findHistory(locationId: string, limit: number): Promise<LocationHealth[]> {
    const rows = await this.prisma.locationHealth.findMany({
      where: { locationId },
      orderBy: { computedAt: "desc" },
      take: limit,
    })
    return rows.map(healthMapper.toDomain)
  }
}
