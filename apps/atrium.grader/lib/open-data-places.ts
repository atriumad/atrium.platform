import type { GoogleLocalBenchmark, GooglePlaceMeta } from "./google-places-client"
import { getGooglePlacesApiKey, getGoogleRestaurantProfile, getGoogleWebsiteUrl, searchGooglePlaces } from "./google-places-client"
import { parseGooglePlaceId } from "./place-id"
import type { ManualReputationInput } from "./place-utils"
import { BusinessProviderConfigError } from "./providers/business-provider"

export type { GoogleLocalBenchmark, GooglePlaceMeta } from "./google-places-client"
export type { PlaceSuggestion } from "./place-suggestion"
export type { ManualReputationInput } from "./place-utils"

export class OpenDataPlacesLookupError extends Error {}

function googlePlaceIdOrThrow(placeId: string): string {
  const googlePlaceId = parseGooglePlaceId(placeId)
  if (!googlePlaceId) throw new Error("placeId is required")
  return googlePlaceId
}

function toLookupError(error: unknown): OpenDataPlacesLookupError {
  if (error instanceof BusinessProviderConfigError) {
    return new OpenDataPlacesLookupError(error.message)
  }

  return new OpenDataPlacesLookupError(error instanceof Error ? error.message : String(error))
}

function assertGoogleProviderConfigured(): void {
  if (!getGooglePlacesApiKey()) {
    throw new BusinessProviderConfigError("GOOGLE_PLACES_API_KEY is required for Google Places restaurant data")
  }
}

export async function searchRestaurantPlaces(
  query: string,
  fetcher: typeof fetch = fetch,
) {
  const input = query.trim()
  if (input.length < 3) return []

  try {
    assertGoogleProviderConfigured()
  } catch (e) {
    throw toLookupError(e)
  }

  return searchGooglePlaces(input, fetcher).catch((e) => {
    throw toLookupError(e)
  })
}

export async function getRestaurantGrowthProfileFromPlace(
  placeId: string,
  _reputation: ManualReputationInput | undefined,
  fetcher: typeof fetch = fetch,
): Promise<{
  profile: import("@atrium/application").RestaurantGrowthProfile
  googleMeta: GooglePlaceMeta | null
  localBenchmark: GoogleLocalBenchmark | null
}> {
  let googlePlaceId: string
  try {
    assertGoogleProviderConfigured()
    googlePlaceId = googlePlaceIdOrThrow(placeId)
  } catch (e) {
    throw toLookupError(e)
  }

  return getGoogleRestaurantProfile(googlePlaceId, fetcher).catch((e) => {
    // Preserve original error messages for HTTP status mapping in route.ts
    throw toLookupError(e)
  })
}

export async function getWebsiteUrlForPlace(
  placeId: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  let googlePlaceId: string
  try {
    assertGoogleProviderConfigured()
    googlePlaceId = googlePlaceIdOrThrow(placeId)
  } catch (e) {
    throw toLookupError(e)
  }

  return getGoogleWebsiteUrl(googlePlaceId, fetcher).catch((e) => {
    throw toLookupError(e)
  })
}
