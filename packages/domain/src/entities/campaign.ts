export type CampaignChannel = "social" | "email" | "sms" | "in_store"
export type CampaignStatus = "draft" | "active" | "completed" | "cancelled"

export type Campaign = {
  readonly id: string
  readonly tenantId: string
  readonly locationId: string | null
  readonly name: string
  readonly channel: CampaignChannel
  readonly promoCode: string | null
  readonly startsAt: Date
  readonly endsAt: Date | null
  readonly status: CampaignStatus
}
