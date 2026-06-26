import type { CustomerIdentifier, Money } from "@atrium/shared"
import { sameIdentifier } from "@atrium/shared"
import type { OrderChannel } from "./order"

export type LoyaltyTier = "standard" | "bronze" | "silver" | "gold" | "vip"

export type Customer = {
  readonly id: string
  readonly tenantId: string
  readonly identifiers: CustomerIdentifier[]
  readonly firstSeenAt: Date
  readonly lastSeenAt: Date
  readonly acquisitionSource: string | null
  readonly totalOrders: number
  readonly totalSpent: Money
  readonly avgTicket: Money
  readonly visitFrequency: number | null    // avg days between orders
  readonly preferredChannel: OrderChannel | null
  readonly loyaltyTier: LoyaltyTier
  readonly churnRisk: number | null         // 0–1
  readonly churnRiskReason: string | null
  readonly tags: string[]
  readonly notes: string | null
}

export function createCustomer(props: Customer): Customer {
  return { ...props }
}

export function addIdentifier(customer: Customer, id: CustomerIdentifier): Customer {
  if (hasIdentifier(customer, id)) return customer
  return { ...customer, identifiers: [...customer.identifiers, id] }
}

export function hasIdentifier(customer: Customer, id: CustomerIdentifier): boolean {
  return customer.identifiers.some((existing) => sameIdentifier(existing, id))
}

export function mergeIdentifiers(customer: Customer, incoming: CustomerIdentifier[]): Customer {
  let result = customer
  for (const id of incoming) {
    result = addIdentifier(result, id)
  }
  return result
}
