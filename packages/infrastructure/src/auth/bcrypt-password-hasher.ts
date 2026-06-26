import type { PasswordHasher } from "@atrium/application"
import bcrypt from "bcryptjs"

export const PASSWORD_HASH_COST = 12
export const DUMMY_PASSWORD_HASH =
  "$2b$12$KYuAN4.F3Mg/0w6yAbuhVuQNPrCEGFHUhUE91XDPNjKeS1SGx1DIa"

export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_HASH_COST)
  }

  verify(password: string, passwordHash: string | null | undefined): Promise<boolean> {
    return bcrypt.compare(password, passwordHash ?? DUMMY_PASSWORD_HASH)
  }
}
