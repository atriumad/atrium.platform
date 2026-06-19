import { describe, expect, test } from "bun:test"
import { reviewMapper } from "./review-mapper"

const row = {
  id: "rev-1",
  locationId: "loc-1",
  platform: "google",
  rating: 4,
  content: "Great food!",
  reply: null,
  publishedAt: new Date("2026-06-18T10:00:00Z"),
  respondedAt: null,
  sentimentScore: 0.8,
  sourceRef: "google:abc123",
}

describe("reviewMapper", () => {
  test("toDomain maps Prisma row to domain Review", () => {
    const domain = reviewMapper.toDomain(row)
    expect(domain.id).toBe("rev-1")
    expect(domain.locationId).toBe("loc-1")
    expect(domain.platform).toBe("google")
    expect(domain.rating).toBe(4)
    expect(domain.content).toBe("Great food!")
    expect(domain.reply).toBeNull()
    expect(domain.sentimentScore).toBe(0.8)
    expect(domain.sourceRef).toBe("google:abc123")
  })

  test("toDomain handles null fields", () => {
    const nullRow = { ...row, content: null, reply: null, sentimentScore: null, respondedAt: null }
    const domain = reviewMapper.toDomain(nullRow)
    expect(domain.content).toBeNull()
    expect(domain.reply).toBeNull()
    expect(domain.sentimentScore).toBeNull()
    expect(domain.respondedAt).toBeNull()
  })

  test("toPersistence maps domain Review to Prisma input", () => {
    const domain = {
      id: "rev-2",
      locationId: "loc-1",
      platform: "yelp" as const,
      rating: 3 as const,
      content: "Okay",
      reply: "Thanks!",
      publishedAt: new Date("2026-06-17T12:00:00Z"),
      respondedAt: new Date("2026-06-18T10:00:00Z"),
      sentimentScore: null,
      sourceRef: "yelp:456",
    }
    const data = reviewMapper.toPersistence(domain)
    expect(data.id).toBe("rev-2")
    expect(data.platform).toBe("yelp")
    expect(data.rating).toBe(3)
    expect(data.reply).toBe("Thanks!")
    expect(data.respondedAt).toEqual(new Date("2026-06-18T10:00:00Z"))
    expect(data.sentimentScore).toBeNull()
  })
})
