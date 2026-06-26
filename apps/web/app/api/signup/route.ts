import { createUseCases } from "@atrium/infrastructure"
import { NextResponse } from "next/server"
import { authErrorResponse, unexpectedAuthErrorResponse } from "@/lib/auth-http"

export async function POST(req: Request) {
  try {
    const body = await req.json() as { name?: unknown; email?: unknown; password?: unknown }

    const name     = typeof body.name     === "string" ? body.name.trim()     : ""
    const email    = typeof body.email    === "string" ? body.email          : ""
    const password = typeof body.password === "string" ? body.password        : ""

    const result = await createUseCases().registerOwner.execute({ name, email, password })
    if (!result.ok) {
      return authErrorResponse(result.error)
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return unexpectedAuthErrorResponse("create account", error)
  }
}
