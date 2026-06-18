export type ReviewPlatform = "google" | "yelp" | "tripadvisor" | "facebook"
export type StarRating = 1 | 2 | 3 | 4 | 5

export type Review = {
  readonly id: string
  readonly locationId: string
  readonly platform: ReviewPlatform
  readonly rating: StarRating
  readonly content: string | null
  readonly reply: string | null
  readonly publishedAt: Date
  readonly respondedAt: Date | null
  readonly sentimentScore: number | null   // -1 to 1
  readonly sourceRef: string
}
