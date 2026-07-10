import type { RestaurantGrowthProfile, RestaurantGrowthReport } from "@atrium/application"
import { NextResponse } from "next/server"
import type { GoogleLocalBenchmark, GooglePlaceMeta } from "@/lib/google-places-client"
import { generateReportNarrative } from "@/lib/report-agent"
import { buildAgentEvidenceContext } from "@/lib/report-evidence"

type NarrativeRequest = {
  readonly profile?: RestaurantGrowthProfile
  readonly googleMeta?: GooglePlaceMeta | null
  readonly localBenchmark?: GoogleLocalBenchmark | null
  readonly report?: RestaurantGrowthReport
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as NarrativeRequest | null

  if (!body?.profile || !body?.report) {
    return NextResponse.json({ narrative: null })
  }

  const evidence = buildAgentEvidenceContext({
    profile: body.profile,
    googleMeta: body.googleMeta ?? null,
    report: body.report,
    localBenchmark: body.localBenchmark ?? null,
  })

  const narrative = await generateReportNarrative({
    profile: body.profile,
    evidence,
    scores: body.report.scores,
    overallScore: body.report.overallScore,
    issues: body.report.issues,
    recommendations: body.report.recommendations,
  })

  return NextResponse.json({ narrative })
}
