import type { NextRequest } from "next/server"
import { sweep } from "@/lib/health/runner"
import { store } from "@/lib/health/store"

/**
 * The autonomous half of the app. Vercel Cron calls this on the schedule in
 * `vercel.json`; it is the only thing that writes check history.
 *
 * Vercel signs scheduled invocations with `Authorization: Bearer $CRON_SECRET`.
 * Without the secret configured the endpoint stays open in development and
 * closed everywhere else, so a deployment can never be swept by a stranger.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  return request.headers.get("authorization") === `Bearer ${secret}`
}

async function handle(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const result = await sweep()

  return Response.json({
    checkedAt: new Date().toISOString(),
    durationMs: result.durationMs,
    durable: store().kind === "upstash",
    ran: result.runs.length,
    down: result.runs.filter((run) => run.status === "down").length,
    degraded: result.runs.filter((run) => run.status === "degraded").length,
    opened: result.opened.map((incident) => incident.monitorId),
    resolved: result.resolved.map((incident) => incident.monitorId),
  })
}

export async function GET(request: NextRequest) {
  return handle(request)
}

/** Same work either way — Vercel Cron uses GET, humans and hooks tend to POST. */
export async function POST(request: NextRequest) {
  return handle(request)
}
