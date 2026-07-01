import { getGooglePlacesApiKey, getGoogleRestaurantProfile, searchGooglePlaces } from "./google-places-client"
import { getOsmRestaurantProfile, getOsmWebsiteUrl, searchOsmPlaces } from "./osm-client"
import { parseGooglePlaceId } from "./place-id"
import type { ManualReputationInput } from "./place-utils"
import { BusinessProviderConfigError, configuredBusinessProviderMode } from "./providers/business-provider"

export type { PlaceSuggestion } from "./osm-client"
export type { ManualReputationInput } from "./place-utils"

export class OpenDataPlacesLookupError extends Error {}

function toLookupError(error: unknown): OpenDataPlacesLookupError {
  if (error instanceof BusinessProviderConfigError) {
    return new OpenDataPlacesLookupError(error.message)
  }

  return new OpenDataPlacesLookupError(error instanceof Error ? error.message : String(error))
}

function shouldUseGoogleForSearch(): boolean {
  const mode = configuredBusinessProviderMode()
  const hasKey = Boolean(getGooglePlacesApiKey())

  if (mode === "google" && !hasKey) {
    throw new BusinessProviderConfigError("GOOGLE_PLACES_API_KEY is required when GRADER_BUSINESS_PROVIDER=google")
  }

  return mode === "google" || (mode === "auto" && hasKey)
}

function shouldUseGoogleForProfile(placeId: string): boolean {
  const mode = configuredBusinessProviderMode()
  const hasKey = Boolean(getGooglePlacesApiKey())

  if (mode === "google" && !hasKey) {
    throw new BusinessProviderConfigError("GOOGLE_PLACES_API_KEY is required when GRADER_BUSINESS_PROVIDER=google")
  }

  return Boolean(parseGooglePlaceId(placeId)) && (mode === "google" || (mode === "auto" && hasKey))
}

export async function searchRestaurantPlaces(
  query: string,
  fetcher: typeof fetch = fetch,
) {
  const input = query.trim()
  if (input.length < 3) return []

  let useGoogle: boolean
  try {
    useGoogle = shouldUseGoogleForSearch()
  } catch (e) {
    throw toLookupError(e)
  }

  if (useGoogle) {
    return searchGooglePlaces(input, fetcher).catch((e) => {
      throw toLookupError(e)
    })
  }

  return searchOsmPlaces(input, fetcher).catch((e) => {
    throw toLookupError(e)
  })
}

export async function getRestaurantGrowthProfileFromPlace(
  placeId: string,
  reputation: ManualReputationInput | undefined,
  fetcher: typeof fetch = fetch,
) {
  let useGoogle: boolean
  try {
    useGoogle = shouldUseGoogleForProfile(placeId)
  } catch (e) {
    throw toLookupError(e)
  }

  if (useGoogle) {
    const googlePlaceId = parseGooglePlaceId(placeId)
    if (googlePlaceId) {
      return getGoogleRestaurantProfile(googlePlaceId, fetcher).catch((e) => {
        throw toLookupError(e)
      })
    }
  }

  return getOsmRestaurantProfile(placeId, reputation, fetcher).catch((e) => {
    // Preserve original error messages for HTTP status mapping in route.ts
    throw toLookupError(e)
  })
}

export async function getWebsiteUrlForPlace(
  placeId: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  return getOsmWebsiteUrl(placeId, fetcher)
}
