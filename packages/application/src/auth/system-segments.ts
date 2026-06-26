import type { CustomerSegmentSeed } from "./auth-ports"

export const SYSTEM_CUSTOMER_SEGMENTS = [
  {
    name: "vip",
    type: "system",
    rules: [{ field: "ltv_percentile", operator: "gte", value: 0.95 }],
  },
  {
    name: "at_risk",
    type: "system",
    rules: [
      { field: "days_since_last_order", operator: "gte", value: 45 },
      { field: "visit_frequency", operator: "lte", value: 20 },
    ],
  },
  {
    name: "new",
    type: "system",
    rules: [{ field: "days_since_first_order", operator: "lte", value: 30 }],
  },
  {
    name: "loyal",
    type: "system",
    rules: [
      { field: "total_orders", operator: "gte", value: 5 },
      { field: "days_since_last_order", operator: "lte", value: 30 },
    ],
  },
  {
    name: "dormant",
    type: "system",
    rules: [{ field: "days_since_last_order", operator: "gte", value: 90 }],
  },
  {
    name: "one_time",
    type: "system",
    rules: [
      { field: "total_orders", operator: "eq", value: 1 },
      { field: "days_since_last_order", operator: "gte", value: 60 },
    ],
  },
] as const satisfies readonly CustomerSegmentSeed[]
