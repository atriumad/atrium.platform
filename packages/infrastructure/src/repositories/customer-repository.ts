import type { Customer, CustomerRepository, LoyaltyTier } from "@atrium/domain"
import type { CustomerIdentifier } from "@atrium/shared"
import type { PrismaClient } from "@prisma/client"
import { customerMapper } from "./mappers/customer-mapper"

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async save(customer: Customer): Promise<void> {
    const data = customerMapper.toPersistence(customer)
    const { identifiers: _ids, ...customerFields } = data
    await this.prisma.customer.upsert({
      where: { id: customer.id },
      create: customerFields,
      update: customerFields,
    })
    for (const id of customer.identifiers) {
      const provider = id.type === "external_ref" ? id.provider : ""
      await this.prisma.customerIdentifier.upsert({
        where: {
          tenantId_type_provider_value: {
            tenantId: customer.tenantId,
            type: id.type,
            provider,
            value: id.value,
          },
        },
        create: {
          tenantId: customer.tenantId,
          type: id.type,
          value: id.value,
          provider,
          customerId: customer.id,
        },
        update: {
          tenantId: customer.tenantId,
          type: id.type,
          value: id.value,
          provider,
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

  async findByIdentifier(tenantId: string, identifier: CustomerIdentifier): Promise<Customer | null> {
    const provider = identifier.type === "external_ref" ? identifier.provider : ""
    const row = await this.prisma.customer.findFirst({
      where: {
        tenantId,
        identifiers: {
          some: {
            tenantId,
            type: identifier.type,
            provider,
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
