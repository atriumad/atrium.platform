import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { getGoogleLocalBenchmark, getGoogleRestaurantProfile } from "./google-places-client"

const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY

beforeEach(() => {
  process.env.GOOGLE_PLACES_API_KEY = "test-key"
})

afterEach(() => {
  if (originalGoogleKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey
})

describe("getGoogleRestaurantProfile", () => {
  test("maps enriched Google Places fields into agent metadata", async () => {
    const fetcher = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("places/test-place")) {
        return Response.json({
          id: "test-place",
          displayName: { text: "Atrium Bistro" },
          formattedAddress: "12 Market St",
          types: ["restaurant"],
          primaryType: "restaurant",
          primaryTypeDisplayName: { text: "Restaurant" },
          websiteUri: "https://atriumbistro.test",
          nationalPhoneNumber: "(555) 010-9999",
          googleMapsUri: "https://maps.google.com/?cid=123",
          businessStatus: "OPERATIONAL",
          priceLevel: "PRICE_LEVEL_MODERATE",
          currentOpeningHours: { weekdayDescriptions: ["Monday: 9 AM-9 PM"] },
          regularOpeningHours: { weekdayDescriptions: ["Monday: 9 AM-9 PM"] },
          rating: 4.4,
          userRatingCount: 128,
          dineIn: true,
          takeout: true,
          delivery: false,
          reservable: true,
          outdoorSeating: true,
          servesDinner: true,
          servesCoffee: true,
          paymentOptions: { acceptsCreditCards: true },
        })
      }

      return new Response("<html><title>Atrium Bistro</title></html>", {
        headers: { "content-type": "text/html" },
      })
    })

    const { googleMeta } = await getGoogleRestaurantProfile("test-place", fetcher as unknown as typeof fetch)

    expect(googleMeta).toEqual(expect.objectContaining({
      priceLevel: "PRICE_LEVEL_MODERATE",
      primaryType: "restaurant",
      primaryTypeDisplayName: "Restaurant",
      googleMapsUri: "https://maps.google.com/?cid=123",
      openingHoursPublished: true,
      regularHoursPublished: true,
      dineIn: true,
      takeout: true,
      delivery: false,
      reservable: true,
      outdoorSeating: true,
      servesDinner: true,
      servesCoffee: true,
      acceptsCreditCards: true,
    }))
  })
})

describe("getGoogleLocalBenchmark", () => {
  test("builds a local benchmark from nearby Google restaurants", async () => {
    const fetcher = mock(async () => Response.json({
      places: [
        { id: "target", displayName: { text: "Atrium Bistro" }, rating: 4.4, userRatingCount: 128 },
        { id: "comp-1", displayName: { text: "Market Cafe" }, rating: 4.7, userRatingCount: 230, websiteUri: "https://market.test" },
        { id: "comp-2", displayName: { text: "Corner Grill" }, rating: 4.1, userRatingCount: 90 },
        { id: "comp-3", displayName: { text: "Lunch House" }, rating: 4.2, userRatingCount: 140 },
      ],
    }))

    const benchmark = await getGoogleLocalBenchmark({
      googlePlaceId: "target",
      location: { latitude: 25.7617, longitude: -80.1918 },
      category: "restaurant",
      targetRating: 4.4,
    }, fetcher as unknown as typeof fetch)

    expect(benchmark).toEqual(expect.objectContaining({
      competitorCount: 3,
      averageRating: expect.any(Number),
      averageReviewCount: expect.any(Number),
      relativeRatingPosition: "near",
      localRank: 2,
    }))
  })
})
