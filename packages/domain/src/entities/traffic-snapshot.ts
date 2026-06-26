export type TrafficSource = "organic" | "paid" | "direct" | "social" | "referral"

export type TrafficSnapshot = {
  readonly id: string
  readonly locationId: string
  readonly periodStart: Date
  readonly periodEnd: Date
  readonly sessions: number
  readonly users: number
  readonly source: TrafficSource
}
