import { prisma } from "../src/client"
import { money } from "@atrium/shared"
import type { Customer } from "@atrium/domain"
import { createUseCases } from "../src/composition-root"

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function seed() {
  console.log("\n=== Seeding data ===\n")

  const { orderRepo, customerRepo, reviewRepo, revenueRepo } = createUseCases(prisma)

  const tenantId = "seed-tenant-1"
  const locationId = "seed-loc-1"

  // Clean existing seed data
  await prisma.order.deleteMany({ where: { locationId } })
  await prisma.review.deleteMany({ where: { locationId } })
  await prisma.revenueSnapshot.deleteMany({ where: { locationId } })
  await prisma.locationHealth.deleteMany({ where: { locationId } })
  await prisma.location.deleteMany({ where: { id: locationId } })
  await prisma.customerIdentifier.deleteMany({ where: { customer: { tenantId } } })
  await prisma.customer.deleteMany({ where: { tenantId } })
  await prisma.tenant.deleteMany({ where: { id: tenantId } })

  // Tenant + Location
  await prisma.tenant.create({ data: { id: tenantId, name: "Seed Test Group", slug: "seed-test" } })
  await prisma.location.create({ data: { id: locationId, tenantId, name: "Seed Bistro", address: "123 Test St" } })
  console.log("  ✓ Tenant + Location created")

  // Customers
  const customerIds = ["seed-c1", "seed-c2", "seed-c3", "seed-c4", "seed-c5"]
  const customerData: { id: string; tier: string; email: string }[] = [
    { id: "seed-c1", tier: "gold", email: "c1@seed.test" },
    { id: "seed-c2", tier: "silver", email: "c2@seed.test" },
    { id: "seed-c3", tier: "standard", email: "c3@seed.test" },
    { id: "seed-c4", tier: "bronze", email: "c4@seed.test" },
    { id: "seed-c5", tier: "standard", email: "c5@seed.test" },
  ]
  for (const c of customerData) {
    const customer: Customer = {
      id: c.id,
      tenantId,
      identifiers: [{ type: "email", value: c.email }],
      firstSeenAt: c.id === "seed-c3" ? daysAgo(90) : daysAgo(60),
      lastSeenAt: c.id === "seed-c3" ? daysAgo(90) : daysAgo(1),
      acquisitionSource: null,
      totalOrders: 0,
      totalSpent: money(0, "USD"),
      avgTicket: money(0, "USD"),
      visitFrequency: null,
      preferredChannel: null,
      loyaltyTier: c.tier as Customer["loyaltyTier"],
      churnRisk: null,
      churnRiskReason: null,
      tags: [],
      notes: null,
    }
    await customerRepo.save(customer)
  }
  console.log("  ✓ 5 Customers created")

  // Orders
  // Current window (last 30 days): c1, c2, c4, c5
  // Previous window (60-30 days ago): c1, c3, c4
  const orders = [
    // Current window
    { id: "seed-o1", customerId: "seed-c1", at: daysAgo(25), cents: 3500 },
    { id: "seed-o2", customerId: "seed-c1", at: daysAgo(10), cents: 4500 },
    { id: "seed-o3", customerId: "seed-c2", at: daysAgo(20), cents: 2800 },
    { id: "seed-o4", customerId: "seed-c2", at: daysAgo(5), cents: 3200 },
    { id: "seed-o5", customerId: "seed-c4", at: daysAgo(15), cents: 5000 },
    { id: "seed-o6", customerId: "seed-c5", at: daysAgo(3), cents: 1500 },
    // Previous window
    { id: "seed-o7", customerId: "seed-c1", at: daysAgo(55), cents: 3000 },
    { id: "seed-o8", customerId: "seed-c1", at: daysAgo(40), cents: 4000 },
    { id: "seed-o9", customerId: "seed-c3", at: daysAgo(50), cents: 2500 },
    { id: "seed-o10", customerId: "seed-c4", at: daysAgo(35), cents: 4500 },
  ]
  for (const o of orders) {
    await orderRepo.save({
      id: o.id,
      locationId,
      customerId: o.customerId,
      occurredAt: o.at,
      channel: "dine_in",
      total: money(o.cents, "USD"),
      itemsCount: 2,
      sourceRef: `seed:${o.id}`,
    })
  }
  console.log(`  ✓ ${orders.length} Orders created`)

  // Reviews
  const reviews = [
    { rating: 5 as const, sentiment: 0.5 },
    { rating: 4 as const, sentiment: 0.2 },
    { rating: 3 as const, sentiment: 0 },
    { rating: 4 as const, sentiment: 0.3 },
    { rating: 2 as const, sentiment: -0.2 },
    { rating: 5 as const, sentiment: 0.4 },
  ]
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i]
    await reviewRepo.save({
      id: `seed-r${i + 1}`,
      locationId,
      platform: "google",
      rating: r.rating,
      content: `Review #${i + 1}`,
      reply: null,
      publishedAt: daysAgo(i * 5),
      respondedAt: null,
      sentimentScore: r.sentiment,
      sourceRef: `seed:review-${i + 1}`,
    })
  }
  console.log(`  ✓ ${reviews.length} Reviews created`)

  // Revenue snapshots (last 8 weeks)
  for (let w = 0; w < 8; w++) {
    await revenueRepo.save({
      id: `seed-rs${w + 1}`,
      locationId,
      periodType: "weekly",
      periodStart: daysAgo(w * 7 + 7),
      totalRevenue: money(15000 + Math.floor(Math.random() * 5000), "USD"),
      orderCount: 10 + w,
      avgTicket: money(1500 + w * 50, "USD"),
    })
  }
  console.log("  ✓ 8 Revenue snapshots created\n")
}

async function verify() {
  console.log("=== Verifying use cases ===\n")

  const useCases = createUseCases(prisma)
  const locationId = "seed-loc-1"

  // 1. RecalculateHealthScore
  console.log("--- RecalculateHealthScore ---")
  const healthResult = await useCases.recalculateHealthScore.execute({ locationId })
  if (!healthResult.ok) {
    console.log("  ✗ Failed:", healthResult.error.message)
  } else {
    const h = healthResult.value
    console.log(`  Score:      ${h.score.toFixed(1)} / 100`)
    console.log(`  Revenue:    ${h.dimensions.revenue.toFixed(1)}  (weight 30%)`)
    console.log(`  Reputation: ${h.dimensions.reputation.toFixed(1)}  (weight 30%)`)
    console.log(`  Traffic:    ${h.dimensions.traffic.toFixed(1)}  (weight 20%)`)
    console.log(`  Retention:  ${h.dimensions.retention.toFixed(1)}  (weight 20%)`)
    console.log(`  Trend:      ${h.trend}`)
  }

  // 2. GetCustomerProfile
  console.log("\n--- GetCustomerProfile (seed-c1 with orders) ---")
  const profileResult = await useCases.getCustomerProfile.execute({
    customerId: "seed-c1",
    includeRecentOrders: true,
  })
  if (!profileResult.ok) {
    console.log("  ✗ Failed:", profileResult.error.message)
  } else {
    const p = profileResult.value
    console.log(`  Customer: ${p.customer.id} (${p.customer.loyaltyTier})`)
    console.log(`  Identifiers: ${p.customer.identifiers.length}`)
    console.log(`  Total spent: $${(p.customer.totalSpent.amount / 100).toFixed(2)}`)
    console.log(`  Recent orders: ${p.recentOrders?.length ?? 0}`)
  }

  // 3. ListCustomers
  console.log("\n--- ListCustomers (all, then filtered by tier) ---")
  const allResult = await useCases.listCustomers.execute({ tenantId: "seed-tenant-1" })
  if (!allResult.ok) {
    console.log("  ✗ Failed:", allResult.error.message)
  } else {
    const l = allResult.value
    console.log(`  Total customers: ${l.total}`)
    console.log(`  Returned: ${l.customers.length}`)
    for (const c of l.customers) {
      console.log(`    • ${c.id} — ${c.loyaltyTier}`)
    }
  }

  const goldResult = await useCases.listCustomers.execute({
    tenantId: "seed-tenant-1",
    tier: "gold",
  })
  if (goldResult.ok) {
    console.log(`\n  Gold tier count: ${goldResult.value.total}`)
  }

  // 4. ComputeChurnRisk
  console.log("\n--- ComputeChurnRisk ---")

  // seed-c3 was last seen 60 days ago with no recent orders — should be elevated
  const churnResult = await useCases.computeChurnRisk.execute({ customerId: "seed-c3" })
  if (!churnResult.ok) {
    console.log("  ✗ Failed:", churnResult.error.message)
  } else {
    const c = churnResult.value
    console.log(`  Customer: seed-c3`)
    console.log(`  Churn risk: ${c.customer.churnRisk !== null ? (c.customer.churnRisk * 100).toFixed(1) + '%' : 'null'}`)
    console.log(`  Reason: ${c.customer.churnRiskReason ?? 'none'}`)
    console.log(`  Elevated event: ${c.event ? 'YES' : 'NO'}`)
  }

  // seed-c1 was visited 1 day ago — should be low risk
  const safeResult = await useCases.computeChurnRisk.execute({ customerId: "seed-c1" })
  if (!safeResult.ok) {
    console.log("  ✗ Failed:", safeResult.error.message)
  } else {
    const c = safeResult.value
    console.log(`\n  Customer: seed-c1`)
    console.log(`  Churn risk: ${c.customer.churnRisk !== null ? (c.customer.churnRisk * 100).toFixed(1) + '%' : 'null'}`)
    console.log(`  Elevated event: ${c.event ? 'YES' : 'NO'}`)
  }

  console.log("\n=== All verifications complete ===\n")
}

async function main() {
  try {
    await seed()
    await verify()
  } catch (e) {
    console.error("\n✗ Error:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
