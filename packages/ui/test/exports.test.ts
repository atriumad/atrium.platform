import { describe, expect, test } from "bun:test"

describe("@atrium/ui entry points", () => {
  test("the new barrel exports the primitives", async () => {
    const mod = await import("../src/index.ts")
    expect(Object.keys(mod).sort()).toEqual(
      ["Button", "Card", "Eyebrow", "Input", "Logo", "Meter", "NumberReel", "Stat", "Tag"],
    )
  })

  test("the legacy barrel still exports the nine frozen components", async () => {
    const mod = await import("../src/legacy.ts")
    expect(Object.keys(mod).sort()).toEqual(
      ["Badge", "Button", "Card", "Chip", "Eyebrow", "Highlight", "Input", "Logo", "ScriptAccent"],
    )
  })

  test("the two barrels are disjoint modules", async () => {
    const next = await import("../src/index.ts")
    const legacy = await import("../src/legacy.ts")
    expect(next.Button).not.toBe(legacy.Button)
  })
})
