import type { RestaurantGrowthProfile } from "@atrium/application"
import type { PlaceSuggestion } from "./osm-client"
import { toGooglePlaceId } from "./place-id"
import { buildConversionSignals, estimateNegativeReviews, normalizeUrl, readableType } from "./place-utils"
import { scanRestaurantWebsite } from "./website-scanner"

const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1"

const GOOGLE_AUTOCOMPLETE_FIELD_MASK = [
  "suggestions.placePrediction.place",
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text",
  "suggestions.placePrediction.structuredFormat",
  "suggestions.placePrediction.types",
].join(",")

const GOOGLE_SUGGESTION_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "shortFormattedAddress",
  "photos",
].join(",")

const GOOGLE_PLACE_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "shortFormattedAddress",
  "types",
  "primaryTypeDisplayName",
  "websiteUri",
  "nationalPhoneNumber",
  "currentOpeningHours",
  "regularOpeningHours",
  "rating",
  "userRatingCount",
  "reviews",
  "location",
  "photos",
  "editorialSummary",
  "businessStatus",
  "priceLevel",
  "reservable",
  "takeout",
  "delivery",
  "dineIn",
].join(",")

export type GooglePlaceMeta = {
  readonly priceLevel?: string
  readonly reservable?: boolean
  readonly takeout?: boolean
  readonly delivery?: boolean
  readonly dineIn?: boolean
  readonly openingHoursPublished: boolean
  readonly hasEditorialSummary: boolean
}

const DEFAULT_PHOTO_WIDTH = 420
const DEFAULT_PHOTO_HEIGHT = 260

type GoogleLocalizedText = {
  readonly text?: string
}

type GoogleAuthorAttribution = {
  readonly displayName?: string
  readonly uri?: string
}

type GooglePlacePhoto = {
  readonly name?: string
  readonly authorAttributions?: GoogleAuthorAttribution[]
}

type GooglePlaceReview = {
  readonly rating?: number
  readonly publishTime?: string
  readonly text?: GoogleLocalizedText
  readonly authorAttribution?: GoogleAuthorAttribution
}

type GooglePlace = {
  readonly id?: string
  readonly displayName?: GoogleLocalizedText
  readonly primaryTypeDisplayName?: GoogleLocalizedText
  readonly formattedAddress?: string
  readonly shortFormattedAddress?: string
  readonly types?: string[]
  readonly websiteUri?: string
  readonly nationalPhoneNumber?: string
  readonly currentOpeningHours?: { readonly weekdayDescriptions?: string[] }
  readonly regularOpeningHours?: { readonly weekdayDescriptions?: string[] }
  readonly rating?: number
  readonly userRatingCount?: number
  readonly reviews?: GooglePlaceReview[]
  readonly location?: { readonly latitude?: number; readonly longitude?: number }
  readonly photos?: GooglePlacePhoto[]
  readonly editorialSummary?: GoogleLocalizedText
  readonly businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY"
  readonly priceLevel?: "PRICE_LEVEL_FREE" | "PRICE_LEVEL_INEXPENSIVE" | "PRICE_LEVEL_MODERATE" | "PRICE_LEVEL_EXPENSIVE" | "PRICE_LEVEL_VERY_EXPENSIVE"
  readonly reservable?: boolean
  readonly takeout?: boolean
  readonly delivery?: boolean
  readonly dineIn?: boolean
}

type GooglePlacePrediction = {
  readonly place?: string
  readonly placeId?: string
  readonly text?: GoogleLocalizedText
  readonly structuredFormat?: {
    readonly mainText?: GoogleLocalizedText
    readonly secondaryText?: GoogleLocalizedText
  }
  readonly types?: string[]
}

type GoogleAutocompleteResponse = {
  readonly suggestions?: Array<{
    readonly placePrediction?: GooglePlacePrediction
  }>
}

type GooglePhotoMediaResponse = {
  readonly photoUri?: string
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

function googlePlaceDetailsUrl(placeId: string): string {
  return `${GOOGLE_PLACES_BASE_URL}/places/${encodeURIComponent(placeId)}`
}

function googlePhotoAttribution(photo: GooglePlacePhoto | undefined): string | null {
  const attribution = photo?.authorAttributions?.find((item) => item.displayName || item.uri)
  return attribution?.displayName ?? attribution?.uri ?? null
}

function firstPhoto(place: GooglePlace | null): GooglePlacePhoto | null {
  return place?.photos?.find((photo) => photo.name && photo.name.trim().length > 0) ?? null
}

function photoProxyUrl(photoName: string, width = DEFAULT_PHOTO_WIDTH, height = DEFAULT_PHOTO_HEIGHT): string {
  const params = new URLSearchParams({
    name: photoName,
    maxWidthPx: String(width),
    maxHeightPx: String(height),
  })

  return `/api/grader/place-photo?${params.toString()}`
}

function placeIdFromPrediction(prediction: GooglePlacePrediction): string | null {
  const id = prediction.placeId ?? prediction.place?.replace(/^places\//, "")
  const normalized = id?.trim()
  return normalized && normalized.length > 0 ? normalized : null
}

function suggestionName(prediction: GooglePlacePrediction, details: GooglePlace | null): string {
  return details?.displayName?.text
    ?? prediction.structuredFormat?.mainText?.text
    ?? prediction.text?.text
    ?? "Unknown restaurant"
}

function suggestionAddress(prediction: GooglePlacePrediction, details: GooglePlace | null): string {
  return details?.shortFormattedAddress
    ?? details?.formattedAddress
    ?? prediction.structuredFormat?.secondaryText?.text
    ?? prediction.text?.text
    ?? "Address unavailable"
}

async function getGoogleSuggestionDetails(
  googlePlaceId: string,
  fetcher: typeof fetch,
): Promise<GooglePlace | null> {
  const res = await fetcher(googlePlaceDetailsUrl(googlePlaceId), {
    method: "GET",
    headers: googlePlacesHeaders(GOOGLE_SUGGESTION_DETAILS_FIELD_MASK),
  })

  if (!res.ok) return null
  return await res.json() as GooglePlace
}

function computeProfileCompleteness(place: GooglePlace, websiteUrl: string | null): number {
  const hasHours = Boolean(
    place.regularOpeningHours?.weekdayDescriptions?.length
    ?? place.currentOpeningHours?.weekdayDescriptions?.length,
  )
  const checks = [
    place.displayName?.text,
    place.formattedAddress,
    place.types?.length ? place.types.join(",") : null,
    websiteUrl,
    place.nationalPhoneNumber,
    hasHours ? "hours" : null,
    place.editorialSummary?.text,
    place.photos?.length ? "photos" : null,
  ]

  return checks.filter(Boolean).length / checks.length
}

function realNegativeReviewCount(reviews: GooglePlaceReview[] | undefined): number {
  if (!reviews?.length) return 0
  return reviews.filter((r) => typeof r.rating === "number" && r.rating <= 2).length
}

export async function searchGooglePlaces(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<PlaceSuggestion[]> {
  const res = await fetcher(`${GOOGLE_PLACES_BASE_URL}/places:autocomplete`, {
    method: "POST",
    headers: googlePlacesHeaders(GOOGLE_AUTOCOMPLETE_FIELD_MASK),
    body: JSON.stringify({
      input: query,
      includeQueryPredictions: false,
    }),
  })

  if (!res.ok) throw new Error("Unable to search Google Places")

  const data = await res.json() as GoogleAutocompleteResponse
  const predictions = (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is GooglePlacePrediction => Boolean(prediction && placeIdFromPrediction(prediction)))
    .slice(0, 6)

  return await Promise.all(predictions.map(async (prediction) => {
    const googlePlaceId = placeIdFromPrediction(prediction) ?? ""
    const details = await getGoogleSuggestionDetails(googlePlaceId, fetcher).catch(() => null)
    const photo = firstPhoto(details)
    const address = suggestionAddress(prediction, details)

    return {
      placeId: toGooglePlaceId(googlePlaceId),
      name: suggestionName(prediction, details),
      address,
      description: address,
      source: "google" as const,
      photoUrl: photo?.name ? photoProxyUrl(photo.name) : null,
      photoAttribution: googlePhotoAttribution(photo ?? undefined),
    }
  }))
}

export async function getGoogleRestaurantProfile(
  googlePlaceId: string,
  fetcher: typeof fetch = fetch,
): Promise<{ profile: RestaurantGrowthProfile; googleMeta: GooglePlaceMeta }> {
  const res = await fetcher(googlePlaceDetailsUrl(googlePlaceId), {
    method: "GET",
    headers: googlePlacesHeaders(GOOGLE_PLACE_DETAILS_FIELD_MASK),
  })

  if (res.status === 404) throw new Error("Business not found")
  if (!res.ok) throw new Error("Unable to load Google Place details")

  const place = await res.json() as GooglePlace

  if (place.businessStatus === "CLOSED_PERMANENTLY") {
    throw new Error("Business not found")
  }

  const websiteUrl = normalizeUrl(place.websiteUri ?? null)
  const website = await scanRestaurantWebsite(websiteUrl, fetcher)
  const rating = typeof place.rating === "number" && Number.isFinite(place.rating) ? place.rating : 0
  const reviewCount = typeof place.userRatingCount === "number" && Number.isFinite(place.userRatingCount)
    ? Math.max(0, Math.round(place.userRatingCount))
    : 0
  const hasPhone = Boolean(place.nationalPhoneNumber)
  const photo = firstPhoto(place)

  // Google attributes override website HTML scan when available — more reliable
  const enrichedWebsite = {
    ...website,
    hasReservations: place.reservable ?? website.hasReservations,
    hasOnlineOrdering: (place.takeout === true || place.delivery === true) ? true : website.hasOnlineOrdering,
  }

  // Use real review data for negative count when available, fall back to estimate
  const negativeCount = place.reviews?.length
    ? realNegativeReviewCount(place.reviews)
    : estimateNegativeReviews(rating, reviewCount)

  // Use primary type display name if available (cleaner than raw type key)
  const category = place.primaryTypeDisplayName?.text
    ?? readableType(place.types?.[0] ?? "restaurant")

  const googleMeta: GooglePlaceMeta = {
    ...(place.priceLevel !== undefined && { priceLevel: place.priceLevel }),
    ...(place.reservable !== undefined && { reservable: place.reservable }),
    ...(place.takeout !== undefined && { takeout: place.takeout }),
    ...(place.delivery !== undefined && { delivery: place.delivery }),
    ...(place.dineIn !== undefined && { dineIn: place.dineIn }),
    openingHoursPublished: Boolean(
      place.regularOpeningHours?.weekdayDescriptions?.length
      ?? place.currentOpeningHours?.weekdayDescriptions?.length,
    ),
    hasEditorialSummary: Boolean(place.editorialSummary?.text),
  }

  const profile: RestaurantGrowthProfile = {
    id: toGooglePlaceId(googlePlaceId),
    name: place.displayName?.text ?? "Unknown restaurant",
    category,
    address: place.formattedAddress ?? "Address unavailable",
    websiteUrl,
    photoUrl: photo?.name ? photoProxyUrl(photo.name, 900, 540) : null,
    photoAttribution: googlePhotoAttribution(photo ?? undefined),
    googleRating: rating,
    googleReviewCount: reviewCount,
    recentNegativeReviewCount: negativeCount,
    unansweredReviewCount: 0,
    reputationDataSource: rating > 0 || reviewCount > 0 ? "google" : "unavailable",
    profileCompleteness: computeProfileCompleteness(place, websiteUrl),
    localRank: null,
    competitorAverageRating: null,
    website: enrichedWebsite,
    conversion: buildConversionSignals(enrichedWebsite, hasPhone),
  }

  return { profile, googleMeta }
}

export async function getGooglePlacePhotoUri(
  photoName: string,
  dimensions: { readonly maxWidthPx?: number; readonly maxHeightPx?: number } = {},
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const apiKey = getGooglePlacesApiKey()
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is required")

  const url = new URL(`${GOOGLE_PLACES_BASE_URL}/${photoName.replace(/^\/+/, "")}/media`)
  url.searchParams.set("key", apiKey)
  url.searchParams.set("skipHttpRedirect", "true")
  url.searchParams.set("maxWidthPx", String(dimensions.maxWidthPx ?? DEFAULT_PHOTO_WIDTH))
  url.searchParams.set("maxHeightPx", String(dimensions.maxHeightPx ?? DEFAULT_PHOTO_HEIGHT))

  const res = await fetcher(url.toString(), { method: "GET" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Unable to load Google Place photo")

  const data = await res.json() as GooglePhotoMediaResponse
  return data.photoUri ?? null
}
