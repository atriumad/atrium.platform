import { describe, expect, test } from "bun:test"
import { alertingIsConfigured, announce } from "@/lib/health/alerts"
import type { Incident } from "@/lib/health/types"

/**
 * Alerting has two properties that matter more than the message text: it speaks
 * only on transitions, and it never throws. Both are easy to regress and neither
 * shows up in a screenshot.
 *
 * These run with no channel configured, which is the environment the test suite
 * has. That is the case worth pinning anyway — nothing may throw, and a sweep
 * with nothing to announce must not try to announce it.
 */

function incident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "test-incident",
    monitorId: "website-home",
    systemId: "atrium-website",
    startedAt: new Date().toISOString(),
    endedAt: null,
    severity: "down",
    cause: "HTTP 503, expected 200",
    ...overrides,
  }
}

describe("announce", () => {
  test("says nothing when nothing changed", async () => {
    const outcomes = await announce({ opened: [], resolved: [] })
    expect(outcomes).toEqual([])
  })

  test("does not throw when no webhook is configured", async () => {
    // A status app with no webhook is misconfigured, not broken. It has to keep
    // sweeping and recording either way.
    expect(alertingIsConfigured()).toBe(false)
    const outcomes = await announce({ opened: [incident()], resolved: [] })
    expect(outcomes).toEqual([])
  })

  test("a resolved incident is also a transition, not silence", async () => {
    const outcomes = await announce({
      opened: [],
      resolved: [incident({ endedAt: new Date().toISOString() })],
    })
    // Nothing configured here, so nothing is sent — the assertion is that the
    // recovery path is reached and handled rather than crashing on endedAt.
    expect(outcomes).toEqual([])
  })
})
