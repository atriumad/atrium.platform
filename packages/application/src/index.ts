// Auth
export type { AuthErrorCode } from "./auth/auth-errors"
export { AuthError } from "./auth/auth-errors"
export { createTenantSlug, normalizeAuthEmail } from "./auth/auth-normalization"
export type {
  AuthRepository,
  AuthUser,
  AuthUserWithPassword,
  CreateOwnerWithTenantInput,
  CustomerSegmentSeed,
  PasswordHasher,
  SegmentRule,
  SegmentRuleValue,
} from "./auth/auth-ports"
export type { AuthenticateUserInput, AuthenticateUserResult } from "./auth/authenticate-user"
export { AuthenticateUser } from "./auth/authenticate-user"
export type { RegisterOwnerInput, RegisterOwnerResult } from "./auth/register-owner"
export { RegisterOwner } from "./auth/register-owner"
export { SYSTEM_CUSTOMER_SEGMENTS } from "./auth/system-segments"

// CRM

export type { ChurnRiskParams, ChurnRiskResult } from "./crm/churn-risk-service"
export { computeChurnRiskScore } from "./crm/churn-risk-service"
export type { ComputeChurnRiskInput, ComputeChurnRiskResult } from "./crm/compute-churn-risk"
export { ComputeChurnRisk } from "./crm/compute-churn-risk"
export type { CustomerProfile, GetCustomerProfileInput } from "./crm/get-customer-profile"
export { GetCustomerProfile } from "./crm/get-customer-profile"
export type { ListCustomersInput, ListCustomersResult } from "./crm/list-customers"
export { ListCustomers } from "./crm/list-customers"

// Diagnostics
export type {
  RestaurantConversionSignals,
  RestaurantGrowthIssue,
  RestaurantGrowthOpportunity,
  RestaurantGrowthProfile,
  RestaurantGrowthRecommendation,
  RestaurantGrowthReport,
  RestaurantGrowthScores,
  RestaurantWebsiteSignals,
} from "./diagnostics/restaurant-growth-grader"
export { gradeRestaurantGrowth } from "./diagnostics/restaurant-growth-grader"

// Social
export type {
  SocialHandles,
  SocialHealthScore,
  SocialPlatformData,
  SocialPlatformScore,
  SocialPost,
  SocialScanResult,
} from "./diagnostics/social-health-scorer"
export { scoreSocialHealth } from "./diagnostics/social-health-scorer"

// Health Score
export {
  computeReputationScore,
  computeRetentionScore,
  computeRevenueScore,
  computeTrafficScore,
  computeTrend,
} from "./health-score/health-score-service"
export type { RecalculateHealthScoreInput } from "./health-score/recalculate-health-score"
export { RecalculateHealthScore } from "./health-score/recalculate-health-score"
