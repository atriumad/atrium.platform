/**
 * Freezes everything about the monorepo that a deployed status app cannot
 * discover for itself.
 *
 * On Vercel there is no working tree inside a serverless function: no git, no
 * turbo, no source files. But the *build* runs in the repo, so this script runs
 * as `prebuild`, walks the tree once, and writes a JSON file the app imports
 * statically. The result carries its own timestamp and commit so the UI can say
 * how old it is instead of pretending it is live.
 *
 * Run manually with `bun run snapshot`.
 */

import { execFileSync } from "node:child_process"
import type { Dirent } from "node:fs"
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

const APP_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const REPO_ROOT = path.resolve(APP_DIR, "../..")
const OUT_FILE = path.join(APP_DIR, "data", "repo-snapshot.generated.json")

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  ".git",
  "dist",
  "out",
  ".worktrees",
  "graphify-out",
  ".obsidian",
])

const COUNTED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"])

type Workspace = {
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

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T
  } catch {
    return null
  }
}

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" }).trim()
  } catch {
    return ""
  }
}

function walkFiles(dir: string, visit: (file: string) => void): void {
  let entries: Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue
      walkFiles(full, visit)
      continue
    }
    visit(full)
  }
}

function collectStats(absDir: string) {
  const totals = new Map<string, { files: number; lines: number }>()
  let files = 0
  let lines = 0
  let testFiles = 0

  walkFiles(absDir, (file) => {
    const ext = path.extname(file)
    if (!COUNTED_EXTENSIONS.has(ext)) return
    const content = readFileSync(file, "utf8")
    const count = content.length === 0 ? 0 : content.split("\n").length
    const bucket = totals.get(ext) ?? { files: 0, lines: 0 }
    bucket.files += 1
    bucket.lines += count
    totals.set(ext, bucket)
    files += 1
    lines += count
    if (/\.test\.[tj]sx?$/.test(path.basename(file))) testFiles += 1
  })

  return {
    files,
    lines,
    testFiles,
    byExtension: [...totals.entries()]
      .map(([ext, value]) => ({ ext, ...value }))
      .sort((a, b) => b.lines - a.lines),
  }
}

function collectRoutes(absDir: string): Workspace["routes"] {
  const appDir = path.join(absDir, "app")
  const out: Workspace["routes"] = []

  const walk = (current: string, urlParts: string[]) => {
    let entries: Dirent[]
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue
        const segment =
          entry.name.startsWith("(") || entry.name.startsWith("_") ? null : entry.name
        walk(full, segment ? [...urlParts, segment] : urlParts)
        continue
      }
      const isPage = /^page\.(tsx|ts|jsx|js)$/.test(entry.name)
      const isRoute = /^route\.(tsx|ts|jsx|js)$/.test(entry.name)
      if (!isPage && !isRoute) continue
      out.push({
        path: `/${urlParts.join("/")}`,
        kind: isPage ? "page" : "route",
        file: path.relative(REPO_ROOT, full),
      })
    }
  }

  walk(appDir, [])
  return out.sort((a, b) => a.path.localeCompare(b.path))
}

function collectWorkspaces(): Workspace[] {
  const groups: Array<[string, Workspace["kind"]]> = [
    ["apps", "app"],
    ["packages", "package"],
    ["tooling", "tooling"],
  ]
  const found: Workspace[] = []

  for (const [group, kind] of groups) {
    let entries: string[]
    try {
      entries = readdirSync(path.join(REPO_ROOT, group))
    } catch {
      continue
    }
    for (const entry of entries.sort()) {
      const dir = `${group}/${entry}`
      const absDir = path.join(REPO_ROOT, dir)
      const pkg = readJson<{
        name?: string
        version?: string
        scripts?: Record<string, string>
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }>(path.join(absDir, "package.json"))
      if (!pkg?.name) continue

      const scripts = pkg.scripts ?? {}
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      const stats = collectStats(absDir)

      found.push({
        name: pkg.name,
        slug: entry.replace(/^atrium\./, ""),
        kind,
        dir,
        version: pkg.version ?? "0.0.0",
        scripts,
        workspaceDeps: Object.keys(deps)
          .filter((dep) => dep.startsWith("@atrium/"))
          .sort(),
        tasks: ["typecheck", "lint", "test", "build"].filter((task) => task in scripts),
        ...stats,
        routes: collectRoutes(absDir),
      })
    }
  }

  return found
}

type GraphSnapshot = {
  nodes: number
  links: number
  builtAtCommit: string | null
  areas: Array<{ area: string; nodes: number }>
  relations: Array<{ relation: string; count: number }>
  communities: Array<{ id: number; label: string; size: number; areas: string[] }>
}

function collectGraph(): GraphSnapshot | null {
  const file = path.join(REPO_ROOT, "graphify-out", "graph.json")
  const raw = readJson<{
    nodes: Array<{ source_file: string; community: number; label: string }>
    links: Array<{ relation: string }>
    built_at_commit?: string
  }>(file)
  if (!raw) return null

  const labels =
    readJson<Record<string, string>>(
      path.join(REPO_ROOT, "graphify-out", ".graphify_labels.json"),
    ) ?? {}

  const areaOf = (sourceFile: string) => {
    const parts = sourceFile.split("/")
    const head = parts[0] ?? "(root)"
    return head === "apps" || head === "packages" || head === "tooling"
      ? parts.slice(0, 2).join("/")
      : parts.length > 1
        ? head
        : "(root)"
  }

  const areas = new Map<string, number>()
  const communities = new Map<number, { size: number; areas: Map<string, number> }>()
  for (const node of raw.nodes) {
    const area = areaOf(node.source_file)
    areas.set(area, (areas.get(area) ?? 0) + 1)
    const bucket = communities.get(node.community) ?? { size: 0, areas: new Map() }
    bucket.size += 1
    bucket.areas.set(area, (bucket.areas.get(area) ?? 0) + 1)
    communities.set(node.community, bucket)
  }

  const relations = new Map<string, number>()
  for (const link of raw.links) {
    relations.set(link.relation, (relations.get(link.relation) ?? 0) + 1)
  }

  return {
    nodes: raw.nodes.length,
    links: raw.links.length,
    builtAtCommit: raw.built_at_commit ?? null,
    areas: [...areas.entries()]
      .map(([area, nodes]) => ({ area, nodes }))
      .sort((a, b) => b.nodes - a.nodes)
      .slice(0, 12),
    relations: [...relations.entries()]
      .map(([relation, count]) => ({ relation, count }))
      .sort((a, b) => b.count - a.count),
    communities: [...communities.entries()]
      .map(([id, value]) => ({
        id,
        label: labels[String(id)] ?? `Community ${id}`,
        size: value.size,
        areas: [...value.areas.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([area]) => area),
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 16),
  }
}

/** A deployed app cannot read the repo's Markdown, so the small stuff comes along. */
function collectDocs() {
  const candidates = [
    "README.md",
    "ARCHITECTURE.md",
    "AGENTS.md",
    "apps/atrium.status/README.md",
    "apps/atrium.cdn/README.md",
    "apps/atrium.website/README.md",
    "apps/atrium.grader/README.md",
  ]
  const MAX_BYTES = 120_000

  return candidates
    .map((file) => {
      const full = path.join(REPO_ROOT, file)
      try {
        if (statSync(full).size > MAX_BYTES) return null
        return { file, title: path.basename(file, ".md"), body: readFileSync(full, "utf8") }
      } catch {
        return null
      }
    })
    .filter((doc): doc is { file: string; title: string; body: string } => doc !== null)
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  git: {
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"]),
    head: git(["rev-parse", "HEAD"]),
    lastCommit: git(["log", "-1", "--pretty=%s"]),
    lastCommitAt: git(["log", "-1", "--pretty=%cI"]),
    dirtyFiles: git(["status", "--porcelain"]).split("\n").filter(Boolean).length,
  },
  workspaces: collectWorkspaces(),
  graph: collectGraph(),
  docs: collectDocs(),
}

mkdirSync(path.dirname(OUT_FILE), { recursive: true })
writeFileSync(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")

console.log(
  `snapshot: ${snapshot.workspaces.length} workspaces, ${snapshot.docs.length} docs, graph ${
    snapshot.graph ? `${snapshot.graph.nodes} nodes` : "absent"
  } → ${path.relative(REPO_ROOT, OUT_FILE)}`,
)
