import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { searchFacebookByName, searchInstagramByName, searchTikTokByName } from "./social-name-search"

const originalFetch = globalThis.fetch
const originalKey = process.env.SCRAPECREATORS_API_KEY

beforeEach(() => {
  process.env.SCRAPECREATORS_API_KEY = "test-key"
})

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalKey === undefined) delete process.env.SCRAPECREATORS_API_KEY
  else process.env.SCRAPECREATORS_API_KEY = originalKey
})

describe("social name search", () => {
  test("uses Instagram profile search before guessed handles", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("/v1/instagram/search/profiles")) {
        return Response.json({
          profiles: [
            {
              username: "foodblogger",
              full_name: "Kansas City Food Blogger",
              biography: "Tried Chick-In Waffle today",
              follower_count: 75_000,
              matched_from: "caption",
            },
            {
              username: "chick_in_waffle_co",
              full_name: "Chick-in Waffle",
              biography: "Waffly good chicken",
              follower_count: 15_440,
              is_business_account: true,
              matched_from: "profile",
            },
          ],
        })
      }

      return Response.json({})
    }) as unknown as typeof fetch

    await expect(searchInstagramByName("Chick-In Waffle")).resolves.toBe("chick_in_waffle_co")
  })

  test("uses TikTok user search before guessed handles", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("/v1/tiktok/search/users")) {
        return Response.json({
          users: [
            { unique_id: "chickinwaffleco", nickname: "Chick-in Waffle", follower_count: 4_778 },
            { unique_id: "chickinwaffle", nickname: "haru", follower_count: 141 },
          ],
        })
      }

      return Response.json({})
    }) as unknown as typeof fetch

    await expect(searchTikTokByName("Chick-In Waffle")).resolves.toBe("chickinwaffleco")
  })

  test("finds a Facebook profile URL from Google search results", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("/v1/google/search")) {
        return Response.json({
          results: [
            {
              url: "https://www.facebook.com/photo.php?fbid=123",
              title: "Chick-in-waffle added a new photo",
              description: "Photo result should not be treated as the page.",
            },
            {
              url: "https://www.facebook.com/ChickinWaffleCo/",
              title: "Chick-in-waffle | Kansas City MO - Facebook",
              description: "Chicken and waffles in Kansas City.",
            },
          ],
        })
      }

      return Response.json({})
    }) as unknown as typeof fetch

    await expect(searchFacebookByName("Chick-In Waffle", { address: "Kansas City, MO" })).resolves.toBe(
      "https://www.facebook.com/ChickinWaffleCo/",
    )
  })
})
