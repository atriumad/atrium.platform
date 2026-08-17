import Link from "next/link"
import { notFound } from "next/navigation"
import { ProbeButton } from "@/app/components/ProbeButton"
import { StatusDot, StatusPill, Timeline, UptimeFigure } from "@/app/components/status"
import { Eyebrow, KeyValue, Mono, Panel, Pill } from "@/app/components/ui"
import { getSystem } from "@/config/systems"
import { systemDetail } from "@/lib/health/query"
import { formatDuration, formatRelative } from "@/lib/health/uptime"
import { renderMarkdown } from "@/lib/markdown"
import { workspace as workspaceSnapshot } from "@/lib/repo-data"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: getSystem(id)?.name ?? "Unknown system" }
}

/** Markdown authored in the registry, escaped and rendered by lib/markdown.ts. */
function Prose({ source }: { source: string }) {
  const { html } = renderMarkdown(source)
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapes all text first
    <div className="prose-doc" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

const ENV_TONE = {
  set: "ok",
  missing: "medium",
  dead: "high",
  "script-only": "neutral",
} as const

export default async function SystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await systemDetail(id)
  if (!detail) notFound()

  const { view, dependencies, dependents, incidents } = detail
  const system = view.system
  const ws = system.workspace ? workspaceSnapshot(system.workspace) : undefined
  const closedIncidents = incidents.filter((incident) => incident.endedAt)

  return (
    <div className="flex flex-col gap-9">
      <header className="flex flex-col gap-4">
        <Link
          className="text-[0.82rem] text-[color:var(--color-muted)] hover:underline"
          href="/systems"
        >
          ← all systems
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h1 className="font-serif text-[clamp(2rem,4vw,2.8rem)] leading-tight text-[color:var(--color-ink)]">
            {system.name}
          </h1>
          <StatusPill status={view.status} />
          <Pill tone="neutral">{system.criticality}</Pill>
          {system.workspace ? <Mono>{system.workspace}</Mono> : null}
        </div>
        <p className="max-w-[70ch] text-[1.02rem]">{system.summary}</p>
        <p className="flex flex-wrap items-center gap-x-4 text-[0.8rem] text-[color:var(--color-muted)]">
          <span>checked {formatRelative(view.checkedAt)}</span>
          {system.owner ? <span>· owner {system.owner}</span> : null}
          {(system.links ?? []).map((link) => (
            <a
              className="underline underline-offset-4"
              href={link.href}
              key={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label} ↗
            </a>
          ))}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[1.5rem] text-[color:var(--color-ink)]">Checks</h2>
        {view.monitors.map(({ monitor, last, status, uptime24h, uptime30d, timeline }) => (
          <Panel className="flex flex-col gap-4" key={monitor.id}>
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              <StatusDot size={10} status={status} />
              <div className="min-w-[16rem] flex-1">
                <h3 className="text-[1rem] font-medium text-[color:var(--color-ink)]">
                  {monitor.label}
                </h3>
                <p className="text-[0.85rem] text-[color:var(--color-muted)]">{monitor.meaning}</p>
              </div>
              {status === "paused" ? (
                <p className="max-w-[28rem] text-[0.82rem] text-[color:var(--color-muted)]">
                  {monitor.disabledReason}
                </p>
              ) : (
                <>
                  <div className="flex gap-6">
                    <UptimeFigure label="24h" summary={uptime24h} />
                    <UptimeFigure label="30d" summary={uptime30d} />
                  </div>
                  <ProbeButton monitorId={monitor.id} />
                </>
              )}
            </div>

            {status !== "paused" ? (
              <>
                {timeline ? <Timeline buckets={timeline} /> : null}
                <p className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.74rem] text-[color:var(--color-muted)]">
                  <span>
                    {monitor.method ?? "GET"} {monitor.url}
                  </span>
                  <span>expects {(monitor.expectStatus ?? [200]).join(" or ")}</span>
                  {last ? (
                    <span>
                      last {last.httpStatus ?? "—"} · {last.latencyMs}ms · {formatRelative(last.at)}
                    </span>
                  ) : (
                    <span>never checked</span>
                  )}
                </p>
                {last?.error && status !== "up" ? (
                  <p className="text-[0.84rem] text-[color:var(--color-error)]">{last.error}</p>
                ) : null}
              </>
            ) : null}
          </Panel>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-[1.5rem] text-[color:var(--color-ink)]">What it is</h2>
        <Panel>
          <Prose source={system.overview} />
        </Panel>
      </section>

      {(system.sections ?? []).length > 0 ? (
        <section className="flex flex-col gap-4">
          {(system.sections ?? []).map((section) => (
            <Panel className="flex flex-col gap-1" key={section.title}>
              <h3 className="text-[1.05rem] font-medium text-[color:var(--color-ink)]">
                {section.title}
              </h3>
              <Prose source={section.body} />
            </Panel>
          ))}
        </section>
      ) : null}

      {(system.runbook ?? []).length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-[1.5rem] text-[color:var(--color-ink)]">
            When it breaks
          </h2>
          <Panel className="flex flex-col divide-y divide-[color:var(--color-line)] p-0">
            {(system.runbook ?? []).map((step) => (
              <div className="grid gap-3 px-5 py-4 md:grid-cols-3" key={step.symptom}>
                <div>
                  <Eyebrow>Symptom</Eyebrow>
                  <p className="mt-1 text-[0.9rem] text-[color:var(--color-ink)]">{step.symptom}</p>
                </div>
                <div>
                  <Eyebrow>Check</Eyebrow>
                  <p className="mt-1 text-[0.9rem]">{step.check}</p>
                </div>
                <div>
                  <Eyebrow>Fix</Eyebrow>
                  <p className="mt-1 text-[0.9rem]">{step.fix}</p>
                </div>
              </div>
            ))}
          </Panel>
        </section>
      ) : null}

      {dependencies.length > 0 || dependents.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {dependencies.length > 0 ? (
            <Panel className="flex flex-col gap-3">
              <Eyebrow>Needs</Eyebrow>
              <ul className="flex flex-col gap-2">
                {dependencies.map((dependency) => (
                  <li className="flex items-center gap-3" key={dependency.system.id}>
                    <StatusDot size={8} status={dependency.status} />
                    <Link
                      className="text-[0.92rem] text-[color:var(--color-ink)] hover:underline"
                      href={`/systems/${dependency.system.id}`}
                    >
                      {dependency.system.name}
                    </Link>
                    <span className="text-[0.8rem] text-[color:var(--color-muted)]">
                      {dependency.system.summary}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {dependents.length > 0 ? (
            <Panel className="flex flex-col gap-3">
              <Eyebrow>Breaks when this does</Eyebrow>
              <ul className="flex flex-col gap-2">
                {dependents.map((dependent) => (
                  <li key={dependent.id}>
                    <Link
                      className="text-[0.92rem] text-[color:var(--color-ink)] hover:underline"
                      href={`/systems/${dependent.id}`}
                    >
                      {dependent.name}
                    </Link>
                    <span className="ml-2 text-[0.8rem] text-[color:var(--color-muted)]">
                      {dependent.summary}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </section>
      ) : null}

      {(system.env ?? []).length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-[1.5rem] text-[color:var(--color-ink)]">Configuration</h2>
          <Panel className="overflow-x-auto p-0">
            <table className="w-full border-collapse text-[0.86rem]">
              <thead>
                <tr className="border-b border-[color:var(--color-line)] text-left">
                  <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">variable</th>
                  <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">status</th>
                  <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">purpose</th>
                </tr>
              </thead>
              <tbody>
                {(system.env ?? []).map((entry) => (
                  <tr
                    className="border-b border-[color:var(--color-line)] align-top last:border-0"
                    key={entry.name}
                  >
                    <td className="px-5 py-3">
                      <Mono>{entry.name}</Mono>
                      <span className="mt-1 block text-[0.74rem] text-[color:var(--color-muted-soft)]">
                        {entry.where}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={ENV_TONE[entry.status]}>{entry.status}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      {entry.purpose}
                      {entry.note ? (
                        <span className="mt-1 block text-[0.82rem] text-[color:var(--color-muted)]">
                          {entry.note}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </section>
      ) : null}

      {(system.entryPoints ?? []).length > 0 || ws ? (
        <section className="grid gap-4 md:grid-cols-2">
          {(system.entryPoints ?? []).length > 0 ? (
            <Panel className="flex flex-col gap-3">
              <Eyebrow>Where to start reading</Eyebrow>
              <ul className="flex flex-col gap-2">
                {(system.entryPoints ?? []).map((entry) => (
                  <li key={entry.path}>
                    <p className="text-[0.9rem] text-[color:var(--color-ink)]">{entry.label}</p>
                    <Mono>{entry.path}</Mono>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {ws ? (
            <Panel className="flex flex-col gap-4">
              <Eyebrow>In the repo</Eyebrow>
              <div className="grid grid-cols-2 gap-4">
                <KeyValue label="path" value={<Mono>{ws.dir}</Mono>} />
                <KeyValue label="version" value={ws.version} />
                <KeyValue label="files" value={`${ws.files} (${ws.testFiles} tests)`} />
                <KeyValue label="lines" value={ws.lines.toLocaleString("en-US")} />
                {ws.routes.length > 0 ? (
                  <KeyValue label="routes" value={ws.routes.length} />
                ) : null}
                <KeyValue
                  label="depends on"
                  value={ws.workspaceDeps.length > 0 ? ws.workspaceDeps.join(", ") : "—"}
                />
              </div>
              <Link
                className="text-[0.84rem] underline underline-offset-4"
                href={`/repo/${ws.slug}`}
              >
                engineering view →
              </Link>
            </Panel>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-[1.5rem] text-[color:var(--color-ink)]">Incident history</h2>
        {incidents.length === 0 ? (
          <Panel tone="sunken">
            <p className="text-[0.9rem] text-[color:var(--color-muted)]">
              No incidents recorded for this system.
            </p>
          </Panel>
        ) : (
          <Panel className="flex flex-col divide-y divide-[color:var(--color-line)] p-0">
            {[...view.openIncidents, ...closedIncidents].map((incident) => (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3" key={incident.id}>
                <StatusPill
                  label={incident.endedAt ? "Resolved" : "Open"}
                  status={incident.endedAt ? "up" : "down"}
                />
                <Mono>{incident.monitorId}</Mono>
                <span className="text-[0.86rem]">{incident.cause}</span>
                <span className="ml-auto text-[0.8rem] text-[color:var(--color-muted)]">
                  {new Date(incident.startedAt).toLocaleString()} ·{" "}
                  {formatDuration(incident.startedAt, incident.endedAt)}
                </span>
              </div>
            ))}
          </Panel>
        )}
      </section>
    </div>
  )
}
