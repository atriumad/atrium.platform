import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Card } from "../src/components/Card"
import { Input } from "../src/components/Input"
import { Logo } from "../src/components/Logo"
import { Meter } from "../src/components/Meter"

describe("Card", () => {
  test("dark tone carries the dark ground and cream text", () => {
    const html = renderToStaticMarkup(createElement(Card, { tone: "dark" }, "x"))
    expect(html).toContain("bg-dark")
    expect(html).toContain("text-cream")
  })

  test("elevation none emits no shadow utility", () => {
    const html = renderToStaticMarkup(createElement(Card, { elevation: "none" }, "x"))
    expect(html).not.toContain("shadow-soft")
    expect(html).not.toContain("shadow-float")
  })

  test("hairline adds a ring, not a border, so it does not affect layout", () => {
    const html = renderToStaticMarkup(createElement(Card, { hairline: true }, "x"))
    expect(html).toContain("ring-1")
    expect(html).toContain("ring-line")
  })
})

describe("Input", () => {
  test("label is bound to the control", () => {
    const html = renderToStaticMarkup(createElement(Input, { label: "Restaurant", id: "r" }))
    expect(html).toContain('for="r"')
    expect(html).toContain('id="r"')
  })

  test("error is announced and wired via aria-describedby", () => {
    const html = renderToStaticMarkup(createElement(Input, { label: "Email", id: "e", error: "Required" }))
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="e-error"')
    expect(html).toContain('id="e-error"')
    expect(html).toContain('role="alert"')
    expect(html).toContain("Required")
  })

  test("hint is wired when there is no error", () => {
    const html = renderToStaticMarkup(createElement(Input, { label: "Email", id: "e", hint: "Work address" }))
    expect(html).toContain('aria-describedby="e-hint"')
    expect(html).not.toContain('aria-invalid="true"')
  })
})

describe("Meter", () => {
  test("exposes the width to the JS animator and the value to assistive tech", () => {
    const html = renderToStaticMarkup(createElement(Meter, { value: 68, label: "Reputation", tone: "mid" }))
    expect(html).toContain('data-w="68%"')
    expect(html).toContain("atr-fill")
    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-valuenow="68"')
    expect(html).toContain("bg-amber-fill")
  })

  test("clamps out-of-range values", () => {
    const html = renderToStaticMarkup(createElement(Meter, { value: 140, label: "x" }))
    expect(html).toContain('data-w="100%"')
  })
})

describe("Logo", () => {
  test("mark variant has accessible name", () => {
    const html = renderToStaticMarkup(createElement(Logo, { variant: "mark" }))
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Atrium"')
  })

  test("wordmark variant has accessible name", () => {
    const html = renderToStaticMarkup(createElement(Logo, { variant: "wordmark" }))
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Atrium"')
  })

  test("lockup variant has accessible name", () => {
    const html = renderToStaticMarkup(createElement(Logo, { variant: "lockup" }))
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Atrium"')
  })
})
