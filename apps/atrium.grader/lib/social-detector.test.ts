import { describe, expect, test } from "bun:test"
import { detectSocialHandles } from "./social-detector"

describe("detectSocialHandles", () => {
  test("detects instagram handle from anchor tag", () => {
    const html = `<a href="https://instagram.com/bistromia">Follow</a>`
    expect(detectSocialHandles(html).instagram).toBe("bistromia")
  })

  test("detects instagram handle with www prefix", () => {
    const html = `<a href="https://www.instagram.com/real_bistro">IG</a>`
    expect(detectSocialHandles(html).instagram).toBe("real_bistro")
  })

  test("detects facebook url from anchor", () => {
    const html = `<a href="https://facebook.com/bistromia">FB</a>`
    expect(detectSocialHandles(html).facebook).toMatch(/facebook\.com\/bistromia/)
  })

  test("strips facebook url query params", () => {
    const html = `<a href="https://facebook.com/bistromia?ref=ts">FB</a>`
    expect(detectSocialHandles(html).facebook).not.toContain("?ref=ts")
  })

  test("detects tiktok handle from anchor", () => {
    const html = `<a href="https://tiktok.com/@bistromia">TikTok</a>`
    expect(detectSocialHandles(html).tiktok).toBe("bistromia")
  })

  test("skips instagram post links", () => {
    const html = `<a href="https://instagram.com/p/ABC123/">Post</a>`
    expect(detectSocialHandles(html).instagram).toBeNull()
  })

  test("skips instagram reel links", () => {
    const html = `<a href="https://instagram.com/reel/DEF456/">Reel</a>`
    expect(detectSocialHandles(html).instagram).toBeNull()
  })

  test("skips instagram stories links", () => {
    const html = `<a href="https://instagram.com/stories/bistromia/123">Story</a>`
    expect(detectSocialHandles(html).instagram).toBeNull()
  })

  test("skips facebook sharer links", () => {
    const html = `<a href="https://facebook.com/sharer/sharer.php?u=https://example.com">Share</a>`
    expect(detectSocialHandles(html).facebook).toBeNull()
  })

  test("skips facebook dialog links", () => {
    const html = `<a href="https://facebook.com/dialog/share?app_id=1">Share</a>`
    expect(detectSocialHandles(html).facebook).toBeNull()
  })

  test("returns manual confidence when no handles detected", () => {
    const result = detectSocialHandles("<html><body>No social</body></html>")
    expect(result.confidence).toBe("manual")
    expect(result.instagram).toBeNull()
    expect(result.facebook).toBeNull()
    expect(result.tiktok).toBeNull()
  })

  test("returns detected confidence when at least one handle found", () => {
    const html = `<a href="https://instagram.com/bistromia">IG</a>`
    expect(detectSocialHandles(html).confidence).toBe("detected")
  })

  test("does not throw on empty string", () => {
    expect(() => detectSocialHandles("")).not.toThrow()
  })

  test("detects all three platforms from same page", () => {
    const html = `
      <a href="https://instagram.com/bistromia">IG</a>
      <a href="https://facebook.com/bistromia">FB</a>
      <a href="https://tiktok.com/@bistromia">TT</a>
    `
    const result = detectSocialHandles(html)
    expect(result.instagram).toBe("bistromia")
    expect(result.facebook).toMatch(/bistromia/)
    expect(result.tiktok).toBe("bistromia")
    expect(result.confidence).toBe("detected")
  })
})
