import { describe, expect, mock, test } from "bun:test"
import { money } from "@atrium/shared"
import type { PrismaClient } from "@prisma/client"
import { PrismaCustomerRepository } from "./customer-repository"

function mockPrisma() {
  const customer = {
    upsert: mock(() => Promise.resolve()),
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
    count: mock(() => Promise.resolve(0)),
  }
  const customerIdentifier = {
    upsert: mock(() => Promise.resolve()),
  }
  return { customer, customerIdentifier }
}

const sampleCustomer = {
  id: "cus-1",
  tenantId: "tenant-1",
  identifiers: [{ type: "email" as const, value: "test@example.com" }],
  firstSeenAt: new Date("2026-01-01T00:00:00Z"),
  lastSeenAt: new Date("2026-06-18T10:00:00Z"),
  acquisitionSource: null,
  totalOrders: 10,
  totalSpent: money(50000, "USD"),
  avgTicket: money(5000, "USD"),
  visitFrequency: null,
  preferredChannel: null,
  loyaltyTier: "silver" as const,
  churnRisk: null,
  churnRiskReason: null,
  tags: [],
  notes: null,
}

describe("PrismaCustomerRepository", () => {
  test("save upserts customer and identifiers separately", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaCustomerRepository(prisma as unknown as PrismaClient)

    await repo.save(sampleCustomer)

    expect(prisma.customer.upsert).toHaveBeenCalledTimes(1)
    const call = prisma.customer.upsert.mock.calls[0][0]
    expect(call.where.id).toBe("cus-1")
    expect(call.create.totalOrders).toBe(10)
    expect(call.create.identifiers).toBeUndefined()

    expect(prisma.customerIdentifier.upsert).toHaveBeenCalledTimes(1)
    const idCall = prisma.customerIdentifier.upsert.mock.calls[0][0]
    expect(idCall.where.tenantId_type_provider_value.tenantId).toBe("tenant-1")
    expect(idCall.where.tenantId_type_provider_value.type).toBe("email")
    expect(idCall.where.tenantId_type_provider_value.provider).toBe("")
    expect(idCall.where.tenantId_type_provider_value.value).toBe("test@example.com")
    expect(idCall.create.tenantId).toBe("tenant-1")
    expect(idCall.create.provider).toBe("")
  })

  test("save scopes external references by tenant and provider", async () => {
    const prisma = mockPrisma()
    const repo = new PrismaCustomerRepository(prisma as unknown as PrismaClient)

    await repo.save({
      ...sampleCustomer,
      identifiers: [{ type: "external_ref", provider: "toast", value: "cust-1" }],
    })

    const idCall = prisma.customerIdentifier.upsert.mock.calls[0][0]
    expect(idCall.where.tenantId_type_provider_value).toEqual({
      tenantId: "tenant-1",
      type: "external_ref",
      provider: "toast",
      value: "cust-1",
    })
  })

  test("findById returns customer with identifiers", async () => {
    const prisma = mockPrisma()
    prisma.customer.findUnique = mock(() =>
      Promise.resolve({
        id: "cus-1",
        tenantId: "tenant-1",
        firstSeenAt: new Date("2026-01-01T00:00:00Z"),
        lastSeenAt: new Date("2026-06-18T10:00:00Z"),
        acquisitionSource: null,
        totalOrders: 10,
        totalSpentAmount: 50000,
        totalSpentCurrency: "USD",
        avgTicketAmount: 5000,
        visitFrequency: null,
        preferredChannel: null,
        loyaltyTier: "silver",
        churnRisk: null,
        churnRiskReason: null,
        churnRiskUpdatedAt: null,
        tags: [],
        notes: null,
        identifiers: [
          { id: "ci-1", tenantId: "tenant-1", customerId: "cus-1", type: "email", value: "test@example.com", provider: "" },
        ],
      }),
    )
    const repo = new PrismaCustomerRepository(prisma as unknown as PrismaClient)

    const result = await repo.findById("cus-1")
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.id).toBe("cus-1")
    expect(result.identifiers).toHaveLength(1)
  })

  test("findByIdentifier filters by tenant and provider", async () => {
    const prisma = mockPrisma()
    prisma.customer.findFirst = mock(() => Promise.resolve(null))
    const repo = new PrismaCustomerRepository(prisma as unknown as PrismaClient)

    await repo.findByIdentifier("tenant-1", {
      type: "external_ref",
      provider: "toast",
      value: "cust-1",
    })

    expect(prisma.customer.findFirst).toHaveBeenCalledTimes(1)
    const where = prisma.customer.findFirst.mock.calls[0][0].where
    expect(where.tenantId).toBe("tenant-1")
    expect(where.identifiers.some).toEqual({
      tenantId: "tenant-1",
      type: "external_ref",
      provider: "toast",
      value: "cust-1",
    })
  })

  test("findByTenant returns paginated results", async () => {
    const prisma = mockPrisma()
    prisma.customer.findMany = mock(() => Promise.resolve([]))
    prisma.customer.count = mock(() => Promise.resolve(42))
    const repo = new PrismaCustomerRepository(prisma as unknown as PrismaClient)

    const result = await repo.findByTenant("tenant-1", { limit: 10, offset: 0 })
    expect(result.customers).toEqual([])
    expect(result.total).toBe(42)
    expect(prisma.customer.findMany.mock.calls[0][0].where.tenantId).toBe("tenant-1")
    expect(prisma.customer.findMany.mock.calls[0][0].take).toBe(10)
    expect(prisma.customer.findMany.mock.calls[0][0].skip).toBe(0)
  })

  test("findByTenant filters by loyaltyTier", async () => {
    const prisma = mockPrisma()
    prisma.customer.findMany = mock(() => Promise.resolve([]))
    prisma.customer.count = mock(() => Promise.resolve(0))
    const repo = new PrismaCustomerRepository(prisma as unknown as PrismaClient)

    await repo.findByTenant("tenant-1", { tier: "gold" })
    const where = prisma.customer.findMany.mock.calls[0][0].where
    expect(where.loyaltyTier).toBe("gold")
  })
})
