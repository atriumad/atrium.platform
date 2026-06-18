import type { LoyaltyTier } from "@atrium/domain"

export type CustomerTierChangedEvent = {
  readonly type: "crm.customer.tier_changed"
  readonly payload: {
    readonly customerId: string
    readonly tenantId: string
    readonly from: LoyaltyTier
    readonly to: LoyaltyTier
  }
}

export type CustomerSegmentChangedEvent = {
  readonly type: "crm.customer.segment_changed"
  readonly payload: {
    readonly customerId: string
    readonly tenantId: string
    readonly segment: string
    readonly action: "joined" | "left"
  }
}

export type ChurnRiskElevatedEvent = {
  readonly type: "crm.churn_risk.elevated"
  readonly payload: {
    readonly customerId: string
    readonly tenantId: string
    readonly riskScore: number
    readonly reason: string
  }
}

export type ReviewLinkedEvent = {
  readonly type: "crm.review.linked"
  readonly payload: {
    readonly customerId: string
    readonly reviewId: string
  }
}

export type CrmEvent =
  | CustomerTierChangedEvent
  | CustomerSegmentChangedEvent
  | ChurnRiskElevatedEvent
  | ReviewLinkedEvent
