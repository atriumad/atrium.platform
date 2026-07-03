import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Best-effort per-instance rate limit. Runs on the Edge runtime (no shared
// store), so under multiple warm instances the effective limit is
// `WINDOW_LIMIT * instanceCount`. Good enough to blunt scripted abuse and
// SSRF-probing traffic against the paid/external-fetching grader routes;
// swap for an Upstash Redis-backed limiter if this needs to hold under
// multi-region serverless scale.
const WINDOW_MS = 60_000
const WINDOW_LIMIT = 20

const hits = new Map<string, { count: number; resetAt: number }>()
const PRUNE_THRESHOLD = 5_000

function pruneExpired(now: number): void {
  if (hits.size < PRUNE_THRESHOLD) return
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key)
  }
}

function clientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown"
  return `${ip}:${request.nextUrl.pathname}`
}

export function middleware(request: NextRequest) {
  const key = clientKey(request)
  const now = Date.now()
  pruneExpired(now)
  const entry = hits.get(key)

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  entry.count += 1
  if (entry.count > WINDOW_LIMIT) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": Math.ceil((entry.resetAt - now) / 1000).toString() } },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/grader/:path*"],
}
