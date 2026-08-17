import Link from "next/link"
import type { MonitorStatus } from "@/lib/health/types"
import type { Bucket } from "@/lib/health/uptime"
import { formatPercent, formatRelative, type UptimeSummary } from "@/lib/health/uptime"

/** One vocabulary for status colour, used by every surface in the app. */
export const STATUS_TOKENS: Record<
  MonitorStatus,
  { label: string; dot: string; text: string; soft: string }
> = {
  up: {
    label: "Operational",
    dot: "bg-[color:var(--color-green-fill)]",
    text: "text-[color:var(--color-green)]",
    soft: "bg-[color:var(--color-green-soft)]",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-[color:var(--color-amber-fill)]",
    text: "text-[color:var(--color-amber-ink)]",
    soft: "bg-[color:var(--color-amber-soft)]",
  },
  down: {
    label: "Down",
    dot: "bg-[color:var(--color-error)]",
    text: "text-[color:var(--color-error)]",
    soft: "bg-[color:var(--color-red-soft)]",
  },
  paused: {
    label: "Not monitored",
    dot: "bg-[color:var(--color-pending)]",
    text: "text-[color:var(--color-muted)]",
    soft: "bg-[color:var(--color-cool)]",
  },
  unknown: {
    label: "No data yet",
    dot: "bg-[color:var(--color-muted-soft)]",
    text: "text-[color:var(--color-muted)]",
    soft: "bg-[color:var(--color-cool)]",
  },
}

export function StatusDot({ status, size = 8 }: { status: MonitorStatus; size?: number }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ${STATUS_TOKENS[status].dot}`}
      style={{ width: size, height: size }}
    />
  )
}

export function StatusPill({ status, label }: { status: MonitorStatus; label?: string }) {
  const token = STATUS_TOKENS[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${token.soft} ${token.text}`}
    >
      <StatusDot size={6} status={status} />
      {label ?? token.label}
    </span>
  )
}

/** 48 bars, one per half hour. Gaps stay visible instead of being smoothed away. */
export function Timeline({ buckets }: { buckets: Bucket[] }) {
  return (
    <div className="flex h-8 items-end gap-[2px]" role="img" aria-label="Last 24 hours">
      {buckets.map((bucket) => (
        <span
          className={`flex-1 rounded-[2px] ${STATUS_TOKENS[bucket.status].dot} ${
            bucket.status === "unknown" ? "opacity-25" : ""
          }`}
          key={bucket.at}
          style={{ height: bucket.status === "unknown" ? "35%" : "100%" }}
          title={`${new Date(bucket.at).toLocaleString()} — ${STATUS_TOKENS[bucket.status].label}`}
        />
      ))}
    </div>
  )
}

export function UptimeFigure({
  summary,
  label,
}: {
  summary?: UptimeSummary | undefined
  label: string
}) {
  return (
    <div>
      <p className="font-mono text-[0.95rem] text-[color:var(--color-ink)]">
        {formatPercent(summary?.percent ?? null)}
      </p>
      <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[color:var(--color-muted-soft)]">
        {label}
      </p>
    </div>
  )
}

export function LastChecked({ at }: { at: string | null }) {
  return (
    <span className="text-[0.76rem] text-[color:var(--color-muted)]">
      checked {formatRelative(at)}
    </span>
  )
}

export function SystemLink({
  id,
  name,
  className = "",
}: {
  id: string
  name: string
  className?: string
}) {
  return (
    <Link className={`hover:underline ${className}`} href={`/systems/${id}`}>
      {name}
    </Link>
  )
}
