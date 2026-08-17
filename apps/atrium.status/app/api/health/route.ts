import { healthPayload } from "@/lib/health/query"

/**
 * The machine-readable status of the whole estate. Safe to make public: it
 * names systems and their state, never URLs, secrets or internals.
 *
 * Also the endpoint the status app uses to watch itself from the outside.
 */

export const dynamic = "force-dynamic"

export async function GET() {
  const payload = await healthPayload()
  return Response.json(payload, {
    headers: {
      "cache-control": "no-store",
      // Anyone rendering a badge from this should be able to.
      "access-control-allow-origin": "*",
    },
  })
}
