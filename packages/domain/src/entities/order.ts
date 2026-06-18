import type { Money } from "@atrium/shared"

export type OrderChannel = "dine_in" | "pickup" | "delivery" | "online"

export type Order = {
  readonly id: string
  readonly locationId: string
  readonly customerId: string | null
  readonly occurredAt: Date
  readonly channel: OrderChannel
  readonly total: Money
  readonly itemsCount: number
  readonly sourceRef: string   // provider-agnostic external ID
}
