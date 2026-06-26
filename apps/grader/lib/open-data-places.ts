import type {
  RestaurantGrowthProfile,
  RestaurantWebsiteSignals,
} from "@atrium/application"

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"
const OVERPASS_URL = "https://overpass-api.de/api/interpreter"
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
  readonly source: "openstreetmap"
}

export type ManualReputationInput = {
  readonly rating?: number | null
  readonly reviewCount?: number | null
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

type OverpassElement = {
  readonly type: "node" | "way" | "relation"
  readonly id: number
  readonly lat?: number
  readonly lon?: number
  readonly center?: {
    readonly lat?: number
    readonly lon?: number
  }
  readonly tags?: Record<string, string | undefined>
}

type OverpassResponse = {
  readonly elements?: OverpassElement[]
}

type LocalBenchmark = {
  readonly competitorCount: number
  readonly competitorsWithWebsite: number
  readonly competitorsWithPhone: number
  readonly competitorsWithHours: number
}

export class OpenDataPlacesLookupError extends Error {}

export async function searchRestaurantPlaces(
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<PlaceSuggestion[]> {
  const input = query.trim()

  if (input.length < 3) return []

  const params = new URLSearchParams({
    q: input,
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
    throw new OpenDataPlacesLookupError("Unable to search open restaurant data")
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

export async function getRestaurantGrowthProfileFromPlace(
  placeId: string,
  reputation: ManualReputationInput | undefined,
  fetcher: typeof fetch = fetch,
): Promise<RestaurantGrowthProfile> {
  const osmId = parsePlaceId(placeId)
  if (!osmId) {
    throw new OpenDataPlacesLookupError("placeId is required")
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

  if (res.status === 404) {
    throw new OpenDataPlacesLookupError("Business not found")
  }

  if (!res.ok) {
    throw new OpenDataPlacesLookupError("Unable to load restaurant details")
  }

  const data = await res.json() as NominatimPlace[]
  const place = data[0]

  if (!place) {
    throw new OpenDataPlacesLookupError("Business not found")
  }

  const websiteUrl = normalizeUrl(readTag(place, ["website", "contact:website", "url", "homepage"]))
  const [website, benchmark] = await Promise.all([
    scanRestaurantWebsite(websiteUrl, fetcher),
    fetchLocalBenchmark(place, placeId, fetcher),
  ])

  return toGrowthProfile(placeId, place, websiteUrl, website, benchmark, reputation)
}

async function fetchLocalBenchmark(
  place: NominatimPlace,
  selectedPlaceId: string,
  fetcher: typeof fetch,
): Promise<LocalBenchmark> {
  const lat = Number.parseFloat(place.lat ?? "")
  const lon = Number.parseFloat(place.lon ?? "")

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return emptyBenchmark()
  }

  const query = `
    [out:json][timeout:8];
    (
      node(around:1200,${lat},${lon})["amenity"~"^(restaurant|cafe|bar|fast_food|pub|food_court|ice_cream)$"];
      way(around:1200,${lat},${lon})["amenity"~"^(restaurant|cafe|bar|fast_food|pub|food_court|ice_cream)$"];
      relation(around:1200,${lat},${lon})["amenity"~"^(restaurant|cafe|bar|fast_food|pub|food_court|ice_cream)$"];
      node(around:1200,${lat},${lon})["shop"="bakery"];
      way(around:1200,${lat},${lon})["shop"="bakery"];
      relation(around:1200,${lat},${lon})["shop"="bakery"];
    );
    out center tags 40;
  `

  try {
    const res = await fetcher(OVERPASS_URL, {
      method: "POST",
      headers: {
        ...openDataHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ data: query }),
    })

    if (!res.ok) return emptyBenchmark()

    const data = await res.json() as OverpassResponse
    const competitors = (data.elements ?? [])
      .filter((element) => toPlaceId(element.type, element.id) !== selectedPlaceId)
      .filter((element) => Boolean(element.tags?.name))

    return {
      competitorCount: competitors.length,
      competitorsWithWebsite: competitors.filter((element) => hasAnyTag(element.tags, ["website", "contact:website", "url"])).length,
      competitorsWithPhone: competitors.filter((element) => hasAnyTag(element.tags, ["phone", "contact:phone"])).length,
      competitorsWithHours: competitors.filter((element) => hasAnyTag(element.tags, ["opening_hours"])).length,
    }
  } catch {
    return emptyBenchmark()
  }
}

async function scanRestaurantWebsite(
  websiteUrl: string | null,
  fetcher: typeof fetch,
): Promise<RestaurantWebsiteSignals> {
  if (!websiteUrl) {
    return emptyWebsiteSignals()
  }

  const startedAt = Date.now()

  try {
    const res = await fetcher(websiteUrl, {
      method: "GET",
      signal: AbortSignal.timeout(4_000),
    })
    const loadTimeMs = Date.now() - startedAt

    if (!res.ok) {
      return {
        ...emptyWebsiteSignals(),
        loadTimeMs,
      }
    }

    const html = await res.text()
    const lower = html.toLowerCase()

    return {
      hasMobileFriendlyLayout: true,
      hasMenu: /\bmenu\b/.test(lower),
      hasOnlineOrdering: /order online|online ordering|\/order|delivery|takeout|toasttab|doordash|ubereats|chownow|clover|squareup/.test(lower),
      hasReservations: /reservation|reservations|book a table|book now|opentable|resy/.test(lower),
      hasPhoneVisible: /href=["']tel:/.test(lower),
      hasLocationSchema: /application\/ld\+json|schema\.org\/restaurant|"@type"\s*:\s*"restaurant"|"@type"\s*:\s*"localbusiness"/.test(lower),
      hasMetaDescription: /<meta[^>]+name=["']description["'][^>]*>/i.test(html),
      loadTimeMs,
    }
  } catch {
    return emptyWebsiteSignals()
  }
}

function toGrowthProfile(
  fallbackId: string,
  place: NominatimPlace,
  websiteUrl: string | null,
  website: RestaurantWebsiteSignals,
  benchmark: LocalBenchmark,
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
    conversion: {
      hasPrimaryCta: website.hasOnlineOrdering || website.hasReservations || website.hasPhoneVisible,
      hasOnlineOrderingCta: website.hasOnlineOrdering,
      hasReservationCta: website.hasReservations,
      hasTrackingPixel: false,
      hasClickToCall: website.hasPhoneVisible || Boolean(phone),
    },
  }
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

function deriveLocalRank(hasWebsite: boolean, benchmark: LocalBenchmark): number | null {
  if (benchmark.competitorCount < 3) return null

  const websiteShare = benchmark.competitorsWithWebsite / benchmark.competitorCount
  const phoneShare = benchmark.competitorsWithPhone / benchmark.competitorCount

  if (hasWebsite && websiteShare < 0.35) return 3
  if (hasWebsite && websiteShare < 0.65) return 6
  if (!hasWebsite && websiteShare >= 0.5) return 12
  if (!hasWebsite && phoneShare >= 0.7) return 10
  return 8
}

function normalizeReputation(reputation: ManualReputationInput | undefined): {
  readonly rating: number | null
  readonly reviewCount: number | null
} {
  const rating = typeof reputation?.rating === "number" && Number.isFinite(reputation.rating)
    ? Math.min(5, Math.max(1, reputation.rating))
    : null
  const reviewCount = typeof reputation?.reviewCount === "number" && Number.isFinite(reputation.reviewCount)
    ? Math.max(0, Math.round(reputation.reviewCount))
    : null

  return { rating, reviewCount }
}

function parsePlaceId(placeId: string): { readonly prefix: "N" | "W" | "R"; readonly id: number } | null {
  const [, type, rawId] = placeId.trim().match(/^osm:(node|way|relation):(\d+)$/) ?? []
  const id = Number(rawId)

  if (!type || !Number.isSafeInteger(id)) return null

  return {
    prefix: type === "node" ? "N" : type === "way" ? "W" : "R",
    id,
  }
}

function toPlaceId(type: "node" | "way" | "relation", id: number): string {
  return `osm:${type}:${id}`
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

function hasAnyTag(tags: Record<string, string | undefined> | undefined, keys: string[]): boolean {
  return keys.some((key) => Boolean(tags?.[key]))
}

function normalizeUrl(value: string | null): string | null {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function estimateNegativeReviews(rating: number, reviewCount: number): number {
  if (reviewCount === 0 || rating >= 4.6) return 0
  if (rating >= 4.3) return Math.min(8, Math.ceil(reviewCount * 0.02))
  if (rating >= 4.0) return Math.min(16, Math.ceil(reviewCount * 0.04))
  return Math.min(24, Math.ceil(reviewCount * 0.08))
}

function readableType(type: string): string {
  return type
    .split(/[;_,]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function emptyBenchmark(): LocalBenchmark {
  return {
    competitorCount: 0,
    competitorsWithWebsite: 0,
    competitorsWithPhone: 0,
    competitorsWithHours: 0,
  }
}

function emptyWebsiteSignals(): RestaurantWebsiteSignals {
  return {
    hasMobileFriendlyLayout: false,
    hasMenu: false,
    hasOnlineOrdering: false,
    hasReservations: false,
    hasPhoneVisible: false,
    hasLocationSchema: false,
    hasMetaDescription: false,
    loadTimeMs: 5_000,
  }
}

function openDataHeaders(): HeadersInit {
  return {
    "Accept-Language": "en",
    "User-Agent": process.env.OSM_USER_AGENT ?? "AtriumGrader/0.1 (https://atrium.local)",
  }
}
