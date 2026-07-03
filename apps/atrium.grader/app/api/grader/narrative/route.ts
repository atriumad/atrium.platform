import { NextResponse } from "next/server"
import type { AgentContext } from "@/lib/report-agent"
import { generateReportNarrative } from "@/lib/report-agent"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as AgentContext | null

  if (!body?.profile || !body?.scores) {
    return NextResponse.json({ narrative: null })
  }

  const narrative = await generateReportNarrative(body)
  return NextResponse.json({ narrative })
}
