import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const COOKIE = "atrium-session"

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "")
}

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/api/auth", "/api/signup"]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function isAuthPage(pathname: string): boolean {
  return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const token = req.cookies.get(COOKIE)?.value

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  try {
    await jwtVerify(token, secret())
    if (isAuthPage(pathname)) return NextResponse.redirect(new URL("/", req.url))
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL("/sign-in", req.url))
    res.cookies.delete(COOKIE)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
