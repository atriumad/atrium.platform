import { afterEach, describe, expect, mock, test } from "bun:test"

const originalFetch = globalThis.fetch
const originalBusinessProvider = process.env.GRADER_BUSINESS_PROVIDER
const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY
const originalScrapeCreatorsKey = process.env.SCRAPECREATORS_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalBusinessProvider === undefined) delete process.env.GRADER_BUSINESS_PROVIDER
  else process.env.GRADER_BUSINESS_PROVIDER = originalBusinessProvider
  if (originalGoogleKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey
  if (originalScrapeCreatorsKey === undefined) delete process.env.SCRAPECREATORS_API_KEY
  else process.env.SCRAPECREATORS_API_KEY = originalScrapeCreatorsKey
})

function graderRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/grader", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/grader", () => {
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
    expect(body.report.dataQuality).toEqual(expect.objectContaining({
      provider: "mixed",
      hasWebsite: true,
      hasReputation: true,
      hasSocial: false,
    }))
    expect(body.report.diagnosticSteps).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "website", source: expect.any(String) }),
      expect.objectContaining({ id: "reputation", status: "complete" }),
    ]))
  })

  test("returns 400 when place id is missing", async () => {
    const { POST } = await import("./route")

    const res = await POST(graderRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "placeId is required" })
  })

  test("uses Google Places provider when configured with an API key", async () => {
    process.env.GRADER_BUSINESS_PROVIDER = "google"
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("places.googleapis.com/v1/places/google-place-123")) {
        return Response.json({
          id: "google-place-123",
          displayName: { text: "Google Bistro" },
          formattedAddress: "22 Market St, Miami, FL",
          types: ["restaurant"],
          websiteUri: "https://googlebistro.example",
          nationalPhoneNumber: "(305) 555-0133",
          currentOpeningHours: { weekdayDescriptions: ["Mon-Sun 11:00-22:00"] },
          rating: 4.8,
          userRatingCount: 412,
          location: { latitude: 25.77, longitude: -80.19 },
        })
      }

      return new Response(`
        <html>
          <head>
            <meta name="viewport" content="width=device-width">
            <meta name="description" content="Google Bistro">
          </head>
          <body>
            <a href="/menu">Menu</a>
            <a href="/order">Order online</a>
            <a href="/reservations">Reservations</a>
            <a href="tel:+13055550133">Call</a>
            <script type="application/ld+json">{ "@type": "Restaurant" }</script>
          </body>
        </html>
      `)
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "google:google-place-123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.business.name).toBe("Google Bistro")
    expect(body.report.dataQuality.provider).toBe("google")
    expect(body.report.dataQuality.hasReputation).toBe(true)
    expect(body.report.diagnosticSteps).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "reputation",
        source: "Google Places reputation summary",
        status: "complete",
      }),
    ]))
  })

  test("returns meta with profile and googleMeta for client enrichment", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([{ osm_type: "node", osm_id: 123, lat: "25.79065", lon: "-80.13005", category: "amenity", type: "restaurant", display_name: "Real Bistro, Miami Beach, FL", namedetails: { name: "Real Bistro" }, extratags: {} }])
      }
      return Response.json({ elements: [] })
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "osm:node:123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report).toBeDefined()
    expect(body.meta).toBeDefined()
    expect(body.meta.profile).toBeDefined()
    expect(body.meta.profile.name).toBe("Real Bistro")
    // socialHealth is no longer in the base report — lives in /api/grader/social
    expect(body.report.socialHealth).toBeUndefined()
    expect(body.report.scores.social).toBeUndefined()
  })

  test("returns report without socialHealth when no social handles provided", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([{ osm_type: "node", osm_id: 123, lat: "25.79065", lon: "-80.13005", category: "amenity", type: "restaurant", display_name: "Real Bistro, Miami Beach, FL", namedetails: { name: "Real Bistro" }, extratags: {} }])
      }
      return Response.json({ elements: [] })
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "osm:node:123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.socialHealth).toBeUndefined()
    expect(body.report.scores.social).toBeUndefined()
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
    expect(body.report.dataQuality.hasSocial).toBe(false)
    expect(body.report.diagnosticSteps).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "social", status: "skipped" }),
      expect.objectContaining({ id: "reputation", status: "partial" }),
    ]))
  })
})
