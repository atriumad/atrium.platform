import type { NextRequest } from "next/server"
import { alertingIsConfigured, sendTestAlert } from "@/lib/health/alerts"

/**
 * Proves the alert wiring works without waiting for something to break.
 *
 * Guarded by the same `CRON_SECRET` as the sweep endpoint, because this one
 * sends real messages to real people — leaving it open would hand anyone a
 * button that pages the team.
 *
 * GET reports what is configured and sends nothing. POST sends.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 30

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  return request.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  return Response.json({
    configured: alertingIsConfigured(),
    channel: "slack",
    hint: "POST to this URL to send a test alert.",
  })
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  if (!alertingIsConfigured()) {
    return Response.json(
      { error: "no alert channel configured", hint: "Set SLACK_WEBHOOK_URL." },
      { status: 503 },
    )
  }

  const outcome = await sendTestAlert()

  return Response.json(
    outcome,
    // 502 when the send failed: the caller asked for a message and got none.
    { status: outcome.delivery.ok ? 200 : 502 },
  )
}
