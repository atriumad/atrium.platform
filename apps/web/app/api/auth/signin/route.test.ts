import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

let authenticateUserExecute = mock(async () => {
  throw new Error("database unavailable")
})

mock.module("@atrium/infrastructure", () => ({
  createUseCases: () => ({
    authenticateUser: {
      execute: authenticateUserExecute,
    },
  }),
}))

const originalConsoleError = console.error

beforeEach(() => {
  authenticateUserExecute = mock(async () => {
    throw new Error("database unavailable")
  })
  console.error = mock(() => undefined) as unknown as typeof console.error
})

afterEach(() => {
  console.error = originalConsoleError
})

function signinRequest(): Request {
  return new Request("http://localhost/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "owner@example.com",
      password: "wrong-password",
    }),
  })
}

describe("POST /api/auth/signin", () => {
  test("returns a JSON error when authentication infrastructure fails", async () => {
    const { POST } = await import("./route")

    const res = await POST(signinRequest())

    expect(res.status).toBe(500)
    expect(res.headers.get("content-type")).toContain("application/json")
    expect(await res.json()).toEqual({ error: "Unable to sign in right now" })
  })
})
