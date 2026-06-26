import { describe, expect, test } from "bun:test"
import { money } from "@atrium/shared"
import { revenueSnapshotMapper } from "./revenue-snapshot-mapper"

const row = {
  id: "rs-1",
  locationId: "loc-1",
  periodType: "weekly",
  periodStart: new Date("2026-06-15T00:00:00Z"),
  totalRevenue: 150000,
  currency: "USD",
  orderCount: 300,
  avgTicket: 5000,
}

describe("revenueSnapshotMapper", () => {
  test("toDomain maps Prisma row to domain RevenueSnapshot", () => {
    const domain = revenueSnapshotMapper.toDomain(row)
    expect(domain.id).toBe("rs-1")
    expect(domain.locationId).toBe("loc-1")
    expect(domain.periodType).toBe("weekly")
    expect(domain.totalRevenue).toEqual(money(150000, "USD"))
    expect(domain.orderCount).toBe(300)
    expect(domain.avgTicket).toEqual(money(5000, "USD"))
  })

  test("toPersistence maps domain RevenueSnapshot to Prisma input", () => {
    const domain = {
      id: "rs-2",
      locationId: "loc-1",
      periodType: "daily" as const,
      periodStart: new Date("2026-06-18T00:00:00Z"),
      totalRevenue: money(25000, "MXN"),
      orderCount: 45,
      avgTicket: money(555, "MXN"),
    }
    const data = revenueSnapshotMapper.toPersistence(domain)
    expect(data.id).toBe("rs-2")
    expect(data.totalRevenue).toBe(25000)
    expect(data.currency).toBe("MXN")
    expect(data.orderCount).toBe(45)
    expect(data.avgTicket).toBe(555)
  })

  test("toDomain handles different period types", () => {
    const monthly = revenueSnapshotMapper.toDomain({ ...row, periodType: "monthly" })
    expect(monthly.periodType).toBe("monthly")

    const daily = revenueSnapshotMapper.toDomain({ ...row, periodType: "daily" })
    expect(daily.periodType).toBe("daily")
  })
})
