import { afterEach, describe, expect, mock, test } from "bun:test"
import { runPageSpeedWebsiteAudit } from "./pagespeed-client"
import { scanRestaurantWebsite } from "./website-scanner"

const originalFetch = globalThis.fetch
const originalPageSpeedKey = process.env.PAGESPEED_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalPageSpeedKey === undefined) delete process.env.PAGESPEED_API_KEY
  else process.env.PAGESPEED_API_KEY = originalPageSpeedKey
})

function pageSpeedResponse(score: number) {
  return Response.json({
    lighthouseResult: {
      finalDisplayedUrl: "https://bistro.example",
      categories: {
        performance: { score },
        accessibility: { score: 0.91 },
        "best-practices": { score: 0.88 },
        seo: { score: 0.94 },
      },
      audits: {
        "first-contentful-paint": { numericValue: 1100 },
        "largest-contentful-paint": { numericValue: 2100 },
        "total-blocking-time": { numericValue: 80 },
        "cumulative-layout-shift": { numericValue: 0.04 },
        "speed-index": { numericValue: 1800 },
      },
    },
  })
}

describe.serial("scanRestaurantWebsite", () => {
  test("keeps using the basic scanner by default", async () => {
    delete process.env.PAGESPEED_API_KEY

    globalThis.fetch = mock(async () => new Response(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width">
          <meta name="description" content="Bistro">
        </head>
        <body><a href="/menu">Menu</a><a href="tel:+13055550123">Call</a></body>
      </html>
    `)) as unknown as typeof fetch

    const result = await scanRestaurantWebsite("https://bistro.example")

    expect(result.hasMobileFriendlyLayout).toBe(true)
    expect(result.hasMenu).toBe(true)
    expect(result.hasPhoneVisible).toBe(true)
    expect(result.lighthouse).toBeUndefined()
  })

  test("keeps Lighthouse outside the basic website scan", async () => {
    process.env.PAGESPEED_API_KEY = "test-pagespeed-key"

    globalThis.fetch = mock(async () => new Response(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width">
          <meta name="description" content="Bistro">
        </head>
        <body>
          <a href="/menu">Menu</a>
          <a href="/order">Order online</a>
          <a href="/reservations">Reservations</a>
          <a href="tel:+13055550123">Call</a>
          <script type="application/ld+json">{ "@type": "Restaurant" }</script>
        </body>
      </html>
    `)) as unknown as typeof fetch

    const result = await scanRestaurantWebsite("https://bistro.example")

    expect(result.lighthouse).toBeUndefined()
    expect(result.hasOnlineOrdering).toBe(true)
  })
})

describe.serial("runPageSpeedWebsiteAudit", () => {
  test("attaches mobile and desktop Lighthouse summaries", async () => {
    process.env.PAGESPEED_API_KEY = "test-pagespeed-key"

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes("pagespeedonline.googleapis.com") && url.includes("strategy=mobile")) {
        return pageSpeedResponse(0.87)
      }

      if (url.includes("pagespeedonline.googleapis.com") && url.includes("strategy=desktop")) {
        return pageSpeedResponse(0.94)
      }

      return Response.json({})
    }) as unknown as typeof fetch

    const result = await runPageSpeedWebsiteAudit("https://bistro.example")

    expect(result.provider).toBe("pagespeed")
    expect(result.mobile?.performanceScore).toBe(87)
    expect(result.desktop?.performanceScore).toBe(94)
    expect(result.mobile?.metrics.largestContentfulPaintMs).toBe(2100)
  })
})
