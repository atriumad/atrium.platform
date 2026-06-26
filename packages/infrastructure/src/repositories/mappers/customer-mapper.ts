import type { Customer, LoyaltyTier, OrderChannel } from "@atrium/domain"
import { type Currency, money } from "@atrium/shared"
import type { Prisma } from "@prisma/client"

type CustomerRow = Prisma.CustomerGetPayload<{
  include: { identifiers: true }
}>

export const customerMapper = {
  toDomain(row: CustomerRow): Customer {
    return {
      id: row.id,
      tenantId: row.tenantId,
      identifiers: row.identifiers.map((id) => {
        const base = { value: id.value }
        if (id.type === "email") return { ...base, type: "email" as const }
        if (id.type === "phone") return { ...base, type: "phone" as const }
        return { ...base, type: "external_ref" as const, provider: id.provider }
      }),
      firstSeenAt: row.firstSeenAt,
      lastSeenAt: row.lastSeenAt,
      acquisitionSource: row.acquisitionSource,
      totalOrders: row.totalOrders,
      totalSpent: money(row.totalSpentAmount, row.totalSpentCurrency as Currency),
      avgTicket: money(row.avgTicketAmount, "USD"),
      visitFrequency: row.visitFrequency,
      preferredChannel: row.preferredChannel as OrderChannel | null,
      loyaltyTier: row.loyaltyTier as LoyaltyTier,
      churnRisk: row.churnRisk,
      churnRiskReason: row.churnRiskReason,
      tags: row.tags,
      notes: row.notes,
    }
  },

  toPersistence(customer: Customer): Prisma.CustomerUncheckedCreateInput {
    return {
      id: customer.id,
      tenantId: customer.tenantId,
      firstSeenAt: customer.firstSeenAt,
      lastSeenAt: customer.lastSeenAt,
      acquisitionSource: customer.acquisitionSource,
      totalOrders: customer.totalOrders,
      totalSpentAmount: customer.totalSpent.amount,
      totalSpentCurrency: customer.totalSpent.currency,
      avgTicketAmount: customer.avgTicket.amount,
      visitFrequency: customer.visitFrequency,
      preferredChannel: customer.preferredChannel,
      loyaltyTier: customer.loyaltyTier,
      churnRisk: customer.churnRisk,
      churnRiskReason: customer.churnRiskReason,
      tags: customer.tags,
      notes: customer.notes,
      identifiers: {
        create: customer.identifiers.map((id) => ({
          tenantId: customer.tenantId,
          type: id.type,
          value: id.value,
          provider: id.type === "external_ref" ? id.provider : "",
        })),
      },
    }
  },
}
