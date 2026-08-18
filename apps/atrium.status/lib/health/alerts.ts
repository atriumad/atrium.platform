import { findMonitor } from "@/config/systems"
import { storageIsDurable } from "./store"
import type { Incident } from "./types"

/**
 * Outbound alerting to Slack. Without it the app is a dashboard: it knows a
 * system is down and waits for somebody to open a page and find out.
 *
 * Two rules govern everything here.
 *
 * It only speaks on transitions — an incident opening or closing. A system that
 * has been down for a day is not news, and re-sending it is how people learn to
 * filter these out. `sweep()` already reconciles incidents into `opened` and
 * `resolved`, so the transitions arrive for free.
 *
 * It never throws. A revoked webhook, an outbound request that hangs — none of
 * that may turn a sweep that measured and recorded everything correctly into a
 * failed one. Every send is caught and its failure reported back to the caller
 * rather than raised.
 *
 * Slack only, on purpose. An email path through Resend existed here and was
 * removed: it needed an API key and a verified sending domain to earn its keep,
 * and one channel that definitely works beats two that half do. Git has it if a
 * second channel is wanted later.
 */

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL ?? ""
const SEND_TIMEOUT_MS = 8_000

export type AlertDelivery = {
  ok: boolean
  error?: string
}

export type AlertOutcome = {
  /** What the alert was about, for logs and for the manual test endpoint. */
  subject: string
  delivery: AlertDelivery
}

export function alertingIsConfigured(): boolean {
  return Boolean(WEBHOOK_URL)
}

function systemLabel(incident: Incident): string {
  const target = findMonitor(incident.monitorId)
  if (!target) return incident.systemId
  return `${target.system.name} — ${target.monitor.label}`
}

function meaning(incident: Incident): string {
  return findMonitor(incident.monitorId)?.monitor.meaning ?? ""
}

function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000))
}

type Message = { subject: string; lines: string[] }

function downMessage(incident: Incident): Message {
  const what = systemLabel(incident)
  return {
    subject: `DOWN — ${what}`,
    lines: [
      `Cause: ${incident.cause}`,
      meaning(incident) ? `Impact: ${meaning(incident)}` : "",
      `Started: ${incident.startedAt}`,
    ].filter(Boolean),
  }
}

function recoveredMessage(incident: Incident): Message {
  const what = systemLabel(incident)
  return {
    subject: `RECOVERED — ${what}`,
    lines: [
      `Was down for about ${minutesSince(incident.startedAt)} min.`,
      `Cause was: ${incident.cause}`,
    ],
  }
}

/**
 * Slack renders `text` as mrkdwn, so `*bold*` and newlines are all the
 * formatting this needs. Blocks would look marginally better and add a payload
 * Slack can reject; a plain string cannot be malformed.
 */
async function post(message: Message): Promise<AlertDelivery> {
  const text = [`*${message.subject}*`, ...message.lines].join("\n")
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })
    if (!response.ok) {
      // Slack answers 4xx with a plain-text reason like `invalid_payload` or
      // `no_service`, which is worth keeping — it is the difference between a
      // bad message and a dead webhook.
      const detail = await response.text().catch(() => "")
      return { ok: false, error: `HTTP ${response.status} ${detail}`.trim() }
    }
    return { ok: true }
  } catch (cause) {
    return { ok: false, error: cause instanceof Error ? cause.message : String(cause) }
  }
}

async function send(message: Message): Promise<AlertOutcome> {
  const delivery = await post(message)
  if (!delivery.ok) {
    // Logged rather than thrown: the sweep behind this already succeeded.
    console.error(`[alerts] slack failed: ${delivery.error}`)
  }
  return { subject: message.subject, delivery }
}

type Transitions = { opened: Incident[]; resolved: Incident[] }

/**
 * Announces one sweep's transitions. Called at the end of `sweep()`; safe to
 * call when nothing changed, when nothing is configured, or when the network is
 * gone.
 */
export async function announce({ opened, resolved }: Transitions): Promise<AlertOutcome[]> {
  if (opened.length === 0 && resolved.length === 0) return []
  if (!alertingIsConfigured()) {
    // Loud on purpose. A status app with no way to tell anyone is the failure
    // mode this module exists to remove, so it says so on every transition
    // rather than staying quiet about being quiet.
    console.warn(
      `[alerts] ${opened.length} opened / ${resolved.length} resolved with no webhook configured — ` +
        "set SLACK_WEBHOOK_URL.",
    )
    return []
  }

  const outcomes: AlertOutcome[] = []
  for (const incident of opened) outcomes.push(await send(downMessage(incident)))
  for (const incident of resolved) outcomes.push(await send(recoveredMessage(incident)))
  return outcomes
}

/**
 * A deliberate send, for proving the wiring works end to end without waiting for
 * something to break. Exposed through `POST /api/alerts/test`.
 */
export async function sendTestAlert(): Promise<AlertOutcome> {
  return send({
    subject: "TEST — alerting is wired",
    lines: [
      "This is a test from the Atrium status app. Nothing is down.",
      `Durable storage: ${storageIsDurable() ? "yes (Upstash)" : "NO — in-memory, history will not survive"}`,
    ],
  })
}
