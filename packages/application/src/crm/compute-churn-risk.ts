import type { Customer, CustomerRepository } from "@atrium/domain"
import type { ChurnRiskElevatedEvent } from "@atrium/events"
import type { Result } from "@atrium/shared"
import { err, ok } from "@atrium/shared"
import { computeChurnRiskScore } from "./churn-risk-service"

export type ComputeChurnRiskInput = {
  customerId: string
}

export type ComputeChurnRiskResult = {
  customer: Customer
  event?: ChurnRiskElevatedEvent
}

export class ComputeChurnRisk {
  constructor(private readonly customerRepo: CustomerRepository) {}

  async execute(input: ComputeChurnRiskInput): Promise<Result<ComputeChurnRiskResult>> {
    if (!input.customerId) {
      return err(new Error("customerId is required"))
    }

    const customer = await this.customerRepo.findById(input.customerId)
    if (!customer) {
      return err(new Error(`Customer ${input.customerId} not found`))
    }

    const now = new Date()
    const msSinceLastOrder = now.getTime() - customer.lastSeenAt.getTime()
    const daysSinceLastOrder = Math.floor(msSinceLastOrder / (1000 * 60 * 60 * 24))

    const daysSinceFirstSeen = Math.floor(
      (now.getTime() - customer.firstSeenAt.getTime()) / (1000 * 60 * 60 * 24),
    )

    const { score, reasons } = computeChurnRiskScore({
      daysSinceLastOrder,
      totalOrders: customer.totalOrders,
      visitFrequency: customer.visitFrequency,
      daysSinceFirstSeen,
      loyaltyTier: customer.loyaltyTier,
    })

    const reason = reasons.length > 0 ? reasons.join("; ") : null

    const updatedCustomer: Customer = {
      ...customer,
      churnRisk: score,
      churnRiskReason: score > 0.6 ? reason : null,
    }

    await this.customerRepo.save(updatedCustomer)

    let event: ChurnRiskElevatedEvent | undefined
    if (score > 0.6 && reason) {
      event = {
        type: "crm.churn_risk.elevated",
        payload: {
          customerId: customer.id,
          tenantId: customer.tenantId,
          riskScore: score,
          reason,
        },
      }
    }

    return ok({ customer: updatedCustomer, ...(event ? { event } : {}) })
  }
}
