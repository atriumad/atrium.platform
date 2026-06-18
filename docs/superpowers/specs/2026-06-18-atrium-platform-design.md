# Atrium Platform — System Design Spec

**Date:** 2026-06-18
**Status:** Approved — ready for implementation planning
**Version:** 2.0 (clean rewrite — v1 deprecated)

---

## Why v1 Was Deprecated

v1 was built around data sources, not around the business. Toast's data model leaked into the domain. Metricool's API quirks became business logic. When a connector changed, the core broke. The system had no real scalability because it had no real separation.

v2 corrects this by modeling the **restaurant**, not the APIs that feed it.

---

## 1. Core Principle

**The domain models outcomes, not data.**

```
❌ v1:  Toast.Order → stored as-is → UI shows Toast fields
✅ v2:  Toast extracts → normalizes to Order (12 fields) → domain works with Order
```

The domain does not know Toast exists. Connectors do not know the domain exists. They communicate exclusively through typed, versioned event contracts.

The system must be useful even when zero connectors are active. It must improve as connectors are added.

---

## 2. Tech Stack

| Layer | Technology | Decision |
|---|---|---|
| Monorepo | Turborepo + Bun | Confirmed |
| App | Next.js 15, App Router | Confirmed |
| Language | TypeScript | Confirmed |
| Styling | Tailwind CSS + Shadcn | Confirmed |
| ORM | Prisma | Confirmed |
| Database | Neon (Postgres serverless) | Recommended over Supabase — Prisma-native, Vercel-native, no auth lock-in |
| Auth | Clerk | Multi-tenant organizations + RBAC out of the box |
| Events / Jobs | Trigger.dev | Event-driven jobs, cron, long-running backfill, realtime progress |
| Deployment | Vercel | web app + edge functions |
| AI | Provider-agnostic port | Claude (default) or OpenAI, switchable via env var |

---

## 3. Monorepo Structure

```
atrium.platform/
  apps/
    web/                      # Next.js 15 App Router — thin layer only
  packages/
    domain/                   # Entities, value objects, invariants — ZERO external deps
    application/              # Use cases, orchestration, health score engine
    events/                   # Typed, versioned event contracts
    connectors/
      toast/                  # Toast POS adapter
      google-business/        # Google Business Profile adapter
      google-analytics/       # GA4 + Search Console adapter
    infrastructure/           # Prisma client, Trigger.dev, port implementations
    ai/                       # Agents, prompts, providers, evaluators
    shared/                   # Common utilities, types, helpers
    ui/                       # Shadcn design system + reusable components
  tooling/
    typescript/               # Shared tsconfig base
    eslint/                   # Shared eslint config
  turbo.json
  package.json
  bun.lock
```

### Dependency Graph (enforced — no exceptions)

```
domain          → no dependencies
events          → shared
application     → domain, events
connectors/*    → events, shared         (NEVER domain directly)
infrastructure  → domain, application, prisma
ai              → domain, events, shared
ui              → shared
web             → application, ui        (NEVER connectors or infrastructure)
```

If `web` needs infra, it goes through a use case in `application`.
If a connector needs domain data, it maps to an event in `events`.

---

## 4. Domain Model

### Hierarchy

```
Tenant                         ← the restaurant brand / group (Atrium's paying customer)
  ├── Location                 ← physical store
  │     ├── Order
  │     ├── Review
  │     ├── TrafficSnapshot
  │     ├── KeywordSnapshot
  │     └── RevenueSnapshot
  ├── Customer                 ← enriched by all data sources
  │     ├── CustomerActivity   ← unified timeline of touchpoints
  │     └── [CustomerSegment membership]
  └── CustomerSegment          ← dynamic groupings (system + custom)

Tenant-level
  ├── LocationHealth           ← the health score
  ├── Campaign
  ├── Alert
  └── Recommendation
```

**The CRM is the primary intelligence output.** Every connector, event, and computation ultimately enriches our understanding of each customer. `LocationHealth` tells you how the restaurant is doing. The CRM tells you who your customers are, how they behave, and who is about to leave.

### Value Objects

```ts
// Always use — never raw primitives for these
type Money = { amount: number; currency: 'USD' | 'MXN' | 'EUR' }

type CustomerIdentifier =
  | { type: 'email';        value: string }
  | { type: 'phone';        value: string }   // E.164 normalized
  | { type: 'external_ref'; provider: string; value: string }
```

### Entities

**Tenant**
```ts
{ id, name, slug, timezone, created_at }
```

**Location**
```ts
{ id, tenant_id, name, address, google_place_id?: string, created_at }
```

**Order**
```ts
{
  id, location_id, customer_id?: string
  occurred_at: Date
  channel: 'dine_in' | 'pickup' | 'delivery' | 'online'
  total: Money
  items_count: number
  source_ref: string            // external ID (Toast GUID, Square ID, etc.)
}
```

**Customer**
```ts
{
  id, tenant_id
  identifiers: CustomerIdentifier[]   // dedup logic lives here, not in SQL

  // Lifecycle
  first_seen_at: Date
  last_seen_at: Date
  acquisition_source: string | null   // first channel that brought them

  // Computed stats — updated via domain events, never calculated on-the-fly
  total_orders: number
  total_spent: Money
  avg_ticket: Money
  visit_frequency: number             // avg days between orders
  preferred_channel: 'dine_in' | 'pickup' | 'delivery' | 'online' | null

  // CRM intelligence — computed, not manually set
  loyalty_tier: 'standard' | 'bronze' | 'silver' | 'gold' | 'vip'
  churn_risk: number | null           // 0–1, rules-based + AI narrative

  // Manual annotations — set by Atrium team or owner
  tags: string[]
  notes: string | null
}
```

**CustomerSegment**
```ts
{
  id, tenant_id
  name: string
  type: 'system' | 'custom'
  rules: SegmentRule[]                // evaluated dynamically — no stored membership list

  // System segments (predefined, cannot be deleted):
  // 'vip'      → top 10% LTV in tenant
  // 'at_risk'  → no order in 45+ days, previously ordered ≥1/month
  // 'new'      → first order within last 30 days
  // 'loyal'    → 5+ orders, active in last 30 days
  // 'dormant'  → no order in 90+ days
  // 'one_time' → exactly 1 order, 60+ days ago
}
```

**CustomerActivity** *(unified customer timeline)*
```ts
{
  id, customer_id, tenant_id
  type: 'order' | 'review' | 'campaign_redeemed' | 'tier_changed' | 'segment_changed'
  payload: Json
  occurred_at: Date
}
```

**Review**
```ts
{
  id, location_id
  platform: 'google' | 'yelp' | 'tripadvisor' | 'facebook'
  rating: 1 | 2 | 3 | 4 | 5
  content?: string
  reply?: string
  published_at: Date
  responded_at?: Date
  sentiment_score?: number            // -1 to 1 — computed by AI, stored by domain
  source_ref: string
}
```

**TrafficSnapshot**
```ts
{
  id, location_id
  period_start: Date, period_end: Date
  sessions: number, users: number
  source: 'organic' | 'paid' | 'direct' | 'social' | 'referral'
}
```

**KeywordSnapshot**
```ts
{
  id, location_id, captured_at: Date
  keyword: string
  position: number
  impressions: number, clicks: number
}
```

**RevenueSnapshot** *(denormalized — trigger-driven)*
```ts
{
  id, location_id
  period_type: 'daily' | 'weekly' | 'monthly'
  period_start: Date
  total_revenue: Money
  order_count: number
  avg_ticket: Money
}
```

**LocationHealth** *(the product's core KPI)*
```ts
{
  id, location_id, computed_at: Date
  score: number                  // 0–100 weighted
  dimensions: {
    revenue:    number           // 30%
    reputation: number           // 30%
    traffic:    number           // 20%
    retention:  number           // 20%
  }
  trend: 'up' | 'stable' | 'down'
}
```

**Campaign**
```ts
{
  id, tenant_id, location_id?: string
  name: string
  channel: 'social' | 'email' | 'sms' | 'in_store'
  promo_code?: string
  starts_at: Date, ends_at?: Date
  status: 'draft' | 'active' | 'completed' | 'cancelled'
}
```

**Alert**
```ts
{
  id, tenant_id, location_id?: string
  type: 'revenue_drop' | 'review_spike' | 'traffic_anomaly' | 'low_rating'
  severity: 'info' | 'warning' | 'critical'
  payload: Json
  triggered_at: Date
  acknowledged_at?: Date
}
```

**Recommendation**
```ts
{
  id, tenant_id
  category: 'operations' | 'marketing' | 'reputation' | 'growth'
  title: string, body: string
  rationale: string
  status: 'pending' | 'accepted' | 'dismissed'
  created_at: Date, expires_at?: Date
}
```

**User**
```ts
{
  id
  tenant_id: string | null      // null for atrium_admin (cross-tenant)
  clerk_user_id: string
  role: 'atrium_admin' | 'owner' | 'manager' | 'viewer'
}
```

### Raw Payload Rule

Connectors normalize N API fields to M domain fields (M << N). The full raw payload is never discarded:

```
Connector → normalize 12 fields → publish domain event
           → store full JSON in connector_events (infrastructure table)
```

`connector_events` is infra, not domain. The domain never reads it. If a field wasn't normalized today, it can be backfilled tomorrow.

---

## 5. Event Architecture

### Three Layers

```
Layer 1: Connector events    ← external world data arrives
Layer 2: Domain events       ← what happened in the business
Layer 3: Reaction jobs       ← what the system does in response
```

### Event Catalog (`packages/events`)

```ts
// Sales
'sales.order.created'              → { locationId, order: Order, occurredAt }
'sales.order.updated'              → { locationId, orderId, changes, occurredAt }
'sales.order.voided'               → { locationId, orderId, occurredAt }

// Reputation
'reputation.review.received'       → { locationId, review: Review }
'reputation.review.responded'      → { locationId, reviewId, reply, respondedAt }

// Traffic
'traffic.snapshot.captured'        → { locationId, snapshot: TrafficSnapshot }
'seo.keyword.snapshot.captured'    → { locationId, snapshot: KeywordSnapshot }

// CRM — customer intelligence
'crm.customer.tier_changed'        → { customerId, tenantId, from: LoyaltyTier, to: LoyaltyTier }
'crm.customer.segment_changed'     → { customerId, tenantId, segment: string, action: 'joined' | 'left' }
'crm.churn_risk.elevated'          → { customerId, tenantId, risk_score: number, reason: string }
'crm.review.linked'                → { customerId, reviewId }   // review matched to a known customer

// Analytics (internal)
'analytics.revenue.recomputed'     → { locationId, period, snapshot: RevenueSnapshot }
'analytics.health.recomputed'      → { locationId, health: LocationHealth }

// AI
'ai.anomaly.detected'              → { tenantId, locationId, type, severity, payload }
'ai.recommendation.created'        → { tenantId, recommendation: Recommendation }
```

### Job Reactions (Trigger.dev)

```
sales.order.created
  ├── dedup-customer                → merge CustomerIdentifiers
  ├── update-customer-stats         → total_orders, total_spent, avg_ticket, preferred_channel
  ├── recompute-revenue-snapshot    → daily snapshot
  ├── recompute-loyalty-tier        → if LTV crosses threshold → crm.customer.tier_changed
  ├── recompute-visit-frequency     → avg days between orders
  └── reset-churn-risk              → customer returned → clears elevated risk

analytics.revenue.recomputed
  ├── recompute-health-revenue
  └── check-sales-anomaly           → if current < rolling_avg_14d × 0.80 → ai.anomaly.detected

reputation.review.received
  ├── compute-sentiment             → AI call → stores sentiment_score
  ├── link-review-to-customer       → match by email → crm.review.linked → CustomerActivity
  ├── check-low-rating              → rating < 3 → critical Alert
  └── recompute-health-reputation

crm.customer.tier_changed
  └── record-activity               → CustomerActivity { type: 'tier_changed' }

crm.churn_risk.elevated
  ├── create-alert                  → Alert { type: 'churn_risk', severity: 'warning' }
  └── recommendation-engine         → suggest re-engagement action

analytics.health.recomputed
  └── check-recommendations-needed  → score < 60 → recommendation-engine

ai.anomaly.detected
  ├── create-alert
  └── recommendation-engine

[cron: daily 02:00 tenant timezone]
  └── evaluate-at-risk-customers    → scan all customers → flag churn risk
                                    → crm.churn_risk.elevated for each crossing threshold
```

### Connector Sync Strategy

```
Webhooks (real-time)
  External event → POST /api/webhooks/{connector}
                 → validate signature
                 → publish domain event to Trigger.dev
                 → respond in <200ms

Scheduled catch-up (Trigger.dev cron, hourly)
  → connector queries external API (last hour)
  → publishes events for each record
  → idempotent: upsert by source_ref, no duplicates

Manual backfill (Trigger.dev long-running job)
  → triggered from UI via Server Action
  → processes in 30-day chunks
  → streams progress via Trigger.dev realtime
```

### Idempotency Rule

Every job must be safe to run multiple times:

```ts
await db.order.upsert({
  where: { sourceRef: event.payload.order.sourceRef },
  create: { ...order },
  update: { ...order },
})
```

---

## 6. Health Score Engine

Location: `packages/application/health-score/`

**The health score is deterministic math, not AI.** It must be fully explainable.

### Dimension Formulas

```
Revenue (weight: 30%)
  revenue_change = (current_week - last_week) / last_week
  score = clamp(50 + (revenue_change × 100), 0, 100)

Reputation (weight: 30%)
  avg_rating = mean(reviews.last_30_days.rating)
  sentiment_adj = mean(reviews.last_30_days.sentiment_score) × 10
  score = (avg_rating / 5 × 90) + sentiment_adj

Traffic (weight: 20%)
  session_change = (current_sessions - prev_sessions) / prev_sessions
  score = clamp(50 + (session_change × 100), 0, 100)

Retention (weight: 20%)
  customers_current = distinct customers, orders last 30 days
  returning = customers_current ∩ customers, orders prev 30 days
  score = (returning / customers_current) × 100

Overall = revenue×0.30 + reputation×0.30 + traffic×0.20 + retention×0.20
Trend   = compare overall vs 3 previous computed scores
```

### Recalculation Triggers

```
analytics.revenue.recomputed   → recompute revenue dimension
reputation.review.received     → recompute reputation dimension
traffic.snapshot.captured      → recompute traffic dimension
sales.order.created (daily)    → recompute retention dimension
```

Each trigger recomputes only its affected dimension, then recomputes the overall score.

---

## 7. AI Layer

### Provider Port

```ts
// packages/ai/ports/ai-provider.ts
export interface AIProvider {
  complete(prompt: string, context: string): Promise<string>
}

// Implementations:
// packages/ai/providers/claude.ts   (claude-sonnet-4-6, default)
// packages/ai/providers/openai.ts   (gpt-4o)
// packages/ai/providers/mock.ts     (tests)

// Active provider set by env:
// AI_PROVIDER=claude | openai
```

The application never imports Anthropic or OpenAI SDKs directly. Only `AIProvider`.

### Three Agents

**Anomaly Detector**
```
Trigger: analytics.revenue.recomputed
Input:   last 14 RevenueSnapshots (domain data, not raw API)
Logic:   if current < rolling_avg_14d × 0.80 → anomaly
AI role: generate human-readable description of the anomaly
Output:  ai.anomaly.detected event
```

**Weekly Digest Agent**
```
Trigger: Trigger.dev cron — Monday 08:00 (tenant timezone)
Input:   RestaurantContext (see below)
AI role: generate executive summary + 3 key insights
Output:  Recommendation { category: 'summary', expires_at: +7d }
```

**Recommendation Engine**
```
Trigger: ai.anomaly.detected | analytics.health.recomputed (score < 60)
Input:   RestaurantContext + active Alerts + Recommendation history
AI role: generate 1–3 concrete, prioritized actions with rationale
Output:  Recommendation[]
```

### RestaurantContext — what AI receives

```ts
type RestaurantContext = {
  location:       Pick<Location, 'name' | 'address' | 'timezone'>
  health:         LocationHealth
  revenue:        RevenueSnapshot[]    // last 30 days
  reviews:        Review[]             // last 30 days
  topCustomers:   Customer[]           // top 10 by spend
  atRiskCustomers: Customer[]          // churn_risk > 0.6
  segmentSummary: {
    segment: string
    count: number
    pct_of_total: number
  }[]
  activeAlerts:   Alert[]
  openCampaigns:  Campaign[]
}
```

AI never sees raw API payloads. The context always has the same shape regardless of which connectors are active.

### Prompt Management

```
packages/ai/
  prompts/
    anomaly-description.ts
    weekly-digest.ts
    recommendation.ts
  agents/
    anomaly-detector.ts
    weekly-digest.ts
    recommendation-engine.ts
  ports/
    ai-provider.ts
  providers/
    claude.ts
    openai.ts
    mock.ts
```

Prompts are versioned TypeScript files. Updatable without touching job logic.

---

## 8. Auth & Multi-tenancy

**Clerk** handles authentication, sessions, and organization management.

```
Clerk Organization  →  Tenant (in domain)
Clerk User          →  User.clerk_user_id
```

**Roles:**
```ts
type Role = 'atrium_admin' | 'owner' | 'manager' | 'viewer'
```

`atrium_admin` — cross-tenant access (Atrium team)
`owner / manager / viewer` — scoped to their tenant only

**Client onboarding flow:**
```
1. Atrium creates Clerk Organization for the restaurant
2. Invites owner by email (Clerk handles invitation)
3. Clerk webhook → user.created → application creates Tenant + Location
4. Client connects integrations from /settings
```

No custom invitation tokens. No custom session management. No bcrypt in the codebase.

---

## 9. Connector Contracts

The `Connector` interface lives in `packages/shared` (not domain) so connectors can implement it without creating a circular dependency. Each implementation lives in `packages/connectors/{name}/`.

```ts
// packages/shared/connector.ts
interface Connector {
  // Validates credentials and returns connection status
  verify(credentials: ConnectorCredentials): Promise<ConnectorStatus>

  // Pulls data for a time range and publishes domain events
  sync(locationId: string, range: DateRange): Promise<SyncResult>

  // Handles real-time webhook payload → publishes domain events
  handleWebhook(payload: unknown, signature: string): Promise<void>
}
```

### Connector Priority

1. **Toast POS** — `sales.*` events — core revenue data
2. **Google Business Profile** — `reputation.review.*` events — reviews + local metrics
3. **Google Analytics (GA4)** — `traffic.snapshot.*` events — web traffic
4. **Search Console** — `seo.keyword.*` events — keyword positions

Each connector is independently deployable and independently removable.

---

## 10. CRM — Use Cases & Application Layer

Location: `packages/application/crm/`

### Use Cases

```
GetCustomerProfile
  Input:  customerId
  Output: Customer + last 12 months CustomerActivity + active segments + open Recommendations
  Notes:  360-degree view — the main CRM screen per customer

ListCustomers
  Input:  tenantId + filters { segment?, tier?, churn_risk_min?, search?, dateRange? }
  Output: paginated Customer[] with computed stats
  Notes:  powers the CRM list view with real-time filtering

ExportSegment
  Input:  segmentId
  Output: { email, phone, name }[] — anonymized for external use (email/SMS campaigns)
  Notes:  never exports raw order data — only contact identifiers

EvaluateSegmentMembership
  Input:  customerId (or all customers for a tenant on cron)
  Output: CustomerSegment[] changes → emits crm.customer.segment_changed
  Notes:  rules evaluated dynamically — no stored membership rows

UpdateCustomerAnnotations
  Input:  customerId + { tags?, notes? }
  Roles:  atrium_admin, owner, manager
  Output: updated Customer
  Notes:  only manual fields — never overwrites computed fields

ComputeChurnRisk
  Input:  Customer + order history
  Logic:  rules-first (days_since_last_order, freq_drop) → score 0–1
          AI generates human-readable reason when score > 0.6
  Output: churn_risk updated on Customer + crm.churn_risk.elevated if crossing 0.6

LinkReviewToCustomer
  Input:  Review
  Logic:  match Review email/name against CustomerIdentifier[]
  Output: CustomerActivity { type: 'review' } + crm.review.linked event
  Notes:  best-effort — no match → review stays unlinked, no error
```

### Loyalty Tier Thresholds (system defaults, configurable per tenant)

| Tier | Condition |
|---|---|
| `standard` | < 3 orders OR LTV < $150 |
| `bronze` | ≥ 3 orders AND LTV ≥ $150 |
| `silver` | ≥ 8 orders AND LTV ≥ $400 |
| `gold` | ≥ 20 orders AND LTV ≥ $1,000 |
| `vip` | top 5% LTV in tenant |

Thresholds stored in Tenant config — not hardcoded. Tier recomputed on every `sales.order.created`.

### Churn Risk Rules (deterministic layer)

```
days_since_last_order > 45  AND  avg_visit_frequency < 20  →  risk += 0.4
days_since_last_order > 30  AND  visit_frequency_dropped_50pct  →  risk += 0.3
total_orders == 1  AND  first_seen_at > 60 days ago  →  risk += 0.5
loyalty_tier in ['gold', 'vip']  AND  days_since_last_order > 30  →  risk += 0.6 (priority)
```

Score clamped to 0–1. AI generates the `reason` string when score > 0.6.

---

## 11. Non-Negotiable Rules

1. `domain` imports nothing external.
2. `connectors` never import from `domain` — only from `events` and `shared`.
3. `web` never imports from `connectors` or `infrastructure`.
4. Money is always a `Money` value object — never a raw number.
5. Customer deduplication logic lives in `domain` — never in SQL or migrations.
6. Every job in Trigger.dev must be idempotent (`upsert` by `source_ref`).
7. AI receives `RestaurantContext` — never raw connector payloads.
8. Health score is deterministic math — AI only generates narrative around it.
9. Raw connector payloads are always stored in `connector_events` — never discarded.
10. Every event contract in `packages/events` is versioned explicitly.

---

## 11. Connector Integration Priority

| Phase | Connector | Events | Unlocks |
|---|---|---|---|
| 1 | Toast POS | `sales.*` | Revenue analytics, full CRM (tier, churn, segments, activity), retention score, at-risk alerts, weekly AI digest |
| 2 | Google Business Profile | `reputation.review.*` | Reputation score, review management, review→customer linking |
| 3 | GA4 + Search Console | `traffic.*`, `seo.*` | Traffic score, keyword tracking |
| 4 | Email (Resend) | — | Campaigns, re-engagement automation |
| 5 | Meta Ads | `campaigns.*` | Paid attribution |

**Phase 1 alone delivers a complete product.** Toast orders are enough to build the full CRM: loyalty tiers, churn risk, customer segments, activity timeline, at-risk alerts, and weekly AI summaries. Every subsequent phase enriches the CRM further without requiring it.

---

## 12. What This System Is NOT

- Not a replacement for Toast, Google, or Meta — it reads from them, doesn't replace them.
- Not a social media manager — it analyzes, doesn't publish posts.
- Not a generic analytics tool — it's a restaurant growth platform with opinionated metrics.
- Not a chatbot — AI agents are analysts and operators, not conversation interfaces.
