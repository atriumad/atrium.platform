export type SocialHandles = {
  readonly instagram: string | null
  readonly facebook: string | null
  readonly tiktok: string | null
  readonly confidence: "detected" | "manual"
}

export type SocialPost = {
  readonly date: string
  readonly likes: number
  readonly comments: number
}

export type SocialPlatformData = {
  readonly exists: boolean
  readonly followers: number | null
  readonly bio: string | null
  readonly hasProfilePic: boolean
  readonly hasLink: boolean
  readonly recentPosts: SocialPost[]
  readonly error?: string
}

export type SocialScanResult = {
  readonly instagram: SocialPlatformData
  readonly facebook: SocialPlatformData
  readonly tiktok: SocialPlatformData
}

export type SocialPlatformScore = {
  readonly platform: "instagram" | "facebook" | "tiktok"
  readonly score: number
  readonly presence: number
  readonly completeness: number
  readonly activity: number
  readonly engagement: number
  readonly issues: string[]
  readonly opportunities: string[]
  readonly recommendedActions: string[]
}

export type SocialHealthScore = {
  readonly score: number
  readonly platforms: SocialPlatformScore[]
  readonly issues: string[]
  readonly opportunities: string[]
  readonly recommendedActions: string[]
}

const PLATFORM_WEIGHTS: Record<"instagram" | "facebook" | "tiktok", number> = {
  instagram: 0.40,
  facebook: 0.35,
  tiktok: 0.25,
}

const PLATFORM_LABELS: Record<"instagram" | "facebook" | "tiktok", string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
}

export function scoreSocialHealth(scan: SocialScanResult): SocialHealthScore {
  const platforms: SocialPlatformScore[] = [
    scorePlatform("instagram", scan.instagram),
    scorePlatform("facebook", scan.facebook),
    scorePlatform("tiktok", scan.tiktok),
  ]

  const score = roundScore(
    platforms.reduce((acc, p) => acc + p.score * PLATFORM_WEIGHTS[p.platform], 0),
  )

  return {
    score,
    platforms,
    issues: platforms.flatMap((p) => p.issues),
    opportunities: platforms.flatMap((p) => p.opportunities),
    recommendedActions: platforms.flatMap((p) => p.recommendedActions),
  }
}

function scorePlatform(
  platform: "instagram" | "facebook" | "tiktok",
  data: SocialPlatformData,
): SocialPlatformScore {
  const label = PLATFORM_LABELS[platform]

  if (!data.exists) {
    return {
      platform,
      score: 0,
      presence: 0,
      completeness: 0,
      activity: 0,
      engagement: 0,
      issues: [],
      opportunities: [`${label} sin cuenta — crear perfil para ampliar visibilidad.`],
      recommendedActions: [`Crear cuenta en ${label} para este restaurante.`],
    }
  }

  const presence = 25
  const completeness = scoreCompleteness(data)
  const activity = scoreActivity(data.recentPosts.length)
  const engagement = scoreEngagement(data.recentPosts, data.followers)
  const score = roundScore(presence + completeness + activity + engagement)

  return {
    platform,
    score,
    presence,
    completeness,
    activity,
    engagement,
    issues: buildPlatformIssues(label, data, activity, engagement),
    opportunities: buildPlatformOpportunities(label, data, activity),
    recommendedActions: buildPlatformActions(label, data, activity),
  }
}

function scoreCompleteness(data: SocialPlatformData): number {
  let pts = 0
  if (data.bio) pts += 10
  if (data.hasProfilePic) pts += 8
  if (data.hasLink) pts += 7
  return pts
}

function scoreActivity(postCount: number): number {
  if (postCount >= 8) return 25
  if (postCount >= 4) return 18
  if (postCount >= 1) return 10
  return 0
}

function scoreEngagement(posts: SocialPost[], followers: number | null): number {
  if (!followers || followers <= 0 || posts.length === 0) return 0
  const avgInteractions = posts.reduce((acc, p) => acc + p.likes + p.comments, 0) / posts.length
  const rate = avgInteractions / followers
  if (rate > 0.05) return 25
  if (rate >= 0.02) return 18
  if (rate >= 0.005) return 10
  return 5
}

function buildPlatformIssues(label: string, data: SocialPlatformData, activity: number, engagement: number): string[] {
  const issues: string[] = []
  if (!data.bio) issues.push(`Sin bio en ${label}.`)
  if (!data.hasProfilePic) issues.push(`Sin foto de perfil en ${label}.`)
  if (!data.hasLink) issues.push(`Sin link al sitio web en ${label}.`)
  if (activity === 0) issues.push(`Sin publicaciones en los últimos 30 días en ${label}.`)
  if (engagement <= 5 && data.recentPosts.length > 0) issues.push(`Engagement bajo en ${label}.`)
  return issues
}

function buildPlatformOpportunities(label: string, data: SocialPlatformData, activity: number): string[] {
  const opportunities: string[] = []
  if (activity < 18) opportunities.push(`Aumentar frecuencia de publicaciones en ${label} a mínimo 4 por mes.`)
  if (!data.bio || !data.hasLink) opportunities.push(`Completar el perfil de ${label} con bio y link al sitio web.`)
  return opportunities
}

function buildPlatformActions(label: string, data: SocialPlatformData, activity: number): string[] {
  const actions: string[] = []
  if (!data.bio) actions.push(`Escribir una bio clara con especialidad y ciudad en ${label}.`)
  if (!data.hasLink) actions.push(`Agregar link al menú o sitio web en ${label}.`)
  if (activity === 0) actions.push(`Publicar al menos una foto de plato o ambiente esta semana en ${label}.`)
  return actions
}

function roundScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)))
}
