import { describe, expect, test } from "bun:test"
import bcrypt from "bcryptjs"
import { BcryptPasswordHasher, DUMMY_PASSWORD_HASH } from "./bcrypt-password-hasher"

describe("BcryptPasswordHasher", () => {
  test("uses a real cost-12 bcrypt hash for missing users", async () => {
    const passwords = new BcryptPasswordHasher()

    expect(bcrypt.getRounds(DUMMY_PASSWORD_HASH)).toBe(12)
    await expect(passwords.verify("wrong-password", null)).resolves.toBe(false)
  })

  test("hashes and verifies user passwords", async () => {
    const passwords = new BcryptPasswordHasher()
    const hash = await passwords.hash("correct horse battery staple")

    expect(bcrypt.getRounds(hash)).toBe(12)
    await expect(passwords.verify("correct horse battery staple", hash)).resolves.toBe(true)
    await expect(passwords.verify("wrong", hash)).resolves.toBe(false)
  }, 15_000)
})
