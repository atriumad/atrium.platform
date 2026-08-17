import checksJson from "@/data/checks.json"
import snapshotJson from "@/data/repo-snapshot.generated.json"

/**
 * The engineering view of the monorepo, read from build-time artefacts.
 *
 * `repo-snapshot.generated.json` is written by `scripts/snapshot.ts` on every
 * build, so it always matches the deployed commit. `checks.json` is committed
 * by hand via `bun run checks:snapshot`, because running the whole suite on
 * every deploy would be slow and would fail deploys on unrelated red tests.
 *
 * Both carry timestamps. Anything shown from here is labelled with its age —
 * this is deliberately not live data, and the UI must never imply that it is.
 */

export type WorkspaceSnapshot = {
  name: string
  slug: string
  kind: "app" | "package" | "tooling"
  dir: string
  version: string
  scripts: Record<string, string>
  workspaceDeps: string[]
  tasks: string[]
  files: number
  lines: number
  testFiles: number
  byExtension: Array<{ ext: string; files: number; lines: number }>
  routes: Array<{ path: string; kind: "page" | "route"; file: string }>
}

export type RepoSnapshot = {
  generatedAt: string
  git: {
    branch: string
    head: string
    lastCommit: string
    lastCommitAt: string
    dirtyFiles: number
  }
  workspaces: WorkspaceSnapshot[]
  graph: {
    nodes: number
    links: number
    builtAtCommit: string | null
    areas: Array<{ area: string; nodes: number }>
    relations: Array<{ relation: string; count: number }>
    communities: Array<{ id: number; label: string; size: number; areas: string[] }>
  } | null
  docs: Array<{ file: string; title: string; body: string }>
}

export type ChecksSnapshot = {
  recordedAt: string
  commit: string
  branch: string
  dirty: boolean
  results: Array<{
    task: string
    ok: boolean
    exitCode: number
    durationMs: number
    summary: string
    failedWorkspaces: string[]
  }>
}

export const repoSnapshot = snapshotJson as RepoSnapshot
export const checksSnapshot = checksJson as ChecksSnapshot

export function workspace(nameOrSlug: string): WorkspaceSnapshot | undefined {
  return repoSnapshot.workspaces.find(
    (candidate) => candidate.name === nameOrSlug || candidate.slug === nameOrSlug,
  )
}

export function doc(file: string): RepoSnapshot["docs"][number] | undefined {
  return repoSnapshot.docs.find((candidate) => candidate.file === file)
}

/** True when the knowledge graph was built from a different commit than this build. */
export function graphIsStale(): boolean {
  const graph = repoSnapshot.graph
  if (!graph?.builtAtCommit || !repoSnapshot.git.head) return false
  return graph.builtAtCommit !== repoSnapshot.git.head
}

/** Local development can run the real thing; a deployment can only replay. */
export const canRunChecks = process.env.NODE_ENV === "development"
