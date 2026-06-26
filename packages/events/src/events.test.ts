import { describe, expect, it } from "bun:test"
import type { Order, RevenueSnapshot, Review } from "@atrium/domain"
import { money } from "@atrium/shared"
import type { DomainEvent } from "./index"
import { isAiEvent, isAnalyticsEvent, isCrmEvent, isReputationEvent, isSalesEvent } from "./index"

const sampleOrder: Order = {
  id: "ord-1",
  locationId: "loc1",
  customerId: null,
  occurredAt: new Date(),
  channel: "dine_in",
  total: money(2500, "USD"),
  itemsCount: 2,
  sourceRef: "pos:ord-1",
}

const sampleReview: Review = {
  id: "rev-1",
  locationId: "loc1",
  platform: "google",
  rating: 5,
  content: "Great",
  reply: null,
  publishedAt: new Date(),
  respondedAt: null,
  sentimentScore: 0.8,
  sourceRef: "google:rev-1",
}

const sampleRevenueSnapshot: RevenueSnapshot = {
  id: "rev-snap-1",
  locationId: "loc1",
  periodType: "daily",
  periodStart: new Date(),
  totalRevenue: money(150000, "USD"),
  orderCount: 60,
  avgTicket: money(2500, "USD"),
}

const orderCreated: DomainEvent = {
  type: "sales.order.created",
  payload: { locationId: "loc1", order: sampleOrder, occurredAt: new Date() },
}

const reviewReceived: DomainEvent = {
  type: "reputation.review.received",
  payload: { locationId: "loc1", review: sampleReview },
}

const tierChanged: DomainEvent = {
  type: "crm.customer.tier_changed",
  payload: { customerId: "c1", tenantId: "t1", from: "standard", to: "bronze" },
}

const revenueRecomputed: DomainEvent = {
  type: "analytics.revenue.recomputed",
  payload: { locationId: "loc1", period: "daily", snapshot: sampleRevenueSnapshot },
}

const anomalyDetected: DomainEvent = {
  type: "ai.anomaly.detected",
  payload: { tenantId: "t1", locationId: "loc1", anomalyType: "revenue_drop", severity: "warning", description: "drop", data: {} },
}

describe("event type guards", () => {
  it("isSalesEvent", () => {
    expect(isSalesEvent(orderCreated)).toBe(true)
    expect(isSalesEvent(reviewReceived)).toBe(false)
  })

  it("isReputationEvent", () => {
    expect(isReputationEvent(reviewReceived)).toBe(true)
    expect(isReputationEvent(orderCreated)).toBe(false)
  })

  it("isCrmEvent", () => {
    expect(isCrmEvent(tierChanged)).toBe(true)
    expect(isCrmEvent(orderCreated)).toBe(false)
  })

  it("isAnalyticsEvent", () => {
    expect(isAnalyticsEvent(revenueRecomputed)).toBe(true)
    expect(isAnalyticsEvent(orderCreated)).toBe(false)
  })

  it("isAiEvent", () => {
    expect(isAiEvent(anomalyDetected)).toBe(true)
    expect(isAiEvent(orderCreated)).toBe(false)
  })
})
