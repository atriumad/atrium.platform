import { describe, expect, mock, test } from "bun:test"
import { GetCustomerProfile } from "./get-customer-profile"
import type { CustomerRepository } from "@atrium/domain"
import type { OrderRepository } from "@atrium/domain"
import type { Customer } from "@atrium/domain"

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

const sampleCustomer: Customer = {
  id: "cus-1",
  tenantId: "tenant-1",
  identifiers: [{ type: "email", value: "test@example.com" }],
  firstSeenAt: new Date("2026-01-01T00:00:00Z"),
  lastSeenAt: new Date("2026-06-18T10:00:00Z"),
  acquisitionSource: null,
  totalOrders: 10,
  totalSpent: { amount: 50000, currency: "USD" },
  avgTicket: { amount: 5000, currency: "USD" },
  visitFrequency: null,
  preferredChannel: null,
  loyaltyTier: "silver",
  churnRisk: null,
  churnRiskReason: null,
  tags: [],
  notes: null,
}

describe("GetCustomerProfile", () => {
  test("returns customer when found", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    customerRepo.findById = mock(() => Promise.resolve(sampleCustomer))

    const useCase = new GetCustomerProfile(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "cus-1" })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.customer.id).toBe("cus-1")
    expect(result.value.customer.loyaltyTier).toBe("silver")
  })

  test("returns error when customer not found", async () => {
    const { customerRepo, orderRepo } = mockRepos()

    const useCase = new GetCustomerProfile(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "nonexistent" })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toContain("not found")
  })

  test("includes recent orders when requested", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    customerRepo.findById = mock(() => Promise.resolve(sampleCustomer))
    orderRepo.findByCustomer = mock(() =>
      Promise.resolve([
        {
          id: "ord-1",
          locationId: "loc-1",
          customerId: "cus-1",
          occurredAt: new Date("2026-06-17T12:00:00Z"),
          channel: "dine_in",
          total: { amount: 2500, currency: "USD" },
          itemsCount: 2,
          sourceRef: "toast:123",
        },
      ]),
    )

    const useCase = new GetCustomerProfile(customerRepo, orderRepo)
    const result = await useCase.execute({
      customerId: "cus-1",
      includeRecentOrders: true,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.recentOrders).toBeDefined()
    expect(result.value.recentOrders).toHaveLength(1)
    expect(result.value.recentOrders![0]!.id).toBe("ord-1")
  })

  test("does not fetch orders when not requested", async () => {
    const { customerRepo, orderRepo } = mockRepos()
    customerRepo.findById = mock(() => Promise.resolve(sampleCustomer))

    const useCase = new GetCustomerProfile(customerRepo, orderRepo)
    const result = await useCase.execute({ customerId: "cus-1" })

    expect(result.ok).toBe(true)
    expect(orderRepo.findByCustomer).not.toHaveBeenCalled()
  })
})
