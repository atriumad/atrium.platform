import { describe, expect, mock, test } from "bun:test"
import type { AuthRepository, AuthUserWithPassword, PasswordHasher } from "./auth-ports"
import { RegisterOwner } from "./register-owner"

function mockAuthRepo() {
  return {
    findByEmail: mock(() => Promise.resolve(null)),
    createOwnerWithTenant: mock(() =>
      Promise.resolve({
        id: "user-1",
        email: "owner@example.com",
        role: "owner",
        tenantId: "tenant-1",
      }),
    ),
  } satisfies AuthRepository
}

function mockPasswordHasher() {
  return {
    hash: mock((password: string) => Promise.resolve(`hash:${password}`)),
    verify: mock(() => Promise.resolve(false)),
  } satisfies PasswordHasher
}

const existingUser: AuthUserWithPassword = {
  id: "existing-user",
  email: "owner@example.com",
  role: "owner",
  tenantId: "tenant-1",
  passwordHash: "hash",
}

describe("RegisterOwner", () => {
  test("creates an owner tenant with normalized email and system segments", async () => {
    const authRepo = mockAuthRepo()
    const passwords = mockPasswordHasher()

    const useCase = new RegisterOwner(authRepo, passwords, () => "fixed")
    const result = await useCase.execute({
      name: "  Atrium Demo  ",
      email: "  OWNER@Example.COM  ",
      password: "long-password",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(passwords.hash).toHaveBeenCalledWith("long-password")
    expect(authRepo.createOwnerWithTenant).toHaveBeenCalledTimes(1)

    const input = authRepo.createOwnerWithTenant.mock.calls[0]?.[0]
    expect(input?.name).toBe("Atrium Demo")
    expect(input?.email).toBe("owner@example.com")
    expect(input?.passwordHash).toBe("hash:long-password")
    expect(input?.slug).toBe("owner-fixed")
    expect(input?.segments.map((segment) => segment.name)).toEqual([
      "vip",
      "at_risk",
      "new",
      "loyal",
      "dormant",
      "one_time",
    ])
    expect(result.value.user.role).toBe("owner")
  })

  test("rejects duplicate emails before hashing", async () => {
    const authRepo = mockAuthRepo()
    const passwords = mockPasswordHasher()
    authRepo.findByEmail = mock(() => Promise.resolve(existingUser))

    const useCase = new RegisterOwner(authRepo, passwords)
    const result = await useCase.execute({
      name: "Atrium Demo",
      email: "owner@example.com",
      password: "long-password",
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe("EMAIL_ALREADY_REGISTERED")
    expect(passwords.hash).not.toHaveBeenCalled()
  })

  test("rejects short passwords", async () => {
    const authRepo = mockAuthRepo()
    const passwords = mockPasswordHasher()

    const useCase = new RegisterOwner(authRepo, passwords)
    const result = await useCase.execute({
      name: "Atrium Demo",
      email: "owner@example.com",
      password: "short",
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe("VALIDATION_ERROR")
    expect(authRepo.findByEmail).not.toHaveBeenCalled()
  })
})
