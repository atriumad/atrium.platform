import type { Order, OrderChannel } from "@atrium/domain"
import { money } from "@atrium/shared"
import type { Prisma } from "@prisma/client"

type OrderRow = Prisma.OrderGetPayload<{}>

export const orderMapper = {
  toDomain(row: OrderRow): Order {
    return {
      id: row.id,
      locationId: row.locationId,
      customerId: row.customerId,
      occurredAt: row.occurredAt,
      channel: row.channel as OrderChannel,
      total: money(row.totalAmount, row.currency as any),
      itemsCount: row.itemsCount,
      sourceRef: row.sourceRef,
    }
  },

  toPersistence(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id,
      locationId: order.locationId,
      customerId: order.customerId,
      occurredAt: order.occurredAt,
      channel: order.channel,
      totalAmount: order.total.amount,
      currency: order.total.currency,
      itemsCount: order.itemsCount,
      sourceRef: order.sourceRef,
    }
  },
}
