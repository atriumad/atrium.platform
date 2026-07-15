import { afterEach, describe, expect, mock, test } from "bun:test"
import { resetGooglePlacesBudgetUsage } from "../../../lib/providers/business-provider"

const originalFetch = globalThis.fetch
const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY
const originalGoogleDailyLimit = process.env.GRADER_GOOGLE_DAILY_LIMIT
const originalGoogleMonthlyLimit = process.env.GRADER_GOOGLE_MONTHLY_LIMIT
const originalScrapeCreatorsKey = process.env.SCRAPECREATORS_API_KEY
const originalScanStore = process.env.GRADER_SCAN_STORE

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalGoogleKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey
  if (originalGoogleDailyLimit === undefined) delete process.env.GRADER_GOOGLE_DAILY_LIMIT
  else process.env.GRADER_GOOGLE_DAILY_LIMIT = originalGoogleDailyLimit
  if (originalGoogleMonthlyLimit === undefined) delete process.env.GRADER_GOOGLE_MONTHLY_LIMIT
  else process.env.GRADER_GOOGLE_MONTHLY_LIMIT = originalGoogleMonthlyLimit
  if (originalScrapeCreatorsKey === undefined) delete process.env.SCRAPECREATORS_API_KEY
  else process.env.SCRAPECREATORS_API_KEY = originalScrapeCreatorsKey
  if (originalScanStore === undefined) delete process.env.GRADER_SCAN_STORE
  else process.env.GRADER_SCAN_STORE = originalScanStore
  resetGooglePlacesBudgetUsage()
})

function graderRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/grader", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function mockGooglePlaceFetch(): typeof fetch {
  return mock(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)

    if (url.includes("places.googleapis.com/v1/places/google-place-123")) {
      expect(new Headers(init?.headers).get("X-Goog-FieldMask")).toBe([
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
      ].join(","))

      return Response.json({
        id: "google-place-123",
        displayName: { text: "Google Bistro" },
        formattedAddress: "22 Market St, Miami, FL",
        types: ["restaurant"],
        primaryType: "restaurant",
        primaryTypeDisplayName: { text: "Restaurant" },
        websiteUri: "https://googlebistro.example",
        nationalPhoneNumber: "(305) 555-0133",
        googleMapsUri: "https://maps.google.com/?cid=456",
        currentOpeningHours: { weekdayDescriptions: ["Mon-Sun 11:00-22:00"] },
        regularOpeningHours: { weekdayDescriptions: ["Mon-Sun 11:00-22:00"] },
        priceLevel: "PRICE_LEVEL_MODERATE",
        rating: 4.8,
        userRatingCount: 412,
        location: { latitude: 25.77, longitude: -80.19 },
        dineIn: true,
        takeout: true,
        delivery: false,
        reservable: true,
        servesDinner: true,
        paymentOptions: { acceptsCreditCards: true },
      })
    }

    if (url.includes("places.googleapis.com/v1/places:searchNearby")) {
      expect(new Headers(init?.headers).get("X-Goog-FieldMask")).toBe([
        "places.id",
        "places.displayName",
        "places.rating",
        "places.userRatingCount",
        "places.types",
        "places.websiteUri",
      ].join(","))

      return Response.json({
        places: [
          { id: "google-place-123", displayName: { text: "Google Bistro" }, rating: 4.8, userRatingCount: 412 },
          { id: "competitor-1", displayName: { text: "Market Cafe" }, rating: 4.6, userRatingCount: 280 },
          { id: "competitor-2", displayName: { text: "Corner Grill" }, rating: 4.4, userRatingCount: 190 },
          { id: "competitor-3", displayName: { text: "Lunch House" }, rating: 4.3, userRatingCount: 120 },
        ],
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
}

describe.serial("POST /api/grader", () => {
  test("returns a Google Places growth report with scan evidence", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"
    globalThis.fetch = mockGooglePlaceFetch()

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "google:google-place-123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.scanId).toMatch(/^scan_/)
    expect(body.report.business.name).toBe("Google Bistro")
    expect(body.report.overallScore).toBeGreaterThan(0)
    expect(body.report.scoringVersion).toBe("restaurant-growth-v2")
    expect(body.report.dataQuality).toEqual(expect.objectContaining({
      provider: "google",
      hasWebsite: true,
      hasReputation: true,
      hasSocial: false,
    }))
    expect(body.report.providerVersions).toEqual(expect.objectContaining({
      businessData: "google-places-business-v1",
      website: "website-html-v1",
      benchmark: "google-nearby-benchmark-v1",
      reputation: "google-places-reputation-v1",
      social: "not-scanned",
    }))
    expect(body.report.diagnosticSteps).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "reputation",
        source: "Google Places reputation summary",
        status: "complete",
      }),
      expect.objectContaining({
        id: "benchmark",
        source: "Google local benchmark",
        status: "complete",
      }),
    ]))
    expect(body.meta.profile.name).toBe("Google Bistro")
    expect(body.meta.googleMeta).toEqual(expect.objectContaining({
      openingHoursPublished: true,
      regularHoursPublished: true,
      priceLevel: "PRICE_LEVEL_MODERATE",
      googleMapsUri: "https://maps.google.com/?cid=456",
      takeout: true,
      delivery: false,
      acceptsCreditCards: true,
    }))
    expect(body.meta.localBenchmark).toEqual(expect.objectContaining({
      competitorCount: 3,
      localRank: 1,
      relativeRatingPosition: "above",
    }))
  })

  test("returns 400 when place id is missing", async () => {
    const { POST } = await import("./route")

    const res = await POST(graderRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "placeId is required" })
  })

  test("rejects non-Google place ids", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "legacy:node:123" }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.scanId).toMatch(/^scan_/)
    expect(body.error).toBe("placeId is required")
  })

  test("returns a provider configuration error when Google API key is missing", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "google:google-place-123" }))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.scanId).toMatch(/^scan_/)
    expect(body.error).toBe("GOOGLE_PLACES_API_KEY is required for Google Places restaurant data")
  })

  test("returns report without socialHealth in the base Google report", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"
    globalThis.fetch = mockGooglePlaceFetch()

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "google:google-place-123" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.report.socialHealth).toBeUndefined()
    expect(body.report.scores.social).toBeUndefined()
  })

  test("returns a budget guard error when Google monthly limit is exhausted", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"
    process.env.GRADER_GOOGLE_MONTHLY_LIMIT = "0"

    const { POST } = await import("./route")

    const res = await POST(graderRequest({ placeId: "google:google-place-123" }))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe("Google Places monthly budget limit reached for places.details.profile")
  })
})
