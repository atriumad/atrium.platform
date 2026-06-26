export type AuthUser = {
  readonly id: string
  readonly email: string
  readonly role: string
  readonly tenantId: string | null
}

export type AuthUserWithPassword = AuthUser & {
  readonly passwordHash: string
}

export type SegmentRuleValue = string | number | boolean

export type SegmentRule = {
  readonly field: string
  readonly operator: string
  readonly value: SegmentRuleValue
}

export type CustomerSegmentSeed = {
  readonly name: string
  readonly type: "system"
  readonly rules: readonly SegmentRule[]
}

export type CreateOwnerWithTenantInput = {
  readonly name: string
  readonly slug: string
  readonly timezone: string
  readonly email: string
  readonly passwordHash: string
  readonly segments: readonly CustomerSegmentSeed[]
}

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUserWithPassword | null>
  createOwnerWithTenant(input: CreateOwnerWithTenantInput): Promise<AuthUser>
}

export interface PasswordHasher {
  hash(password: string): Promise<string>
  verify(password: string, passwordHash: string | null | undefined): Promise<boolean>
}
