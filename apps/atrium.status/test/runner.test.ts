import { afterAll, describe, expect, test } from "bun:test"
import { runMonitor } from "@/lib/health/runner"
import type { MonitorDefinition } from "@/lib/health/types"

/**
 * The retry is the filter that stops one dropped packet from opening an incident
 * and denting the 30-day uptime number. It is also invisible when it works, so
 * it is exactly the kind of thing that rots quietly — hence real requests
 * against a real local server rather than a mocked `fetch`.
 */

let hits = 0
/** Fails the first `failFor` requests, then succeeds. */
let failFor = 0

const server = Bun.serve({
  port: 0,
  async fetch(request) {
    hits++
    if (hits <= failFor) return new Response("nope", { status: 503 })
    // A localhost round trip measures 0ms, so a latency threshold cannot be
    // tested against it — this path spends real time instead.
    if (new URL(request.url).pathname === "/slow") {
      await Bun.sleep(40)
    }
    return new Response("ok")
  },
})

const base = `http://localhost:${server.port}`

afterAll(() => server.stop(true))

function monitor(overrides: Partial<MonitorDefinition> = {}): MonitorDefinition {
  return {
    id: "test-monitor",
    label: "Test",
    meaning: "nothing, this is a test",
    url: base,
    expectStatus: [200],
    ...overrides,
  } as MonitorDefinition
}

function reset(failures: number) {
  hits = 0
  failFor = failures
}

describe("runMonitor retries", () => {
  test("a healthy check is one request", async () => {
    reset(0)
    const run = await runMonitor(monitor(), "test-system")
    expect(run.status).toBe("up")
    expect(run.attempts).toBe(1)
    expect(hits).toBe(1)
  })

  test("a transient failure is retried and does not report down", async () => {
    // This is the whole point: the first request fails, the second succeeds, and
    // the sweep records `up`. Before the retry existed this opened an incident.
    reset(1)
    const run = await runMonitor(monitor(), "test-system")
    expect(run.status).toBe("up")
    expect(run.attempts).toBe(2)
    expect(hits).toBe(2)
  })

  test("a sustained failure reports down after exhausting its attempts", async () => {
    reset(99)
    const run = await runMonitor(monitor(), "test-system")
    expect(run.status).toBe("down")
    expect(run.attempts).toBe(2)
    expect(hits).toBe(2)
    expect(run.error).toContain("503")
  })

  test("a paused monitor makes no request at all", async () => {
    reset(0)
    const run = await runMonitor(
      monitor({ enabled: false, disabledReason: "no URL configured" }),
      "test-system",
    )
    expect(run.status).toBe("paused")
    expect(hits).toBe(0)
  })

  test("a slow-but-successful check is degraded, not retried", async () => {
    // Degraded is a warning about a working system. Retrying it would double the
    // load on something already struggling.
    reset(0)
    const run = await runMonitor(
      monitor({ url: `${base}/slow`, degradedAboveMs: 10 }),
      "test-system",
    )
    expect(run.status).toBe("degraded")
    expect(run.attempts).toBe(1)
    expect(hits).toBe(1)
  })

  test("a body assertion that fails is a failure, and is retried", async () => {
    reset(0)
    const run = await runMonitor(
      monitor({ expectBodyIncludes: "this string is not in the response" }),
      "test-system",
    )
    expect(run.status).toBe("down")
    expect(run.attempts).toBe(2)
    expect(hits).toBe(2)
  })
})
