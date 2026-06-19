import type { CustomerRepository } from "@atrium/domain"
import type { Customer, LoyaltyTier } from "@atrium/domain"
import type { CustomerIdentifier } from "@atrium/shared"
import type { PrismaClient } from "@prisma/client"
import { customerMapper } from "./mappers/customer-mapper"

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async save(customer: Customer): Promise<void> {
    const data = customerMapper.toPersistence(customer)
    const { identifiers: _ids, ...customerFields } = data
    await this.prisma.customer.upsert({
      where: { id: customerFields.id! },
      create: customerFields,
      update: customerFields,
    })
    for (const id of customer.identifiers) {
      await this.prisma.customerIdentifier.upsert({
        where: {
          type_value: { type: id.type, value: id.value },
        },
        create: {
          type: id.type,
          value: id.value,
          provider: id.type === "external_ref" ? id.provider : null,
          customerId: customer.id,
        },
        update: {
          type: id.type,
          value: id.value,
          provider: id.type === "external_ref" ? id.provider : null,
          customerId: customer.id,
        },
      })
    }
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({
      where: { id },
      include: { identifiers: true },
    })
    return row ? customerMapper.toDomain(row) : null
  }

  async findByIdentifier(identifier: CustomerIdentifier): Promise<Customer | null> {
    const row = await this.prisma.customer.findFirst({
      where: {
        identifiers: {
          some: {
            type: identifier.type,
            value: identifier.value,
          },
        },
      },
      include: { identifiers: true },
    })
    return row ? customerMapper.toDomain(row) : null
  }

  async findByTenant(
    tenantId: string,
    opts?: { tier?: LoyaltyTier; minChurnRisk?: number; limit?: number; offset?: number },
  ): Promise<{ customers: Customer[]; total: number }> {
    const where: Record<string, unknown> = { tenantId }

    if (opts?.tier) where.loyaltyTier = opts.tier
    if (opts?.minChurnRisk != null) where.churnRisk = { gte: opts.minChurnRisk }

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: { identifiers: true },
        take: opts?.limit ?? 50,
        skip: opts?.offset ?? 0,
      }),
      this.prisma.customer.count({ where }),
    ])

    return {
      customers: rows.map(customerMapper.toDomain),
      total,
    }
  }
}
