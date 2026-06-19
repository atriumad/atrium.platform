import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@atrium/infrastructure"
import { createSessionToken, COOKIE } from "@/auth"

export async function POST(req: Request) {
  const body = await req.json() as { email?: unknown; password?: unknown }
  const email    = typeof body.email    === "string" ? body.email.trim()    : ""
  const password = typeof body.password === "string" ? body.password        : ""

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Constant-time compare to prevent user enumeration
  const hash = user?.passwordHash ?? "$2b$12$invalidhashtopreventtimingattack"
  const valid = await bcrypt.compare(password, hash)

  if (!user || !valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

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
}
