import type { Customer, CustomerRepository, OrderRepository, Order } from "@atrium/domain"
import type { Result } from "@atrium/shared"
import { ok, err } from "@atrium/shared"

export type CustomerProfile = {
  customer: Customer
  recentOrders?: Order[]
}

export type GetCustomerProfileInput = {
  customerId: string
  includeRecentOrders?: boolean
}

export class GetCustomerProfile {
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly orderRepo: OrderRepository,
  ) {}

  async execute(
    input: GetCustomerProfileInput,
  ): Promise<Result<CustomerProfile>> {
    const customer = await this.customerRepo.findById(input.customerId)

    if (!customer) {
      return err(new Error(`Customer not found: ${input.customerId}`))
    }

    if (!input.includeRecentOrders) {
      return ok({ customer })
    }

    const recentOrders = await this.orderRepo.findByCustomer(input.customerId)

    return ok({ customer, recentOrders })
  }
}
