import { describe, expect, test } from "bun:test"
import { NextRequest } from "next/server"
import { middleware } from "./middleware"

describe("middleware", () => {
  test("allows public auth pages", async () => {
    const res = await middleware(new NextRequest("http://localhost/sign-in"))

    expect(res.status).toBe(200)
    expect(res.headers.get("location")).toBe(null)
  })

  test("allows public auth API routes", async () => {
    const res = await middleware(new NextRequest("http://localhost/api/auth/login"))

    expect(res.status).toBe(200)
    expect(res.headers.get("location")).toBe(null)
  })

  test("redirects protected routes without a session", async () => {
    const res = await middleware(new NextRequest("http://localhost/"))

    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost/sign-in")
  })
})
