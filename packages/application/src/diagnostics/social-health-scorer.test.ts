import { describe, expect, test } from "bun:test"
import {
  scoreSocialHealth,
  type SocialPlatformData,
  type SocialScanResult,
} from "./social-health-scorer"

function platform(overrides: Partial<SocialPlatformData> = {}): SocialPlatformData {
  return {
    exists: true,
    followers: 1000,
    bio: "Great food",
    hasProfilePic: true,
    hasLink: true,
    recentPosts: [
      { date: new Date().toISOString(), likes: 50, comments: 5 },
      { date: new Date().toISOString(), likes: 60, comments: 8 },
    ],
    ...overrides,
  }
}

function absent(): SocialPlatformData {
  return { exists: false, followers: null, bio: null, hasProfilePic: false, hasLink: false, recentPosts: [], error: "no handle" }
}

describe("scoreSocialHealth", () => {
  test("absent platform scores 0 presence", () => {
    const scan: SocialScanResult = { instagram: absent(), facebook: absent(), tiktok: absent() }
    const result = scoreSocialHealth(scan)
    expect(result.score).toBe(0)
    const ig = result.platforms.find((p) => p.platform === "instagram")
    expect(ig?.presence).toBe(0)
  })

  test("present platform scores 25 presence", () => {
    const scan: SocialScanResult = { instagram: platform(), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.presence).toBe(25)
  })

  test("completeness: bio+pic+link = 25", () => {
    const scan: SocialScanResult = {
      instagram: platform({ bio: "yes", hasProfilePic: true, hasLink: true }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.completeness).toBe(25)
  })

  test("completeness: bio only = 10", () => {
    const scan: SocialScanResult = {
      instagram: platform({ bio: "yes", hasProfilePic: false, hasLink: false }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.completeness).toBe(10)
  })

  test("completeness: nothing = 0", () => {
    const scan: SocialScanResult = {
      instagram: platform({ bio: null, hasProfilePic: false, hasLink: false }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.completeness).toBe(0)
  })

  test("activity: 8+ posts = 25", () => {
    const manyPosts = Array.from({ length: 10 }, () => ({ date: new Date().toISOString(), likes: 10, comments: 1 }))
    const scan: SocialScanResult = { instagram: platform({ recentPosts: manyPosts }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(25)
  })

  test("activity: 4-7 posts = 18", () => {
    const posts = Array.from({ length: 5 }, () => ({ date: new Date().toISOString(), likes: 10, comments: 1 }))
    const scan: SocialScanResult = { instagram: platform({ recentPosts: posts }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(18)
  })

  test("activity: 1-3 posts = 10", () => {
    const posts = [{ date: new Date().toISOString(), likes: 10, comments: 1 }]
    const scan: SocialScanResult = { instagram: platform({ recentPosts: posts }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(10)
  })

  test("activity: 0 posts = 0", () => {
    const scan: SocialScanResult = { instagram: platform({ recentPosts: [] }), facebook: absent(), tiktok: absent() }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.activity).toBe(0)
  })

  test("engagement >5% = 25", () => {
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 60, comments: 5 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(25)
  })

  test("engagement 2-5% = 18", () => {
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 30, comments: 0 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(18)
  })

  test("engagement 0.5-2% = 10", () => {
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 10, comments: 0 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(10)
  })

  test("engagement <0.5% = 5", () => {
    const scan: SocialScanResult = {
      instagram: platform({ followers: 1000, recentPosts: [{ date: new Date().toISOString(), likes: 2, comments: 0 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(5)
  })

  test("engagement 0 when no followers", () => {
    const scan: SocialScanResult = {
      instagram: platform({ followers: 0, recentPosts: [{ date: new Date().toISOString(), likes: 100, comments: 10 }] }),
      facebook: absent(),
      tiktok: absent(),
    }
    const ig = scoreSocialHealth(scan).platforms.find((p) => p.platform === "instagram")
    expect(ig?.engagement).toBe(0)
  })

  test("overall score: instagram 40%, facebook 35%, tiktok 25% weights", () => {
    const igFull = platform({
      bio: "yes", hasProfilePic: true, hasLink: true,
      followers: 1000,
      recentPosts: Array.from({ length: 10 }, () => ({ date: new Date().toISOString(), likes: 60, comments: 5 })),
    })
    const scan: SocialScanResult = { instagram: igFull, facebook: absent(), tiktok: absent() }
    expect(scoreSocialHealth(scan).score).toBe(40)
  })

  test("absent platform generates opportunity message", () => {
    const scan: SocialScanResult = { instagram: absent(), facebook: absent(), tiktok: absent() }
    const tiktok = scoreSocialHealth(scan).platforms.find((p) => p.platform === "tiktok")
    expect(tiktok?.opportunities.length).toBeGreaterThan(0)
  })

  test("score is clamped to 0-100", () => {
    const scan: SocialScanResult = { instagram: absent(), facebook: absent(), tiktok: absent() }
    const result = scoreSocialHealth(scan)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
