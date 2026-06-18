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
