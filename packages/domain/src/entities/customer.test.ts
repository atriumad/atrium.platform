import { describe, it, expect } from "bun:test"
import { createCustomer, addIdentifier, hasIdentifier, mergeIdentifiers } from "./customer"
import type { CustomerIdentifier } from "@atrium/shared"

const base = {
  id: "c1",
  tenantId: "t1",
  firstSeenAt: new Date("2026-01-01"),
  lastSeenAt: new Date("2026-06-01"),
  identifiers: [] as CustomerIdentifier[],
  totalOrders: 0,
  totalSpent: { amount: 0, currency: "USD" as const },
  avgTicket: { amount: 0, currency: "USD" as const },
  visitFrequency: null,
  preferredChannel: null,
  loyaltyTier: "standard" as const,
  churnRisk: null,
  churnRiskReason: null,
  acquisitionSource: null,
  tags: [],
  notes: null,
}

describe("Customer", () => {
  it("creates a valid customer", () => {
    const c = createCustomer(base)
    expect(c.id).toBe("c1")
    expect(c.loyaltyTier).toBe("standard")
  })

  it("adds an identifier", () => {
    const c = createCustomer(base)
    const updated = addIdentifier(c, { type: "email", value: "joe@example.com" })
    expect(updated.identifiers).toHaveLength(1)
  })

  it("does not duplicate identical identifiers", () => {
    const id: CustomerIdentifier = { type: "email", value: "joe@example.com" }
    const once = addIdentifier(createCustomer(base), id)
    const twice = addIdentifier(once, id)
    expect(twice.identifiers).toHaveLength(1)
  })

  it("does not duplicate external_ref with same provider+value", () => {
    const id: CustomerIdentifier = { type: "external_ref", provider: "toast", value: "abc" }
    const once = addIdentifier(createCustomer(base), id)
    const twice = addIdentifier(once, id)
    expect(twice.identifiers).toHaveLength(1)
  })

  it("checks identifier presence", () => {
    const c = createCustomer({ ...base, identifiers: [{ type: "email", value: "joe@example.com" }] })
    expect(hasIdentifier(c, { type: "email", value: "joe@example.com" })).toBe(true)
    expect(hasIdentifier(c, { type: "email", value: "other@example.com" })).toBe(false)
  })

  it("merges multiple identifiers without duplication", () => {
    const c = createCustomer(base)
    const ids: CustomerIdentifier[] = [
      { type: "email", value: "joe@example.com" },
      { type: "phone", value: "+15551234567" },
      { type: "email", value: "joe@example.com" }, // duplicate
    ]
    const merged = mergeIdentifiers(c, ids)
    expect(merged.identifiers).toHaveLength(2)
  })
})
