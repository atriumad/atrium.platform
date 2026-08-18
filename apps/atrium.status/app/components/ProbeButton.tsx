"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { MonitorRun } from "@/lib/health/types"

/**
 * Re-runs one monitor now. The server records the run, then the router
 * refreshes so the page re-reads it from the store — the button never holds
 * status of its own, so what you see always came from storage.
 */
export function ProbeButton({
  monitorId,
  compact = false,
}: {
  monitorId: string
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function check() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/monitors/probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ monitorId }),
      })
      const data = (await response.json()) as { run?: MonitorRun; error?: string }
      if (!response.ok) setError(data.error ?? "failed")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "failed")
    } finally {
      setBusy(false)
      startTransition(() => router.refresh())
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        className={`rounded-full border border-[color:var(--color-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-green-fill)] px-3 py-1 text-[0.76rem] transition-colors hover:border-[color:var(--color-ink)] disabled:opacity-60 ${
          compact ? "" : "bg-[color:var(--color-card)]"
        }`}
        disabled={busy || pending}
        onClick={check}
        type="button"
      >
        {busy || pending ? "checking…" : "check now"}
      </button>
      {error ? <span className="text-[0.74rem] text-[color:var(--color-error)]">{error}</span> : null}
    </span>
  )
}
