import type { Review, ReviewPlatform, StarRating } from "@atrium/domain"
import type { Prisma, Review as PrismaReview } from "@prisma/client"

type ReviewRow = PrismaReview

export const reviewMapper = {
  toDomain(row: ReviewRow): Review {
    return {
      id: row.id,
      locationId: row.locationId,
      platform: row.platform as ReviewPlatform,
      rating: row.rating as StarRating,
      content: row.content,
      reply: row.reply,
      publishedAt: row.publishedAt,
      respondedAt: row.respondedAt,
      sentimentScore: row.sentimentScore,
      sourceRef: row.sourceRef,
    }
  },

  toPersistence(review: Review): Prisma.ReviewUncheckedCreateInput {
    return {
      id: review.id,
      locationId: review.locationId,
      platform: review.platform,
      rating: review.rating,
      content: review.content,
      reply: review.reply,
      publishedAt: review.publishedAt,
      respondedAt: review.respondedAt,
      sentimentScore: review.sentimentScore,
      sourceRef: review.sourceRef,
    }
  },
}
