import { describe, expect, mock, test } from "bun:test"
import type { AuthRepository, AuthUserWithPassword, PasswordHasher } from "./auth-ports"
import { AuthenticateUser } from "./authenticate-user"

function mockAuthRepo() {
  return {
    findByEmail: mock(() => Promise.resolve(null)),
    createOwnerWithTenant: mock(() =>
      Promise.resolve({
        id: "user-new",
        email: "new@example.com",
        role: "owner",
        tenantId: "tenant-new",
      }),
    ),
  } satisfies AuthRepository
}

function mockPasswordHasher() {
  return {
    hash: mock((password: string) => Promise.resolve(`hash:${password}`)),
    verify: mock((password: string, passwordHash: string | null | undefined) =>
      Promise.resolve(passwordHash === `hash:${password}`),
    ),
  } satisfies PasswordHasher
}

const sampleUser: AuthUserWithPassword = {
  id: "user-1",
  email: "owner@example.com",
  role: "owner",
  tenantId: "tenant-1",
  passwordHash: "hash:correct-password",
}

describe("AuthenticateUser", () => {
  test("authenticates a user with normalized email", async () => {
    const authRepo = mockAuthRepo()
    const passwords = mockPasswordHasher()
    authRepo.findByEmail = mock(() => Promise.resolve(sampleUser))

    const useCase = new AuthenticateUser(authRepo, passwords)
    const result = await useCase.execute({
      email: "  OWNER@Example.COM  ",
      password: "correct-password",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(authRepo.findByEmail).toHaveBeenCalledWith("owner@example.com")
    expect(passwords.verify).toHaveBeenCalledWith("correct-password", sampleUser.passwordHash)
    expect(result.value.user).toEqual({
      id: "user-1",
      email: "owner@example.com",
      role: "owner",
      tenantId: "tenant-1",
    })
  })

  test("uses password verification even when email is missing from storage", async () => {
    const authRepo = mockAuthRepo()
    const passwords = mockPasswordHasher()

    const useCase = new AuthenticateUser(authRepo, passwords)
    const result = await useCase.execute({
      email: "missing@example.com",
      password: "wrong-password",
    })

    expect(result.ok).toBe(false)
    expect(passwords.verify).toHaveBeenCalledWith("wrong-password", undefined)
  })

  test("rejects missing credentials", async () => {
    const useCase = new AuthenticateUser(mockAuthRepo(), mockPasswordHasher())
    const result = await useCase.execute({ email: "", password: "" })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe("VALIDATION_ERROR")
  })
})
