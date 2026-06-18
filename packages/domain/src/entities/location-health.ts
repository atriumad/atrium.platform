export type HealthTrend = "up" | "stable" | "down"

export type HealthDimensions = {
  readonly revenue: number     // 0–100, weight 30%
  readonly reputation: number  // 0–100, weight 30%
  readonly traffic: number     // 0–100, weight 20%
  readonly retention: number   // 0–100, weight 20%
}

export type LocationHealth = {
  readonly id: string
  readonly locationId: string
  readonly computedAt: Date
  readonly score: number
  readonly dimensions: HealthDimensions
  readonly trend: HealthTrend
}

export function computeOverallScore(d: HealthDimensions): number {
  return d.revenue * 0.30 + d.reputation * 0.30 + d.traffic * 0.20 + d.retention * 0.20
}
