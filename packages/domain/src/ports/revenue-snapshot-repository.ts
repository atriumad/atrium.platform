import type { RevenueSnapshot, PeriodType } from "../entities/revenue-snapshot"

export interface RevenueSnapshotRepository {
  save(snapshot: RevenueSnapshot): Promise<void>
  findByLocation(
    locationId: string,
    periodType: PeriodType,
  ): Promise<RevenueSnapshot[]>
}
