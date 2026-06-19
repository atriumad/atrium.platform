import type { CustomerRepository, LoyaltyTier, Customer } from "@atrium/domain"
import type { Result } from "@atrium/shared"
import { ok, err } from "@atrium/shared"

export type ListCustomersInput = {
  tenantId: string
  tier?: LoyaltyTier
  minChurnRisk?: number
  limit?: number
  offset?: number
}

export type ListCustomersResult = {
  customers: Customer[]
  total: number
}

export class ListCustomers {
  constructor(private readonly customerRepo: CustomerRepository) {}

  async execute(
    input: ListCustomersInput,
  ): Promise<Result<ListCustomersResult>> {
    if (input.limit !== undefined && input.limit < 0) {
      return err(new Error("Invalid limit: must be non-negative"))
    }

    if (input.offset !== undefined && input.offset < 0) {
      return err(new Error("Invalid offset: must be non-negative"))
    }

    const result = await this.customerRepo.findByTenant(
      input.tenantId,
      {
        ...(input.tier !== undefined && { tier: input.tier }),
        ...(input.minChurnRisk !== undefined && { minChurnRisk: input.minChurnRisk }),
        ...(input.limit !== undefined && { limit: input.limit }),
        ...(input.offset !== undefined && { offset: input.offset }),
      },
    )

    return ok(result)
  }
}
