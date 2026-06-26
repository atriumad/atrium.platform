import type {
  AuthRepository,
  AuthUser,
  AuthUserWithPassword,
  CreateOwnerWithTenantInput,
} from "@atrium/application"
import type { Prisma, PrismaClient, User } from "@prisma/client"

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthUserWithPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    return user ? this.toUserWithPassword(user) : null
  }

  async createOwnerWithTenant(input: CreateOwnerWithTenantInput): Promise<AuthUser> {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          timezone: input.timezone,
        },
      })

      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
          role: "owner",
          tenantId: tenant.id,
        },
      })

      await tx.customerSegment.createMany({
        data: input.segments.map((segment) => ({
          tenantId: tenant.id,
          name: segment.name,
          type: segment.type,
          rules: segment.rules.map((rule) => ({ ...rule })) satisfies Prisma.InputJsonValue,
        })),
      })

      return this.toUser(user)
    })
  }

  private toUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    }
  }

  private toUserWithPassword(user: User): AuthUserWithPassword {
    return {
      ...this.toUser(user),
      passwordHash: user.passwordHash,
    }
  }
}
