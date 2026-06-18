export type Currency = "USD" | "MXN" | "EUR"

export type Money = {
  readonly amount: number   // cents (integer)
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
