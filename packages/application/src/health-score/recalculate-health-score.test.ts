import { describe, expect, mock, test } from "bun:test"
import { RecalculateHealthScore } from "./recalculate-health-score"
import type {
  OrderRepository,
  HealthRepository,
  ReviewRepository,
  RevenueSnapshotRepository,
  LocationHealth,
} from "@atrium/domain"
import { lastNDays } from "@atrium/shared"

function mockRepos() {
  const orderRepo = {
    save: mock(() => Promise.resolve()),
    findBySourceRef: mock(() => Promise.resolve(null)),
    findByLocation: mock(() => Promise.resolve([])),
    findByCustomer: mock(() => Promise.resolve([])),
    countByLocation: mock(() => Promise.resolve(0)),
  } satisfies OrderRepository

  const healthRepo = {
    save: mock(() => Promise.resolve()),
    findLatest: mock(() => Promise.resolve(null)),
    findHistory: mock(() => Promise.resolve([])),
  } satisfies HealthRepository

  const reviewRepo = {
    save: mock(() => Promise.resolve()),
    findByLocation: mock(() => Promise.resolve([])),
    findBySourceRef: mock(() => Promise.resolve(null)),
  } satisfies ReviewRepository

  const revenueRepo = {
    save: mock(() => Promise.resolve()),
    findByLocation: mock(() => Promise.resolve([])),
  } satisfies RevenueSnapshotRepository

  return { orderRepo, healthRepo, reviewRepo, revenueRepo }
}

describe("RecalculateHealthScore", () => {
  test("computes health score and saves it", async () => {
    const { orderRepo, healthRepo, reviewRepo, revenueRepo } = mockRepos()

    // Current period orders
    orderRepo.findByLocation = mock(() =>
      Promise.resolve([
        {
          id: "ord-1",
          locationId: "loc-1",
          customerId: "cus-1",
          occurredAt: new Date(),
          channel: "dine_in" as const,
          total: { amount: 2500, currency: "USD" as const },
          itemsCount: 2,
          sourceRef: "toast:1",
        },
        {
          id: "ord-2",
          locationId: "loc-1",
          customerId: "cus-1",
          occurredAt: new Date(),
          channel: "dine_in" as const,
          total: { amount: 1500, currency: "USD" as const },
          itemsCount: 1,
          sourceRef: "toast:2",
        },
      ]),
    )

    healthRepo.findHistory = mock(() => Promise.resolve([]))

    const useCase = new RecalculateHealthScore(
      orderRepo,
      healthRepo,
      reviewRepo,
      revenueRepo,
    )

    const result = await useCase.execute({ locationId: "loc-1" })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.locationId).toBe("loc-1")
    expect(result.value.score).toBeGreaterThanOrEqual(0)
    expect(result.value.score).toBeLessThanOrEqual(100)
    expect(result.value.dimensions.revenue).toBeGreaterThanOrEqual(0)
    expect(result.value.dimensions.reputation).toBeGreaterThanOrEqual(0)
    expect(result.value.dimensions.traffic).toBeGreaterThanOrEqual(0)
    expect(result.value.dimensions.retention).toBeGreaterThanOrEqual(0)
    expect(["up", "stable", "down"]).toContain(result.value.trend)

    expect(healthRepo.save).toHaveBeenCalledTimes(1)
  })

  test("retention calculation uses correct customer overlap", async () => {
    const { orderRepo, healthRepo, reviewRepo, revenueRepo } = mockRepos()

    // Current period: 3 orders from 3 customers
    // Previous period: 2 orders from 2 of those same customers
    let callCount = 0
    orderRepo.findByLocation = mock(() => {
      callCount++
      if (callCount <= 1) {
        // First call: current period orders
        return Promise.resolve([
          { id: "ord-a", locationId: "loc-1", customerId: "cus-1", occurredAt: new Date(), channel: "dine_in" as const, total: { amount: 1000, currency: "USD" as const }, itemsCount: 1, sourceRef: "a" },
          { id: "ord-b", locationId: "loc-1", customerId: "cus-2", occurredAt: new Date(), channel: "dine_in" as const, total: { amount: 1000, currency: "USD" as const }, itemsCount: 1, sourceRef: "b" },
          { id: "ord-c", locationId: "loc-1", customerId: "cus-3", occurredAt: new Date(), channel: "dine_in" as const, total: { amount: 1000, currency: "USD" as const }, itemsCount: 1, sourceRef: "c" },
        ])
      }
      // Second call: previous period orders (cus-1 and cus-2 returned)
      return Promise.resolve([
        { id: "ord-x", locationId: "loc-1", customerId: "cus-1", occurredAt: new Date(), channel: "dine_in" as const, total: { amount: 1000, currency: "USD" as const }, itemsCount: 1, sourceRef: "x" },
        { id: "ord-y", locationId: "loc-1", customerId: "cus-2", occurredAt: new Date(), channel: "dine_in" as const, total: { amount: 1000, currency: "USD" as const }, itemsCount: 1, sourceRef: "y" },
      ])
    })

    healthRepo.findHistory = mock(() => Promise.resolve([]))

    const useCase = new RecalculateHealthScore(
      orderRepo,
      healthRepo,
      reviewRepo,
      revenueRepo,
    )

    const result = await useCase.execute({ locationId: "loc-1" })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // retention = 2 (returning) / 3 (current) * 100 ≈ 67
    expect(result.value.dimensions.retention).toBeCloseTo(67, -1)
  })

  test("returns error when locationId is empty", async () => {
    const { orderRepo, healthRepo, reviewRepo, revenueRepo } = mockRepos()
    const useCase = new RecalculateHealthScore(
      orderRepo,
      healthRepo,
      reviewRepo,
      revenueRepo,
    )

    const result = await useCase.execute({ locationId: "" })
    expect(result.ok).toBe(false)
  })
})
