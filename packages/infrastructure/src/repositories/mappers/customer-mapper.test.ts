import { describe, expect, test } from "bun:test"
import { money } from "@atrium/shared"
import { customerMapper } from "./customer-mapper"

const row = {
  id: "cus-1",
  tenantId: "tenant-1",
  firstSeenAt: new Date("2025-01-01T00:00:00Z"),
  lastSeenAt: new Date("2026-06-18T10:00:00Z"),
  acquisitionSource: "google",
  totalOrders: 15,
  totalSpentAmount: 75000,
  totalSpentCurrency: "USD",
  avgTicketAmount: 5000,
  visitFrequency: 14.5,
  preferredChannel: "delivery",
  loyaltyTier: "gold",
  churnRisk: 0.15,
  churnRiskReason: "decreasing frequency",
  churnRiskUpdatedAt: new Date("2026-06-17T00:00:00Z"),
  tags: ["vip", "high-value"],
  notes: "Prefers contactless pickup",
  identifiers: [
    { id: "ci-1", tenantId: "tenant-1", customerId: "cus-1", type: "email", value: "test@example.com", provider: "" },
    { id: "ci-2", tenantId: "tenant-1", customerId: "cus-1", type: "phone", value: "+15551234567", provider: "" },
  ],
}

describe("customerMapper", () => {
  test("toDomain maps Prisma row to domain Customer", () => {
    const domain = customerMapper.toDomain(row)
    expect(domain.id).toBe("cus-1")
    expect(domain.tenantId).toBe("tenant-1")
    expect(domain.totalSpent).toEqual(money(75000, "USD"))
    expect(domain.avgTicket).toEqual(money(5000, "USD"))
    expect(domain.loyaltyTier).toBe("gold")
    expect(domain.churnRisk).toBe(0.15)
    expect(domain.identifiers).toHaveLength(2)
    expect(domain.identifiers[0]).toEqual({ type: "email", value: "test@example.com" })
    expect(domain.identifiers[1]).toEqual({ type: "phone", value: "+15551234567" })
  })

  test("toDomain defaults avgTicket currency to USD", () => {
    const domain = customerMapper.toDomain(row)
    expect(domain.avgTicket.currency).toBe("USD")
  })

  test("toDomain handles nullable fields", () => {
    const nullRow = {
      ...row,
      acquisitionSource: null,
      visitFrequency: null,
      preferredChannel: null,
      churnRisk: null,
      churnRiskReason: null,
      notes: null,
    }
    const domain = customerMapper.toDomain(nullRow)
    expect(domain.acquisitionSource).toBeNull()
    expect(domain.visitFrequency).toBeNull()
    expect(domain.preferredChannel).toBeNull()
    expect(domain.churnRisk).toBeNull()
    expect(domain.churnRiskReason).toBeNull()
    expect(domain.notes).toBeNull()
  })

  test("toPersistence maps domain Customer to Prisma input", () => {
    const domain = {
      id: "cus-2",
      tenantId: "tenant-1",
      identifiers: [
        { type: "email" as const, value: "new@example.com" },
      ],
      firstSeenAt: new Date("2026-01-01T00:00:00Z"),
      lastSeenAt: new Date("2026-06-18T12:00:00Z"),
      acquisitionSource: null,
      totalOrders: 5,
      totalSpent: money(25000, "USD"),
      avgTicket: money(5000, "USD"),
      visitFrequency: null,
      preferredChannel: null,
      loyaltyTier: "standard" as const,
      churnRisk: null,
      churnRiskReason: null,
      tags: [],
      notes: null,
    }

    const data = customerMapper.toPersistence(domain)
    expect(data.id).toBe("cus-2")
    expect(data.tenantId).toBe("tenant-1")
    expect(data.totalOrders).toBe(5)
    expect(data.totalSpentAmount).toBe(25000)
    expect(data.totalSpentCurrency).toBe("USD")
    expect(data.avgTicketAmount).toBe(5000)
    expect(data.tags).toEqual([])
    expect(data.notes).toBeNull()
  })

  test("toPersistence includes identifier data for creation", () => {
    const domain = {
      id: "cus-3",
      tenantId: "tenant-1",
      identifiers: [
        { type: "email" as const, value: "a@b.com" },
        { type: "external_ref" as const, provider: "square", value: "sq_123" },
      ],
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      acquisitionSource: null,
      totalOrders: 0,
      totalSpent: money(0, "USD"),
      avgTicket: money(0, "USD"),
      visitFrequency: null,
      preferredChannel: null,
      loyaltyTier: "standard" as const,
      churnRisk: null,
      churnRiskReason: null,
      tags: [],
      notes: null,
    }

    const data = customerMapper.toPersistence(domain)
    expect(data.identifiers?.create).toHaveLength(2)
    expect(data.identifiers?.create?.[0]).toMatchObject({
      tenantId: "tenant-1",
      type: "email",
      value: "a@b.com",
      provider: "",
    })
  })
})
