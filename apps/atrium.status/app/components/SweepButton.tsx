"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

/**
 * Triggers the same sweep the cron runs. Shown only where the endpoint will
 * accept it — with CRON_SECRET set, a deployment answers 401 to a browser, and
 * the button says so rather than silently doing nothing.
 */
export function SweepButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function sweep() {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch("/api/cron/check", { method: "POST" })
      const data = (await response.json()) as {
        ran?: number
        down?: number
        error?: string
      }
      setMessage(
        response.ok
          ? `${data.ran} checks · ${data.down ?? 0} down`
          : data.error === "unauthorized"
            ? "the scheduled sweep is secret-protected; wait for the cron"
            : (data.error ?? "failed"),
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "failed")
    } finally {
      setBusy(false)
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-[0.82rem] font-medium text-[color:var(--color-lime)] transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-green-fill)]"
        disabled={busy || pending}
        onClick={sweep}
        type="button"
      >
        {busy || pending ? "running every check…" : "run every check now"}
      </button>
      {message ? (
        <span className="text-[0.78rem] text-[color:var(--color-muted)]">{message}</span>
      ) : null}
    </div>
  )
}
