import { describe, it, expect } from "bun:test"
import { money, addMoney, zeroCents, formatMoney } from "./money"

describe("money", () => {
  it("creates a Money value object", () => {
    const m = money(1050, "USD")
    expect(m.amount).toBe(1050)
    expect(m.currency).toBe("USD")
  })

  it("adds two Money values of the same currency", () => {
    expect(addMoney(money(500, "USD"), money(300, "USD"))).toEqual(money(800, "USD"))
  })

  it("throws when adding different currencies", () => {
    expect(() => addMoney(money(500, "USD"), money(300, "MXN"))).toThrow(
      "Cannot add USD and MXN"
    )
  })

  it("throws when amount is not an integer", () => {
    expect(() => money(10.5, "USD")).toThrow("integer")
  })

  it("returns zero cents", () => {
    expect(zeroCents("USD")).toEqual(money(0, "USD"))
  })

  it("formats USD", () => {
    expect(formatMoney(money(1050, "USD"))).toBe("$10.50")
  })
})
