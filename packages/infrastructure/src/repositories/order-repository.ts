import type { OrderRepository } from "@atrium/domain"
import type { Order } from "@atrium/domain"
import type { DateRange } from "@atrium/shared"
import type { PrismaClient } from "@prisma/client"
import { orderMapper } from "./mappers/order-mapper"

export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async save(order: Order): Promise<void> {
    const data = orderMapper.toPersistence(order)
    await this.prisma.order.upsert({
      where: { id: data.id! },
      create: data,
      update: data,
    })
  }

  async findBySourceRef(sourceRef: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { sourceRef } })
    return row ? orderMapper.toDomain(row) : null
  }

  async findByLocation(locationId: string, range: DateRange): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: {
        locationId,
        occurredAt: { gte: range.start, lte: range.end },
      },
    })
    return rows.map(orderMapper.toDomain)
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { customerId },
    })
    return rows.map(orderMapper.toDomain)
  }

  async countByLocation(locationId: string, range: DateRange): Promise<number> {
    return this.prisma.order.count({
      where: {
        locationId,
        occurredAt: { gte: range.start, lte: range.end },
      },
    })
  }
}
