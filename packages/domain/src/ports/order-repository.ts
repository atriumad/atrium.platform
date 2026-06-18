import type { Order } from "../entities/order"
import type { DateRange } from "@atrium/shared"

export interface OrderRepository {
  save(order: Order): Promise<void>
  findBySourceRef(sourceRef: string): Promise<Order | null>
  findByLocation(locationId: string, range: DateRange): Promise<Order[]>
  findByCustomer(customerId: string): Promise<Order[]>
  countByLocation(locationId: string, range: DateRange): Promise<number>
}
