import type { SocialHandles, SocialPlatformData, SocialScanResult } from "@atrium/application"

const BASE_URL = "https://api.scrapecreators.com"
const TIMEOUT_MS = 5_000
const POST_LIMIT = 12
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function scanSocialProfiles(
  handles: SocialHandles,
  fetcher: typeof fetch = fetch,
): Promise<SocialScanResult> {
  const apiKey = getScrapeCreatorsApiKey()

  if (!apiKey) {
    const msg = "SCRAPECREATORS_API_KEY not set"
    return { instagram: absent(msg), facebook: absent(msg), tiktok: absent(msg) }
  }

  const [instagram, facebook, tiktok] = await Promise.all([
    handles.instagram
      ? fetchInstagram(handles.instagram, apiKey, fetcher)
      : Promise.resolve(absent("No Instagram handle")),
    handles.facebook
      ? fetchFacebook(handles.facebook, apiKey, fetcher)
      : Promise.resolve(absent("No Facebook URL")),
    handles.tiktok
      ? fetchTikTok(handles.tiktok, apiKey, fetcher)
      : Promise.resolve(absent("No TikTok handle")),
  ])

  return { instagram, facebook, tiktok }
}

async function fetchInstagram(handle: string, apiKey: string, fetcher: typeof fetch): Promise<SocialPlatformData> {
  try {
    const [profile, posts] = await Promise.all([
      scrapeGet(`/v1/instagram/profile?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
      scrapeGet(`/v2/instagram/user/posts?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
    ])

    if (!profile.ok) return absent(`Instagram not found (${profile.status})`)

    const p = await profile.json() as Record<string, unknown>
    const postsBody = posts.ok ? (await posts.json() as Record<string, unknown>) : {}
    const items = postsBody.data ?? postsBody.items ?? []

    return {
      exists: true,
      followers: toNumber(p.follower_count ?? p.followers_count),
      bio: toStr(p.biography),
      hasProfilePic: Boolean(p.profile_pic_url ?? p.hd_profile_pic_url_info),
      hasLink: Boolean(p.external_url) || Boolean(Array.isArray(p.bio_links) && p.bio_links.length > 0),
      recentPosts: extractInstagramPosts(items),
    }
  } catch (e) {
    return absent(String(e))
  }
}

async function fetchFacebook(url: string, apiKey: string, fetcher: typeof fetch): Promise<SocialPlatformData> {
  try {
    const [profile, posts] = await Promise.all([
      scrapeGet(`/v1/facebook/profile?url=${encodeURIComponent(url)}`, apiKey, fetcher),
      scrapeGet(`/v1/facebook/profile/posts?url=${encodeURIComponent(url)}`, apiKey, fetcher),
    ])

    if (!profile.ok) return absent(`Facebook not found (${profile.status})`)

    const p = await profile.json() as Record<string, unknown>
    const postsBody = posts.ok ? (await posts.json() as Record<string, unknown>) : {}
    const items = postsBody.data ?? postsBody.posts ?? []

    return {
      exists: true,
      followers: toNumber(p.followers ?? p.fans),
      bio: toStr(p.about ?? p.description),
      hasProfilePic: Boolean(p.picture ?? p.profile_picture),
      hasLink: Boolean(p.website),
      recentPosts: extractFacebookPosts(items),
    }
  } catch (e) {
    return absent(String(e))
  }
}

async function fetchTikTok(handle: string, apiKey: string, fetcher: typeof fetch): Promise<SocialPlatformData> {
  try {
    const [profile, videos] = await Promise.all([
      scrapeGet(`/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
      scrapeGet(`/v3/tiktok/profile/videos?handle=${encodeURIComponent(handle)}`, apiKey, fetcher),
    ])

    if (!profile.ok) return absent(`TikTok not found (${profile.status})`)

    const p = await profile.json() as Record<string, unknown>
    const videosBody = videos.ok ? (await videos.json() as Record<string, unknown>) : {}
    const items = videosBody.itemList ?? videosBody.videos ?? []

    const userInfo = (p.userInfo ?? {}) as Record<string, unknown>
    const user = (userInfo.user ?? p.user ?? p) as Record<string, unknown>
    const stats = (userInfo.stats ?? p.stats ?? {}) as Record<string, unknown>
    const bioLink = user.bioLink as Record<string, unknown> | undefined

    return {
      exists: true,
      followers: toNumber(stats.followerCount ?? stats.fans),
      bio: toStr(user.signature ?? user.bio),
      hasProfilePic: Boolean(user.avatarMedium ?? user.avatar_medium),
      hasLink: Boolean(bioLink?.link ?? user.bio_link),
      recentPosts: extractTikTokPosts(items),
    }
  } catch (e) {
    return absent(String(e))
  }
}

function scrapeGet(path: string, apiKey: string, fetcher: typeof fetch): Promise<Response> {
  return fetcher(`${BASE_URL}${path}`, {
    headers: { "x-api-key": apiKey },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

function extractInstagramPosts(items: unknown): SocialPlatformData["recentPosts"] {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const ts = toNumber(i.taken_at ?? i.taken_at_timestamp) ?? 0
      const dateMs = ts > 1_000_000_000_000 ? ts : ts * 1000
      return { date: new Date(dateMs).toISOString(), likes: toNumber(i.like_count) ?? 0, comments: toNumber(i.comment_count) ?? 0 }
    })
    .filter((p) => new Date(p.date).getTime() >= cutoff)
}

function extractFacebookPosts(items: unknown): SocialPlatformData["recentPosts"] {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const reactions = (i.reactions as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined
      const comments = (i.comments as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined
      const ts = toStr(i.timestamp ?? i.created_time)
      const dateMs = ts ? new Date(ts).getTime() : 0
      return { date: new Date(dateMs).toISOString(), likes: toNumber(reactions?.total_count) ?? 0, comments: toNumber(comments?.total_count) ?? 0 }
    })
    .filter((p) => new Date(p.date).getTime() >= cutoff)
}

function extractTikTokPosts(items: unknown): SocialPlatformData["recentPosts"] {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const stats = (i.stats ?? {}) as Record<string, unknown>
      const ts = toNumber(i.createTime ?? i.create_time) ?? 0
      return { date: new Date(ts * 1000).toISOString(), likes: toNumber(stats.diggCount ?? stats.likeCount) ?? 0, comments: toNumber(stats.commentCount) ?? 0 }
    })
    .filter((p) => new Date(p.date).getTime() >= cutoff)
}

function absent(error: string): SocialPlatformData {
  return { exists: false, followers: null, bio: null, hasProfilePic: false, hasLink: false, recentPosts: [], error }
}

function toNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toStr(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return null
}

function getScrapeCreatorsApiKey(): string | null {
  const value = process.env.SCRAPECREATORS_API_KEY?.trim()
  return value && value.length > 0 ? value : null
}
