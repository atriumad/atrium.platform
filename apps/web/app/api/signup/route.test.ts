import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

let registerOwnerExecute = mock(async () => {
  throw new Error("database unavailable")
})

mock.module("@atrium/infrastructure", () => ({
  createUseCases: () => ({
    registerOwner: {
      execute: registerOwnerExecute,
    },
  }),
}))

const originalConsoleError = console.error

beforeEach(() => {
  registerOwnerExecute = mock(async () => {
    throw new Error("database unavailable")
  })
  console.error = mock(() => undefined) as unknown as typeof console.error
})

afterEach(() => {
  console.error = originalConsoleError
})

function signupRequest(): Request {
  return new Request("http://localhost/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Atrium Demo",
      email: "owner@example.com",
      password: "long-password",
    }),
  })
}

describe("POST /api/signup", () => {
  test("returns a JSON error when registration infrastructure fails", async () => {
    const { POST } = await import("./route")

    const res = await POST(signupRequest())

    expect(res.status).toBe(500)
    expect(res.headers.get("content-type")).toContain("application/json")
    expect(await res.json()).toEqual({ error: "Unable to create account right now" })
  })
})
