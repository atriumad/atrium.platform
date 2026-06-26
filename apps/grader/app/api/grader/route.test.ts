import { afterEach, describe, expect, mock, test } from "bun:test"

function graderRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/grader", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

describe("POST /api/grader", () => {
  test("returns a growth report from Google Place details", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"
    globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input)

      if (url.includes("places.googleapis.com/v1/places/ChIJrealbistro123")) {
        expect(init?.method).toBe("GET")
        expect((init?.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe("test-google-key")
        expect((init?.headers as Record<string, string>)["X-Goog-FieldMask"]).toContain("rating")

        return Response.json({
          id: "ChIJrealbistro123",
          displayName: { text: "Real Bistro" },
          formattedAddress: "100 Ocean Dr, Miami Beach, FL",
          types: ["restaurant"],
          websiteUri: "https://realbistro.example",
          nationalPhoneNumber: "(305) 555-0100",
          currentOpeningHours: {
            weekdayDescriptions: ["Monday: 11:00 AM - 10:00 PM"],
          },
          rating: 4.7,
          userRatingCount: 321,
          location: {
            latitude: 25.79065,
            longitude: -80.13005,
          },
        })
      }

      return new Response(`
        <html>
          <head><meta name="description" content="Fresh seafood on Ocean Drive"></head>
          <body>
            <a href="/menu">Menu</a>
            <a href="/order">Order online</a>
            <a href="tel:+13055550100">Call</a>
          </body>
        </html>
      `)
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "google:ChIJrealbistro123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.business.id).toBe("google:ChIJrealbistro123")
    expect(body.report.business.name).toBe("Real Bistro")
    expect(body.report.scores.reputation).toBeGreaterThan(0)
    expect(body.report.confidence).toBe("high")
  })

  test("returns a growth report from free open data and manual reputation", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([
          {
            osm_type: "node",
            osm_id: 123,
            lat: "25.79065",
            lon: "-80.13005",
            category: "amenity",
            type: "restaurant",
            display_name: "Real Bistro, 100 Ocean Dr, Miami Beach, FL",
            namedetails: { name: "Real Bistro" },
            address: {
              road: "100 Ocean Dr",
              city: "Miami Beach",
              state: "Florida",
            },
            extratags: {
              website: "https://realbistro.example",
              phone: "(305) 555-0100",
              opening_hours: "Mo-Su 11:00-23:00",
              cuisine: "seafood",
            },
          },
        ])
      }

      if (url.includes("overpass-api.de")) {
        return Response.json({
          elements: [
            { type: "node", id: 124, tags: { name: "Nearby Cafe", website: "https://cafe.example" } },
            { type: "node", id: 125, tags: { name: "Nearby Bar", phone: "(305) 555-0101" } },
            { type: "node", id: 126, tags: { name: "Nearby Bakery", opening_hours: "Mo-Fr 08:00-17:00" } },
          ],
        })
      }

      return new Response(`
        <html>
          <head><meta name="description" content="Fresh seafood on Ocean Drive"></head>
          <body>
            <a href="/menu">Menu</a>
            <a href="/order">Order online</a>
            <a href="/reservations">Reservations</a>
            <a href="tel:+13055550100">Call</a>
            <script type="application/ld+json">{ "@type": "Restaurant" }</script>
          </body>
        </html>
      `)
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({
      placeId: "osm:node:123",
      reputation: {
        rating: 4.6,
        reviewCount: 287,
      },
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.business.name).toBe("Real Bistro")
    expect(body.report.overallScore).toBeGreaterThan(0)
    expect(body.report.scores).toHaveProperty("discovery")
    expect(body.report.recommendations.length).toBeGreaterThan(0)
    expect(body.report.confidence).toBe("high")
  })

  test("returns 400 when place id is missing", async () => {
    const { POST } = await import("./route")

    const res = await POST(graderRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "placeId is required" })
  })

  test("does not require a paid API key", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([
          {
            osm_type: "node",
            osm_id: 123,
            lat: "25.79065",
            lon: "-80.13005",
            category: "amenity",
            type: "restaurant",
            display_name: "Real Bistro, Miami Beach, FL",
            namedetails: { name: "Real Bistro" },
            extratags: {},
          },
        ])
      }

      return Response.json({ elements: [] })
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "osm:node:123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.business.name).toBe("Real Bistro")
    expect(body.report.confidence).toBe("low")
  })
})
