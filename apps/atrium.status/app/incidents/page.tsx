import Link from "next/link"
import { StatusPill } from "@/app/components/status"
import { Eyebrow, Mono, Panel } from "@/app/components/ui"
import { getSystem } from "@/config/systems"
import { overview } from "@/lib/health/query"
import { store } from "@/lib/health/store"
import { formatDuration, formatRelative } from "@/lib/health/uptime"

export const dynamic = "force-dynamic"
export const metadata = { title: "Incidents" }

export default async function IncidentsPage() {
  const [data, log] = await Promise.all([overview(), store().incidentLog(100)])
  const all = [...data.openIncidents, ...log]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Eyebrow>Incidents</Eyebrow>
        <h1 className="max-w-[24ch] font-serif text-[clamp(2.1rem,4.4vw,3rem)] leading-[1.05] text-[color:var(--color-ink)]">
          Every time a check went red, and how long it stayed there.
        </h1>
        <p className="max-w-[64ch] text-[1rem]">
          An incident opens the first time a monitor fails and closes the first time it passes
          again. Slow-but-working never opens one — that shows as degraded on the dashboard instead.
        </p>
      </header>

      {all.length === 0 ? (
        <Panel tone="sunken">
          <p className="text-[0.92rem]">
            Nothing recorded yet.{" "}
            {data.storeKind === "memory"
              ? "This environment has no durable storage, so history resets on every restart."
              : "No monitor has failed since the store was created."}
          </p>
        </Panel>
      ) : (
        <Panel className="flex flex-col divide-y divide-[color:var(--color-line)] p-0">
          {all.map((incident) => {
            const system = getSystem(incident.systemId)
            return (
              <article
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
                key={`${incident.id}-${incident.endedAt ?? "open"}`}
              >
                <StatusPill
                  label={incident.endedAt ? "Resolved" : "Open"}
                  status={incident.endedAt ? "up" : "down"}
                />
                <Link
                  className="font-medium text-[color:var(--color-ink)] hover:underline"
                  href={`/systems/${incident.systemId}`}
                >
                  {system?.name ?? incident.systemId}
                </Link>
                <Mono>{incident.monitorId}</Mono>
                <span className="text-[0.88rem] text-[color:var(--color-body)]">
                  {incident.cause}
                </span>
                <span className="ml-auto text-right text-[0.8rem] text-[color:var(--color-muted)]">
                  <span className="block">
                    started {formatRelative(incident.startedAt)} ·{" "}
                    {formatDuration(incident.startedAt, incident.endedAt)}
                  </span>
                  <span className="block text-[color:var(--color-muted-soft)]">
                    {new Date(incident.startedAt).toLocaleString()}
                  </span>
                </span>
              </article>
            )
          })}
        </Panel>
      )}
    </div>
  )
}
