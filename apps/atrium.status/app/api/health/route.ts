import { after } from "next/server"
import { healthPayload } from "@/lib/health/query"
import { sweepIfStale } from "@/lib/health/runner"

/**
 * The machine-readable status of the whole estate. Safe to make public: it
 * names systems and their state, never URLs, secrets or internals.
 *
 * Reading it also refreshes stale data in the background, which makes this a
 * valid target for any external scheduler — no secret required, and pinging it
 * every few minutes is enough to keep the board current on its own.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET() {
  after(() => sweepIfStale())

  const payload = await healthPayload()
  return Response.json(payload, {
    headers: {
      "cache-control": "no-store",
      // Anyone rendering a badge from this should be able to.
      "access-control-allow-origin": "*",
    },
  })
}
