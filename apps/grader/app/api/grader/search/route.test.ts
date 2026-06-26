import { afterEach, describe, expect, mock, test } from "bun:test"

function searchRequest(query: string): Request {
  return new Request("http://localhost/api/grader/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
}

const originalFetch = globalThis.fetch
const originalGooglePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalGooglePlacesApiKey === undefined) {
    delete process.env.GOOGLE_PLACES_API_KEY
  } else {
    process.env.GOOGLE_PLACES_API_KEY = originalGooglePlacesApiKey
  }
})

describe("POST /api/grader/search", () => {
  test("returns Google Places restaurant suggestions when an API key is configured", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"
    globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
      expect(String(input)).toBe("https://places.googleapis.com/v1/places:searchText")
      expect(init?.method).toBe("POST")
      expect((init?.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe("test-google-key")
      expect((init?.headers as Record<string, string>)["X-Goog-FieldMask"]).toContain("places.id")

      return Response.json({
        places: [
          {
            id: "ChIJrealbistro123",
            displayName: { text: "Real Bistro" },
            formattedAddress: "100 Ocean Dr, Miami Beach, FL",
            types: ["restaurant"],
          },
        ],
      })
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(searchRequest("real bistro miami"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.suggestions).toEqual([
      {
        placeId: "google:ChIJrealbistro123",
        name: "Real Bistro",
        address: "100 Ocean Dr, Miami Beach, FL",
        description: "100 Ocean Dr, Miami Beach, FL",
        source: "google",
      },
    ])
  })

  test("returns OpenStreetMap restaurant suggestions", async () => {
    globalThis.fetch = mock(async () =>
      Response.json([
        {
          osm_type: "node",
          osm_id: 123,
          category: "amenity",
          type: "restaurant",
          display_name: "Real Bistro, Miami Beach, FL",
          namedetails: { name: "Real Bistro" },
          address: {
            road: "100 Ocean Dr",
            city: "Miami Beach",
            state: "Florida",
          },
        },
        {
          osm_type: "node",
          osm_id: 456,
          category: "shop",
          type: "clothes",
          display_name: "Real Boutique, Miami Beach, FL",
          namedetails: { name: "Real Boutique" },
        },
      ]),
    ) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(searchRequest("real bistro miami"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.suggestions).toEqual([
      {
        placeId: "osm:node:123",
        name: "Real Bistro",
        address: "100 Ocean Dr, Miami Beach, Florida",
        description: "Real Bistro, Miami Beach, FL",
        source: "openstreetmap",
      },
    ])
  })

  test("returns food places when cuisine tags are present", async () => {
    globalThis.fetch = mock(async () =>
      Response.json([
        {
          osm_type: "way",
          osm_id: 789,
          category: "tourism",
          type: "attraction",
          display_name: "Hidden Ramen, Orlando, FL",
          namedetails: { name: "Hidden Ramen" },
          extratags: {
            cuisine: "ramen",
          },
        },
      ]),
    ) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(searchRequest("hidden ramen orlando"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.suggestions).toEqual([
      {
        placeId: "osm:way:789",
        name: "Hidden Ramen",
        address: "Hidden Ramen, Orlando, FL",
        description: "Hidden Ramen, Orlando, FL",
        source: "openstreetmap",
      },
    ])
  })

  test("returns an empty list for short queries", async () => {
    const { POST } = await import("./route")

    const res = await POST(searchRequest("ab"))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ suggestions: [] })
  })
})
