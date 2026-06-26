import { afterEach, describe, expect, test } from "bun:test"
import { readAuthSecret } from "./auth-secret"

const ORIGINAL_SECRET = process.env.AUTH_SECRET

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.AUTH_SECRET
  } else {
    process.env.AUTH_SECRET = ORIGINAL_SECRET
  }
})

describe("auth secret", () => {
  test("throws when AUTH_SECRET is missing", () => {
    delete process.env.AUTH_SECRET
    expect(() => readAuthSecret()).toThrow("AUTH_SECRET env var is not set")
  })

  test("returns encoded AUTH_SECRET when configured", () => {
    process.env.AUTH_SECRET = "test-secret"
    expect(readAuthSecret()).toEqual(new TextEncoder().encode("test-secret"))
  })
})
