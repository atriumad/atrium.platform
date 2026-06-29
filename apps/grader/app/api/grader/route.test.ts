import { afterEach, describe, expect, mock, test } from "bun:test"

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

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
  })

  test("returns 400 when place id is missing", async () => {
    const { POST } = await import("./route")

    const res = await POST(graderRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "placeId is required" })
  })

  test("includes socialHealth when social handles provided and API key set", async () => {
    process.env.SCRAPECREATORS_API_KEY = "test-key"

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("nominatim.openstreetmap.org/lookup")) {
        return Response.json([{ osm_type: "node", osm_id: 123, lat: "25.79065", lon: "-80.13005", category: "amenity", type: "restaurant", display_name: "Real Bistro, Miami Beach, FL", namedetails: { name: "Real Bistro" }, extratags: {} }])
      }
      if (url.includes("overpass-api.de")) return Response.json({ elements: [] })
      if (url.includes("scrapecreators.com") && url.includes("/v1/instagram/profile")) {
        return Response.json({ biography: "Fresh seafood", profile_pic_url: "https://example.com/pic.jpg", external_url: "https://bistro.com", follower_count: 2000 })
      }
      if (url.includes("scrapecreators.com") && url.includes("/v2/instagram/user/posts")) {
        return Response.json({ data: Array.from({ length: 5 }, (_, i) => ({ taken_at: Math.floor((Date.now() - (i + 1) * 86400000) / 1000), like_count: 50, comment_count: 5 })) })
      }
      if (url.includes("scrapecreators.com")) return Response.json({})

      return Response.json({})
    }) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(graderRequest({
      placeId: "osm:node:123",
      socialHandles: { instagram: "bistromia", facebook: null, tiktok: null },
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.socialHealth).toBeDefined()
    expect(body.report.socialHealth.score).toBeGreaterThan(0)
    expect(body.report.scores.social).toBeGreaterThan(0)

    delete process.env.SCRAPECREATORS_API_KEY
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
  })
})
