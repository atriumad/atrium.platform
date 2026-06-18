import type { LocationHealth } from "../entities/location-health"

export interface HealthRepository {
  save(health: LocationHealth): Promise<void>
  findLatest(locationId: string): Promise<LocationHealth | null>
  findHistory(locationId: string, limit: number): Promise<LocationHealth[]>
}
