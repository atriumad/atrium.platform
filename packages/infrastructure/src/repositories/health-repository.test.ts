import { describe, expect, mock, test } from "bun:test"
import type { PrismaClient } from "@prisma/client"
import { PrismaHealthRepository } from "./health-repository"

function mockPrisma() {
  const locationHealth = {
    upsert: mock(() => Promise.resolve()),
    findFirst: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
  }
  return { locationHealth }
}

describe("PrismaHealthRepository", () => {
  const sampleHealth = {
    id: "lh-1",
    locationId: "loc-1",
    computedAt: new Date("2026-06-18T10:00:00Z"),
    score: 78.5,
    dimensions: { revenue: 85, reputation: 72, traffic: 80, retention: 75 },
    trend: "up" as const,
  }

  test("save calls upsert with mapped data", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaHealthRepository(prisma as unknown as PrismaClient)

    await repo.save(sampleHealth)

    expect(prisma.locationHealth.upsert).toHaveBeenCalledTimes(1)
    const call = prisma.locationHealth.upsert.mock.calls[0][0]
    expect(call.where.id).toBe("lh-1")
    expect(call.create.score).toBe(78.5)
  })

  test("findLatest returns most recent health record", async () => {
    const prisma = mockPrisma()
    prisma.locationHealth.findFirst = mock(() =>
      Promise.resolve({
        id: "lh-1",
        locationId: "loc-1",
        computedAt: new Date("2026-06-18T10:00:00Z"),
        score: 78.5,
        revenue: 85,
        reputation: 72,
        traffic: 80,
        retention: 75,
        trend: "up",
      }),
    )
    const repo = new PrismaHealthRepository(prisma as unknown as PrismaClient)

    const result = await repo.findLatest("loc-1")
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.score).toBe(78.5)
    expect(prisma.locationHealth.findFirst.mock.calls[0][0].where.locationId).toBe("loc-1")
    expect(prisma.locationHealth.findFirst.mock.calls[0][0].orderBy.computedAt).toBe("desc")
  })

  test("findHistory returns limited recent records", async () => {
    const prisma = mockPrisma()
    prisma.locationHealth.findMany = mock(() => Promise.resolve([]))
    const repo = new PrismaHealthRepository(prisma as unknown as PrismaClient)

    await repo.findHistory("loc-1", 30)

    expect(prisma.locationHealth.findMany).toHaveBeenCalledTimes(1)
    const call = prisma.locationHealth.findMany.mock.calls[0][0]
    expect(call.where.locationId).toBe("loc-1")
    expect(call.orderBy.computedAt).toBe("desc")
    expect(call.take).toBe(30)
  })
})
