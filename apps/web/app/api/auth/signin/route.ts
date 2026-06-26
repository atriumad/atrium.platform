import { createUseCases } from "@atrium/infrastructure"
import { NextResponse } from "next/server"
import { COOKIE, createSessionToken } from "@/auth"
import { authErrorResponse, unexpectedAuthErrorResponse } from "@/lib/auth-http"

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: unknown; password?: unknown }
    const email    = typeof body.email    === "string" ? body.email    : ""
    const password = typeof body.password === "string" ? body.password        : ""

    const result = await createUseCases().authenticateUser.execute({ email, password })
    if (!result.ok) {
      return authErrorResponse(result.error)
    }

    const { user } = result.value
    const token = await createSessionToken({
      id:       user.id,
      email:    user.email,
      role:     user.role,
      tenantId: user.tenantId,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (error) {
    return unexpectedAuthErrorResponse("sign in", error)
  }
}
