import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckRunner } from "@/app/components/CheckRunner"
import { Eyebrow, KeyValue, Mono, Panel } from "@/app/components/ui"
import { SYSTEMS } from "@/config/systems"
import type { TaskName } from "@/lib/checks"
import { canRunChecks, workspace as findWorkspace } from "@/lib/repo-data"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return { title: findWorkspace(slug)?.name ?? "Unknown workspace" }
}

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const workspace = findWorkspace(slug)
  if (!workspace) notFound()

  const system = SYSTEMS.find((candidate) => candidate.workspace === workspace.name)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link className="text-[0.82rem] text-[color:var(--color-muted)] hover:underline" href="/repo">
          ← repo
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="font-serif text-[clamp(1.9rem,3.6vw,2.6rem)] text-[color:var(--color-ink)]">
            {workspace.name}
          </h1>
          <Mono>{workspace.dir}</Mono>
        </div>
        {system ? (
          <p className="text-[0.95rem]">
            {system.summary}{" "}
            <Link className="underline underline-offset-4" href={`/systems/${system.id}`}>
              full documentation and health →
            </Link>
          </p>
        ) : (
          <p className="text-[0.9rem] text-[color:var(--color-muted)]">
            No system registered for this workspace — it is internal to the repo.
          </p>
        )}
      </header>

      {canRunChecks && workspace.tasks.length > 0 ? (
        <Panel className="flex flex-col gap-3">
          <Eyebrow>Run its checks</Eyebrow>
          <CheckRunner allowFresh target={workspace.name} tasks={workspace.tasks as TaskName[]} />
        </Panel>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Panel className="flex flex-col gap-5">
          <Eyebrow>Size</Eyebrow>
          <div className="grid grid-cols-2 gap-4">
            <KeyValue label="version" value={workspace.version} />
            <KeyValue label="files" value={`${workspace.files} (${workspace.testFiles} tests)`} />
            <KeyValue label="lines" value={workspace.lines.toLocaleString("en-US")} />
            <KeyValue
              label="depends on"
              value={workspace.workspaceDeps.length > 0 ? workspace.workspaceDeps.join(", ") : "—"}
            />
          </div>
          <div>
            <Eyebrow>By extension</Eyebrow>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.74rem] text-[color:var(--color-muted)]">
              {workspace.byExtension.map((row) => (
                <li key={row.ext}>
                  {row.ext} · {row.files} files · {row.lines.toLocaleString("en-US")} lines
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel className="flex flex-col gap-3">
          <Eyebrow>Scripts</Eyebrow>
          <ul className="flex flex-col gap-1.5 font-mono text-[0.76rem]">
            {Object.entries(workspace.scripts).map(([name, command]) => (
              <li className="flex gap-3" key={name}>
                <span className="min-w-[7rem] text-[color:var(--color-ink)]">{name}</span>
                <span className="text-[color:var(--color-muted)]">{command}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {workspace.routes.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-[1.4rem] text-[color:var(--color-ink)]">
            URL surface — {workspace.routes.length} routes
          </h2>
          <Panel className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {workspace.routes.map((route) => (
              <div className="flex items-baseline gap-3" key={route.file}>
                <span
                  className={`font-mono text-[0.8rem] ${
                    route.kind === "route"
                      ? "text-[color:var(--color-amber-ink)]"
                      : "text-[color:var(--color-ink)]"
                  }`}
                >
                  {route.path}
                </span>
                <span className="text-[0.68rem] uppercase tracking-wide text-[color:var(--color-muted-soft)]">
                  {route.kind}
                </span>
              </div>
            ))}
          </Panel>
        </section>
      ) : null}
    </div>
  )
}
