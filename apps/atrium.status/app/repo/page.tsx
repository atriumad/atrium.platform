import Link from "next/link"
import { CheckRunner } from "@/app/components/CheckRunner"
import { Eyebrow, Mono, Panel, Pill, Stat } from "@/app/components/ui"
import { formatRelative } from "@/lib/health/uptime"
import { canRunChecks, checksSnapshot, graphIsStale, repoSnapshot } from "@/lib/repo-data"

export const dynamic = "force-dynamic"
export const metadata = { title: "Repo" }

export default function RepoPage() {
  const { workspaces, git, graph, docs, generatedAt } = repoSnapshot
  const apps = workspaces.filter((workspace) => workspace.kind === "app")
  const packages = workspaces.filter((workspace) => workspace.kind === "package")
  const totals = workspaces.reduce(
    (accumulator, workspace) => ({
      files: accumulator.files + workspace.files,
      lines: accumulator.lines + workspace.lines,
      tests: accumulator.tests + workspace.testFiles,
      routes: accumulator.routes + workspace.routes.length,
    }),
    { files: 0, lines: 0, tests: 0, routes: 0 },
  )

  return (
    <div className="flex flex-col gap-9">
      <header className="flex flex-col gap-4">
        <Eyebrow>Engineering</Eyebrow>
        <h1 className="max-w-[24ch] font-serif text-[clamp(2.1rem,4.4vw,3rem)] leading-[1.05] text-[color:var(--color-ink)]">
          The monorepo behind it: what is in it, and whether it is green.
        </h1>
        <p className="max-w-[66ch] text-[1rem] leading-relaxed">
          This page is about the code, not about production health — that lives on the{" "}
          <Link className="underline underline-offset-4" href="/">
            status
          </Link>{" "}
          page. The structure below was captured at build time from commit{" "}
          <Mono>{git.head.slice(0, 7)}</Mono>, {formatRelative(generatedAt)}.
        </p>
      </header>

      <Panel className="flex flex-wrap gap-x-12 gap-y-6" tone="sunken">
        <Stat label="apps" value={apps.length} />
        <Stat label="shared packages" value={packages.length} />
        <Stat label="source files" value={totals.files} />
        <Stat label="lines" value={totals.lines.toLocaleString("en-US")} />
        <Stat label="routes" value={totals.routes} />
        <Stat label="test files" value={totals.tests} />
      </Panel>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">Checks</h2>
          <span className="text-[0.8rem] text-[color:var(--color-muted)]">
            recorded {formatRelative(checksSnapshot.recordedAt)} on{" "}
            <Mono>{checksSnapshot.commit.slice(0, 7)}</Mono>
            {checksSnapshot.dirty ? " (working tree was dirty)" : ""}
          </span>
        </div>

        <Panel className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {checksSnapshot.results.map((result) => (
              <div
                className={`rounded-[16px] px-4 py-3 ${
                  result.ok
                    ? "bg-[color:var(--color-green-soft)]"
                    : "bg-[color:var(--color-red-soft)]"
                }`}
                key={result.task}
              >
                <p className="text-[0.78rem] uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                  {result.task}
                </p>
                <p
                  className={`mt-1 text-[1rem] font-medium ${
                    result.ok
                      ? "text-[color:var(--color-green)]"
                      : "text-[color:var(--color-error)]"
                  }`}
                >
                  {result.summary}
                </p>
                {result.failedWorkspaces.length > 0 ? (
                  <p className="mt-1 font-mono text-[0.72rem] text-[color:var(--color-error)]">
                    {result.failedWorkspaces.join(", ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {canRunChecks ? (
            <div className="flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-4">
              <p className="text-[0.86rem] text-[color:var(--color-muted)]">
                Local development — these run the real thing through turbo.
              </p>
              <CheckRunner allowFresh target="all" tasks={["typecheck", "lint", "test", "build"]} />
            </div>
          ) : (
            <p className="border-t border-[color:var(--color-line)] pt-4 text-[0.84rem] text-[color:var(--color-muted)]">
              A deployment cannot run turbo — no working tree, no toolchain. Refresh these numbers
              with <Mono>bun run status:snapshot</Mono> and commit{" "}
              <Mono>apps/atrium.status/data/checks.json</Mono>.
            </p>
          )}
        </Panel>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">Workspaces</h2>
        <Panel className="overflow-x-auto p-0">
          <table className="w-full border-collapse text-[0.86rem]">
            <thead>
              <tr className="border-b border-[color:var(--color-line)] text-left">
                <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">workspace</th>
                <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">kind</th>
                <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">size</th>
                <th className="px-5 py-3 font-medium text-[color:var(--color-muted)]">depends on</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((workspace) => (
                <tr
                  className="border-b border-[color:var(--color-line)] last:border-0"
                  key={workspace.name}
                >
                  <td className="px-5 py-3">
                    <Link
                      className="font-medium text-[color:var(--color-ink)] hover:underline"
                      href={`/repo/${workspace.slug}`}
                    >
                      {workspace.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Pill tone="neutral">{workspace.kind}</Pill>
                  </td>
                  <td className="px-5 py-3 text-[color:var(--color-muted)]">
                    {workspace.files} files · {workspace.lines.toLocaleString("en-US")} lines ·{" "}
                    {workspace.testFiles} tests
                    {workspace.routes.length > 0 ? ` · ${workspace.routes.length} routes` : ""}
                  </td>
                  <td className="px-5 py-3 font-mono text-[0.74rem] text-[color:var(--color-muted)]">
                    {workspace.workspaceDeps.length > 0 ? workspace.workspaceDeps.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      {graph ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">
              Knowledge graph
            </h2>
            {graphIsStale() ? (
              <Pill tone="medium">
                built from {graph.builtAtCommit?.slice(0, 7)}, HEAD is {git.head.slice(0, 7)}
              </Pill>
            ) : (
              <Pill tone="ok">current</Pill>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="flex flex-col gap-3">
              <Eyebrow>Where the nodes live</Eyebrow>
              <ul className="flex flex-col gap-1.5 text-[0.84rem]">
                {graph.areas.map((area) => (
                  <li className="flex items-center gap-3" key={area.area}>
                    <span className="min-w-[12rem] font-mono text-[0.76rem]">{area.area}</span>
                    <span
                      className="h-1.5 rounded-full bg-[color:var(--color-lime)]"
                      style={{ width: `${(area.nodes / (graph.areas[0]?.nodes ?? 1)) * 55}%` }}
                    />
                    <span className="text-[color:var(--color-muted)]">{area.nodes}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="flex flex-col gap-3">
              <Eyebrow>Biggest clusters</Eyebrow>
              <ul className="flex flex-col gap-1.5 text-[0.84rem]">
                {graph.communities.slice(0, 10).map((community) => (
                  <li className="flex items-baseline gap-3" key={community.id}>
                    <span className="text-[color:var(--color-ink)]">{community.label}</span>
                    <span className="font-mono text-[0.72rem] text-[color:var(--color-muted-soft)]">
                      {community.areas.join(" · ")}
                    </span>
                    <span className="ml-auto text-[color:var(--color-muted)]">{community.size}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[0.8rem] text-[color:var(--color-muted)]">
                {graph.nodes.toLocaleString("en-US")} nodes · {graph.links.toLocaleString("en-US")}{" "}
                edges. Rebuild with <Mono>graphify update .</Mono>
              </p>
            </Panel>
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-[1.6rem] text-[color:var(--color-ink)]">Repo documents</h2>
        <Panel className="flex flex-col divide-y divide-[color:var(--color-line)] p-0">
          {docs.map((entry) => (
            <Link
              className="flex flex-wrap items-baseline gap-x-4 px-5 py-3 transition-colors hover:bg-[color:var(--color-cool)]"
              href={`/repo/docs/${entry.file}`}
              key={entry.file}
            >
              <span className="min-w-[14rem] text-[0.94rem] text-[color:var(--color-ink)]">
                {entry.title}
              </span>
              <Mono>{entry.file}</Mono>
              <span className="ml-auto text-[0.74rem] text-[color:var(--color-muted-soft)]">
                {(entry.body.length / 1024).toFixed(0)} KB
              </span>
            </Link>
          ))}
        </Panel>
        <p className="text-[0.8rem] text-[color:var(--color-muted)]">
          Bundled at build time, because a deployed app has no repo to read. Add one to the list in{" "}
          <Mono>scripts/snapshot.ts</Mono>.
        </p>
      </section>
    </div>
  )
}
