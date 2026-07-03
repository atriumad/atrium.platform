import type { SocialHandles, SocialPlatformData, SocialScanResult } from "@atrium/application"

const BASE_URL = "https://api.scrapecreators.com"
const TIMEOUT_MS = 10_000
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

    const raw = await profile.json() as Record<string, unknown>
    // API response: { data: { user: { biography, ... } } }
    const dataObj = (raw.data as Record<string, unknown> | undefined) ?? raw
    const p = (dataObj.user as Record<string, unknown> | undefined) ?? dataObj

    const postsBody = posts.ok ? (await posts.json() as Record<string, unknown>) : {}
    const profileItems = instagramTimelineItems(p)
    const postItems = instagramResponseItems(postsBody)
    const items = profileItems.length > 0 ? profileItems : postItems
    const followedBy = p.edge_followed_by as Record<string, unknown> | undefined

    return {
      exists: true,
      followers: toNumber(p.follower_count ?? p.followers_count ?? followedBy?.count),
      bio: toStr(p.biography),
      hasProfilePic: Boolean(p.profile_pic_url ?? p.profile_pic_url_hd ?? p.hd_profile_pic_url_info),
      hasLink: Boolean(p.external_url) || Boolean(Array.isArray(p.bio_links) && (p.bio_links as unknown[]).length > 0),
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
    if (p.accountDoesNotExist === true) return absent("Facebook account not found")
    const postsBody = posts.ok ? (await posts.json() as Record<string, unknown>) : {}
    const items = postsBody.data ?? postsBody.posts ?? []
    const profilePhoto = p.profilePhoto as Record<string, unknown> | undefined

    return {
      exists: true,
      followers: toNumber(p.followers ?? p.fans ?? p.followerCount ?? p.follower_count ?? p.followers_count ?? p.likeCount),
      bio: toStr(p.about ?? p.description ?? p.pageIntro ?? p.category),
      hasProfilePic: Boolean(p.picture ?? p.profile_picture ?? p.profilePicLarge ?? p.profilePicMedium ?? profilePhoto?.url),
      hasLink: Boolean(p.website) || Boolean(Array.isArray(p.links) && (p.links as unknown[]).length > 0),
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
    const items = videosBody.aweme_list ?? videosBody.itemList ?? videosBody.videos ?? []

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
      const raw = item as Record<string, unknown>
      const i = (raw.node as Record<string, unknown> | undefined) ?? raw
      const likedBy = i.edge_liked_by as Record<string, unknown> | undefined
      const previewLike = i.edge_media_preview_like as Record<string, unknown> | undefined
      const comments = i.edge_media_to_comment as Record<string, unknown> | undefined
      const date = toIsoDate(i.taken_at ?? i.taken_at_timestamp)
      if (!date) return null

      return {
        date,
        likes: toNumber(i.like_count ?? likedBy?.count ?? previewLike?.count) ?? 0,
        comments: toNumber(i.comment_count ?? comments?.count) ?? 0,
      }
    })
    .filter((p): p is SocialPlatformData["recentPosts"][number] => p !== null && new Date(p.date).getTime() >= cutoff)
}

function extractFacebookPosts(items: unknown): SocialPlatformData["recentPosts"] {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const reactions = (i.reactions as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined
      const comments = (i.comments as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined
      const date = toIsoDate(i.publishTime ?? i.timestamp ?? i.created_time)
      if (!date) return null

      return {
        date,
        likes: toNumber(i.reactionCount ?? reactions?.total_count) ?? 0,
        comments: toNumber(i.commentCount ?? comments?.total_count) ?? 0,
      }
    })
    .filter((p): p is SocialPlatformData["recentPosts"][number] => p !== null && new Date(p.date).getTime() >= cutoff)
}

function extractTikTokPosts(items: unknown): SocialPlatformData["recentPosts"] {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.slice(0, POST_LIMIT)
    .map((item) => {
      const i = item as Record<string, unknown>
      const stats = (i.stats ?? i.statistics ?? {}) as Record<string, unknown>
      const date = toIsoDate(i.createTime ?? i.create_time)
      if (!date) return null

      return {
        date,
        likes: toNumber(stats.diggCount ?? stats.likeCount ?? stats.digg_count ?? stats.like_count) ?? 0,
        comments: toNumber(stats.commentCount ?? stats.comment_count) ?? 0,
      }
    })
    .filter((p): p is SocialPlatformData["recentPosts"][number] => p !== null && new Date(p.date).getTime() >= cutoff)
}

function absent(error: string): SocialPlatformData {
  return { exists: false, followers: null, bio: null, hasProfilePic: false, hasLink: false, recentPosts: [], error }
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
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

function instagramTimelineItems(profile: Record<string, unknown>): unknown[] {
  const timeline = profile.edge_owner_to_timeline_media as Record<string, unknown> | undefined
  return Array.isArray(timeline?.edges) ? timeline.edges : []
}

function instagramResponseItems(body: Record<string, unknown>): unknown[] {
  if (Array.isArray(body.items)) return body.items
  if (Array.isArray(body.posts)) return body.posts
  if (Array.isArray(body.data)) return body.data

  const data = body.data as Record<string, unknown> | undefined
  const user = data?.user as Record<string, unknown> | undefined
  return user ? instagramTimelineItems(user) : []
}

function toIsoDate(value: unknown): string | null {
  const n = toNumber(value)
  if (n !== null) {
    const ms = n > 1_000_000_000_000 ? n : n * 1000
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null
  }

  const s = toStr(value)
  if (!s) return null

  const ms = Date.parse(s)
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null
}
