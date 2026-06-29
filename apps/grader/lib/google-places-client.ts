import type { RestaurantGrowthProfile } from "@atrium/application"
import { toGooglePlaceId } from "./place-id"
import { buildConversionSignals, estimateNegativeReviews, normalizeUrl, readableType } from "./place-utils"
import type { PlaceSuggestion } from "./osm-client"
import { scanRestaurantWebsite } from "./website-scanner"

const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1"

const GOOGLE_TEXT_SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.types",
].join(",")

const GOOGLE_PLACE_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "types",
  "websiteUri",
  "nationalPhoneNumber",
  "currentOpeningHours",
  "rating",
  "userRatingCount",
  "location",
].join(",")

type GoogleLocalizedText = {
  readonly text?: string
}

type GooglePlace = {
  readonly id?: string
  readonly displayName?: GoogleLocalizedText
  readonly formattedAddress?: string
  readonly types?: string[]
  readonly websiteUri?: string
  readonly nationalPhoneNumber?: string
  readonly currentOpeningHours?: {
    readonly weekdayDescriptions?: string[]
  }
  readonly rating?: number
  readonly userRatingCount?: number
  readonly location?: {
    readonly latitude?: number
    readonly longitude?: number
  }
}

type GoogleTextSearchResponse = {
  readonly places?: GooglePlace[]
}

export function getGooglePlacesApiKey(): string | null {
  const value = process.env.GOOGLE_PLACES_API_KEY?.trim()
  return value && value.length > 0 ? value : null
}

function googlePlacesHeaders(fieldMask: string): HeadersInit {
  const apiKey = getGooglePlacesApiKey()
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is required")

  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldMask,
  }
}

function computeProfileCompleteness(place: GooglePlace, websiteUrl: string | null): number {
  const checks = [
    place.displayName?.text,
    place.formattedAddress,
    place.types?.length ? place.types.join(",") : null,
    websiteUrl,
    place.nationalPhoneNumber,
    place.currentOpeningHours?.weekdayDescriptions?.length ? "hours" : null,
  ]

  return checks.filter(Boolean).length / checks.length
}

export async function searchGooglePlaces(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<PlaceSuggestion[]> {
  const res = await fetcher(`${GOOGLE_PLACES_BASE_URL}/places:searchText`, {
    method: "POST",
    headers: googlePlacesHeaders(GOOGLE_TEXT_SEARCH_FIELD_MASK),
    body: JSON.stringify({
      includedType: "restaurant",
      maxResultCount: 6,
      textQuery: query,
    }),
  })

  if (!res.ok) throw new Error("Unable to search Google Places")

  const data = await res.json() as GoogleTextSearchResponse
  return (data.places ?? [])
    .filter((place) => Boolean(place.id))
    .map((place) => ({
      placeId: toGooglePlaceId(place.id ?? ""),
      name: place.displayName?.text ?? "Unknown restaurant",
      address: place.formattedAddress ?? "Address unavailable",
      description: place.formattedAddress ?? place.displayName?.text ?? "Address unavailable",
      source: "google",
    }))
}

export async function getGoogleRestaurantProfile(
  googlePlaceId: string,
  fetcher: typeof fetch = fetch,
): Promise<RestaurantGrowthProfile> {
  const res = await fetcher(`${GOOGLE_PLACES_BASE_URL}/places/${encodeURIComponent(googlePlaceId)}`, {
    method: "GET",
    headers: googlePlacesHeaders(GOOGLE_PLACE_DETAILS_FIELD_MASK),
  })

  if (res.status === 404) throw new Error("Business not found")
  if (!res.ok) throw new Error("Unable to load Google Place details")

  const place = await res.json() as GooglePlace
  const websiteUrl = normalizeUrl(place.websiteUri ?? null)
  const website = await scanRestaurantWebsite(websiteUrl, fetcher)
  const rating = typeof place.rating === "number" && Number.isFinite(place.rating) ? place.rating : 0
  const reviewCount = typeof place.userRatingCount === "number" && Number.isFinite(place.userRatingCount)
    ? Math.max(0, Math.round(place.userRatingCount))
    : 0
  const hasPhone = Boolean(place.nationalPhoneNumber)

  return {
    id: toGooglePlaceId(googlePlaceId),
    name: place.displayName?.text ?? "Unknown restaurant",
    category: readableType(place.types?.[0] ?? "restaurant"),
    address: place.formattedAddress ?? "Address unavailable",
    websiteUrl,
    googleRating: rating,
    googleReviewCount: reviewCount,
    recentNegativeReviewCount: estimateNegativeReviews(rating, reviewCount),
    unansweredReviewCount: 0,
    reputationDataSource: rating > 0 || reviewCount > 0 ? "google" : "unavailable",
    profileCompleteness: computeProfileCompleteness(place, websiteUrl),
    localRank: null,
    competitorAverageRating: null,
    website,
    conversion: buildConversionSignals(website, hasPhone),
  }
}
