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

export const SYSTEM_SEGMENTS = [
  "vip",
  "at_risk",
  "new",
  "loyal",
  "dormant",
  "one_time",
] as const

export type SystemSegmentName = (typeof SYSTEM_SEGMENTS)[number]
