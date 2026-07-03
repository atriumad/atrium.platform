import type { RestaurantGrowthProfile } from "@atrium/application"
import { fetchLocalBenchmark } from "./local-benchmark"
import { parseGooglePlaceId, parsePlaceId, toPlaceId } from "./place-id"
import type { ManualReputationInput } from "./place-utils"
import { buildConversionSignals, deriveLocalRank, estimateNegativeReviews, normalizeReputation, normalizeUrl, readableType } from "./place-utils"
import { scanRestaurantWebsite } from "./website-scanner"

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"

const FOOD_TYPES = new Set([
  "bakery",
  "bar",
  "cafe",
  "fast_food",
  "food_court",
  "ice_cream",
  "pub",
  "restaurant",
])

export type PlaceSuggestion = {
  readonly placeId: string
  readonly name: string
  readonly address: string
  readonly description: string
  readonly source: "google" | "openstreetmap"
  readonly photoUrl?: string | null
  readonly photoAttribution?: string | null
}

type NominatimPlace = {
  readonly place_id?: number
  readonly osm_type?: "node" | "way" | "relation"
  readonly osm_id?: number
  readonly lat?: string
  readonly lon?: string
  readonly category?: string
  readonly type?: string
  readonly display_name?: string
  readonly name?: string
  readonly address?: Record<string, string | undefined>
  readonly namedetails?: Record<string, string | undefined>
  readonly extratags?: Record<string, string | undefined>
}

function openDataHeaders(): HeadersInit {
  return {
    "Accept-Language": "en",
    "User-Agent": process.env.OSM_USER_AGENT ?? "AtriumGrader/0.1 (https://atrium.local)",
  }
}

function isFoodPlace(place: NominatimPlace): boolean {
  if (place.category === "amenity" && place.type && FOOD_TYPES.has(place.type)) return true
  if (place.category === "shop" && place.type === "bakery") return true
  return Boolean(readTag(place, ["cuisine"])) && Boolean(place.osm_type && place.osm_id)
}

function placeName(place: NominatimPlace): string {
  return place.namedetails?.name
    ?? place.name
    ?? readTag(place, ["name", "brand"])
    ?? firstDisplayNamePart(place)
    ?? "Unknown restaurant"
}

function firstDisplayNamePart(place: NominatimPlace): string | null {
  const first = place.display_name?.split(",")[0]?.trim()
  return first && first.length > 0 ? first : null
}

function shortAddress(place: NominatimPlace): string {
  const address = place.address
  if (!address) return place.display_name ?? "Address unavailable"

  return [
    address.road,
    address.neighbourhood ?? address.suburb,
    address.city ?? address.town ?? address.village,
    address.state,
  ].filter(Boolean).join(", ") || place.display_name || "Address unavailable"
}

function readTag(place: NominatimPlace, keys: string[]): string | null {
  for (const key of keys) {
    const value = place.extratags?.[key] ?? place.namedetails?.[key]
    if (value && value.trim().length > 0) return value.trim()
  }

  return null
}

function computeProfileCompleteness(place: NominatimPlace, websiteUrl: string | null): number {
  const checks = [
    placeName(place),
    place.display_name ?? shortAddress(place),
    place.type,
    websiteUrl,
    readTag(place, ["phone", "contact:phone"]),
    readTag(place, ["opening_hours"]),
  ]

  return checks.filter(Boolean).length / checks.length
}

function toGrowthProfile(
  fallbackId: string,
  place: NominatimPlace,
  websiteUrl: string | null,
  website: Awaited<ReturnType<typeof scanRestaurantWebsite>>,
  benchmark: Awaited<ReturnType<typeof fetchLocalBenchmark>>,
  reputation: ManualReputationInput | undefined,
): RestaurantGrowthProfile {
  const manualReputation = normalizeReputation(reputation)
  const rating = manualReputation.rating ?? 0
  const reviewCount = manualReputation.reviewCount ?? 0
  const phone = readTag(place, ["phone", "contact:phone"])

  return {
    id: fallbackId,
    name: placeName(place),
    category: readableType(readTag(place, ["cuisine"]) ?? place.type ?? "restaurant"),
    address: place.display_name ?? shortAddress(place),
    websiteUrl,
    googleRating: rating,
    googleReviewCount: reviewCount,
    recentNegativeReviewCount: manualReputation.rating === null
      ? 0
      : estimateNegativeReviews(rating, reviewCount),
    unansweredReviewCount: 0,
    reputationDataSource: manualReputation.rating === null && manualReputation.reviewCount === null
      ? "unavailable"
      : "manual",
    profileCompleteness: computeProfileCompleteness(place, websiteUrl),
    localRank: deriveLocalRank(Boolean(websiteUrl), benchmark),
    competitorAverageRating: null,
    website,
    conversion: buildConversionSignals(website, Boolean(phone)),
  }
}

export async function searchOsmPlaces(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
    dedupe: "1",
    limit: "8",
  })

  const res = await fetcher(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
    method: "GET",
    headers: openDataHeaders(),
  })

  if (!res.ok) {
    throw new Error("Unable to search open restaurant data")
  }

  const data = await res.json() as NominatimPlace[]
  return data
    .filter(isFoodPlace)
    .filter((place) => Boolean(place.osm_type && place.osm_id))
    .slice(0, 6)
    .map((place) => ({
      placeId: toPlaceId(place.osm_type ?? "node", place.osm_id ?? 0),
      name: placeName(place),
      address: shortAddress(place),
      description: place.display_name ?? shortAddress(place),
      source: "openstreetmap",
    }))
}

export async function getOsmRestaurantProfile(
  placeId: string,
  reputation: ManualReputationInput | undefined,
  fetcher: typeof fetch = fetch,
): Promise<{ profile: RestaurantGrowthProfile; googleMeta: null }> {
  const osmId = parsePlaceId(placeId)
  if (!osmId) {
    throw new Error("placeId is required")
  }

  const params = new URLSearchParams({
    osm_ids: `${osmId.prefix}${osmId.id}`,
    format: "jsonv2",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
  })

  const res = await fetcher(`${NOMINATIM_BASE_URL}/lookup?${params.toString()}`, {
    method: "GET",
    headers: openDataHeaders(),
  })

  if (res.status === 404) throw new Error("Business not found")
  if (!res.ok) throw new Error("Unable to load restaurant details")

  const data = await res.json() as NominatimPlace[]
  const place = data[0]

  if (!place) throw new Error("Business not found")

  const lat = Number.parseFloat(place.lat ?? "")
  const lon = Number.parseFloat(place.lon ?? "")
  const websiteUrl = normalizeUrl(readTag(place, ["website", "contact:website", "url", "homepage"]))

  const [website, benchmark] = await Promise.all([
    scanRestaurantWebsite(websiteUrl, fetcher),
    fetchLocalBenchmark(lat, lon, placeId, fetcher),
  ])

  return { profile: toGrowthProfile(placeId, place, websiteUrl, website, benchmark, reputation), googleMeta: null }
}

export async function getOsmWebsiteUrl(
  placeId: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const osmId = parsePlaceId(placeId)
  if (!osmId) return null

  if (parseGooglePlaceId(placeId)) return null

  const params = new URLSearchParams({
    osm_ids: `${osmId.prefix}${osmId.id}`,
    format: "jsonv2",
    extratags: "1",
  })

  try {
    const res = await fetcher(`${NOMINATIM_BASE_URL}/lookup?${params.toString()}`, {
      method: "GET",
      headers: openDataHeaders(),
      signal: AbortSignal.timeout(4_000),
    })

    if (!res.ok) return null

    const data = await res.json() as NominatimPlace[]
    const place = data[0]
    if (!place) return null

    return normalizeUrl(readTag(place, ["website", "contact:website", "url", "homepage"]))
  } catch {
    return null
  }
}
