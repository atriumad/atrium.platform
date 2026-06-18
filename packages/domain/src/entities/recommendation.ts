export type RecommendationCategory = "operations" | "marketing" | "reputation" | "growth"
export type RecommendationStatus = "pending" | "accepted" | "dismissed"

export type Recommendation = {
  readonly id: string
  readonly tenantId: string
  readonly category: RecommendationCategory
  readonly title: string
  readonly body: string
  readonly rationale: string
  readonly status: RecommendationStatus
  readonly createdAt: Date
  readonly expiresAt: Date | null
}
