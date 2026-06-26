import { describe, expect, mock, test } from "bun:test"
import type { Customer, CustomerRepository } from "@atrium/domain"
import { ListCustomers } from "./list-customers"

function mockRepo() {
  return {
    save: mock(() => Promise.resolve()),
    findById: mock(() => Promise.resolve(null)),
    findByIdentifier: mock(() => Promise.resolve(null)),
    findByTenant: mock(() => Promise.resolve({ customers: [], total: 0 })),
  } satisfies CustomerRepository
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

describe("ListCustomers", () => {
  test("returns paginated customers for a tenant", async () => {
    const repo = mockRepo()
    repo.findByTenant = mock(() =>
      Promise.resolve({ customers: [sampleCustomer], total: 1 }),
    )

    const useCase = new ListCustomers(repo)
    const result = await useCase.execute({
      tenantId: "tenant-1",
      limit: 10,
      offset: 0,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.customers).toHaveLength(1)
    expect(result.value.total).toBe(1)
    expect(repo.findByTenant).toHaveBeenCalledWith("tenant-1", {
      limit: 10,
      offset: 0,
    })
  })

  test("filters by loyalty tier", async () => {
    const repo = mockRepo()
    repo.findByTenant = mock(() => Promise.resolve({ customers: [], total: 0 }))

    const useCase = new ListCustomers(repo)
    await useCase.execute({
      tenantId: "tenant-1",
      tier: "gold",
    })

    expect(repo.findByTenant).toHaveBeenCalledWith("tenant-1", {
      tier: "gold",
    })
  })

  test("uses defaults when no pagination opts provided", async () => {
    const repo = mockRepo()
    repo.findByTenant = mock(() =>
      Promise.resolve({ customers: [], total: 0 }),
    )

    const useCase = new ListCustomers(repo)
    const result = await useCase.execute({ tenantId: "tenant-1" })

    expect(result.ok).toBe(true)
    expect(repo.findByTenant).toHaveBeenCalledWith("tenant-1", {})
  })

  test("validates pagination limits", async () => {
    const repo = mockRepo()
    const useCase = new ListCustomers(repo)

    const result = await useCase.execute({
      tenantId: "tenant-1",
      limit: -1,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toContain("Invalid")
  })
})
