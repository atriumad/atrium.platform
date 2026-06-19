import type {
  OrderRepository,
  HealthRepository,
  ReviewRepository,
  RevenueSnapshotRepository,
  LocationHealth,
  HealthTrend,
  Order,
} from "@atrium/domain"
import { computeOverallScore } from "@atrium/domain"
import { lastNDays, dateRange, type Result, ok, err } from "@atrium/shared"
import {
  computeRevenueScore,
  computeReputationScore,
  computeTrafficScore,
  computeRetentionScore,
  computeTrend,
} from "./health-score-service"

export type RecalculateHealthScoreInput = {
  locationId: string
}

export class RecalculateHealthScore {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly healthRepo: HealthRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly revenueRepo: RevenueSnapshotRepository,
  ) {}

  async execute(
    input: RecalculateHealthScoreInput,
  ): Promise<Result<LocationHealth>> {
    if (!input.locationId) {
      return err(new Error("locationId is required"))
    }

    const now = new Date()

    const currentRange = lastNDays(30)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const previousRange = dateRange(sixtyDaysAgo, thirtyDaysAgo)

    const [currentOrders, previousOrders, reviews, revenueSnapshots, previousHealth] =
      await Promise.all([
        this.orderRepo.findByLocation(input.locationId, currentRange),
        this.orderRepo.findByLocation(input.locationId, previousRange),
        this.reviewRepo.findByLocation(input.locationId),
        this.revenueRepo.findByLocation(input.locationId, "weekly"),
        this.healthRepo.findHistory(input.locationId, 3),
      ])

    const revenueScore = this.computeRevenueScore(
      currentOrders,
      previousOrders,
      revenueSnapshots,
    )

    const reputationScore = computeReputationScore(reviews)

    const trafficScore = this.computeTrafficScore(currentOrders, previousOrders)

    const retentionScore = this.computeRetentionScore(currentOrders, previousOrders)

    const dimensions = {
      revenue: revenueScore,
      reputation: reputationScore,
      traffic: trafficScore,
      retention: retentionScore,
    }

    const score = computeOverallScore(dimensions)

    const trend = this.computeTrend(score, previousHealth)

    const health: LocationHealth = {
      id: `health-${input.locationId}-${now.getTime()}`,
      locationId: input.locationId,
      computedAt: now,
      score,
      dimensions,
      trend,
    }

    await this.healthRepo.save(health)

    return ok(health)
  }

  private computeRevenueScore(
    currentOrders: Order[],
    previousOrders: Order[],
    revenueSnapshots: { totalRevenue: { amount: number } }[],
  ): number {
    const currentRevenue = currentOrders.reduce(
      (sum, o) => sum + o.total.amount,
      0,
    )
    const previousRevenue = previousOrders.reduce(
      (sum, o) => sum + o.total.amount,
      0,
    )

    return computeRevenueScore(currentRevenue, previousRevenue)
  }

  private computeTrafficScore(
    currentOrders: Order[],
    previousOrders: Order[],
  ): number {
    return computeTrafficScore(
      currentOrders.length,
      previousOrders.length,
    )
  }

  private computeRetentionScore(
    currentOrders: Order[],
    previousOrders: Order[],
  ): number {
    const currentCustomers = this.uniqueCustomerIds(currentOrders)
    const previousCustomers = this.uniqueCustomerIds(previousOrders)

    return computeRetentionScore(
      currentCustomers,
      previousCustomers,
    )
  }

  private computeTrend(
    currentScore: number,
    previousHealth: LocationHealth[],
  ): HealthTrend {
    const previousScores = previousHealth.map((h) => h.score)
    return computeTrend(currentScore, previousScores)
  }

  private uniqueCustomerIds(orders: Order[]): string[] {
    const ids = new Set<string>()
    for (const o of orders) {
      if (o.customerId) ids.add(o.customerId)
    }
    return Array.from(ids)
  }
}
