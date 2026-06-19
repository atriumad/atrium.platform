import { describe, expect, mock, test } from "bun:test"
import { PrismaOrderRepository } from "./order-repository"
import { money } from "@atrium/shared"
import { dateRange } from "@atrium/shared"

function mockPrisma() {
  const order = {
    upsert: mock(() => Promise.resolve()),
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
    count: mock(() => Promise.resolve(0)),
  }
  return { order } as any
}

const sampleOrder = {
  id: "ord-1",
  locationId: "loc-1",
  customerId: null,
  occurredAt: new Date("2026-06-18T10:00:00Z"),
  channel: "delivery" as const,
  total: money(2500, "USD"),
  itemsCount: 3,
  sourceRef: "square:txn_123",
}

describe("PrismaOrderRepository", () => {
  test("save calls upsert with mapped data", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaOrderRepository(prisma)

    await repo.save(sampleOrder)

    expect(prisma.order.upsert).toHaveBeenCalledTimes(1)
    const call = prisma.order.upsert.mock.calls[0][0]
    expect(call.where.id).toBe("ord-1")
    expect(call.create.totalAmount).toBe(2500)
    expect(call.update.totalAmount).toBe(2500)
  })

  test("findBySourceRef returns order when found", async () => {
    const prisma = mockPrisma()
    prisma.order.findUnique = mock(() =>
      Promise.resolve({
        id: "ord-1",
        locationId: "loc-1",
        customerId: null,
        occurredAt: new Date("2026-06-18T10:00:00Z"),
        channel: "delivery",
        totalAmount: 2500,
        currency: "USD",
        itemsCount: 3,
        sourceRef: "square:txn_123",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    )
    const repo = new PrismaOrderRepository(prisma)

    const result = await repo.findBySourceRef("square:txn_123")
    expect(result).not.toBeNull()
    expect(result!.id).toBe("ord-1")
    expect(result!.sourceRef).toBe("square:txn_123")
  })

  test("findBySourceRef returns null when not found", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaOrderRepository(prisma)

    const result = await repo.findBySourceRef("missing")
    expect(result).toBeNull()
  })

  test("findByLocation queries with locationId and date range", async () => {
    const prisma = mockPrisma()
    prisma.order.findMany = mock(() => Promise.resolve([]))
    const repo = new PrismaOrderRepository(prisma)
    const range = dateRange(new Date("2026-06-01"), new Date("2026-06-30"))

    await repo.findByLocation("loc-1", range)

    expect(prisma.order.findMany).toHaveBeenCalledTimes(1)
    const where = prisma.order.findMany.mock.calls[0][0].where
    expect(where.locationId).toBe("loc-1")
    expect(where.occurredAt.gte).toEqual(new Date("2026-06-01"))
    expect(where.occurredAt.lte).toEqual(new Date("2026-06-30"))
  })

  test("findByCustomer returns orders for customer", async () => {
    const prisma = mockPrisma()
    prisma.order.findMany = mock(() => Promise.resolve([]))
    const repo = new PrismaOrderRepository(prisma)

    await repo.findByCustomer("cus-1")

    expect(prisma.order.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.order.findMany.mock.calls[0][0].where.customerId).toBe("cus-1")
  })

  test("countByLocation returns count", async () => {
    const prisma = mockPrisma()
    prisma.order.count = mock(() => Promise.resolve(5))
    const repo = new PrismaOrderRepository(prisma)
    const range = dateRange(new Date("2026-06-01"), new Date("2026-06-30"))

    const count = await repo.countByLocation("loc-1", range)
    expect(count).toBe(5)
  })
})
