import type { ReviewRepository } from "@atrium/domain"
import type { Review } from "@atrium/domain"
import type { PrismaClient } from "@prisma/client"
import { reviewMapper } from "./mappers/review-mapper"

export class PrismaReviewRepository implements ReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async save(review: Review): Promise<void> {
    const data = reviewMapper.toPersistence(review)
    await this.prisma.review.upsert({
      where: { id: data.id! },
      create: data,
      update: data,
    })
  }

  async findByLocation(locationId: string): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { locationId },
      orderBy: { publishedAt: "desc" },
    })
    return rows.map(reviewMapper.toDomain)
  }

  async findBySourceRef(sourceRef: string): Promise<Review | null> {
    const row = await this.prisma.review.findUnique({
      where: { sourceRef },
    })
    return row ? reviewMapper.toDomain(row) : null
  }
}
