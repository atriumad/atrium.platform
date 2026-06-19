import { describe, expect, test } from "bun:test"
import { healthMapper } from "./health-mapper"

const row = {
  id: "lh-1",
  locationId: "loc-1",
  computedAt: new Date("2026-06-18T10:00:00Z"),
  score: 78.5,
  revenue: 85.0,
  reputation: 72.0,
  traffic: 80.0,
  retention: 75.0,
  trend: "up",
}

describe("healthMapper", () => {
  test("toDomain maps Prisma row to domain LocationHealth", () => {
    const domain = healthMapper.toDomain(row)
    expect(domain.id).toBe("lh-1")
    expect(domain.locationId).toBe("loc-1")
    expect(domain.computedAt).toEqual(new Date("2026-06-18T10:00:00Z"))
    expect(domain.score).toBe(78.5)
    expect(domain.dimensions.revenue).toBe(85.0)
    expect(domain.dimensions.reputation).toBe(72.0)
    expect(domain.dimensions.traffic).toBe(80.0)
    expect(domain.dimensions.retention).toBe(75.0)
    expect(domain.trend).toBe("up")
  })

  test("toPersistence maps domain LocationHealth to Prisma input", () => {
    const domain = {
      id: "lh-2",
      locationId: "loc-1",
      computedAt: new Date("2026-06-18T11:00:00Z"),
      score: 65.0,
      dimensions: {
        revenue: 60.0,
        reputation: 70.0,
        traffic: 55.0,
        retention: 80.0,
      },
      trend: "down" as const,
    }

    const data = healthMapper.toPersistence(domain)
    expect(data.id).toBe("lh-2")
    expect(data.locationId).toBe("loc-1")
    expect(data.score).toBe(65.0)
    expect(data.revenue).toBe(60.0)
    expect(data.reputation).toBe(70.0)
    expect(data.traffic).toBe(55.0)
    expect(data.retention).toBe(80.0)
    expect(data.trend).toBe("down")
  })
})
