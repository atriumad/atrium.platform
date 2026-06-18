import type { Review } from "@atrium/domain"

export type ReviewReceivedEvent = {
  readonly type: "reputation.review.received"
  readonly payload: {
    readonly locationId: string
    readonly review: Review
  }
}

export type ReviewRespondedEvent = {
  readonly type: "reputation.review.responded"
  readonly payload: {
    readonly locationId: string
    readonly reviewId: string
    readonly reply: string
    readonly respondedAt: Date
  }
}

export type ReputationEvent = ReviewReceivedEvent | ReviewRespondedEvent
