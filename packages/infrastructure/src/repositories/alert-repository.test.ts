import { describe, expect, mock, test } from "bun:test"
import type { PrismaClient } from "@prisma/client"
import { PrismaAlertRepository } from "./alert-repository"

function mockPrisma() {
  const alert = {
    create: mock(() => Promise.resolve()),
    findMany: mock(() => Promise.resolve([])),
    update: mock(() => Promise.resolve()),
  }
  return { alert }
}

const sampleAlert = {
  id: "alert-1",
  tenantId: "tenant-1",
  locationId: "loc-1",
  type: "revenue_drop" as const,
  severity: "critical" as const,
  payload: { drop: 0.25 },
  triggeredAt: new Date("2026-06-18T10:00:00Z"),
  acknowledgedAt: null,
}

describe("PrismaAlertRepository", () => {
  test("save calls create with mapped data", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaAlertRepository(prisma as unknown as PrismaClient)

    await repo.save(sampleAlert)

    expect(prisma.alert.create).toHaveBeenCalledTimes(1)
    const data = prisma.alert.create.mock.calls[0][0].data
    expect(data.id).toBe("alert-1")
    expect(data.type).toBe("revenue_drop")
    expect(data.severity).toBe("critical")
  })

  test("findActive returns unacknowledged alerts", async () => {
    const prisma = mockPrisma()
    prisma.alert.findMany = mock(() => Promise.resolve([]))
    const repo = new PrismaAlertRepository(prisma as unknown as PrismaClient)

    await repo.findActive("tenant-1")

    expect(prisma.alert.findMany).toHaveBeenCalledTimes(1)
    const call = prisma.alert.findMany.mock.calls[0][0]
    expect(call.where.tenantId).toBe("tenant-1")
    expect(call.where.acknowledgedAt).toBeNull()
  })

  test("acknowledge updates acknowledgedAt", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaAlertRepository(prisma as unknown as PrismaClient)
    const now = new Date("2026-06-18T12:00:00Z")

    await repo.acknowledge("alert-1", now)

    expect(prisma.alert.update).toHaveBeenCalledTimes(1)
    const call = prisma.alert.update.mock.calls[0][0]
    expect(call.where.id).toBe("alert-1")
    expect(call.data.acknowledgedAt).toEqual(now)
  })
})
