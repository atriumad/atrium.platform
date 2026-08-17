import type { NextRequest } from "next/server"
import { getLastResults, InvalidCheckError, isAvailable, runCheck } from "@/lib/checks"

/**
 * Local-only. Running turbo needs the working tree and the toolchain, neither of
 * which exists in a serverless function, so a deployment refuses instead of
 * failing halfway through. The deployed UI shows `data/checks.json` instead.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET() {
  if (!isAvailable()) {
    return Response.json({ available: false, results: {} })
  }
  return Response.json({ available: true, results: getLastResults() })
}

export async function POST(request: NextRequest) {
  if (!isAvailable()) {
    return Response.json(
      { error: "checks only run in local development; see data/checks.json" },
      { status: 501 },
    )
  }

  let body: { task?: string; target?: string; fresh?: boolean }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "expected a JSON body" }, { status: 400 })
  }
  if (!body.task || !body.target) {
    return Response.json({ error: "task and target are required" }, { status: 400 })
  }

  try {
    const result = await runCheck(body.task, body.target, { fresh: body.fresh === true })
    return Response.json({ result })
  } catch (error) {
    if (error instanceof InvalidCheckError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: "check failed to start" }, { status: 500 })
  }
}
