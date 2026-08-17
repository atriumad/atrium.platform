import Link from "next/link"
import { after } from "next/server"
import { ProbeButton } from "@/app/components/ProbeButton"
import { SweepButton } from "@/app/components/SweepButton"
import { STATUS_TOKENS, StatusDot, StatusPill } from "@/app/components/status"
import { Eyebrow, Panel } from "@/app/components/ui"
import { overview } from "@/lib/health/query"
import { sweepIfStale } from "@/lib/health/runner"
import { CATEGORY_LABELS, type SystemCategory, worstStatus } from "@/lib/health/types"
import { formatDuration, formatRelative } from "@/lib/health/uptime"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const CATEGORY_ORDER: SystemCategory[] = ["app", "infrastructure", "third-party", "client"]

export default async function StatusPage() {
  // Refresh in the background once the response is out, and only if the stored
  // data has gone stale. This is what keeps the board current on a plan whose
  // cron only fires once a day.
  after(() => sweepIfStale())

  const data = await overview()
  const live = data.systems
    .map((system) => system.status)
    .filter((status) => status !== "paused" && status !== "unknown")
  const overall = worstStatus(live)
  const token = STATUS_TOKENS[overall]

  const headline =
    overall === "up"
      ? "Every monitored system is answering."
      : overall === "degraded"
        ? "Everything is up, but something is slow."
        : overall === "down"
          ? "Something is down right now."
          : "No checks have run yet."

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <Eyebrow>Agency systems</Eyebrow>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${token.soft}`}>
            <StatusDot size={14} status={overall} />
          </span>
          <h1 className="font-serif text-[clamp(2.1rem,4.4vw,3rem)] leading-[1.05] text-[color:var(--color-ink)]">
            {headline}
          </h1>
        </div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.85rem] text-[color:var(--color-muted)]">
          <span>Last sweep {formatRelative(data.lastCheckedAt)}</span>
          <span>·</span>
          <span>
            {data.counts.up} up · {data.counts.degraded} degraded · {data.counts.down} down ·{" "}
            {data.counts.paused} not monitored
          </span>
        </p>
        <SweepButton />
        {data.storeKind === "memory" ? (
          <Panel className="flex flex-col gap-1" tone="sunken">
            <p className="text-[0.88rem] text-[color:var(--color-amber-ink)]">
              History is in memory only — no Upstash credentials in this environment.
            </p>
            <p className="text-[0.82rem] text-[color:var(--color-muted)]">
              Uptime and incidents reset whenever the process restarts. Set{" "}
              <code className="font-mono">UPSTASH_REDIS_REST_URL</code> and{" "}
              <code className="font-mono">UPSTASH_REDIS_REST_TOKEN</code> before relying on this
              deployment.
            </p>
          </Panel>
        ) : null}
      </header>

      {data.openIncidents.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">Open incidents</h2>
          {data.openIncidents.map((incident) => (
            <Panel className="flex flex-wrap items-center gap-x-5 gap-y-2" key={incident.id}>
              <StatusPill status="down" />
              <Link
                className="font-medium text-[color:var(--color-ink)] hover:underline"
                href={`/systems/${incident.systemId}`}
              >
                {incident.monitorId}
              </Link>
              <span className="text-[0.86rem] text-[color:var(--color-body)]">{incident.cause}</span>
              <span className="ml-auto text-[0.8rem] text-[color:var(--color-muted)]">
                open {formatDuration(incident.startedAt, null)}
              </span>
            </Panel>
          ))}
        </section>
      ) : null}

      {CATEGORY_ORDER.map((category) => {
        const systems = data.systems.filter((system) => system.system.category === category)
        if (systems.length === 0) return null

        return (
          <section className="flex flex-col gap-3" key={category}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">
                {CATEGORY_LABELS[category]}
              </h2>
              <span className="text-[0.78rem] text-[color:var(--color-muted)]">
                {systems.length} systems
              </span>
            </div>

            <Panel className="flex flex-col divide-y divide-[color:var(--color-line)] p-0">
              {systems.map((view) => (
                <article className="flex flex-col gap-3 px-5 py-4" key={view.system.id}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <StatusDot size={10} status={view.status} />
                    <Link
                      className="text-[1.02rem] font-medium text-[color:var(--color-ink)] hover:underline"
                      href={`/systems/${view.system.id}`}
                    >
                      {view.system.name}
                    </Link>
                    <span className="text-[0.85rem] text-[color:var(--color-muted)]">
                      {view.system.summary}
                    </span>
                    <span className="ml-auto flex items-center gap-3">
                      <StatusPill status={view.status} />
                    </span>
                  </div>

                  <ul className="flex flex-col gap-1.5 pl-6">
                    {view.monitors.map(({ monitor, last, status }) => (
                      <li
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem]"
                        key={monitor.id}
                      >
                        <StatusDot size={6} status={status} />
                        <span className="min-w-[10rem] text-[color:var(--color-body)]">
                          {monitor.label}
                        </span>
                        <span className="font-mono text-[0.74rem] text-[color:var(--color-muted)]">
                          {status === "paused"
                            ? "paused"
                            : last
                              ? `${last.httpStatus ?? "—"} · ${last.latencyMs}ms · ${formatRelative(last.at)}`
                              : "never checked"}
                        </span>
                        {last?.error && status !== "up" && status !== "paused" ? (
                          <span className="text-[0.78rem] text-[color:var(--color-error)]">
                            {last.error}
                          </span>
                        ) : null}
                        {status === "paused" ? (
                          <span className="text-[0.78rem] text-[color:var(--color-muted-soft)]">
                            {monitor.disabledReason}
                          </span>
                        ) : (
                          <span className="ml-auto">
                            <ProbeButton compact monitorId={monitor.id} />
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </Panel>
          </section>
        )
      })}

      <Panel className="flex flex-wrap items-center justify-between gap-4" tone="sunken">
        <p className="text-[0.86rem]">
          Every system here has a page with its documentation, its runbook and its history.
        </p>
        <Link className="text-[0.86rem] underline underline-offset-4" href="/systems">
          browse the documentation →
        </Link>
      </Panel>
    </div>
  )
}
