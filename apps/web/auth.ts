import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const COOKIE = "atrium-session"
const EXPIRY = "7d"

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error("AUTH_SECRET env var is not set")
  return new TextEncoder().encode(s)
}

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
    .sign(secret())
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
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
