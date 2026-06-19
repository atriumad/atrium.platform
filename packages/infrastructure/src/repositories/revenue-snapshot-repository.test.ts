import { describe, expect, mock, test } from "bun:test"
import { PrismaRevenueSnapshotRepository } from "./revenue-snapshot-repository"

function mockPrisma() {
  const revenueSnapshot = {
    upsert: mock(() => Promise.resolve()),
    findMany: mock(() => Promise.resolve([])),
  }
  return { revenueSnapshot } as any
}

const sampleSnapshot = {
  id: "rs-1",
  locationId: "loc-1",
  periodType: "weekly" as const,
  periodStart: new Date("2026-06-15T00:00:00Z"),
  totalRevenue: { amount: 150000, currency: "USD" as const },
  orderCount: 300,
  avgTicket: { amount: 5000, currency: "USD" as const },
}

describe("PrismaRevenueSnapshotRepository", () => {
  test("save calls upsert with mapped data", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaRevenueSnapshotRepository(prisma)

    await repo.save(sampleSnapshot)

    expect(prisma.revenueSnapshot.upsert).toHaveBeenCalledTimes(1)
    const call = prisma.revenueSnapshot.upsert.mock.calls[0][0]
    expect(call.where.id).toBe("rs-1")
    expect(call.create.totalRevenue).toBe(150000)
    expect(call.create.periodType).toBe("weekly")
  })

  test("findByLocation returns snapshots filtered by type", async () => {
    const prisma = mockPrisma()
    prisma.revenueSnapshot.findMany = mock(() =>
      Promise.resolve([
        {
          id: "rs-1",
          locationId: "loc-1",
          periodType: "weekly",
          periodStart: new Date("2026-06-15T00:00:00Z"),
          totalRevenue: 150000,
          currency: "USD",
          orderCount: 300,
          avgTicket: 5000,
        },
      ]),
    )
    const repo = new PrismaRevenueSnapshotRepository(prisma)

    const result = await repo.findByLocation("loc-1", "weekly")
    expect(result).toHaveLength(1)
    expect(result[0]!.periodType).toBe("weekly")
    expect(prisma.revenueSnapshot.findMany.mock.calls[0][0].where.periodType).toBe("weekly")
  })
})
