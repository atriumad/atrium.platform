import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import type { SocialHandles } from "@atrium/application"
import { scanSocialProfiles } from "./scrape-creators"

const noHandles: SocialHandles = { instagram: null, facebook: null, tiktok: null, confidence: "manual" }
const allHandles: SocialHandles = { instagram: "bistromia", facebook: "https://facebook.com/bistromia", tiktok: "bistromia", confidence: "detected" }

beforeEach(() => { process.env.SCRAPECREATORS_API_KEY = "test-key" })
afterEach(() => { delete process.env.SCRAPECREATORS_API_KEY })

describe("scanSocialProfiles", () => {
  test("returns absent for all platforms when API key is not set", async () => {
    delete process.env.SCRAPECREATORS_API_KEY
    const result = await scanSocialProfiles(allHandles)
    expect(result.instagram.exists).toBe(false)
    expect(result.facebook.exists).toBe(false)
    expect(result.tiktok.exists).toBe(false)
  })

  test("returns absent for platforms with no handle", async () => {
    globalThis.fetch = mock(async () => Response.json({})) as unknown as typeof fetch
    const result = await scanSocialProfiles(noHandles)
    expect(result.instagram.exists).toBe(false)
    expect(result.facebook.exists).toBe(false)
    expect(result.tiktok.exists).toBe(false)
  })

  test("normalizes instagram profile data", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/instagram/profile")) {
        return Response.json({ biography: "Fresh seafood", profile_pic_url: "https://example.com/pic.jpg", external_url: "https://bistro.com", follower_count: 2500 })
      }
      if (url.includes("/v2/instagram/user/posts")) {
        return Response.json({ data: [{ taken_at: Math.floor((Date.now() - 86400000) / 1000), like_count: 120, comment_count: 8 }] })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, instagram: "bistromia", confidence: "detected" })
    expect(result.instagram.exists).toBe(true)
    expect(result.instagram.followers).toBe(2500)
    expect(result.instagram.bio).toBe("Fresh seafood")
    expect(result.instagram.hasProfilePic).toBe(true)
    expect(result.instagram.hasLink).toBe(true)
    expect(result.instagram.recentPosts.length).toBeGreaterThan(0)
  })

  test("returns absent when instagram returns 404", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 404 })) as unknown as typeof fetch
    const result = await scanSocialProfiles({ ...noHandles, instagram: "notfound", confidence: "manual" })
    expect(result.instagram.exists).toBe(false)
    expect(result.instagram.error).toBeDefined()
  })

  test("normalizes tiktok profile data", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/tiktok/profile")) {
        return Response.json({ userInfo: { user: { signature: "Food vibes", avatarMedium: "https://example.com/tt.jpg", bioLink: { link: "https://bistro.com" } }, stats: { followerCount: 3200 } } })
      }
      if (url.includes("/v3/tiktok/profile/videos")) {
        return Response.json({ itemList: [{ createTime: Math.floor((Date.now() - 86400000) / 1000), stats: { diggCount: 200, commentCount: 12 } }] })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, tiktok: "bistromia", confidence: "detected" })
    expect(result.tiktok.exists).toBe(true)
    expect(result.tiktok.followers).toBe(3200)
    expect(result.tiktok.bio).toBe("Food vibes")
  })

  test("normalizes facebook profile data", async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/facebook/profile/posts")) return Response.json({ data: [] })
      if (url.includes("/v1/facebook/profile")) {
        return Response.json({ about: "Miami's finest bistro", picture: "https://example.com/fb.jpg", website: "https://bistro.com", followers: 1800 })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, facebook: "https://facebook.com/bistromia", confidence: "detected" })
    expect(result.facebook.exists).toBe(true)
    expect(result.facebook.followers).toBe(1800)
    expect(result.facebook.bio).toBe("Miami's finest bistro")
  })

  test("sends x-api-key header", async () => {
    const capturedHeaders: Record<string, string>[] = []
    globalThis.fetch = mock(async (_input: string | URL | Request, init?: RequestInit) => {
      capturedHeaders.push((init?.headers ?? {}) as Record<string, string>)
      return Response.json({})
    }) as unknown as typeof fetch

    await scanSocialProfiles({ ...noHandles, instagram: "bistromia", confidence: "manual" })
    expect(capturedHeaders.some((h) => h["x-api-key"] === "test-key")).toBe(true)
  })

  test("filters posts older than 30 days", async () => {
    const oldDate = Math.floor((Date.now() - 40 * 24 * 60 * 60 * 1000) / 1000)
    const recentDate = Math.floor((Date.now() - 5 * 24 * 60 * 60 * 1000) / 1000)

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes("/v1/instagram/profile")) return Response.json({ follower_count: 1000 })
      if (url.includes("/v2/instagram/user/posts")) {
        return Response.json({ data: [{ taken_at: oldDate, like_count: 100, comment_count: 5 }, { taken_at: recentDate, like_count: 50, comment_count: 3 }] })
      }
      return Response.json({})
    }) as unknown as typeof fetch

    const result = await scanSocialProfiles({ ...noHandles, instagram: "bistromia", confidence: "manual" })
    expect(result.instagram.recentPosts.length).toBe(1)
  })
})
