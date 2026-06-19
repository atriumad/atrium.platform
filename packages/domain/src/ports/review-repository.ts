import type { Review } from "../entities/review"

export interface ReviewRepository {
  save(review: Review): Promise<void>
  findByLocation(locationId: string): Promise<Review[]>
  findBySourceRef(sourceRef: string): Promise<Review | null>
}
