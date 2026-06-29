import type { SocialHandles } from "@atrium/application"

const INSTAGRAM_SKIP = /instagram\.com\/(p|reel|stories|explore|accounts|tv)\//i
const FACEBOOK_SKIP = /facebook\.com\/(sharer|dialog|plugins|login)\b/i

export function detectSocialHandles(html: string): SocialHandles {
  const hrefs = extractHrefs(html)

  const instagram = hrefs
    .filter((href) => /instagram\.com\/[a-zA-Z0-9._]+/.test(href) && !INSTAGRAM_SKIP.test(href))
    .map((href) => href.match(/instagram\.com\/(?:www\.)?([a-zA-Z0-9._]+)/)?.[1] ?? null)
    .find((h): h is string => h !== null && h.length > 0) ?? null

  const facebook = hrefs
    .filter((href) => /facebook\.com\/[a-zA-Z0-9._-]+/.test(href) && !FACEBOOK_SKIP.test(href))
    .map((href) => {
      try {
        const url = new URL(href.startsWith("http") ? href : `https:${href}`)
        url.search = ""
        return url.toString()
      } catch {
        return null
      }
    })
    .find((url): url is string => url !== null && url.length > 0) ?? null

  const tiktok = hrefs
    .filter((href) => /tiktok\.com\/@[a-zA-Z0-9._]+/.test(href))
    .map((href) => href.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/)?.[1] ?? null)
    .find((h): h is string => h !== null && h.length > 0) ?? null

  const confidence: "detected" | "manual" =
    instagram !== null || facebook !== null || tiktok !== null ? "detected" : "manual"

  return { instagram, facebook, tiktok, confidence }
}

function extractHrefs(html: string): string[] {
  const hrefs: string[] = []
  const re = /href=["']([^"']+)["']/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(html)) !== null) {
    if (match[1]) hrefs.push(match[1])
  }

  return hrefs
}
