import type { Review, HealthTrend } from "@atrium/domain"

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function computeRevenueScore(currentRevenue: number, previousRevenue: number): number {
  if (previousRevenue === 0) return 50
  const change = (currentRevenue - previousRevenue) / previousRevenue
  return clamp(50 + change * 100, 0, 100)
}

export function computeReputationScore(reviews: Review[]): number {
  if (reviews.length === 0) return 50

  const ratings = reviews.map((r) => r.rating)
  const avgRating = mean(ratings)

  const sentiments = reviews
    .map((r) => r.sentimentScore)
    .filter((s): s is number => s !== null)
  const avgSentiment = mean(sentiments)

  return clamp((avgRating / 5) * 90 + avgSentiment * 10, 0, 100)
}

export function computeTrafficScore(currentSessions: number, previousSessions: number): number {
  if (previousSessions === 0) return 50
  const change = (currentSessions - previousSessions) / previousSessions
  return clamp(50 + change * 100, 0, 100)
}

export function computeRetentionScore(
  currentCustomerIds: string[],
  returningCustomerIds: string[],
): number {
  if (currentCustomerIds.length === 0) return 50
  const returningSet = new Set(returningCustomerIds)
  const returning = currentCustomerIds.filter((id) => returningSet.has(id)).length
  return clamp((returning / currentCustomerIds.length) * 100, 0, 100)
}

export function computeTrend(currentScore: number, previousScores: number[]): HealthTrend {
  if (previousScores.length < 3) return "stable"
  const avgPrevious = mean(previousScores)
  const diff = currentScore - avgPrevious
  if (diff > 3) return "up"
  if (diff < -3) return "down"
  return "stable"
}
