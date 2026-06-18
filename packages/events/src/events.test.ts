import { describe, it, expect } from "bun:test"
import { isSalesEvent, isReputationEvent, isCrmEvent, isAnalyticsEvent, isAiEvent } from "./index"
import type { DomainEvent } from "./index"

const orderCreated: DomainEvent = {
  type: "sales.order.created",
  payload: { locationId: "loc1", order: {} as any, occurredAt: new Date() },
}

const reviewReceived: DomainEvent = {
  type: "reputation.review.received",
  payload: { locationId: "loc1", review: {} as any },
}

const tierChanged: DomainEvent = {
  type: "crm.customer.tier_changed",
  payload: { customerId: "c1", tenantId: "t1", from: "standard", to: "bronze" },
}

const revenueRecomputed: DomainEvent = {
  type: "analytics.revenue.recomputed",
  payload: { locationId: "loc1", period: "daily", snapshot: {} as any },
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
