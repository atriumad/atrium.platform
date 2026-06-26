import { describe, expect, mock, test } from "bun:test"
import type { CreateOwnerWithTenantInput } from "@atrium/application"
import type { PrismaClient } from "@prisma/client"
import { PrismaAuthRepository } from "./prisma-auth-repository"

function prismaUser(overrides: Partial<{
  id: string
  tenantId: string | null
  email: string
  passwordHash: string
  role: string
  emailVerifiedAt: Date | null
  createdAt: Date
}> = {}) {
  return {
    id: "user-1",
    tenantId: "tenant-1",
    email: "owner@example.com",
    passwordHash: "hash",
    role: "owner",
    emailVerifiedAt: null,
    createdAt: new Date("2026-06-18T10:00:00Z"),
    ...overrides,
  }
}

function mockPrisma() {
  const tx = {
    tenant: {
      create: mock(() => Promise.resolve({ id: "tenant-1" })),
    },
    user: {
      create: mock(() => Promise.resolve(prismaUser())),
    },
    customerSegment: {
      createMany: mock(() => Promise.resolve({ count: 1 })),
    },
  }

  const prisma = {
    user: {
      findUnique: mock(() => Promise.resolve(null)),
    },
    $transaction: mock((callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
  }

  return { prisma, tx }
}

const registrationInput: CreateOwnerWithTenantInput = {
  name: "Atrium Demo",
  slug: "owner-fixed",
  timezone: "America/New_York",
  email: "owner@example.com",
  passwordHash: "hash",
  segments: [
    {
      name: "vip",
      type: "system",
      rules: [{ field: "ltv_percentile", operator: "gte", value: 0.95 }],
    },
  ],
}

describe("PrismaAuthRepository", () => {
  test("findByEmail returns a user with password hash", async () => {
    const { prisma } = mockPrisma()
    prisma.user.findUnique = mock(() => Promise.resolve(prismaUser()))
    const repo = new PrismaAuthRepository(prisma as unknown as PrismaClient)

    const result = await repo.findByEmail("owner@example.com")

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "owner@example.com" },
    })
    expect(result).toEqual({
      id: "user-1",
      email: "owner@example.com",
      role: "owner",
      tenantId: "tenant-1",
      passwordHash: "hash",
    })
  })

  test("createOwnerWithTenant creates tenant, owner, and system segments transactionally", async () => {
    const { prisma, tx } = mockPrisma()
    const repo = new PrismaAuthRepository(prisma as unknown as PrismaClient)

    const result = await repo.createOwnerWithTenant(registrationInput)

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(tx.tenant.create).toHaveBeenCalledWith({
      data: {
        name: "Atrium Demo",
        slug: "owner-fixed",
        timezone: "America/New_York",
      },
    })
    expect(tx.user.create).toHaveBeenCalledWith({
      data: {
        email: "owner@example.com",
        passwordHash: "hash",
        role: "owner",
        tenantId: "tenant-1",
      },
    })
    expect(tx.customerSegment.createMany.mock.calls[0]?.[0].data).toEqual([
      {
        tenantId: "tenant-1",
        name: "vip",
        type: "system",
        rules: [{ field: "ltv_percentile", operator: "gte", value: 0.95 }],
      },
    ])
    expect(result).toEqual({
      id: "user-1",
      email: "owner@example.com",
      role: "owner",
      tenantId: "tenant-1",
    })
  })
})
