export type LoyaltyConfig = {
  bronze:    { minOrders: number; minSpentCents: number }
  silver:    { minOrders: number; minSpentCents: number }
  gold:      { minOrders: number; minSpentCents: number }
  vipTopPct: number  // e.g. 0.05 = top 5%
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  bronze:    { minOrders: 3,  minSpentCents: 15000 },
  silver:    { minOrders: 8,  minSpentCents: 40000 },
  gold:      { minOrders: 20, minSpentCents: 100000 },
  vipTopPct: 0.05,
}

export type Tenant = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly timezone: string   // IANA e.g. "America/New_York"
  readonly createdAt: Date
  readonly loyaltyConfig: LoyaltyConfig
}
