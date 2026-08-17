/**
 * Records what the engineering checks say right now, so the deployed app can
 * show a real result instead of nothing.
 *
 * Vercel cannot run typecheck/lint/test/build for other workspaces from inside a
 * serverless function, and running the whole suite during every deploy would be
 * slow and would fail the deploy on an unrelated red test. So the results are
 * captured here, on demand, and committed:
 *
 *     bun run checks:snapshot          # from apps/atrium.status
 *     bun run status:snapshot          # from the repo root
 *
 * The output carries its commit and timestamp; the UI always shows both, and
 * says how stale it is rather than implying it is live.
 */

import { execFileSync, spawnSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

const APP_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const REPO_ROOT = path.resolve(APP_DIR, "../..")
const OUT_FILE = path.join(APP_DIR, "data", "checks.json")

const TASKS = ["typecheck", "lint", "test", "build"] as const

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" }).trim()
  } catch {
    return ""
  }
}

function summarize(task: string, output: string, ok: boolean): string {
  if (task === "test") {
    let pass = 0
    let fail = 0
    for (const line of output.split("\n")) {
      const p = line.match(/^\s*(?:\S+:test:\s*)?(\d+)\s+pass\s*$/)
      const f = line.match(/^\s*(?:\S+:test:\s*)?(\d+)\s+fail\s*$/)
      if (p) pass += Number(p[1] ?? 0)
      if (f) fail += Number(f[1] ?? 0)
    }
    if (pass || fail) return `${pass} pass, ${fail} fail`
  }
  const errors = output.match(/Found (\d+) errors?/)
  if (errors) return `${errors[1]} errors`
  const warnings = output.match(/Found (\d+) warnings?/)
  if (warnings) return `${warnings[1]} warnings`
  return ok ? "passed" : "failed"
}

function failedWorkspaces(output: string): string[] {
  const line = output.match(/Failed:\s+(.+)/)
  if (!line?.[1]) return []
  return line[1]
    .split(",")
    .map((entry) => entry.trim().split("#")[0] ?? "")
    .filter(Boolean)
}

const results = TASKS.map((task) => {
  const startedAt = Date.now()
  const run = spawnSync(
    path.join(REPO_ROOT, "node_modules", ".bin", "turbo"),
    // --force, because a cache replay does not reliably reprint per-workspace
    // test counts and the snapshot would understate what actually ran.
    // --continue, because stopping at the first failure hides the rest.
    ["run", task, "--output-logs=full", "--continue", "--force"],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0", TURBO_UI: "false", CI: "1" },
      maxBuffer: 32 * 1024 * 1024,
    },
  )

  const output = `${run.stdout ?? ""}${run.stderr ?? ""}`
  const ok = run.status === 0
  console.log(`${task}: ${ok ? "ok" : "FAILED"} (${((Date.now() - startedAt) / 1000).toFixed(1)}s)`)

  return {
    task,
    ok,
    exitCode: run.status ?? 1,
    durationMs: Date.now() - startedAt,
    summary: summarize(task, output, ok),
    failedWorkspaces: failedWorkspaces(output),
  }
})

const snapshot = {
  recordedAt: new Date().toISOString(),
  commit: git(["rev-parse", "HEAD"]),
  branch: git(["rev-parse", "--abbrev-ref", "HEAD"]),
  dirty: git(["status", "--porcelain"]).split("\n").filter(Boolean).length > 0,
  results,
}

mkdirSync(path.dirname(OUT_FILE), { recursive: true })
writeFileSync(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")
console.log(`\nwrote ${path.relative(REPO_ROOT, OUT_FILE)} — commit it so the deploy can show it.`)
