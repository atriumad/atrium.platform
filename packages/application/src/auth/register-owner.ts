import type { Result } from "@atrium/shared"
import { err, ok } from "@atrium/shared"
import { AuthError } from "./auth-errors"
import { createTenantSlug, normalizeAuthEmail } from "./auth-normalization"
import type { AuthRepository, AuthUser, PasswordHasher } from "./auth-ports"
import { SYSTEM_CUSTOMER_SEGMENTS } from "./system-segments"

export type RegisterOwnerInput = {
  readonly name: string
  readonly email: string
  readonly password: string
}

export type RegisterOwnerResult = {
  readonly user: AuthUser
}

export class RegisterOwner {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly passwords: PasswordHasher,
    private readonly uniqueSuffix: () => number | string = Date.now,
  ) {}

  async execute(
    input: RegisterOwnerInput,
  ): Promise<Result<RegisterOwnerResult, AuthError>> {
    const name = input.name.trim()
    const email = normalizeAuthEmail(input.email)
    const password = input.password

    if (!name || !email || !password) {
      return err(new AuthError("VALIDATION_ERROR", "name, email, and password are required"))
    }

    if (password.length < 8) {
      return err(new AuthError("VALIDATION_ERROR", "Password must be at least 8 characters"))
    }

    const existing = await this.authRepo.findByEmail(email)
    if (existing) {
      return err(new AuthError("EMAIL_ALREADY_REGISTERED", "Email already registered"))
    }

    const passwordHash = await this.passwords.hash(password)
    const user = await this.authRepo.createOwnerWithTenant({
      name,
      email,
      passwordHash,
      slug: createTenantSlug(email, this.uniqueSuffix()),
      timezone: "America/New_York",
      segments: SYSTEM_CUSTOMER_SEGMENTS,
    })

    return ok({ user })
  }
}
