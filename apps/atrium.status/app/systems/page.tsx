import Link from "next/link"
import { StatusDot } from "@/app/components/status"
import { Eyebrow, Mono, Panel } from "@/app/components/ui"
import { overview } from "@/lib/health/query"
import { CATEGORY_LABELS, type SystemCategory } from "@/lib/health/types"

export const dynamic = "force-dynamic"
export const metadata = { title: "Systems" }

const CATEGORY_ORDER: SystemCategory[] = ["app", "infrastructure", "third-party", "client"]

const CATEGORY_BLURB: Record<SystemCategory, string> = {
  app: "Things we build and deploy.",
  infrastructure: "Things we run that everything else stands on.",
  "third-party": "Things we pay for and cannot fix ourselves.",
  client: "Client-facing properties we are responsible for.",
}

export default async function SystemsIndexPage() {
  const data = await overview()

  return (
    <div className="flex flex-col gap-9">
      <header className="flex flex-col gap-4">
        <Eyebrow>Documentation</Eyebrow>
        <h1 className="max-w-[22ch] font-serif text-[clamp(2.1rem,4.4vw,3rem)] leading-[1.05] text-[color:var(--color-ink)]">
          One page per system: what it is, how it works, what to do when it breaks.
        </h1>
        <p className="max-w-[64ch] text-[1rem] leading-relaxed">
          {data.systems.length} systems. Each one is a single file in{" "}
          <Mono>config/systems/</Mono> that carries both its documentation and its monitors, so the
          page you read and the checks that run can never drift apart.
        </p>
      </header>

      {CATEGORY_ORDER.map((category) => {
        const systems = data.systems.filter((view) => view.system.category === category)
        if (systems.length === 0) return null

        return (
          <section className="flex flex-col gap-3" key={category}>
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">
                {CATEGORY_LABELS[category]}
              </h2>
              <p className="text-[0.85rem] text-[color:var(--color-muted)]">
                {CATEGORY_BLURB[category]}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {systems.map((view) => (
                <Link
                  className="group flex flex-col gap-3 rounded-[22px] border border-[color:var(--color-line)] bg-[color:var(--color-card)] p-5 transition-colors hover:border-[color:var(--color-ink)]"
                  href={`/systems/${view.system.id}`}
                  key={view.system.id}
                >
                  <div className="flex items-center gap-3">
                    <StatusDot size={9} status={view.status} />
                    <h3 className="text-[1.05rem] font-medium text-[color:var(--color-ink)]">
                      {view.system.name}
                    </h3>
                    <span className="ml-auto text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--color-muted-soft)]">
                      {view.system.criticality}
                    </span>
                  </div>
                  <p className="text-[0.9rem] leading-relaxed text-[color:var(--color-body)]">
                    {view.system.summary}
                  </p>
                  <p className="mt-auto flex flex-wrap gap-x-3 text-[0.74rem] text-[color:var(--color-muted-soft)]">
                    <span>
                      {view.system.monitors.filter((monitor) => monitor.enabled !== false).length}{" "}
                      live checks
                    </span>
                    {view.system.workspace ? <Mono>{view.system.workspace}</Mono> : null}
                    {(view.system.tags ?? []).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      <Panel className="flex flex-col gap-2" tone="sunken">
        <h2 className="text-[1rem] font-medium text-[color:var(--color-ink)]">Adding a system</h2>
        <p className="text-[0.88rem] leading-relaxed">
          Copy <Mono>config/systems/_template.ts</Mono>, fill in the documentation and the monitors,
          then add one line to <Mono>config/systems/index.ts</Mono>. The dashboard, this index, the
          cron, the uptime maths and <Mono>/api/health</Mono> all pick it up with no further changes.
          The registry refuses to load on a duplicate monitor id or a monitor disabled without a
          reason.
        </p>
      </Panel>
    </div>
  )
}
