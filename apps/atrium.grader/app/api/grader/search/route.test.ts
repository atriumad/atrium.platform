import { afterEach, describe, expect, mock, test } from "bun:test"

const originalFetch = globalThis.fetch
const originalBusinessProvider = process.env.GRADER_BUSINESS_PROVIDER
const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalBusinessProvider === undefined) delete process.env.GRADER_BUSINESS_PROVIDER
  else process.env.GRADER_BUSINESS_PROVIDER = originalBusinessProvider
  if (originalGoogleKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey
})

function searchRequest(query: string): Request {
  return new Request("http://localhost/api/grader/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
}

describe.serial("POST /api/grader/search", () => {
  test("returns OpenStreetMap restaurant suggestions", async () => {
    process.env.GRADER_BUSINESS_PROVIDER = "osm"

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
    process.env.GRADER_BUSINESS_PROVIDER = "osm"

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

    const res = await POST(searchRequest("real bistro miami"))
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

  test("returns a provider configuration error when Google mode has no API key", async () => {
    process.env.GRADER_BUSINESS_PROVIDER = "google"
    delete process.env.GOOGLE_PLACES_API_KEY

    const { POST } = await import("./route")

    const res = await POST(searchRequest("real bistro miami"))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe("GOOGLE_PLACES_API_KEY is required when GRADER_BUSINESS_PROVIDER=google")
  })

  test("uses Google Autocomplete and returns a photo when Google mode is configured", async () => {
    process.env.GRADER_BUSINESS_PROVIDER = "google"
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"

    globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input)

      if (url.includes("places.googleapis.com/v1/places:autocomplete")) {
        expect(init?.method).toBe("POST")
        expect(JSON.parse(String(init?.body))).toEqual({
          input: "chick in waffle",
          includeQueryPredictions: false,
        })

        return Response.json({
          suggestions: [
            {
              placePrediction: {
                place: "places/google-place-123",
                placeId: "google-place-123",
                text: { text: "Chick-In Waffle" },
                structuredFormat: {
                  mainText: { text: "Chick-In Waffle" },
                  secondaryText: { text: "Miami, FL" },
                },
                types: ["restaurant"],
              },
            },
          ],
        })
      }

      if (url.includes("places.googleapis.com/v1/places/google-place-123")) {
        return Response.json({
          id: "google-place-123",
          displayName: { text: "Chick-In Waffle" },
          formattedAddress: "321 Biscayne Blvd, Miami, FL 33132, USA",
          shortFormattedAddress: "321 Biscayne Blvd, Miami, FL",
          photos: [
            {
              name: "places/google-place-123/photos/photo-abc",
              authorAttributions: [{ displayName: "Google Maps contributor" }],
            },
          ],
        })
      }

      return Response.json({})
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(searchRequest("chick in waffle"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.suggestions).toEqual([
      {
        placeId: "google:google-place-123",
        name: "Chick-In Waffle",
        address: "321 Biscayne Blvd, Miami, FL",
        description: "321 Biscayne Blvd, Miami, FL",
        source: "google",
        photoUrl: "/api/grader/place-photo?name=places%2Fgoogle-place-123%2Fphotos%2Fphoto-abc&maxWidthPx=420&maxHeightPx=260",
        photoAttribution: "Google Maps contributor",
      },
    ])
  })
})
