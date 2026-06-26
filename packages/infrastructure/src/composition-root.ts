import {
  AuthenticateUser,
  ComputeChurnRisk,
  GetCustomerProfile,
  ListCustomers,
  RecalculateHealthScore,
  RegisterOwner,
} from "@atrium/application"
import type { PrismaClient } from "@prisma/client"
import { BcryptPasswordHasher } from "./auth/bcrypt-password-hasher"
import { PrismaAuthRepository } from "./auth/prisma-auth-repository"
import { prisma } from "./client"
import { PrismaCustomerRepository } from "./repositories/customer-repository"
import { PrismaHealthRepository } from "./repositories/health-repository"
import { PrismaOrderRepository } from "./repositories/order-repository"
import { PrismaRevenueSnapshotRepository } from "./repositories/revenue-snapshot-repository"
import { PrismaReviewRepository } from "./repositories/review-repository"
import { PrismaTrafficSnapshotRepository } from "./repositories/traffic-snapshot-repository"

export function createUseCases(client?: PrismaClient) {
  const db = client ?? prisma

  const orderRepo = new PrismaOrderRepository(db)
  const customerRepo = new PrismaCustomerRepository(db)
  const healthRepo = new PrismaHealthRepository(db)
  const reviewRepo = new PrismaReviewRepository(db)
  const revenueRepo = new PrismaRevenueSnapshotRepository(db)
  const trafficRepo = new PrismaTrafficSnapshotRepository(db)
  const authRepo = new PrismaAuthRepository(db)
  const passwordHasher = new BcryptPasswordHasher()

  return {
    authRepo,
    orderRepo,
    customerRepo,
    healthRepo,
    reviewRepo,
    revenueRepo,
    trafficRepo,
    recalculateHealthScore: new RecalculateHealthScore(orderRepo, healthRepo, reviewRepo, revenueRepo, trafficRepo),
    getCustomerProfile: new GetCustomerProfile(customerRepo, orderRepo),
    listCustomers: new ListCustomers(customerRepo),
    computeChurnRisk: new ComputeChurnRisk(customerRepo),
    authenticateUser: new AuthenticateUser(authRepo, passwordHasher),
    registerOwner: new RegisterOwner(authRepo, passwordHasher),
  }
}
