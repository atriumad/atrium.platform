import { SignJWT } from "jose/jwt/sign"
import { jwtVerify } from "jose/jwt/verify"
import { cookies } from "next/headers"
import { readAuthSecret } from "@/lib/auth-secret"

const COOKIE = "atrium-session"
const EXPIRY = "7d"

export type AuthSession = {
  id:       string
  email:    string
  role:     string
  tenantId: string | null
}

export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(readAuthSecret())
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, readAuthSecret())
    return payload as unknown as AuthSession
  } catch {
    return null
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export { COOKIE }
