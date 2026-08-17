import type { ReactNode } from "react"

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
      {children}
    </p>
  )
}

export function Panel({
  children,
  className = "",
  tone = "light",
  id,
}: {
  children: ReactNode
  className?: string
  tone?: "light" | "dark" | "sunken"
  /** anchor target, so an issue or a cluster can be linked to directly */
  id?: string
}) {
  const tones = {
    light: "bg-[color:var(--color-card)] border-[color:var(--color-line)]",
    sunken: "bg-[color:var(--color-cool)] border-transparent",
    dark: "bg-[color:var(--color-ink)] border-transparent text-[color:var(--color-off-white)]",
  } as const
  return (
    <section className={`rounded-[22px] border p-6 ${tones[tone]} ${className}`} id={id}>
      {children}
    </section>
  )
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[0.78rem] text-[color:var(--color-muted)]">{children}</code>
  )
}

const SEVERITY_TONES = {
  high: "bg-[color:var(--color-red-soft)] text-[color:var(--color-error)]",
  medium: "bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]",
  low: "bg-[color:var(--color-cool)] text-[color:var(--color-muted)]",
  ok: "bg-[color:var(--color-green-soft)] text-[color:var(--color-green)]",
  neutral: "bg-[color:var(--color-cool)] text-[color:var(--color-body)]",
} as const

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: keyof typeof SEVERITY_TONES
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${SEVERITY_TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      <div className="text-[0.92rem] text-[color:var(--color-ink)]">{value}</div>
    </div>
  )
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <p className="font-serif text-[2rem] leading-none text-[color:var(--color-ink)]">{value}</p>
      <p className="mt-1.5 text-[0.78rem] text-[color:var(--color-muted)]">{label}</p>
    </div>
  )
}
