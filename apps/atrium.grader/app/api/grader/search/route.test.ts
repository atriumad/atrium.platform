import { afterEach, describe, expect, mock, test } from "bun:test"
import { resetGooglePlacesBudgetUsage } from "../../../../lib/providers/business-provider"

const originalFetch = globalThis.fetch
const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY
const originalGoogleDailyLimit = process.env.GRADER_GOOGLE_DAILY_LIMIT
const originalGoogleMonthlyLimit = process.env.GRADER_GOOGLE_MONTHLY_LIMIT

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalGoogleKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey
  if (originalGoogleDailyLimit === undefined) delete process.env.GRADER_GOOGLE_DAILY_LIMIT
  else process.env.GRADER_GOOGLE_DAILY_LIMIT = originalGoogleDailyLimit
  if (originalGoogleMonthlyLimit === undefined) delete process.env.GRADER_GOOGLE_MONTHLY_LIMIT
  else process.env.GRADER_GOOGLE_MONTHLY_LIMIT = originalGoogleMonthlyLimit
  resetGooglePlacesBudgetUsage()
})

function searchRequest(query: string): Request {
  return new Request("http://localhost/api/grader/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
}

describe.serial("POST /api/grader/search", () => {
  test("returns an empty list for short queries without calling Google", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY
    globalThis.fetch = mock(async () => Response.json({})) as unknown as typeof fetch

    const { POST } = await import("./route")

    const res = await POST(searchRequest("ab"))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ suggestions: [] })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  test("requires Google Places API key", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY

    const { POST } = await import("./route")

    const res = await POST(searchRequest("real bistro miami"))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe("GOOGLE_PLACES_API_KEY is required for Google Places restaurant data")
  })

  test("uses Google Autocomplete with minimal field masks", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"

    globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input)

      if (url.includes("places.googleapis.com/v1/places:autocomplete")) {
        expect(init?.method).toBe("POST")
        expect(new Headers(init?.headers).get("X-Goog-FieldMask")).toBe([
          "suggestions.placePrediction.place",
          "suggestions.placePrediction.placeId",
          "suggestions.placePrediction.text",
          "suggestions.placePrediction.structuredFormat",
          "suggestions.placePrediction.types",
        ].join(","))
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
        expect(new Headers(init?.headers).get("X-Goog-FieldMask")).toBe([
          "id",
          "displayName",
          "formattedAddress",
          "types",
        ].join(","))

        return Response.json({
          id: "google-place-123",
          displayName: { text: "Chick-In Waffle" },
          formattedAddress: "321 Biscayne Blvd, Miami, FL 33132, USA",
          types: ["restaurant"],
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
        address: "321 Biscayne Blvd, Miami, FL 33132, USA",
        description: "321 Biscayne Blvd, Miami, FL 33132, USA",
        source: "google",
      },
    ])
  })

  test("returns a budget guard error when Google daily limit is exhausted", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"
    process.env.GRADER_GOOGLE_DAILY_LIMIT = "0"

    const { POST } = await import("./route")

    const res = await POST(searchRequest("chick in waffle"))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe("Google Places daily budget limit reached for places.autocomplete")
  })
})
