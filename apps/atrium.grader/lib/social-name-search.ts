function normalizeStr(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function matchScore(candidate: string, businessName: string): number {
  const normC = normalizeStr(candidate)
  const normT = normalizeStr(businessName)

  if (normC === normT) return 1.0
  if (normC.includes(normT) || normT.includes(normC)) return 0.85

  const words = businessName.toLowerCase().split(/\s+/).filter((w) => w.length > 2).map(normalizeStr)
  if (words.length === 0) return 0
  const matched = words.filter((w) => normC.includes(w)).length
  return matched / words.length
}

type IgTopSearchResponse = {
  users?: Array<{ user: { username: string; full_name: string } }>
}

type TikTokSearchResponse = {
  user_list?: Array<{ user_info: { unique_id: string; nickname: string } }>
}

export async function searchInstagramByName(
  businessName: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const url = `https://www.instagram.com/web/search/topsearch/?query=${encodeURIComponent(businessName)}&context=blended`

  try {
    const res = await fetcher(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram/269.0.0.18.75",
        "X-IG-App-ID": "936619743392459",
      },
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) return null

    const data = await res.json() as IgTopSearchResponse
    const users = data.users ?? []

    for (const { user } of users.slice(0, 6)) {
      const score = Math.max(
        matchScore(user.username, businessName),
        matchScore(user.full_name, businessName),
      )
      if (score >= 0.6) return user.username
    }

    return null
  } catch {
    return null
  }
}

export async function searchTikTokByName(
  businessName: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  const url = `https://www.tiktok.com/api/search/user/full/?keyword=${encodeURIComponent(businessName)}&count=5&cursor=0&cookie_enabled=true&aid=1988&app_language=en&app_name=tiktok_web`

  try {
    const res = await fetcher(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 TikTok/29.2.4",
      },
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) return null

    const data = await res.json() as TikTokSearchResponse
    const users = data.user_list ?? []

    for (const { user_info } of users.slice(0, 5)) {
      const score = Math.max(
        matchScore(user_info.unique_id, businessName),
        matchScore(user_info.nickname, businessName),
      )
      if (score >= 0.6) return user_info.unique_id
    }

    return null
  } catch {
    return null
  }
}
