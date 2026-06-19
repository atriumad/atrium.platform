import { describe, expect, mock, test } from "bun:test"
import { PrismaReviewRepository } from "./review-repository"

function mockPrisma() {
  const review = {
    upsert: mock(() => Promise.resolve()),
    findMany: mock(() => Promise.resolve([])),
    findUnique: mock(() => Promise.resolve(null)),
  }
  return { review } as any
}

const sampleReview = {
  id: "rev-1",
  locationId: "loc-1",
  platform: "google" as const,
  rating: 4 as const,
  content: "Great food!",
  reply: null,
  publishedAt: new Date("2026-06-18T10:00:00Z"),
  respondedAt: null,
  sentimentScore: 0.8,
  sourceRef: "google:abc",
}

describe("PrismaReviewRepository", () => {
  test("save calls upsert with mapped data", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaReviewRepository(prisma)

    await repo.save(sampleReview)

    expect(prisma.review.upsert).toHaveBeenCalledTimes(1)
    const call = prisma.review.upsert.mock.calls[0][0]
    expect(call.where.id).toBe("rev-1")
    expect(call.create.platform).toBe("google")
    expect(call.create.rating).toBe(4)
  })

  test("findByLocation returns reviews", async () => {
    const prisma = mockPrisma()
    prisma.review.findMany = mock(() =>
      Promise.resolve([
        {
          id: "rev-1",
          locationId: "loc-1",
          platform: "google",
          rating: 4,
          content: "Great",
          reply: null,
          publishedAt: new Date("2026-06-18T10:00:00Z"),
          respondedAt: null,
          sentimentScore: 0.8,
          sourceRef: "google:abc",
        },
      ]),
    )
    const repo = new PrismaReviewRepository(prisma)

    const result = await repo.findByLocation("loc-1")
    expect(result).toHaveLength(1)
    expect(result[0]!.platform).toBe("google")
  })

  test("findBySourceRef returns null when not found", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaReviewRepository(prisma)

    const result = await repo.findBySourceRef("nonexistent")
    expect(result).toBeNull()
  })
})
