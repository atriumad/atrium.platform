import { describe, expect, test } from "bun:test"
import { orderMapper } from "./order-mapper"
import { money } from "@atrium/shared"

const row = {
  id: "ord-1",
  locationId: "loc-1",
  customerId: "cus-1",
  occurredAt: new Date("2026-06-18T10:00:00Z"),
  channel: "delivery",
  totalAmount: 2500,
  currency: "USD",
  itemsCount: 3,
  sourceRef: "square:txn_123",
  createdAt: new Date("2026-06-18T10:00:00Z"),
  updatedAt: new Date("2026-06-18T10:00:00Z"),
}

describe("orderMapper", () => {
  test("toDomain maps Prisma row to domain Order", () => {
    const domain = orderMapper.toDomain(row)
    expect(domain.id).toBe("ord-1")
    expect(domain.locationId).toBe("loc-1")
    expect(domain.customerId).toBe("cus-1")
    expect(domain.occurredAt).toEqual(new Date("2026-06-18T10:00:00Z"))
    expect(domain.channel).toBe("delivery")
    expect(domain.total).toEqual(money(2500, "USD"))
    expect(domain.itemsCount).toBe(3)
    expect(domain.sourceRef).toBe("square:txn_123")
  })

  test("toDomain handles null customerId", () => {
    const nullRow = { ...row, customerId: null }
    const domain = orderMapper.toDomain(nullRow)
    expect(domain.customerId).toBeNull()
  })

  test("toPersistence maps domain Order to Prisma input", () => {
    const domain = {
      id: "ord-2",
      locationId: "loc-1",
      customerId: null,
      occurredAt: new Date("2026-06-18T11:00:00Z"),
      channel: "dine_in" as const,
      total: money(1500, "MXN"),
      itemsCount: 2,
      sourceRef: "square:txn_456",
    }

    const data = orderMapper.toPersistence(domain)
    expect(data.id).toBe("ord-2")
    expect(data.locationId).toBe("loc-1")
    expect(data.customerId).toBeNull()
    expect(data.totalAmount).toBe(1500)
    expect(data.currency).toBe("MXN")
    expect(data.channel).toBe("dine_in")
    expect(data.itemsCount).toBe(2)
    expect(data.sourceRef).toBe("square:txn_456")
  })
})
