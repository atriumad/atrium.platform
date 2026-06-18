import type { Money } from "@atrium/shared"

export type PeriodType = "daily" | "weekly" | "monthly"

export type RevenueSnapshot = {
  readonly id: string
  readonly locationId: string
  readonly periodType: PeriodType
  readonly periodStart: Date
  readonly totalRevenue: Money
  readonly orderCount: number
  readonly avgTicket: Money
}
