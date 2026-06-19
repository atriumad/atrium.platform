import { PrismaClient } from "@prisma/client"
import { prisma } from "./client"
import { PrismaOrderRepository } from "./repositories/order-repository"
import { PrismaCustomerRepository } from "./repositories/customer-repository"
import { PrismaHealthRepository } from "./repositories/health-repository"
import { PrismaReviewRepository } from "./repositories/review-repository"
import { PrismaRevenueSnapshotRepository } from "./repositories/revenue-snapshot-repository"
import { RecalculateHealthScore, GetCustomerProfile, ListCustomers, ComputeChurnRisk } from "@atrium/application"

export function createUseCases(client?: PrismaClient) {
  const db = client ?? prisma

  const orderRepo = new PrismaOrderRepository(db)
  const customerRepo = new PrismaCustomerRepository(db)
  const healthRepo = new PrismaHealthRepository(db)
  const reviewRepo = new PrismaReviewRepository(db)
  const revenueRepo = new PrismaRevenueSnapshotRepository(db)

  return {
    orderRepo,
    customerRepo,
    healthRepo,
    reviewRepo,
    revenueRepo,
    recalculateHealthScore: new RecalculateHealthScore(orderRepo, healthRepo, reviewRepo, revenueRepo),
    getCustomerProfile: new GetCustomerProfile(customerRepo, orderRepo),
    listCustomers: new ListCustomers(customerRepo),
    computeChurnRisk: new ComputeChurnRisk(customerRepo, orderRepo),
  }
}
