import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Button } from "../src/components/Button"
import { Eyebrow } from "../src/components/Eyebrow"
import { Stat } from "../src/components/Stat"
import { Tag } from "../src/components/Tag"

describe("Button", () => {
  test("primary is the ink pill with mint text", () => {
    const html = renderToStaticMarkup(createElement(Button, { variant: "primary" }, "Go"))
    expect(html).toContain("bg-ink")
    expect(html).toContain("text-mint")
    expect(html).toContain("rounded-full")
  })

  test("renders an anchor when href is set", () => {
    const html = renderToStaticMarkup(createElement(Button, { href: "/x" }, "Go"))
    expect(html).toStartWith("<a")
  })

  test("renders a button with an explicit type when href is absent", () => {
    const html = renderToStaticMarkup(createElement(Button, {}, "Go"))
    expect(html).toStartWith("<button")
    expect(html).toContain('type="button"')
  })

  test("className is appended, not replaced", () => {
    const html = renderToStaticMarkup(createElement(Button, { className: "w-full" }, "Go"))
    expect(html).toContain("w-full")
    expect(html).toContain("bg-ink")
  })
})

describe("Tag", () => {
  test("outline carries the hairline token", () => {
    const html = renderToStaticMarkup(createElement(Tag, { variant: "outline" }, "New"))
    expect(html).toContain("border-line")
  })
})

describe("Eyebrow", () => {
  test("is uppercase at the system's tracking and weight", () => {
    const html = renderToStaticMarkup(createElement(Eyebrow, {}, "Primary leak"))
    expect(html).toContain("uppercase")
    expect(html).toContain("tracking-[0.14em]")
    expect(html).toContain("font-semibold")
  })

  test("on-dark switches to mint", () => {
    const html = renderToStaticMarkup(createElement(Eyebrow, { tone: "on-dark" }, "Score"))
    expect(html).toContain("text-mint")
  })
})

describe("Stat", () => {
  test("warn uses the amber ground and ink", () => {
    const html = renderToStaticMarkup(createElement(Stat, { value: 68, label: "Reputation", tone: "warn" }))
    expect(html).toContain("border-amber")
    expect(html).toContain("text-amber-ink")
    expect(html).toContain("68")
    expect(html).toContain("Reputation")
  })
})
