# Atrium Platform — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Turborepo monorepo with domain entities, typed event contracts, Prisma schema on Neon, and Clerk auth — everything Plan 2 (connectors + application) depends on.

**Architecture:** Hexagonal monorepo with strict dependency graph: `domain` has zero external deps, `events` depends only on `shared`, connectors never touch `domain` directly. Prisma lives entirely in `infrastructure`. Clerk handles auth; the domain owns roles via a `User` entity with `clerk_user_id`.

**Tech Stack:** Bun (runtime + package manager + test runner), Turborepo 2, Next.js 15 App Router, TypeScript 5.5, Prisma 5, Neon (Postgres), Clerk

## Global Constraints

- Use `bun` everywhere — never `node`, `npm`, `yarn`, or `pnpm`
- Use `bun:test` for all tests — never jest or vitest
- Money is always `{ amount: number; currency: string }` — never a raw number
- `packages/domain` must have zero imports from outside its own package
- `packages/connectors/*` must never import from `packages/domain`
- `packages/web` must never import from `packages/infrastructure` or `packages/connectors/*`
- All timestamps stored/passed as `Date` objects with timezone awareness
- TypeScript strict mode on all packages

---

## File Map

```
atrium.platform/
  turbo.json
  package.json                              # workspace root
  bun.lock
  tooling/
    typescript/
      base.json
      nextjs.json
  packages/
    shared/
      package.json
      tsconfig.json
      src/
        money.ts                            # Money value object + helpers
        customer-identifier.ts             # CustomerIdentifier discriminated union
        connector.ts                        # Connector interface
        date-range.ts                       # DateRange type
        result.ts                           # Result<T,E> type
        index.ts
    domain/
      package.json
      tsconfig.json
      src/
        entities/
          tenant.ts
          location.ts
          order.ts
          customer.ts
          customer-segment.ts
          customer-activity.ts
          review.ts
          revenue-snapshot.ts
          location-health.ts
          campaign.ts
          alert.ts
          recommendation.ts
          user.ts
        ports/
          order-repository.ts
          customer-repository.ts
          health-repository.ts
          alert-repository.ts
        index.ts
    events/
      package.json
      tsconfig.json
      src/
        sales.ts
        reputation.ts
        crm.ts
        analytics.ts
        ai.ts
        index.ts
    infrastructure/
      package.json
      tsconfig.json
      prisma/
        schema.prisma
      src/
        client.ts                           # singleton PrismaClient
        repositories/
          prisma-order-repository.ts
          prisma-customer-repository.ts
          prisma-health-repository.ts
          prisma-alert-repository.ts
        index.ts
    ui/
      package.json
      tsconfig.json
      src/
        index.ts                            # placeholder — populated in Plan 3
  apps/
    web/
      package.json
      tsconfig.json
      next.config.ts
      middleware.ts                         # Clerk auth
      app/
        layout.tsx
        globals.css
        (auth)/
          sign-in/[[...sign-in]]/page.tsx
          sign-up/[[...sign-up]]/page.tsx
        (dashboard)/
          layout.tsx
          page.tsx                          # placeholder — populated in Plan 3
        api/
          webhooks/
            clerk/route.ts                  # user.created → create Tenant + Location
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `turbo.json`
- Create: `package.json` (workspace root)
- Create: `tooling/typescript/base.json`
- Create: `tooling/typescript/nextjs.json`
- Create: `packages/shared/package.json`
- Create: `packages/domain/package.json`
- Create: `packages/events/package.json`
- Create: `packages/infrastructure/package.json`
- Create: `packages/ui/package.json`
- Create: `apps/web/package.json`

**Interfaces:**
- Produces: working `bun install` + `bun run build` at workspace root

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "atrium-platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "tooling/*"
  ],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:generate": "cd packages/infrastructure && bunx prisma generate",
    "db:migrate": "cd packages/infrastructure && bunx prisma migrate dev",
    "db:studio": "cd packages/infrastructure && bunx prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create turbo.json**

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", ".turbo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "lint": {
      "cache": true
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

- [ ] **Step 3: Create tooling/typescript/base.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 4: Create tooling/typescript/nextjs.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "allowJs": true,
    "plugins": [{ "name": "next" }]
  }
}
```

- [ ] **Step 5: Create packages/shared/package.json**

```json
{
  "name": "@atrium/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "echo 'shared: no build needed'",
    "test": "bun test",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 6: Create packages/domain/package.json**

```json
{
  "name": "@atrium/domain",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "echo 'domain: no build needed'",
    "test": "bun test",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@atrium/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 7: Create packages/events/package.json**

```json
{
  "name": "@atrium/events",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "echo 'events: no build needed'",
    "test": "bun test",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@atrium/shared": "workspace:*",
    "@atrium/domain": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 8: Create packages/infrastructure/package.json**

```json
{
  "name": "@atrium/infrastructure",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "bunx prisma generate",
    "test": "bun test",
    "lint": "tsc --noEmit",
    "db:generate": "bunx prisma generate",
    "db:migrate": "bunx prisma migrate dev",
    "db:studio": "bunx prisma studio"
  },
  "dependencies": {
    "@atrium/domain": "workspace:*",
    "@atrium/shared": "workspace:*",
    "@prisma/client": "^5.17.0"
  },
  "devDependencies": {
    "prisma": "^5.17.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 9: Create packages/ui/package.json**

```json
{
  "name": "@atrium/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "echo 'ui: no build needed'",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@atrium/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 10: Create apps/web/package.json**

```json
{
  "name": "@atrium/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev --turbopack",
    "lint": "next lint",
    "test": "bun test"
  },
  "dependencies": {
    "@atrium/domain": "workspace:*",
    "@atrium/infrastructure": "workspace:*",
    "@atrium/shared": "workspace:*",
    "@atrium/ui": "workspace:*",
    "@clerk/nextjs": "^6.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 11: Create tsconfig.json for each package**

Create `packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tooling/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Repeat the same pattern for `packages/domain/tsconfig.json`, `packages/events/tsconfig.json`, `packages/infrastructure/tsconfig.json`, `packages/ui/tsconfig.json`.

Create `apps/web/tsconfig.json`:
```json
{
  "extends": "../../tooling/typescript/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 12: Install all dependencies**

```bash
bun install
```

Expected: lockfile created, all workspace packages linked.

- [ ] **Step 13: Create placeholder src/index.ts for shared, domain, events, ui**

```ts
// packages/shared/src/index.ts
export {}
```

Same for `packages/domain/src/index.ts`, `packages/events/src/index.ts`, `packages/ui/src/index.ts`.

- [ ] **Step 14: Verify build**

```bash
bun run build
```

Expected: all packages build, no TypeScript errors.

- [ ] **Step 15: Commit**

```bash
git init
echo "node_modules\n.next\n.env\n.env.local\ndist\n.turbo" > .gitignore
git add -A
git commit -m "feat: initialize Turborepo monorepo with Bun workspace"
```

---

## Task 2: Shared Package — Value Objects & Interfaces

**Files:**
- Create: `packages/shared/src/money.ts`
- Create: `packages/shared/src/customer-identifier.ts`
- Create: `packages/shared/src/connector.ts`
- Create: `packages/shared/src/date-range.ts`
- Create: `packages/shared/src/result.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/money.test.ts`

**Interfaces:**
- Produces: `Money`, `CustomerIdentifier`, `Connector`, `DateRange`, `Result<T,E>` — used by all other packages

- [ ] **Step 1: Write failing tests for Money**

Create `packages/shared/src/money.test.ts`:
```ts
import { describe, it, expect } from "bun:test"
import { money, addMoney, zeroCents, formatMoney } from "./money"

describe("money", () => {
  it("creates a Money value object", () => {
    const m = money(1050, "USD")
    expect(m.amount).toBe(1050)
    expect(m.currency).toBe("USD")
  })

  it("adds two Money values of the same currency", () => {
    const a = money(500, "USD")
    const b = money(300, "USD")
    expect(addMoney(a, b)).toEqual(money(800, "USD"))
  })

  it("throws when adding different currencies", () => {
    expect(() => addMoney(money(500, "USD"), money(300, "MXN"))).toThrow(
      "Cannot add USD and MXN"
    )
  })

  it("returns zero cents money", () => {
    expect(zeroCents("USD")).toEqual(money(0, "USD"))
  })

  it("formats money for display", () => {
    expect(formatMoney(money(1050, "USD"))).toBe("$10.50")
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd packages/shared && bun test src/money.test.ts
```

Expected: FAIL — "Cannot find module './money'"

- [ ] **Step 3: Implement money.ts**

Create `packages/shared/src/money.ts`:
```ts
export type Currency = "USD" | "MXN" | "EUR"

export type Money = {
  readonly amount: number   // always in cents (integer)
  readonly currency: Currency
}

export function money(amount: number, currency: Currency): Money {
  if (!Number.isInteger(amount)) throw new Error("Money amount must be an integer (cents)")
  return { amount, currency }
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add ${a.currency} and ${b.currency}`)
  }
  return money(a.amount + b.amount, a.currency)
}

export function zeroCents(currency: Currency): Money {
  return money(0, currency)
}

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currency,
  }).format(m.amount / 100)
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd packages/shared && bun test src/money.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Implement remaining shared types**

Create `packages/shared/src/customer-identifier.ts`:
```ts
export type CustomerIdentifier =
  | { readonly type: "email"; readonly value: string }
  | { readonly type: "phone"; readonly value: string }   // E.164: +1XXXXXXXXXX
  | { readonly type: "external_ref"; readonly provider: string; readonly value: string }

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

export function sameIdentifier(a: CustomerIdentifier, b: CustomerIdentifier): boolean {
  if (a.type !== b.type) return false
  if (a.type === "external_ref" && b.type === "external_ref") {
    return a.provider === b.provider && a.value === b.value
  }
  return a.value === b.value
}
```

Create `packages/shared/src/date-range.ts`:
```ts
export type DateRange = {
  readonly start: Date
  readonly end: Date
}

export function dateRange(start: Date, end: Date): DateRange {
  if (end <= start) throw new Error("end must be after start")
  return { start, end }
}

export function lastNDays(n: number): DateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - n)
  return { start, end }
}
```

Create `packages/shared/src/result.ts`:
```ts
export type Ok<T> = { readonly ok: true; readonly value: T }
export type Err<E> = { readonly ok: false; readonly error: E }
export type Result<T, E = Error> = Ok<T> | Err<E>

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}
```

Create `packages/shared/src/connector.ts`:
```ts
import type { DateRange } from "./date-range"

export type ConnectorStatus = {
  connected: boolean
  lastSyncAt: Date | null
  error: string | null
}

export type SyncResult = {
  processed: number
  inserted: number
  updated: number
  errors: number
}

export type ConnectorCredentials = Record<string, string>

export interface Connector {
  verify(credentials: ConnectorCredentials): Promise<ConnectorStatus>
  sync(locationId: string, range: DateRange): Promise<SyncResult>
  handleWebhook(payload: unknown, signature: string): Promise<void>
}
```

- [ ] **Step 6: Update shared index.ts**

```ts
// packages/shared/src/index.ts
export * from "./money"
export * from "./customer-identifier"
export * from "./date-range"
export * from "./result"
export * from "./connector"
```

- [ ] **Step 7: Verify TypeScript**

```bash
cd packages/shared && bun run lint
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add Money VO, CustomerIdentifier, Connector interface, Result type"
```

---

## Task 3: Domain Package — Entities

**Files:**
- Create: `packages/domain/src/entities/*.ts` (13 files)
- Create: `packages/domain/src/ports/*.ts` (4 files)
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/src/entities/customer.test.ts`

**Interfaces:**
- Consumes: `Money`, `CustomerIdentifier` from `@atrium/shared`
- Produces: all domain entity types + port interfaces — consumed by `@atrium/events`, `@atrium/infrastructure`, `@atrium/application`

- [ ] **Step 1: Write failing test for Customer invariants**

Create `packages/domain/src/entities/customer.test.ts`:
```ts
import { describe, it, expect } from "bun:test"
import { createCustomer, addIdentifier, hasIdentifier } from "./customer"
import type { CustomerIdentifier } from "@atrium/shared"

describe("Customer", () => {
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

  it("creates a valid customer", () => {
    const c = createCustomer(base)
    expect(c.id).toBe("c1")
    expect(c.loyaltyTier).toBe("standard")
  })

  it("adds an identifier to a customer", () => {
    const c = createCustomer(base)
    const updated = addIdentifier(c, { type: "email", value: "joe@example.com" })
    expect(updated.identifiers).toHaveLength(1)
  })

  it("does not add duplicate identifiers", () => {
    const c = createCustomer(base)
    const id: CustomerIdentifier = { type: "email", value: "joe@example.com" }
    const once = addIdentifier(c, id)
    const twice = addIdentifier(once, id)
    expect(twice.identifiers).toHaveLength(1)
  })

  it("checks if customer has an identifier", () => {
    const c = createCustomer({ ...base, identifiers: [{ type: "email", value: "joe@example.com" }] })
    expect(hasIdentifier(c, { type: "email", value: "joe@example.com" })).toBe(true)
    expect(hasIdentifier(c, { type: "email", value: "other@example.com" })).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd packages/domain && bun test src/entities/customer.test.ts
```

Expected: FAIL — "Cannot find module './customer'"

- [ ] **Step 3: Create all entity files**

Create `packages/domain/src/entities/tenant.ts`:
```ts
export type Tenant = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly timezone: string   // IANA timezone string e.g. "America/New_York"
  readonly createdAt: Date
  readonly loyaltyConfig: LoyaltyConfig
}

export type LoyaltyConfig = {
  bronze:   { minOrders: number; minSpentCents: number }
  silver:   { minOrders: number; minSpentCents: number }
  gold:     { minOrders: number; minSpentCents: number }
  vipTopPct: number  // e.g. 0.05 for top 5%
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  bronze:   { minOrders: 3,  minSpentCents: 15000 },
  silver:   { minOrders: 8,  minSpentCents: 40000 },
  gold:     { minOrders: 20, minSpentCents: 100000 },
  vipTopPct: 0.05,
}
```

Create `packages/domain/src/entities/location.ts`:
```ts
export type Location = {
  readonly id: string
  readonly tenantId: string
  readonly name: string
  readonly address: string
  readonly googlePlaceId: string | null
  readonly createdAt: Date
}
```

Create `packages/domain/src/entities/order.ts`:
```ts
import type { Money } from "@atrium/shared"

export type OrderChannel = "dine_in" | "pickup" | "delivery" | "online"

export type Order = {
  readonly id: string
  readonly locationId: string
  readonly customerId: string | null
  readonly occurredAt: Date
  readonly channel: OrderChannel
  readonly total: Money
  readonly itemsCount: number
  readonly sourceRef: string   // external ID — Toast GUID, Square ID, etc.
}
```

Create `packages/domain/src/entities/customer.ts`:
```ts
import type { Money, CustomerIdentifier } from "@atrium/shared"
import { sameIdentifier } from "@atrium/shared"

export type LoyaltyTier = "standard" | "bronze" | "silver" | "gold" | "vip"
export type OrderChannel = "dine_in" | "pickup" | "delivery" | "online"

export type Customer = {
  readonly id: string
  readonly tenantId: string
  readonly identifiers: CustomerIdentifier[]
  readonly firstSeenAt: Date
  readonly lastSeenAt: Date
  readonly acquisitionSource: string | null
  readonly totalOrders: number
  readonly totalSpent: Money
  readonly avgTicket: Money
  readonly visitFrequency: number | null    // avg days between orders
  readonly preferredChannel: OrderChannel | null
  readonly loyaltyTier: LoyaltyTier
  readonly churnRisk: number | null         // 0–1
  readonly churnRiskReason: string | null
  readonly tags: string[]
  readonly notes: string | null
}

export function createCustomer(props: Customer): Customer {
  return { ...props }
}

export function addIdentifier(customer: Customer, id: CustomerIdentifier): Customer {
  if (hasIdentifier(customer, id)) return customer
  return { ...customer, identifiers: [...customer.identifiers, id] }
}

export function hasIdentifier(customer: Customer, id: CustomerIdentifier): boolean {
  return customer.identifiers.some((existing) => sameIdentifier(existing, id))
}

export function mergeIdentifiers(
  customer: Customer,
  incoming: CustomerIdentifier[]
): Customer {
  let result = customer
  for (const id of incoming) {
    result = addIdentifier(result, id)
  }
  return result
}
```

Create `packages/domain/src/entities/customer-segment.ts`:
```ts
export type SegmentRuleOperator = "gt" | "lt" | "gte" | "lte" | "eq"

export type SegmentRule = {
  readonly field: string
  readonly operator: SegmentRuleOperator
  readonly value: number | string
}

export type SegmentType = "system" | "custom"

export type CustomerSegment = {
  readonly id: string
  readonly tenantId: string
  readonly name: string
  readonly type: SegmentType
  readonly rules: SegmentRule[]
}

// System segment names — cannot be deleted
export const SYSTEM_SEGMENTS = [
  "vip",
  "at_risk",
  "new",
  "loyal",
  "dormant",
  "one_time",
] as const

export type SystemSegmentName = (typeof SYSTEM_SEGMENTS)[number]
```

Create `packages/domain/src/entities/customer-activity.ts`:
```ts
export type ActivityType =
  | "order"
  | "review"
  | "campaign_redeemed"
  | "tier_changed"
  | "segment_changed"

export type CustomerActivity = {
  readonly id: string
  readonly customerId: string
  readonly tenantId: string
  readonly type: ActivityType
  readonly payload: Record<string, unknown>
  readonly occurredAt: Date
}
```

Create `packages/domain/src/entities/review.ts`:
```ts
export type ReviewPlatform = "google" | "yelp" | "tripadvisor" | "facebook"
export type StarRating = 1 | 2 | 3 | 4 | 5

export type Review = {
  readonly id: string
  readonly locationId: string
  readonly platform: ReviewPlatform
  readonly rating: StarRating
  readonly content: string | null
  readonly reply: string | null
  readonly publishedAt: Date
  readonly respondedAt: Date | null
  readonly sentimentScore: number | null   // -1 to 1
  readonly sourceRef: string
}
```

Create `packages/domain/src/entities/revenue-snapshot.ts`:
```ts
import type { Money } from "@atrium/shared"

export type PeriodType = "daily" | "weekly" | "monthly"

export type RevenueSnapshot = {
  readonly id: string
  readonly locationId: string
  readonly periodType: PeriodType
  readonly periodStart: Date
  readonly totalRevenue: Money
  readonly orderCount: number
  readonly avgTicket: Money
}
```

Create `packages/domain/src/entities/location-health.ts`:
```ts
export type HealthTrend = "up" | "stable" | "down"

export type HealthDimensions = {
  readonly revenue: number     // 0–100, weight 30%
  readonly reputation: number  // 0–100, weight 30%
  readonly traffic: number     // 0–100, weight 20%
  readonly retention: number   // 0–100, weight 20%
}

export type LocationHealth = {
  readonly id: string
  readonly locationId: string
  readonly computedAt: Date
  readonly score: number          // 0–100 weighted overall
  readonly dimensions: HealthDimensions
  readonly trend: HealthTrend
}

export function computeOverallScore(dimensions: HealthDimensions): number {
  return (
    dimensions.revenue    * 0.30 +
    dimensions.reputation * 0.30 +
    dimensions.traffic    * 0.20 +
    dimensions.retention  * 0.20
  )
}
```

Create `packages/domain/src/entities/campaign.ts`:
```ts
export type CampaignChannel = "social" | "email" | "sms" | "in_store"
export type CampaignStatus = "draft" | "active" | "completed" | "cancelled"

export type Campaign = {
  readonly id: string
  readonly tenantId: string
  readonly locationId: string | null
  readonly name: string
  readonly channel: CampaignChannel
  readonly promoCode: string | null
  readonly startsAt: Date
  readonly endsAt: Date | null
  readonly status: CampaignStatus
}
```

Create `packages/domain/src/entities/alert.ts`:
```ts
export type AlertType =
  | "revenue_drop"
  | "review_spike"
  | "traffic_anomaly"
  | "low_rating"
  | "churn_risk"

export type AlertSeverity = "info" | "warning" | "critical"

export type Alert = {
  readonly id: string
  readonly tenantId: string
  readonly locationId: string | null
  readonly type: AlertType
  readonly severity: AlertSeverity
  readonly payload: Record<string, unknown>
  readonly triggeredAt: Date
  readonly acknowledgedAt: Date | null
}
```

Create `packages/domain/src/entities/recommendation.ts`:
```ts
export type RecommendationCategory =
  | "operations"
  | "marketing"
  | "reputation"
  | "growth"

export type RecommendationStatus = "pending" | "accepted" | "dismissed"

export type Recommendation = {
  readonly id: string
  readonly tenantId: string
  readonly category: RecommendationCategory
  readonly title: string
  readonly body: string
  readonly rationale: string
  readonly status: RecommendationStatus
  readonly createdAt: Date
  readonly expiresAt: Date | null
}
```

Create `packages/domain/src/entities/user.ts`:
```ts
export type UserRole = "atrium_admin" | "owner" | "manager" | "viewer"

export type User = {
  readonly id: string
  readonly tenantId: string | null   // null for atrium_admin (cross-tenant)
  readonly clerkUserId: string
  readonly role: UserRole
}

export function canAccessTenant(user: User, tenantId: string): boolean {
  if (user.role === "atrium_admin") return true
  return user.tenantId === tenantId
}
```

- [ ] **Step 4: Create port interfaces**

Create `packages/domain/src/ports/order-repository.ts`:
```ts
import type { Order } from "../entities/order"
import type { DateRange } from "@atrium/shared"

export interface OrderRepository {
  save(order: Order): Promise<void>
  findBySourceRef(sourceRef: string): Promise<Order | null>
  findByLocation(locationId: string, range: DateRange): Promise<Order[]>
  findByCustomer(customerId: string): Promise<Order[]>
  countByLocation(locationId: string, range: DateRange): Promise<number>
}
```

Create `packages/domain/src/ports/customer-repository.ts`:
```ts
import type { Customer } from "../entities/customer"
import type { CustomerIdentifier } from "@atrium/shared"

export interface CustomerRepository {
  save(customer: Customer): Promise<void>
  findById(id: string): Promise<Customer | null>
  findByIdentifier(identifier: CustomerIdentifier): Promise<Customer | null>
  findByTenant(tenantId: string, opts?: {
    tier?: string
    minChurnRisk?: number
    limit?: number
    offset?: number
  }): Promise<{ customers: Customer[]; total: number }>
}
```

Create `packages/domain/src/ports/health-repository.ts`:
```ts
import type { LocationHealth } from "../entities/location-health"

export interface HealthRepository {
  save(health: LocationHealth): Promise<void>
  findLatest(locationId: string): Promise<LocationHealth | null>
  findHistory(locationId: string, limit: number): Promise<LocationHealth[]>
}
```

Create `packages/domain/src/ports/alert-repository.ts`:
```ts
import type { Alert } from "../entities/alert"

export interface AlertRepository {
  save(alert: Alert): Promise<void>
  findActive(tenantId: string): Promise<Alert[]>
  acknowledge(alertId: string, at: Date): Promise<void>
}
```

- [ ] **Step 5: Create domain index.ts**

```ts
// packages/domain/src/index.ts
// Entities
export * from "./entities/tenant"
export * from "./entities/location"
export * from "./entities/order"
export * from "./entities/customer"
export * from "./entities/customer-segment"
export * from "./entities/customer-activity"
export * from "./entities/review"
export * from "./entities/revenue-snapshot"
export * from "./entities/location-health"
export * from "./entities/campaign"
export * from "./entities/alert"
export * from "./entities/recommendation"
export * from "./entities/user"

// Ports
export * from "./ports/order-repository"
export * from "./ports/customer-repository"
export * from "./ports/health-repository"
export * from "./ports/alert-repository"
```

- [ ] **Step 6: Run tests**

```bash
cd packages/domain && bun test
```

Expected: PASS (4 Customer tests)

- [ ] **Step 7: Verify TypeScript**

```bash
cd packages/domain && bun run lint
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add packages/domain/
git commit -m "feat(domain): add all entities, value objects, and port interfaces"
```

---

## Task 4: Events Package — Typed Contracts

**Files:**
- Create: `packages/events/src/sales.ts`
- Create: `packages/events/src/reputation.ts`
- Create: `packages/events/src/crm.ts`
- Create: `packages/events/src/analytics.ts`
- Create: `packages/events/src/ai.ts`
- Create: `packages/events/src/index.ts`
- Create: `packages/events/src/events.test.ts`

**Interfaces:**
- Consumes: domain entities from `@atrium/domain`
- Produces: `DomainEvent` discriminated union — used by Trigger.dev jobs in Plan 2

- [ ] **Step 1: Write failing test**

Create `packages/events/src/events.test.ts`:
```ts
import { describe, it, expect } from "bun:test"
import { isSalesEvent, isReputationEvent } from "./index"

describe("event type guards", () => {
  it("identifies a sales event", () => {
    const event = {
      type: "sales.order.created" as const,
      payload: {
        locationId: "loc1",
        order: {} as any,
        occurredAt: new Date(),
      },
    }
    expect(isSalesEvent(event)).toBe(true)
    expect(isReputationEvent(event)).toBe(false)
  })

  it("identifies a reputation event", () => {
    const event = {
      type: "reputation.review.received" as const,
      payload: { locationId: "loc1", review: {} as any },
    }
    expect(isReputationEvent(event)).toBe(true)
    expect(isSalesEvent(event)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd packages/events && bun test src/events.test.ts
```

Expected: FAIL

- [ ] **Step 3: Create event contract files**

Create `packages/events/src/sales.ts`:
```ts
import type { Order } from "@atrium/domain"

export type OrderCreatedEvent = {
  readonly type: "sales.order.created"
  readonly payload: {
    readonly locationId: string
    readonly order: Order
    readonly occurredAt: Date
  }
}

export type OrderUpdatedEvent = {
  readonly type: "sales.order.updated"
  readonly payload: {
    readonly locationId: string
    readonly orderId: string
    readonly changes: Partial<Order>
    readonly occurredAt: Date
  }
}

export type OrderVoidedEvent = {
  readonly type: "sales.order.voided"
  readonly payload: {
    readonly locationId: string
    readonly orderId: string
    readonly occurredAt: Date
  }
}

export type SalesEvent = OrderCreatedEvent | OrderUpdatedEvent | OrderVoidedEvent
```

Create `packages/events/src/reputation.ts`:
```ts
import type { Review } from "@atrium/domain"

export type ReviewReceivedEvent = {
  readonly type: "reputation.review.received"
  readonly payload: {
    readonly locationId: string
    readonly review: Review
  }
}

export type ReviewRespondedEvent = {
  readonly type: "reputation.review.responded"
  readonly payload: {
    readonly locationId: string
    readonly reviewId: string
    readonly reply: string
    readonly respondedAt: Date
  }
}

export type ReputationEvent = ReviewReceivedEvent | ReviewRespondedEvent
```

Create `packages/events/src/crm.ts`:
```ts
import type { LoyaltyTier } from "@atrium/domain"

export type CustomerTierChangedEvent = {
  readonly type: "crm.customer.tier_changed"
  readonly payload: {
    readonly customerId: string
    readonly tenantId: string
    readonly from: LoyaltyTier
    readonly to: LoyaltyTier
  }
}

export type CustomerSegmentChangedEvent = {
  readonly type: "crm.customer.segment_changed"
  readonly payload: {
    readonly customerId: string
    readonly tenantId: string
    readonly segment: string
    readonly action: "joined" | "left"
  }
}

export type ChurnRiskElevatedEvent = {
  readonly type: "crm.churn_risk.elevated"
  readonly payload: {
    readonly customerId: string
    readonly tenantId: string
    readonly riskScore: number
    readonly reason: string
  }
}

export type ReviewLinkedEvent = {
  readonly type: "crm.review.linked"
  readonly payload: {
    readonly customerId: string
    readonly reviewId: string
  }
}

export type CrmEvent =
  | CustomerTierChangedEvent
  | CustomerSegmentChangedEvent
  | ChurnRiskElevatedEvent
  | ReviewLinkedEvent
```

Create `packages/events/src/analytics.ts`:
```ts
import type { RevenueSnapshot, LocationHealth } from "@atrium/domain"
import type { PeriodType } from "@atrium/domain"

export type RevenueRecomputedEvent = {
  readonly type: "analytics.revenue.recomputed"
  readonly payload: {
    readonly locationId: string
    readonly period: PeriodType
    readonly snapshot: RevenueSnapshot
  }
}

export type HealthRecomputedEvent = {
  readonly type: "analytics.health.recomputed"
  readonly payload: {
    readonly locationId: string
    readonly health: LocationHealth
  }
}

export type AnalyticsEvent = RevenueRecomputedEvent | HealthRecomputedEvent
```

Create `packages/events/src/ai.ts`:
```ts
import type { Recommendation, AlertType, AlertSeverity } from "@atrium/domain"

export type AnomalyDetectedEvent = {
  readonly type: "ai.anomaly.detected"
  readonly payload: {
    readonly tenantId: string
    readonly locationId: string
    readonly anomalyType: AlertType
    readonly severity: AlertSeverity
    readonly description: string
    readonly data: Record<string, unknown>
  }
}

export type RecommendationCreatedEvent = {
  readonly type: "ai.recommendation.created"
  readonly payload: {
    readonly tenantId: string
    readonly recommendation: Recommendation
  }
}

export type AiEvent = AnomalyDetectedEvent | RecommendationCreatedEvent
```

- [ ] **Step 4: Create events index with type guards**

Create `packages/events/src/index.ts`:
```ts
export * from "./sales"
export * from "./reputation"
export * from "./crm"
export * from "./analytics"
export * from "./ai"

import type { SalesEvent } from "./sales"
import type { ReputationEvent } from "./reputation"
import type { CrmEvent } from "./crm"
import type { AnalyticsEvent } from "./analytics"
import type { AiEvent } from "./ai"

export type DomainEvent =
  | SalesEvent
  | ReputationEvent
  | CrmEvent
  | AnalyticsEvent
  | AiEvent

export function isSalesEvent(e: DomainEvent): e is SalesEvent {
  return e.type.startsWith("sales.")
}

export function isReputationEvent(e: DomainEvent): e is ReputationEvent {
  return e.type.startsWith("reputation.")
}

export function isCrmEvent(e: DomainEvent): e is CrmEvent {
  return e.type.startsWith("crm.")
}

export function isAnalyticsEvent(e: DomainEvent): e is AnalyticsEvent {
  return e.type.startsWith("analytics.")
}

export function isAiEvent(e: DomainEvent): e is AiEvent {
  return e.type.startsWith("ai.")
}
```

- [ ] **Step 5: Run tests**

```bash
cd packages/events && bun test
```

Expected: PASS (2 tests)

- [ ] **Step 6: Verify TypeScript**

```bash
cd packages/events && bun run lint
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/events/
git commit -m "feat(events): add typed domain event contracts with type guards"
```

---

## Task 5: Infrastructure — Prisma Schema & Neon

**Files:**
- Create: `packages/infrastructure/prisma/schema.prisma`
- Create: `packages/infrastructure/.env.example`
- Create: `packages/infrastructure/src/client.ts`
- Create: `packages/infrastructure/src/index.ts`

**Interfaces:**
- Produces: `db` — singleton PrismaClient used by all repositories in Plan 2

- [ ] **Step 1: Create .env.example**

Create `packages/infrastructure/.env.example`:
```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

Create `packages/infrastructure/.env` (from actual Neon connection string — do not commit):
```
DATABASE_URL="<your-neon-connection-string>"
```

Add to root `.gitignore`:
```
packages/infrastructure/.env
.env
.env.local
```

- [ ] **Step 2: Create Prisma schema**

Create `packages/infrastructure/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}

model Tenant {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  timezone       String   @default("America/New_York")
  loyaltyConfig  Json     @default("{}")
  createdAt      DateTime @default(now())

  locations       Location[]
  customers       Customer[]
  campaigns       Campaign[]
  alerts          Alert[]
  recommendations Recommendation[]
  users           User[]
  segments        CustomerSegment[]

  @@map("tenants")
}

model Location {
  id            String   @id @default(cuid())
  tenantId      String
  name          String
  address       String
  googlePlaceId String?
  createdAt     DateTime @default(now())

  tenant               Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders               Order[]
  reviews              Review[]
  trafficSnapshots     TrafficSnapshot[]
  keywordSnapshots     KeywordSnapshot[]
  revenueSnapshots     RevenueSnapshot[]
  locationHealth       LocationHealth[]
  connectorCredentials ConnectorCredential[]

  @@map("locations")
}

model Order {
  id          String   @id @default(cuid())
  locationId  String
  customerId  String?
  occurredAt  DateTime
  channel     String
  totalAmount Int
  currency    String   @default("USD")
  itemsCount  Int
  sourceRef   String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  location Location  @relation(fields: [locationId], references: [id])
  customer Customer? @relation(fields: [customerId], references: [id])

  @@index([locationId, occurredAt])
  @@index([customerId])
  @@map("orders")
}

model Customer {
  id                 String    @id @default(cuid())
  tenantId           String
  firstSeenAt        DateTime
  lastSeenAt         DateTime
  acquisitionSource  String?
  totalOrders        Int       @default(0)
  totalSpentAmount   Int       @default(0)
  totalSpentCurrency String    @default("USD")
  avgTicketAmount    Int       @default(0)
  visitFrequency     Float?
  preferredChannel   String?
  loyaltyTier        String    @default("standard")
  churnRisk          Float?
  churnRiskReason    String?
  churnRiskUpdatedAt DateTime?
  tags               String[]
  notes              String?

  tenant      Tenant               @relation(fields: [tenantId], references: [id])
  identifiers CustomerIdentifier[]
  orders      Order[]
  activities  CustomerActivity[]

  @@index([tenantId])
  @@index([tenantId, loyaltyTier])
  @@index([tenantId, churnRisk])
  @@map("customers")
}

model CustomerIdentifier {
  id         String @id @default(cuid())
  customerId String
  type       String
  value      String
  provider   String?

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@unique([type, value])
  @@index([customerId])
  @@map("customer_identifiers")
}

model CustomerActivity {
  id         String   @id @default(cuid())
  customerId String
  tenantId   String
  type       String
  payload    Json
  occurredAt DateTime

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([customerId, occurredAt])
  @@map("customer_activities")
}

model CustomerSegment {
  id       String @id @default(cuid())
  tenantId String
  name     String
  type     String
  rules    Json

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, name])
  @@map("customer_segments")
}

model Review {
  id             String   @id @default(cuid())
  locationId     String
  platform       String
  rating         Int
  content        String?
  reply          String?
  publishedAt    DateTime
  respondedAt    DateTime?
  sentimentScore Float?
  sourceRef      String   @unique

  location Location @relation(fields: [locationId], references: [id])

  @@index([locationId, publishedAt])
  @@map("reviews")
}

model RevenueSnapshot {
  id           String   @id @default(cuid())
  locationId   String
  periodType   String
  periodStart  DateTime
  totalRevenue Int
  currency     String   @default("USD")
  orderCount   Int
  avgTicket    Int

  location Location @relation(fields: [locationId], references: [id])

  @@unique([locationId, periodType, periodStart])
  @@index([locationId, periodType, periodStart])
  @@map("revenue_snapshots")
}

model LocationHealth {
  id         String   @id @default(cuid())
  locationId String
  computedAt DateTime
  score      Float
  revenue    Float
  reputation Float
  traffic    Float
  retention  Float
  trend      String

  location Location @relation(fields: [locationId], references: [id])

  @@index([locationId, computedAt])
  @@map("location_health")
}

model TrafficSnapshot {
  id          String   @id @default(cuid())
  locationId  String
  periodStart DateTime
  periodEnd   DateTime
  sessions    Int
  users       Int
  source      String

  location Location @relation(fields: [locationId], references: [id])

  @@index([locationId, periodStart])
  @@map("traffic_snapshots")
}

model KeywordSnapshot {
  id          String   @id @default(cuid())
  locationId  String
  capturedAt  DateTime
  keyword     String
  position    Float
  impressions Int
  clicks      Int

  location Location @relation(fields: [locationId], references: [id])

  @@index([locationId, capturedAt])
  @@map("keyword_snapshots")
}

model Alert {
  id             String    @id @default(cuid())
  tenantId       String
  locationId     String?
  type           String
  severity       String
  payload        Json
  triggeredAt    DateTime
  acknowledgedAt DateTime?

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, triggeredAt])
  @@map("alerts")
}

model Recommendation {
  id        String    @id @default(cuid())
  tenantId  String
  category  String
  title     String
  body      String
  rationale String
  status    String    @default("pending")
  createdAt DateTime  @default(now())
  expiresAt DateTime?

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, status])
  @@map("recommendations")
}

model Campaign {
  id         String    @id @default(cuid())
  tenantId   String
  locationId String?
  name       String
  channel    String
  promoCode  String?
  startsAt   DateTime
  endsAt     DateTime?
  status     String    @default("draft")

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@map("campaigns")
}

model User {
  id          String  @id @default(cuid())
  tenantId    String?
  clerkUserId String  @unique
  role        String  @default("viewer")

  tenant Tenant? @relation(fields: [tenantId], references: [id])

  @@map("users")
}

model ConnectorCredential {
  id          String   @id @default(cuid())
  locationId  String
  provider    String
  credentials String
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  location Location @relation(fields: [locationId], references: [id])

  @@unique([locationId, provider])
  @@map("connector_credentials")
}

// Infrastructure only — domain never reads this table
model ConnectorEvent {
  id          String   @id @default(cuid())
  locationId  String?
  provider    String
  eventType   String
  payload     Json
  processedAt DateTime @default(now())

  @@index([locationId, provider])
  @@map("connector_events")
}
```

- [ ] **Step 3: Generate Prisma client**

```bash
cd packages/infrastructure && bunx prisma generate
```

Expected: Prisma Client generated to `node_modules/@prisma/client`

- [ ] **Step 4: Run first migration**

```bash
cd packages/infrastructure && bunx prisma migrate dev --name init
```

Expected: migration file created in `prisma/migrations/`, all tables created in Neon.

- [ ] **Step 5: Create Prisma client singleton**

Create `packages/infrastructure/src/client.ts`:
```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 6: Create infrastructure index**

Create `packages/infrastructure/src/index.ts`:
```ts
export { db } from "./client"
```

- [ ] **Step 7: Verify connection**

```bash
cd packages/infrastructure && bunx prisma studio
```

Expected: Prisma Studio opens, all tables visible and empty.

Close Prisma Studio (`Ctrl+C`) before proceeding.

- [ ] **Step 8: Commit**

```bash
git add packages/infrastructure/
git commit -m "feat(infrastructure): add Prisma schema and Neon migration"
```

---

## Task 6: Auth — Clerk Setup & User Sync

**Files:**
- Create: `apps/web/middleware.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Create: `apps/web/app/(dashboard)/layout.tsx`
- Create: `apps/web/app/(dashboard)/page.tsx`
- Create: `apps/web/app/api/webhooks/clerk/route.ts`
- Create: `apps/web/.env.example`
- Create: `packages/infrastructure/src/repositories/prisma-user-repository.ts`

**Interfaces:**
- Consumes: `db` from `@atrium/infrastructure`
- Produces: Clerk-protected dashboard routes, `POST /api/webhooks/clerk` creates Tenant + User on signup

- [ ] **Step 1: Set up environment variables**

Create `apps/web/.env.example`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=whsec_...
```

Create `apps/web/.env.local` with actual Clerk values (do not commit).

- [ ] **Step 2: Create Next.js config**

Create `apps/web/next.config.ts`:
```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@atrium/ui", "@atrium/shared", "@atrium/domain"],
}

export default nextConfig
```

- [ ] **Step 3: Create Clerk middleware**

Create `apps/web/middleware.ts`:
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
```

- [ ] **Step 4: Create root layout with ClerkProvider**

Create `apps/web/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `apps/web/app/layout.tsx`:
```tsx
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "Atrium",
  description: "Restaurant growth platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 5: Create auth pages**

Create `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:
```tsx
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignIn />
    </main>
  )
}
```

Create `apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:
```tsx
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  )
}
```

- [ ] **Step 6: Create dashboard shell**

Create `apps/web/app/(dashboard)/layout.tsx`:
```tsx
import { UserButton } from "@clerk/nextjs"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-lg">Atrium</span>
        <UserButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

Create `apps/web/app/(dashboard)/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500 mt-1">Platform coming in Plan 3.</p>
    </div>
  )
}
```

- [ ] **Step 7: Create Clerk webhook handler**

Create `apps/web/app/api/webhooks/clerk/route.ts`:
```ts
import { headers } from "next/headers"
import { Webhook } from "svix"
import { db } from "@atrium/infrastructure"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return new Response("No webhook secret", { status: 500 })

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: { type: string; data: Record<string, unknown> }

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof evt
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }

  if (evt.type === "user.created") {
    const clerkUserId = evt.data.id as string
    const email = (evt.data.email_addresses as { email_address: string }[])[0]?.email_address ?? ""

    // Create Tenant + User for the first admin signup
    // In production, Atrium team creates orgs via admin panel
    await db.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        role: "owner",
        tenant: {
          create: {
            name: email.split("@")[0] ?? "New Restaurant",
            slug: `${email.split("@")[0]}-${Date.now()}`,
            timezone: "America/New_York",
          },
        },
      },
      update: {},
    })
  }

  return new Response("OK", { status: 200 })
}
```

Note: Install svix for webhook verification:
```bash
cd apps/web && bun add svix
```

- [ ] **Step 8: Start dev server and verify auth flow**

```bash
bun run dev
```

Navigate to `http://localhost:3000` — should redirect to `/sign-in`.
Sign up → should redirect to dashboard at `/`.
Check Neon DB: `users` and `tenants` tables should have 1 row each.

- [ ] **Step 9: Commit**

```bash
git add apps/web/
git commit -m "feat(auth): add Clerk auth with middleware, auth pages, and user sync webhook"
```

---

## Task 7: System Segment Seeding

**Files:**
- Create: `packages/infrastructure/src/seed-segments.ts`

**Interfaces:**
- Consumes: `db` from `packages/infrastructure/src/client.ts`
- Produces: `seedSystemSegments(tenantId)` — called after Tenant creation in webhook

- [ ] **Step 1: Create seeder**

Create `packages/infrastructure/src/seed-segments.ts`:
```ts
import { db } from "./client"
import { SYSTEM_SEGMENTS } from "@atrium/domain"

const SYSTEM_SEGMENT_RULES: Record<string, object[]> = {
  vip: [{ field: "ltv_percentile", operator: "gte", value: 0.95 }],
  at_risk: [
    { field: "days_since_last_order", operator: "gte", value: 45 },
    { field: "visit_frequency", operator: "lte", value: 20 },
  ],
  new: [{ field: "days_since_first_order", operator: "lte", value: 30 }],
  loyal: [
    { field: "total_orders", operator: "gte", value: 5 },
    { field: "days_since_last_order", operator: "lte", value: 30 },
  ],
  dormant: [{ field: "days_since_last_order", operator: "gte", value: 90 }],
  one_time: [
    { field: "total_orders", operator: "eq", value: 1 },
    { field: "days_since_last_order", operator: "gte", value: 60 },
  ],
}

export async function seedSystemSegments(tenantId: string): Promise<void> {
  await Promise.all(
    SYSTEM_SEGMENTS.map((name) =>
      db.customerSegment.upsert({
        where: { tenantId_name: { tenantId, name } },
        create: {
          tenantId,
          name,
          type: "system",
          rules: SYSTEM_SEGMENT_RULES[name] ?? [],
        },
        update: {},
      })
    )
  )
}
```

- [ ] **Step 2: Call seeder from Clerk webhook**

Update `apps/web/app/api/webhooks/clerk/route.ts` — add import and call after user creation:

```ts
// Add to imports:
// NOTE: direct infra import is a temporary exception for this bootstrap webhook.
// Plan 2 refactors this to call an application use case instead.
import { seedSystemSegments } from "@atrium/infrastructure"

// Replace the db.user.upsert call with:
const result = await db.user.upsert({
  where: { clerkUserId },
  create: {
    clerkUserId,
    role: "owner",
    tenant: {
      create: {
        name: email.split("@")[0] ?? "New Restaurant",
        slug: `${email.split("@")[0]}-${Date.now()}`,
        timezone: "America/New_York",
      },
    },
  },
  update: {},
  include: { tenant: true },
})

if (result.tenant) {
  await seedSystemSegments(result.tenant.id)
}
```

Also export from infrastructure index:
```ts
// packages/infrastructure/src/index.ts
export { db } from "./client"
export { seedSystemSegments } from "./seed-segments"
```

- [ ] **Step 3: Verify seeding**

Sign up a new user, then check Neon DB `customer_segments` table — should have 6 rows for the new tenant.

- [ ] **Step 4: Commit**

```bash
git add packages/infrastructure/src/seed-segments.ts apps/web/app/api/webhooks/clerk/route.ts packages/infrastructure/src/index.ts
git commit -m "feat(infrastructure): seed system customer segments on tenant creation"
```

---

## Verification Checklist (Plan 1 Complete)

Before marking Plan 1 done, verify all of the following:

- [ ] `bun install` at repo root completes without errors
- [ ] `bun run build` passes for all packages
- [ ] `bun test` passes in `packages/shared` and `packages/domain`
- [ ] `bunx prisma studio` (from `packages/infrastructure`) shows all tables
- [ ] Navigating to `http://localhost:3000` redirects to sign-in
- [ ] Sign-up creates a row in `users`, `tenants`, and 6 rows in `customer_segments`
- [ ] TypeScript strict mode passes in all packages (`bun run lint`)
- [ ] No package imports from `@atrium/domain` inside `packages/events` directly importing infrastructure
- [ ] `packages/domain/src/index.ts` has zero imports from outside the package

---

## Next: Plan 2

Plan 2 covers Toast connector + application layer (order sync, CRM enrichment, health score) + Trigger.dev jobs. Run it after Plan 1 is verified.

Path: `docs/superpowers/plans/2026-06-18-plan-2-product.md`
