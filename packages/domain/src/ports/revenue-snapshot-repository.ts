import type { PeriodType, RevenueSnapshot } from "../entities/revenue-snapshot"

export interface RevenueSnapshotRepository {
  save(snapshot: RevenueSnapshot): Promise<void>
  findByLocation(
    locationId: string,
    periodType: PeriodType,
  ): Promise<RevenueSnapshot[]>
}
