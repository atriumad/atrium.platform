import type { DateRange } from "@atrium/shared"
import type { TrafficSnapshot } from "../entities/traffic-snapshot"

export interface TrafficSnapshotRepository {
  save(snapshot: TrafficSnapshot): Promise<void>
  findByLocation(locationId: string, range: DateRange): Promise<TrafficSnapshot[]>
}
