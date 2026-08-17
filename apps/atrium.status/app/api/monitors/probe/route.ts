import type { NextRequest } from "next/server"
import { findMonitor } from "@/config/systems"
import { probe } from "@/lib/health/runner"

/**
 * Runs one monitor on demand — the "check now" button.
 *
 * The caller sends a monitor id, never a URL, so this cannot be used as an
 * open proxy: the only reachable targets are the ones in the registry. It
 * records the run like any other, but does not open or close incidents; that
 * stays the cron's job so a human refresh cannot rewrite the timeline.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  let body: { monitorId?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "expected a JSON body" }, { status: 400 })
  }

  if (!body.monitorId) {
    return Response.json({ error: "monitorId is required" }, { status: 400 })
  }

  const target = findMonitor(body.monitorId)
  if (!target) {
    return Response.json({ error: `unknown monitor "${body.monitorId}"` }, { status: 404 })
  }
  if (target.monitor.enabled === false) {
    return Response.json(
      { error: `monitor is paused: ${target.monitor.disabledReason}` },
      { status: 409 },
    )
  }

  const run = await probe(body.monitorId)
  return Response.json({ run })
}
