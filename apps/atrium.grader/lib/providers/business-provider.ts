import type { RestaurantGrowthProfile } from "@atrium/application"
import type { GooglePlaceMeta } from "../google-places-client"
import type { PlaceSuggestion } from "../place-suggestion"
import type { ManualReputationInput } from "../place-utils"

export type BusinessDataProviderName = "google"

export type BusinessProfileLookup = {
  readonly profile: RestaurantGrowthProfile
  readonly googleMeta: GooglePlaceMeta | null
}

export type BusinessDataProvider = {
  readonly name: BusinessDataProviderName
  search(query: string, fetcher?: typeof fetch): Promise<PlaceSuggestion[]>
  getProfile(
    placeId: string,
    reputation?: ManualReputationInput,
    fetcher?: typeof fetch,
  ): Promise<RestaurantGrowthProfile>
}

export class BusinessProviderConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BusinessProviderConfigError"
  }
}

type GooglePlacesUsageState = {
  dayKey: string
  monthKey: string
  daily: number
  monthly: number
  warnedInMemory: boolean
}

const googlePlacesUsage: GooglePlacesUsageState = {
  dayKey: "",
  monthKey: "",
  daily: 0,
  monthly: 0,
  warnedInMemory: false,
}

function readGoogleBudgetLimit(envName: "GRADER_GOOGLE_DAILY_LIMIT" | "GRADER_GOOGLE_MONTHLY_LIMIT"): number | null {
  const value = process.env[envName]?.trim()
  if (!value) return null

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new BusinessProviderConfigError(`${envName} must be a non-negative integer`)
  }

  return parsed
}

function refreshGooglePlacesUsageWindow(now: Date): void {
  const dayKey = now.toISOString().slice(0, 10)
  const monthKey = now.toISOString().slice(0, 7)

  if (googlePlacesUsage.dayKey !== dayKey) {
    googlePlacesUsage.dayKey = dayKey
    googlePlacesUsage.daily = 0
  }

  if (googlePlacesUsage.monthKey !== monthKey) {
    googlePlacesUsage.monthKey = monthKey
    googlePlacesUsage.monthly = 0
  }
}

export function resetGooglePlacesBudgetUsage(): void {
  googlePlacesUsage.dayKey = ""
  googlePlacesUsage.monthKey = ""
  googlePlacesUsage.daily = 0
  googlePlacesUsage.monthly = 0
  googlePlacesUsage.warnedInMemory = false
}

export function recordGooglePlacesUsage(operation: string, now = new Date()): void {
  const dailyLimit = readGoogleBudgetLimit("GRADER_GOOGLE_DAILY_LIMIT")
  const monthlyLimit = readGoogleBudgetLimit("GRADER_GOOGLE_MONTHLY_LIMIT")

  if (dailyLimit === null && monthlyLimit === null) return

  refreshGooglePlacesUsageWindow(now)

  if (!googlePlacesUsage.warnedInMemory) {
    console.warn("Google Places budget guard is using in-memory per-process counters.")
    googlePlacesUsage.warnedInMemory = true
  }

  if (dailyLimit !== null && googlePlacesUsage.daily >= dailyLimit) {
    throw new BusinessProviderConfigError(`Google Places daily budget limit reached for ${operation}`)
  }

  if (monthlyLimit !== null && googlePlacesUsage.monthly >= monthlyLimit) {
    throw new BusinessProviderConfigError(`Google Places monthly budget limit reached for ${operation}`)
  }

  googlePlacesUsage.daily += 1
  googlePlacesUsage.monthly += 1
}
