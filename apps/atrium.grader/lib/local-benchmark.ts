import type { LocalBenchmark } from "./place-utils"

const OVERPASS_URL = "https://overpass-api.de/api/interpreter"

type OverpassElement = {
  readonly type: "node" | "way" | "relation"
  readonly id: number
  readonly tags?: Record<string, string | undefined>
}

type OverpassResponse = {
  readonly elements?: OverpassElement[]
}

export function emptyBenchmark(): LocalBenchmark {
  return {
    competitorCount: 0,
    competitorsWithWebsite: 0,
    competitorsWithPhone: 0,
    competitorsWithHours: 0,
  }
}

function hasAnyTag(tags: Record<string, string | undefined> | undefined, keys: string[]): boolean {
  return keys.some((key) => Boolean(tags?.[key]))
}

export async function fetchLocalBenchmark(
  lat: number,
  lon: number,
  selectedPlaceId: string,
  fetcher: typeof fetch = fetch,
): Promise<LocalBenchmark> {
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
        "Accept-Language": "en",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": process.env.OSM_USER_AGENT ?? "AtriumGrader/0.1 (https://atrium.local)",
      },
      body: new URLSearchParams({ data: query }),
    })

    if (!res.ok) return emptyBenchmark()

    const data = await res.json() as OverpassResponse
    const competitors = (data.elements ?? [])
      .filter((el) => `osm:${el.type}:${el.id}` !== selectedPlaceId)
      .filter((el) => Boolean(el.tags?.name))

    return {
      competitorCount: competitors.length,
      competitorsWithWebsite: competitors.filter((el) => hasAnyTag(el.tags, ["website", "contact:website", "url"])).length,
      competitorsWithPhone: competitors.filter((el) => hasAnyTag(el.tags, ["phone", "contact:phone"])).length,
      competitorsWithHours: competitors.filter((el) => hasAnyTag(el.tags, ["opening_hours"])).length,
    }
  } catch {
    return emptyBenchmark()
  }
}
