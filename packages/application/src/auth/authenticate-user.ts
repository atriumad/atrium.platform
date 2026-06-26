import type { Result } from "@atrium/shared"
import { err, ok } from "@atrium/shared"
import { AuthError } from "./auth-errors"
import { normalizeAuthEmail } from "./auth-normalization"
import type { AuthRepository, AuthUser, PasswordHasher } from "./auth-ports"

export type AuthenticateUserInput = {
  readonly email: string
  readonly password: string
}

export type AuthenticateUserResult = {
  readonly user: AuthUser
}

export class AuthenticateUser {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  async execute(
    input: AuthenticateUserInput,
  ): Promise<Result<AuthenticateUserResult, AuthError>> {
    const email = normalizeAuthEmail(input.email)
    const password = input.password

    if (!email || !password) {
      return err(new AuthError("VALIDATION_ERROR", "email and password are required"))
    }

    const user = await this.authRepo.findByEmail(email)
    const valid = await this.passwords.verify(password, user?.passwordHash)

    if (!user || !valid) {
      return err(new AuthError("INVALID_CREDENTIALS", "Invalid email or password"))
    }

    return ok({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    })
  }
}
