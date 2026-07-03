import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024 // 2MB — plenty for HTML/JSON, caps abuse

export class UnsafeUrlError extends Error {}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true

  const [a, b] = parts as [number, number, number, number]
  if (a === 10) return true // 10.0.0.0/8
  if (a === 127) return true // loopback
  if (a === 169 && b === 254) return true // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
  if (a === 192 && b === 168) return true // 192.168.0.0/16
  if (a === 0) return true // "this network"
  if (a >= 224) return true // multicast/reserved
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase()
  if (normalized === "::1") return true // loopback
  if (normalized.startsWith("::ffff:")) return isPrivateIPv4(normalized.slice(7))
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true // unique local (fc00::/7)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true // link-local (fe80::/10)
  return false
}

function isPrivateIp(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) return isPrivateIPv4(ip)
  if (version === 6) return isPrivateIPv6(ip)
  return true // couldn't parse — refuse rather than guess
}

/**
 * Throws if `rawUrl` is not safe to fetch server-side: rejects non-http(s)
 * schemes, IP-literal hosts in private/loopback/link-local ranges (including
 * cloud metadata IPs like 169.254.169.254), and hostnames that DNS-resolve
 * to a private address. This is the gate for any outbound fetch whose
 * target URL originates from crowd-sourced or user-supplied data (OSM tags,
 * Google-listed business websites, request bodies) rather than a hardcoded
 * API host.
 *
 * A hostname that fails to resolve is let through rather than blocked —
 * that's not a spoofing attempt, and the real fetch will fail on its own.
 */
export async function assertSafeExternalUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new UnsafeUrlError("Invalid URL")
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new UnsafeUrlError(`Unsupported protocol: ${url.protocol}`)
  }

  const hostname = url.hostname
  if (hostname === "localhost") {
    throw new UnsafeUrlError("Refusing to fetch localhost")
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new UnsafeUrlError("Refusing to fetch private/internal address")
    return url
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true }).catch(() => null)
  if (addresses?.some((a) => isPrivateIp(a.address))) {
    throw new UnsafeUrlError("Refusing to fetch private/internal address")
  }

  return url
}

/**
 * Fetch wrapper for external URLs that don't come from a hardcoded, trusted
 * API host (e.g. a restaurant's website pulled from OSM/Google data, or a
 * URL supplied directly in a request body). Validates the target isn't a
 * private/internal address before requesting, and caps the response body
 * size to avoid unbounded downloads.
 */
export async function safeFetch(
  rawUrl: string,
  init: RequestInit,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const url = await assertSafeExternalUrl(rawUrl)
  const res = await fetcher(url, init)

  const contentLength = Number(res.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    throw new UnsafeUrlError("Response too large")
  }

  if (!res.body) return res

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel()
      throw new UnsafeUrlError("Response too large")
    }
    chunks.push(value)
  }

  return new Response(new Blob(chunks as BlobPart[]), {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  })
}
