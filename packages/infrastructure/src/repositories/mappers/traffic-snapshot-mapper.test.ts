import { describe, expect, test } from "bun:test"
import { trafficSnapshotMapper } from "./traffic-snapshot-mapper"

describe("trafficSnapshotMapper", () => {
  test("toDomain maps Prisma row to domain TrafficSnapshot", () => {
    const row = {
      id: "ts-1",
      locationId: "loc-1",
      periodStart: new Date("2026-06-01T00:00:00Z"),
      periodEnd: new Date("2026-06-30T00:00:00Z"),
      sessions: 150,
      users: 100,
      source: "organic",
    }

    const domain = trafficSnapshotMapper.toDomain(row)

    expect(domain.id).toBe("ts-1")
    expect(domain.sessions).toBe(150)
    expect(domain.source).toBe("organic")
  })

  test("toPersistence maps domain TrafficSnapshot to Prisma input", () => {
    const data = trafficSnapshotMapper.toPersistence({
      id: "ts-1",
      locationId: "loc-1",
      periodStart: new Date("2026-06-01T00:00:00Z"),
      periodEnd: new Date("2026-06-30T00:00:00Z"),
      sessions: 150,
      users: 100,
      source: "organic",
    })

    expect(data.id).toBe("ts-1")
    expect(data.locationId).toBe("loc-1")
    expect(data.sessions).toBe(150)
  })
})
