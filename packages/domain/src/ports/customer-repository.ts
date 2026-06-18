import type { Customer, LoyaltyTier } from "../entities/customer"
import type { CustomerIdentifier } from "@atrium/shared"

export interface CustomerRepository {
  save(customer: Customer): Promise<void>
  findById(id: string): Promise<Customer | null>
  findByIdentifier(identifier: CustomerIdentifier): Promise<Customer | null>
  findByTenant(tenantId: string, opts?: {
    tier?: LoyaltyTier
    minChurnRisk?: number
    limit?: number
    offset?: number
  }): Promise<{ customers: Customer[]; total: number }>
}
