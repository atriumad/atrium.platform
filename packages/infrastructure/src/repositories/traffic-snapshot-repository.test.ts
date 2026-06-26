import { describe, expect, mock, test } from "bun:test"
import type { PrismaClient } from "@prisma/client"
import { PrismaTrafficSnapshotRepository } from "./traffic-snapshot-repository"

function mockPrisma() {
  const trafficSnapshot = {
    upsert: mock(() => Promise.resolve()),
    findMany: mock(() => Promise.resolve([])),
  }
  return { trafficSnapshot }
}

const sampleSnapshot = {
  id: "ts-1",
  locationId: "loc-1",
  periodStart: new Date("2026-06-01T00:00:00Z"),
  periodEnd: new Date("2026-06-30T00:00:00Z"),
  sessions: 150,
  users: 100,
  source: "organic" as const,
}

describe("PrismaTrafficSnapshotRepository", () => {
  test("save calls upsert with mapped data", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaTrafficSnapshotRepository(prisma as unknown as PrismaClient)

    await repo.save(sampleSnapshot)

    expect(prisma.trafficSnapshot.upsert).toHaveBeenCalledTimes(1)
    const call = prisma.trafficSnapshot.upsert.mock.calls[0][0]
    expect(call.where.id).toBe("ts-1")
    expect(call.create.sessions).toBe(150)
  })

  test("findByLocation filters by location and date range", async () => {
    const prisma = mockPrisma()
    prisma.trafficSnapshot.findMany = mock(() =>
      Promise.resolve([
        {
          id: "ts-1",
          locationId: "loc-1",
          periodStart: new Date("2026-06-01T00:00:00Z"),
          periodEnd: new Date("2026-06-30T00:00:00Z"),
          sessions: 150,
          users: 100,
          source: "organic",
        },
      ]),
    )
    const repo = new PrismaTrafficSnapshotRepository(prisma as unknown as PrismaClient)

    const result = await repo.findByLocation("loc-1", {
      start: new Date("2026-06-01T00:00:00Z"),
      end: new Date("2026-07-01T00:00:00Z"),
    })

    expect(result).toHaveLength(1)
    const where = prisma.trafficSnapshot.findMany.mock.calls[0][0].where
    expect(where.locationId).toBe("loc-1")
    expect(where.periodStart.gte).toEqual(new Date("2026-06-01T00:00:00Z"))
    expect(where.periodStart.lt).toEqual(new Date("2026-07-01T00:00:00Z"))
  })
})
