import type { Order } from "@atrium/domain"

export type OrderCreatedEvent = {
  readonly type: "sales.order.created"
  readonly payload: {
    readonly locationId: string
    readonly order: Order
    readonly occurredAt: Date
  }
}

export type OrderUpdatedEvent = {
  readonly type: "sales.order.updated"
  readonly payload: {
    readonly locationId: string
    readonly orderId: string
    readonly changes: Partial<Order>
    readonly occurredAt: Date
  }
}

export type OrderVoidedEvent = {
  readonly type: "sales.order.voided"
  readonly payload: {
    readonly locationId: string
    readonly orderId: string
    readonly occurredAt: Date
  }
}

export type SalesEvent = OrderCreatedEvent | OrderUpdatedEvent | OrderVoidedEvent
