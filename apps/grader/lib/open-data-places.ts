import { getGooglePlacesApiKey, getGoogleRestaurantProfile, searchGooglePlaces } from "./google-places-client"
import { getOsmRestaurantProfile, getOsmWebsiteUrl, searchOsmPlaces } from "./osm-client"
import { parseGooglePlaceId } from "./place-id"
import type { ManualReputationInput } from "./place-utils"

// Provider selection: Google Places is parked until key is present and flag is enabled.
const USE_GOOGLE_PLACES = false

export type { PlaceSuggestion } from "./osm-client"
export type { ManualReputationInput } from "./place-utils"

export class OpenDataPlacesLookupError extends Error {}

export async function searchRestaurantPlaces(
  query: string,
  fetcher: typeof fetch = fetch,
) {
  const input = query.trim()
  if (input.length < 3) return []

  if (USE_GOOGLE_PLACES && getGooglePlacesApiKey()) {
    return searchGooglePlaces(input, fetcher).catch((e) => {
      throw new OpenDataPlacesLookupError(String(e))
    })
  }

  return searchOsmPlaces(input, fetcher).catch((e) => {
    throw new OpenDataPlacesLookupError(String(e))
  })
}

export async function getRestaurantGrowthProfileFromPlace(
  placeId: string,
  reputation: ManualReputationInput | undefined,
  fetcher: typeof fetch = fetch,
) {
  if (USE_GOOGLE_PLACES) {
    const googlePlaceId = parseGooglePlaceId(placeId)
    if (googlePlaceId) {
      return getGoogleRestaurantProfile(googlePlaceId, fetcher).catch((e) => {
        throw new OpenDataPlacesLookupError(String(e))
      })
    }
  }

  return getOsmRestaurantProfile(placeId, reputation, fetcher).catch((e) => {
    // Preserve original error messages for HTTP status mapping in route.ts
    throw new OpenDataPlacesLookupError(e instanceof Error ? e.message : String(e))
  })
}

export async function getWebsiteUrlForPlace(
  placeId: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  return getOsmWebsiteUrl(placeId, fetcher)
}
