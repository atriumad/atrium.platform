import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import Specimen from "../app/specimen/page"

describe("specimen", () => {
  test("renders every token name so the page is the palette's source of truth", () => {
    const html = renderToStaticMarkup(createElement(Specimen))
    for (const token of ["ink", "cream", "amber", "green-fill", "red-fill", "muted", "line"]) {
      expect(html).toContain(token)
    }
  })

  test("shows every Button variant", () => {
    const html = renderToStaticMarkup(createElement(Specimen))
    for (const label of ["primary", "secondary", "accent", "ghost"]) {
      expect(html).toContain(label)
    }
  })

  test("shows the three Meter tones", () => {
    const html = renderToStaticMarkup(createElement(Specimen))
    expect(html).toContain("bg-green-fill")
    expect(html).toContain("bg-amber-fill")
    expect(html).toContain("bg-red-fill")
  })
})
