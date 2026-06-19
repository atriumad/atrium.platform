import { describe, expect, test } from "bun:test"
import { alertMapper } from "./alert-mapper"

const row = {
  id: "alert-1",
  tenantId: "tenant-1",
  locationId: "loc-1",
  type: "revenue_drop",
  severity: "critical",
  payload: { drop: 0.25, period: "2026-06" },
  triggeredAt: new Date("2026-06-18T10:00:00Z"),
  acknowledgedAt: null,
}

describe("alertMapper", () => {
  test("toDomain maps Prisma row to domain Alert", () => {
    const domain = alertMapper.toDomain(row)
    expect(domain.id).toBe("alert-1")
    expect(domain.tenantId).toBe("tenant-1")
    expect(domain.locationId).toBe("loc-1")
    expect(domain.type).toBe("revenue_drop")
    expect(domain.severity).toBe("critical")
    expect(domain.payload).toEqual({ drop: 0.25, period: "2026-06" })
    expect(domain.acknowledgedAt).toBeNull()
  })

  test("toDomain handles acknowledged alert", () => {
    const ackRow = {
      ...row,
      acknowledgedAt: new Date("2026-06-18T12:00:00Z"),
    }
    const domain = alertMapper.toDomain(ackRow)
    expect(domain.acknowledgedAt).toEqual(new Date("2026-06-18T12:00:00Z"))
  })

  test("toDomain handles null locationId", () => {
    const nullRow = { ...row, locationId: null }
    const domain = alertMapper.toDomain(nullRow)
    expect(domain.locationId).toBeNull()
  })

  test("toPersistence maps domain Alert to Prisma input", () => {
    const domain = {
      id: "alert-2",
      tenantId: "tenant-1",
      locationId: null,
      type: "low_rating" as const,
      severity: "warning" as const,
      payload: { rating: 2.5, reviewId: "rev-1" },
      triggeredAt: new Date("2026-06-18T11:00:00Z"),
      acknowledgedAt: null,
    }

    const data = alertMapper.toPersistence(domain)
    expect(data.id).toBe("alert-2")
    expect(data.tenantId).toBe("tenant-1")
    expect(data.locationId).toBeNull()
    expect(data.type).toBe("low_rating")
    expect(data.severity).toBe("warning")
    expect(data.payload).toEqual({ rating: 2.5, reviewId: "rev-1" })
    expect(data.acknowledgedAt).toBeNull()
  })
})
