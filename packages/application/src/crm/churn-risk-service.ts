export type ChurnRiskParams = {
  daysSinceLastOrder: number
  totalOrders: number
  visitFrequency: number | null
  daysSinceFirstSeen?: number   // for one-time customer rule
  loyaltyTier?: string          // for high-value customer rule
}

export type ChurnRiskResult = {
  score: number
  reasons: string[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function computeRecencyFactor(daysSinceLastOrder: number): number {
  if (daysSinceLastOrder <= 7) return 0
  if (daysSinceLastOrder <= 14) return 0.2
  if (daysSinceLastOrder <= 30) return 0.4
  if (daysSinceLastOrder <= 60) return 0.7
  if (daysSinceLastOrder <= 90) return 0.9
  return 1.0
}

function computeFrequencyDropFactor(
  daysSinceLastOrder: number,
  totalOrders: number,
  visitFrequency: number | null,
): number {
  if (visitFrequency === null || totalOrders < 3) return 0.3
  if (daysSinceLastOrder > visitFrequency * 3) return 1.0
  if (daysSinceLastOrder > visitFrequency * 2) return 0.7
  if (daysSinceLastOrder > visitFrequency * 1.5) return 0.4
  return 0
}

export function computeChurnRiskScore(params: ChurnRiskParams): ChurnRiskResult {
  const reasons: string[] = []

  const recencyScore = computeRecencyFactor(params.daysSinceLastOrder)
  if (params.daysSinceLastOrder > 14) {
    reasons.push(`Last visit was ${params.daysSinceLastOrder} days ago`)
  }

  const freqDropScore = computeFrequencyDropFactor(
    params.daysSinceLastOrder,
    params.totalOrders,
    params.visitFrequency,
  )
  if (freqDropScore >= 0.5) {
    reasons.push("Visit frequency has dropped significantly")
  }

  if (params.totalOrders < 3) {
    reasons.push("New customer with fewer than 3 orders")
  }

  let base = clamp(recencyScore * 0.6 + freqDropScore * 0.4, 0, 1)

  // One-time customer who hasn't returned in 60+ days → high risk
  if (params.totalOrders === 1 && (params.daysSinceFirstSeen ?? 0) > 60) {
    base = clamp(base + 0.5, 0, 1)
    reasons.push("One-time customer, never returned after 60 days")
  }

  // High-value customers (gold/vip) who haven't visited in 30+ days → critical risk
  if (
    (params.loyaltyTier === "gold" || params.loyaltyTier === "vip") &&
    params.daysSinceLastOrder > 30
  ) {
    base = clamp(base + 0.6, 0, 1)
    reasons.push(`High-value ${params.loyaltyTier} customer inactive for ${params.daysSinceLastOrder} days`)
  }

  return { score: base, reasons }
}
