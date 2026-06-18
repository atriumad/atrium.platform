export type ActivityType =
  | "order"
  | "review"
  | "campaign_redeemed"
  | "tier_changed"
  | "segment_changed"

export type CustomerActivity = {
  readonly id: string
  readonly customerId: string
  readonly tenantId: string
  readonly type: ActivityType
  readonly payload: Record<string, unknown>
  readonly occurredAt: Date
}
