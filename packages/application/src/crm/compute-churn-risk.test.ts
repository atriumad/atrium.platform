import { describe, expect, mock, test } from "bun:test"
import { ComputeChurnRisk } from "./compute-churn-risk"
import type { Customer, CustomerRepository, OrderRepository } from "@atrium/domain"

function mockRepos() {
  const customerRepo = {
    save: mock(() => Promise.resolve()),
    findById: mock(() => Promise.resolve(null)),
    findByIdentifier: mock(() => Promise.resolve(null)),
    findByTenant: mock(() => Promise.resolve({ customers: [], total: 0 })),
  } satisfies CustomerRepository

  const orderRepo = {
    save: mock(() => Promise.resolve()),
    findBySourceRef: mock(() => Promise.resolve(null)),
    findByLocation: mock(() => Promise.resolve([])),
    findByCustomer: mock(() => Promise.resolve([])),
    countByLocation: mock(() => Promise.resolve(0)),
  } satisfies OrderRepository

  return { customerRepo, orderRepo }
}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  const now = new Date()
  return {
    id: "cus-1",
    tenantId: "tenant-1",
    identifiers: [],
    firstSeenAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    lastSeenAt: now,
    acquisitionSource: null,
    totalOrders: 15,
    totalSpent: { amount: 75000, currency: "USD" },
    avgTicket: { amount: 5000, currency: "USD" },
    visitFrequency: 14,
    preferredChannel: "dine_in",
    loyaltyTier: "gold",
    churnRisk: null,
    churnRiskReason: null,
    tags: [],
    notes: null,
    ...overrides,
  }
}

describe("ComputeChurnRisk", () => {
  test("returns low risk for recently active customer", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    const customer = makeCustomer({ lastSeenAt: new Date() })

    customerRepo.findById = mock(() => Promise.resolve(customer))

    const useCase = new ComputeChurnRisk(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "cus-1" })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.customer.churnRisk).toBeLessThan(0.3)
    expect(result.value.event).toBeUndefined()
    expect(customerRepo.save).toHaveBeenCalledTimes(1)
  })

  test("returns elevated risk for customer inactive 60+ days", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const customer = makeCustomer({ lastSeenAt: sixtyDaysAgo })

    customerRepo.findById = mock(() => Promise.resolve(customer))

    const useCase = new ComputeChurnRisk(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "cus-1" })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.customer.churnRisk).toBeGreaterThanOrEqual(0.6)
    expect(result.value.customer.churnRiskReason).not.toBeNull()
    expect(result.value.event).toBeDefined()
    expect(result.value.event!.type).toBe("crm.churn_risk.elevated")
    expect(result.value.event!.payload.riskScore).toBeGreaterThanOrEqual(0.6)
    expect(result.value.event!.payload.customerId).toBe("cus-1")
    expect(result.value.event!.payload.tenantId).toBe("tenant-1")
  })

  test("returns error when customer not found", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    customerRepo.findById = mock(() => Promise.resolve(null))

    const useCase = new ComputeChurnRisk(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "nonexistent" })

    expect(result.ok).toBe(false)
  })

  test("does not fire event when score exactly 0.5 (below 0.6 threshold)", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const customer = makeCustomer({
      lastSeenAt: fourteenDaysAgo,
      totalOrders: 15,
      visitFrequency: 14,
    })

    customerRepo.findById = mock(() => Promise.resolve(customer))

    const useCase = new ComputeChurnRisk(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "cus-1" })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.customer.churnRisk).toBeLessThan(0.6)
    expect(result.value.event).toBeUndefined()
  })

  test("handles new customer with no visit frequency data", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const customer = makeCustomer({
      lastSeenAt: thirtyDaysAgo,
      totalOrders: 1,
      visitFrequency: null,
      firstSeenAt: thirtyDaysAgo,
    })

    customerRepo.findById = mock(() => Promise.resolve(customer))

    const useCase = new ComputeChurnRisk(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "cus-1" })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.customer.churnRisk).toBeGreaterThanOrEqual(0)
    expect(customerRepo.save).toHaveBeenCalledTimes(1)
  })
})
