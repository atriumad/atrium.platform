import type { RestaurantGrowthProfile } from "@atrium/application"
import type { PlaceSuggestion } from "../osm-client"
import type { ManualReputationInput } from "../place-utils"

export type BusinessDataProviderName = "osm" | "google"
export type BusinessDataProviderMode = BusinessDataProviderName | "auto"

export type BusinessDataProvider = {
  readonly name: BusinessDataProviderName
  search(query: string, fetcher?: typeof fetch): Promise<PlaceSuggestion[]>
  getProfile(
    placeId: string,
    reputation?: ManualReputationInput,
    fetcher?: typeof fetch,
  ): Promise<RestaurantGrowthProfile>
}

export class BusinessProviderConfigError extends Error {}

export function configuredBusinessProviderMode(): BusinessDataProviderMode {
  const value = process.env.GRADER_BUSINESS_PROVIDER?.trim().toLowerCase()

  if (value === "google" || value === "auto") return value
  return "osm"
}
