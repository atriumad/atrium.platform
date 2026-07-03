const SCRAPECREATORS_BASE = "https://api.scrapecreators.com"
const TIMEOUT_MS = 8_000
const MIN_SEARCH_MATCH = 0.6

export type SocialSearchContext = {
  readonly address?: string | null
}

function getScrapeCreatorsKey(): string | null {
  const v = process.env.SCRAPECREATORS_API_KEY?.trim()
  return v && v.length > 0 ? v : null
}

/**
 * Generate normalized handle candidates from a business name.
 * "TACO NACO KC" → ["taconacokc", "taco_naco_kc", "taconaco", "taconaco_kc"]
 */
function handleCandidates(name: string): string[] {
  const lower = name.toLowerCase()
  const words = lower.split(/\s+/).filter((w) => w.length > 0)

  const noSpaces = words.join("")
  const underscored = words.join("_")
  const noSpecial = noSpaces.replace(/[^a-z0-9]/g, "")

  // Also try dropping last word if it's a city suffix (1-2 chars like "kc", "la", "ny")
  const withoutSuffix = words.length > 1 && (words[words.length - 1]?.length ?? 0) <= 3
    ? words.slice(0, -1).join("")
    : null

  const candidates = [noSpecial, noSpaces, underscored]
  if (withoutSuffix) candidates.push(withoutSuffix)

  return [...new Set(candidates)].filter((c) => c.length >= 3)
}

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function nameMatchScore(candidate: string, businessName: string): number {
  const normC = normalizeStr(candidate)
  const normT = normalizeStr(businessName)

  if (normC === normT) return 1.0
  if (normC.includes(normT) || normT.includes(normC)) return 0.85

  const words = businessName.toLowerCase().split(/\s+/).filter((w) => w.length > 2).map(normalizeStr)
  if (words.length === 0) return 0
  const matched = words.filter((w) => normC.includes(w)).length
  return matched / words.length
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : null
}

function toStr(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function textMatchScore(parts: Array<string | null>, businessName: string): number {
  return Math.max(0, ...parts.map((part) => part ? nameMatchScore(part, businessName) : 0))
}

function followerBoost(value: unknown): number {
  const followers = toNumber(value)
  if (!followers || followers <= 0) return 0
  return Math.min(Math.log10(followers + 1) / 100, 0.05)
}

async function scrapeJson(path: string, apiKey: string, fetcher: typeof fetch): Promise<unknown | null> {
  try {
    const res = await fetcher(`${SCRAPECREATORS_BASE}${path}`, {
      headers: { "x-api-key": apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    return await res.json() as unknown
  } catch {
    return null
  }
}

async function checkInstagramHandle(handle: string, apiKey: string, fetcher: typeof fetch): Promise<boolean> {
  try {
    const body = await scrapeJson(`/v1/instagram/profile?handle=${encodeURIComponent(handle)}`, apiKey, fetcher)
    const raw = toRecord(body)
    if (!raw) return false
    const data = toRecord(raw.data) ?? raw
    const user = toRecord(data.user) ?? data
    // Confirm it's a real account with some activity
    return Boolean(user.pk ?? user.id ?? user.biography)
  } catch {
    return false
  }
}

async function checkTikTokHandle(handle: string, apiKey: string, fetcher: typeof fetch): Promise<boolean> {
  try {
    const body = await scrapeJson(`/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`, apiKey, fetcher)
    const raw = toRecord(body)
    if (!raw) return false
    const user = toRecord(raw.user) ?? toRecord(toRecord(raw.userInfo)?.user) ?? raw
    return Boolean(user.uniqueId ?? user.id)
  } catch {
    return false
  }
}

async function searchInstagramProfiles(
  businessName: string,
  apiKey: string,
  fetcher: typeof fetch,
): Promise<string | null> {
  const body = toRecord(await scrapeJson(
    `/v1/instagram/search/profiles?query=${encodeURIComponent(businessName)}`,
    apiKey,
    fetcher,
  ))
  const profiles = Array.isArray(body?.profiles) ? body.profiles : []

  let best: { handle: string; score: number } | null = null
  for (const item of profiles.slice(0, 8)) {
    const profile = toRecord(item)
    const handle = toStr(profile?.username)
    if (!profile || !handle) continue

    const baseScore = textMatchScore([handle, toStr(profile.full_name), toStr(profile.biography)], businessName)
    const sourceBoost = profile.matched_from === "profile" ? 0.12 : 0
    const businessBoost = profile.is_business_account === true || profile.is_professional_account === true ? 0.04 : 0
    const score = baseScore + sourceBoost + businessBoost + followerBoost(profile.follower_count)

    if (!best || score > best.score) best = { handle, score }
  }

  return best && best.score >= MIN_SEARCH_MATCH ? best.handle : null
}

async function searchTikTokUsers(
  businessName: string,
  apiKey: string,
  fetcher: typeof fetch,
): Promise<string | null> {
  const body = toRecord(await scrapeJson(
    `/v1/tiktok/search/users?query=${encodeURIComponent(businessName)}&trim=true`,
    apiKey,
    fetcher,
  ))
  const users = Array.isArray(body?.users) ? body.users : Array.isArray(body?.user_list) ? body.user_list : []

  let best: { handle: string; score: number } | null = null
  for (const item of users.slice(0, 8)) {
    const wrapper = toRecord(item)
    const user = toRecord(wrapper?.user_info) ?? wrapper
    const handle = toStr(user?.unique_id ?? user?.uniqueId)
    if (!user || !handle) continue

    const baseScore = textMatchScore([handle, toStr(user.nickname), toStr(user.signature)], businessName)
    const score = baseScore + followerBoost(user.follower_count)

    if (!best || score > best.score) best = { handle, score }
  }

  return best && best.score >= MIN_SEARCH_MATCH ? best.handle : null
}

function normalizeFacebookUrl(value: string): string | null {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^m\./, "www.")
    if (host !== "facebook.com" && host !== "www.facebook.com") return null

    const path = url.pathname.toLowerCase()
    if (
      path.includes("/videos/")
      || path.includes("/photo")
      || path.includes("/photos/")
      || path.includes("/posts/")
      || path.includes("/reel/")
      || path.includes("/groups/")
      || path.includes("/events/")
      || path.includes("/watch/")
      || path.includes("/sharer")
      || path.includes("/login")
    ) {
      return null
    }

    url.hostname = "www.facebook.com"
    url.search = ""
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

export async function searchFacebookByName(
  businessName: string,
  context: SocialSearchContext = {},
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const apiKey = getScrapeCreatorsKey()
  if (!apiKey) return null

  const query = [businessName, context.address, "Facebook"].filter(Boolean).join(" ")
  const body = toRecord(await scrapeJson(
    `/v1/google/search?query=${encodeURIComponent(query)}&region=US`,
    apiKey,
    fetcher,
  ))
  const results = Array.isArray(body?.results) ? body.results : []

  let best: { url: string; score: number } | null = null
  for (const item of results.slice(0, 8)) {
    const result = toRecord(item)
    const url = toStr(result?.url)
    const profileUrl = url ? normalizeFacebookUrl(url) : null
    if (!result || !profileUrl) continue

    const baseScore = textMatchScore(
      [toStr(result.title), toStr(result.description), profileUrl],
      businessName,
    )
    const score = baseScore + (profileUrl.includes("/pages/") ? 0.02 : 0.05)

    if (!best || score > best.score) best = { url: profileUrl, score }
  }

  return best && best.score >= MIN_SEARCH_MATCH ? best.url : null
}

export async function searchInstagramByName(
  businessName: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const apiKey = getScrapeCreatorsKey()
  if (!apiKey) return null

  const searchResult = await searchInstagramProfiles(businessName, apiKey, fetcher)
  if (searchResult) return searchResult

  const candidates = handleCandidates(businessName)

  for (const candidate of candidates) {
    // Quick name-score gate before burning API credits on clearly wrong candidates
    if (nameMatchScore(candidate, businessName) < 0.5) continue
    const exists = await checkInstagramHandle(candidate, apiKey, fetcher)
    if (exists) return candidate
  }

  return null
}

export async function searchTikTokByName(
  businessName: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const apiKey = getScrapeCreatorsKey()
  if (!apiKey) return null

  const searchResult = await searchTikTokUsers(businessName, apiKey, fetcher)
  if (searchResult) return searchResult

  const candidates = handleCandidates(businessName)

  for (const candidate of candidates) {
    if (nameMatchScore(candidate, businessName) < 0.5) continue
    const exists = await checkTikTokHandle(candidate, apiKey, fetcher)
    if (exists) return candidate
  }

  return null
}
