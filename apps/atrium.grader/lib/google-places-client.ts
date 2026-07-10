import type { RestaurantGrowthProfile } from "@atrium/application"
import { toGooglePlaceId } from "./place-id"
import type { PlaceSuggestion } from "./place-suggestion"
import { buildConversionSignals, estimateNegativeReviews, normalizeUrl, readableType } from "./place-utils"
import { recordGooglePlacesUsage } from "./providers/business-provider"
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
  "types",
].join(",")

const GOOGLE_WEBSITE_FIELD_MASK = [
  "websiteUri",
].join(",")

const GOOGLE_PLACE_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "types",
  "primaryType",
  "primaryTypeDisplayName",
  "websiteUri",
  "nationalPhoneNumber",
  "googleMapsUri",
  "currentOpeningHours",
  "regularOpeningHours",
  "priceLevel",
  "rating",
  "userRatingCount",
  "location",
  "businessStatus",
  "dineIn",
  "takeout",
  "delivery",
  "reservable",
  "outdoorSeating",
  "servesBreakfast",
  "servesLunch",
  "servesDinner",
  "servesCoffee",
  "servesDessert",
  "servesBeer",
  "servesWine",
  "paymentOptions",
].join(",")

const GOOGLE_NEARBY_SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.types",
  "places.websiteUri",
].join(",")

export type GooglePlaceMeta = {
  readonly priceLevel?: string
  readonly primaryType?: string
  readonly primaryTypeDisplayName?: string
  readonly googleMapsUri?: string
  readonly reservable?: boolean
  readonly takeout?: boolean
  readonly delivery?: boolean
  readonly dineIn?: boolean
  readonly outdoorSeating?: boolean
  readonly servesBreakfast?: boolean
  readonly servesLunch?: boolean
  readonly servesDinner?: boolean
  readonly servesCoffee?: boolean
  readonly servesDessert?: boolean
  readonly servesBeer?: boolean
  readonly servesWine?: boolean
  readonly acceptsCreditCards?: boolean
  readonly acceptsDebitCards?: boolean
  readonly acceptsCashOnly?: boolean
  readonly acceptsNfc?: boolean
  readonly openingHoursPublished: boolean
  readonly regularHoursPublished: boolean
  readonly hasEditorialSummary: boolean
}

export type GoogleLocalBenchmark = {
  readonly localRank: number | null
  readonly competitorCount: number
  readonly averageRating: number | null
  readonly averageReviewCount: number | null
  readonly relativeRatingPosition: "above" | "near" | "below" | "unknown"
  readonly competitors: ReadonlyArray<{
    readonly placeId: string
    readonly name: string
    readonly rating: number | null
    readonly reviewCount: number | null
    readonly websiteUrl: string | null
  }>
}

const DEFAULT_PHOTO_WIDTH = 420
const DEFAULT_PHOTO_HEIGHT = 260

type GoogleLocalizedText = {
  readonly text?: string
}

type GooglePlace = {
  readonly id?: string
  readonly displayName?: GoogleLocalizedText
  readonly formattedAddress?: string
  readonly shortFormattedAddress?: string
  readonly types?: string[]
  readonly primaryType?: string
  readonly primaryTypeDisplayName?: GoogleLocalizedText
  readonly websiteUri?: string
  readonly nationalPhoneNumber?: string
  readonly googleMapsUri?: string
  readonly currentOpeningHours?: { readonly weekdayDescriptions?: string[] }
  readonly regularOpeningHours?: { readonly weekdayDescriptions?: string[] }
  readonly rating?: number
  readonly userRatingCount?: number
  readonly location?: { readonly latitude?: number; readonly longitude?: number }
  readonly businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY"
  readonly priceLevel?: string
  readonly dineIn?: boolean
  readonly takeout?: boolean
  readonly delivery?: boolean
  readonly reservable?: boolean
  readonly outdoorSeating?: boolean
  readonly servesBreakfast?: boolean
  readonly servesLunch?: boolean
  readonly servesDinner?: boolean
  readonly servesCoffee?: boolean
  readonly servesDessert?: boolean
  readonly servesBeer?: boolean
  readonly servesWine?: boolean
  readonly paymentOptions?: {
    readonly acceptsCreditCards?: boolean
    readonly acceptsDebitCards?: boolean
    readonly acceptsCashOnly?: boolean
    readonly acceptsNfc?: boolean
  }
  readonly editorialSummary?: GoogleLocalizedText
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

type GoogleNearbySearchResponse = {
  readonly places?: GooglePlace[]
}

type GooglePhotoMediaResponse = {
  readonly photoUri?: string
}

export function getGooglePlacesApiKey(): string | null {
  const value = process.env.GOOGLE_PLACES_API_KEY?.trim()
  return value && value.length > 0 ? value : null
}

function googlePlacesHeaders(fieldMask: string, operation: string): HeadersInit {
  const apiKey = getGooglePlacesApiKey()
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is required")
  recordGooglePlacesUsage(operation)

  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldMask,
  }
}

function googlePlaceDetailsUrl(placeId: string): string {
  return `${GOOGLE_PLACES_BASE_URL}/places/${encodeURIComponent(placeId)}`
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
    headers: googlePlacesHeaders(GOOGLE_SUGGESTION_DETAILS_FIELD_MASK, "places.details.search"),
  })

  if (!res.ok) return null
  return await res.json() as GooglePlace
}

function computeProfileCompleteness(place: GooglePlace, websiteUrl: string | null): number {
  const hasHours = Boolean(place.currentOpeningHours?.weekdayDescriptions?.length)
  const checks = [
    place.displayName?.text,
    place.formattedAddress,
    place.types?.length ? place.types.join(",") : null,
    websiteUrl,
    place.nationalPhoneNumber,
    hasHours ? "hours" : null,
  ]

  return checks.filter(Boolean).length / checks.length
}

export async function searchGooglePlaces(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<PlaceSuggestion[]> {
  const res = await fetcher(`${GOOGLE_PLACES_BASE_URL}/places:autocomplete`, {
    method: "POST",
    headers: googlePlacesHeaders(GOOGLE_AUTOCOMPLETE_FIELD_MASK, "places.autocomplete"),
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
    const address = suggestionAddress(prediction, details)

    return {
      placeId: toGooglePlaceId(googlePlaceId),
      name: suggestionName(prediction, details),
      address,
      description: address,
      source: "google" as const,
    }
  }))
}

function nearbySearchType(category: string): string {
  const value = category.toLowerCase()
  if (value.includes("cafe") || value.includes("coffee")) return "cafe"
  if (value.includes("bar")) return "bar"
  if (value.includes("bakery")) return "bakery"
  return "restaurant"
}

function finiteNumberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function integerOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : null
}

function average(values: ReadonlyArray<number | null>): number | null {
  const numeric = values.filter((value): value is number => typeof value === "number")
  if (numeric.length === 0) return null
  return Math.round((numeric.reduce((sum, value) => sum + value, 0) / numeric.length) * 10) / 10
}

function relativeRatingPosition(
  targetRating: number | null,
  averageRating: number | null,
): GoogleLocalBenchmark["relativeRatingPosition"] {
  if (targetRating === null || averageRating === null) return "unknown"
  const delta = targetRating - averageRating
  if (delta >= 0.15) return "above"
  if (delta <= -0.15) return "below"
  return "near"
}

function estimateRatingRank(input: {
  readonly targetRating: number | null
  readonly targetReviewCount: number | null
  readonly competitors: GoogleLocalBenchmark["competitors"]
}): number | null {
  if (input.targetRating === null) return null

  const ranked = [
    {
      placeId: "__target__",
      rating: input.targetRating,
      reviewCount: input.targetReviewCount,
    },
    ...input.competitors,
  ].sort((a, b) => {
    const ratingDelta = (b.rating ?? -1) - (a.rating ?? -1)
    if (ratingDelta !== 0) return ratingDelta
    return (b.reviewCount ?? -1) - (a.reviewCount ?? -1)
  })

  const index = ranked.findIndex((place) => place.placeId === "__target__")
  return index >= 0 ? index + 1 : null
}

export async function getGoogleLocalBenchmark(
  input: {
    readonly googlePlaceId: string
    readonly location: { readonly latitude: number; readonly longitude: number } | null
    readonly category: string
    readonly targetRating?: number | null
    readonly targetReviewCount?: number | null
  },
  fetcher: typeof fetch = fetch,
): Promise<GoogleLocalBenchmark | null> {
  if (!input.location) return null

  const res = await fetcher(`${GOOGLE_PLACES_BASE_URL}/places:searchNearby`, {
    method: "POST",
    headers: googlePlacesHeaders(GOOGLE_NEARBY_SEARCH_FIELD_MASK, "places.nearby.benchmark"),
    body: JSON.stringify({
      includedTypes: [nearbySearchType(input.category)],
      maxResultCount: 10,
      rankPreference: "POPULARITY",
      locationRestriction: {
        circle: {
          center: {
            latitude: input.location.latitude,
            longitude: input.location.longitude,
          },
          radius: 1_500,
        },
      },
    }),
  })

  if (!res.ok) return null

  const data = await res.json() as GoogleNearbySearchResponse
  const places = data.places ?? []
  const targetPlace = places.find((place) => place.id === input.googlePlaceId)
  const competitors = places
    .filter((place) => place.id && place.id !== input.googlePlaceId)
    .map((place) => ({
      placeId: place.id ?? "",
      name: place.displayName?.text ?? "Nearby restaurant",
      rating: finiteNumberOrNull(place.rating),
      reviewCount: integerOrNull(place.userRatingCount),
      websiteUrl: normalizeUrl(place.websiteUri ?? null),
    }))
    .filter((place) => place.placeId.length > 0)

  if (competitors.length < 3) return null

  const averageRating = average(competitors.map((place) => place.rating))
  const averageReviewCount = average(competitors.map((place) => place.reviewCount))
  const targetRating = finiteNumberOrNull(input.targetRating ?? targetPlace?.rating)
  const targetReviewCount = integerOrNull(input.targetReviewCount ?? targetPlace?.userRatingCount)

  return {
    localRank: estimateRatingRank({ targetRating, targetReviewCount, competitors }),
    competitorCount: competitors.length,
    averageRating,
    averageReviewCount,
    relativeRatingPosition: relativeRatingPosition(targetRating, averageRating),
    competitors,
  }
}

export async function getGoogleRestaurantProfile(
  googlePlaceId: string,
  fetcher: typeof fetch = fetch,
): Promise<{ profile: RestaurantGrowthProfile; googleMeta: GooglePlaceMeta; localBenchmark: GoogleLocalBenchmark | null }> {
  const res = await fetcher(googlePlaceDetailsUrl(googlePlaceId), {
    method: "GET",
    headers: googlePlacesHeaders(GOOGLE_PLACE_DETAILS_FIELD_MASK, "places.details.profile"),
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

  const negativeCount = estimateNegativeReviews(rating, reviewCount)
  const category = readableType(place.types?.[0] ?? "restaurant")
  const location = typeof place.location?.latitude === "number" && typeof place.location.longitude === "number"
    ? { latitude: place.location.latitude, longitude: place.location.longitude }
    : null
  const localBenchmark = await getGoogleLocalBenchmark({
    googlePlaceId,
    location,
    category,
    targetRating: rating,
    targetReviewCount: reviewCount,
  }, fetcher).catch(() => null)

  const googleMeta: GooglePlaceMeta = {
    ...(place.priceLevel !== undefined ? { priceLevel: place.priceLevel } : {}),
    ...(place.primaryType !== undefined ? { primaryType: place.primaryType } : {}),
    ...(place.primaryTypeDisplayName?.text !== undefined ? { primaryTypeDisplayName: place.primaryTypeDisplayName.text } : {}),
    ...(place.googleMapsUri !== undefined ? { googleMapsUri: place.googleMapsUri } : {}),
    ...(typeof place.dineIn === "boolean" ? { dineIn: place.dineIn } : {}),
    ...(typeof place.takeout === "boolean" ? { takeout: place.takeout } : {}),
    ...(typeof place.delivery === "boolean" ? { delivery: place.delivery } : {}),
    ...(typeof place.reservable === "boolean" ? { reservable: place.reservable } : {}),
    ...(typeof place.outdoorSeating === "boolean" ? { outdoorSeating: place.outdoorSeating } : {}),
    ...(typeof place.servesBreakfast === "boolean" ? { servesBreakfast: place.servesBreakfast } : {}),
    ...(typeof place.servesLunch === "boolean" ? { servesLunch: place.servesLunch } : {}),
    ...(typeof place.servesDinner === "boolean" ? { servesDinner: place.servesDinner } : {}),
    ...(typeof place.servesCoffee === "boolean" ? { servesCoffee: place.servesCoffee } : {}),
    ...(typeof place.servesDessert === "boolean" ? { servesDessert: place.servesDessert } : {}),
    ...(typeof place.servesBeer === "boolean" ? { servesBeer: place.servesBeer } : {}),
    ...(typeof place.servesWine === "boolean" ? { servesWine: place.servesWine } : {}),
    ...(typeof place.paymentOptions?.acceptsCreditCards === "boolean"
      ? { acceptsCreditCards: place.paymentOptions.acceptsCreditCards }
      : {}),
    ...(typeof place.paymentOptions?.acceptsDebitCards === "boolean"
      ? { acceptsDebitCards: place.paymentOptions.acceptsDebitCards }
      : {}),
    ...(typeof place.paymentOptions?.acceptsCashOnly === "boolean"
      ? { acceptsCashOnly: place.paymentOptions.acceptsCashOnly }
      : {}),
    ...(typeof place.paymentOptions?.acceptsNfc === "boolean"
      ? { acceptsNfc: place.paymentOptions.acceptsNfc }
      : {}),
    openingHoursPublished: Boolean(place.currentOpeningHours?.weekdayDescriptions?.length),
    regularHoursPublished: Boolean(place.regularOpeningHours?.weekdayDescriptions?.length),
    hasEditorialSummary: Boolean(place.editorialSummary?.text),
  }

  const profile: RestaurantGrowthProfile = {
    id: toGooglePlaceId(googlePlaceId),
    name: place.displayName?.text ?? "Unknown restaurant",
    category,
    address: place.formattedAddress ?? "Address unavailable",
    websiteUrl,
    googleRating: rating,
    googleReviewCount: reviewCount,
    recentNegativeReviewCount: negativeCount,
    unansweredReviewCount: 0,
    reputationDataSource: "google",
    profileCompleteness: computeProfileCompleteness(place, websiteUrl),
    localRank: localBenchmark?.localRank ?? null,
    competitorAverageRating: localBenchmark?.averageRating ?? null,
    website,
    conversion: buildConversionSignals(website, hasPhone),
  }

  return { profile, googleMeta, localBenchmark }
}

export async function getGoogleWebsiteUrl(
  googlePlaceId: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const res = await fetcher(googlePlaceDetailsUrl(googlePlaceId), {
    method: "GET",
    headers: googlePlacesHeaders(GOOGLE_WEBSITE_FIELD_MASK, "places.details.website"),
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error("Unable to load Google Place website")

  const place = await res.json() as GooglePlace
  return normalizeUrl(place.websiteUri ?? null)
}

export async function getGooglePlacePhotoUri(
  photoName: string,
  dimensions: { readonly maxWidthPx?: number; readonly maxHeightPx?: number } = {},
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const apiKey = getGooglePlacesApiKey()
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is required")
  recordGooglePlacesUsage("places.photo")

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
