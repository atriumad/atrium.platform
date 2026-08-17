import { spawn } from "node:child_process"
import path from "node:path"
import { repoSnapshot } from "./repo-data"

/**
 * Runs the repo's own tasks — typecheck, lint, test, build — through turbo.
 *
 * This only works where the working tree and the toolchain exist, which means
 * local development. A deployment has neither, so every entry point here checks
 * `isAvailable()` first and the UI shows the committed snapshot instead.
 */

export const TASKS = ["typecheck", "lint", "test", "build"] as const
export type TaskName = (typeof TASKS)[number]

export type CheckResult = {
  task: TaskName
  /** workspace package name, or "all" */
  target: string
  ok: boolean
  exitCode: number
  cached: boolean
  durationMs: number
  finishedAt: string
  summary: string
  output: string
}

const MAX_OUTPUT_LINES = 400
const RUN_TIMEOUT_MS = 10 * 60 * 1000

const lastResults = new Map<string, CheckResult>()

export function isAvailable(): boolean {
  return process.env.NODE_ENV === "development"
}

/** Repo root, relative to the app — only meaningful when isAvailable(). */
function repoRoot(): string {
  return process.env.REPO_ROOT ?? path.resolve(process.cwd(), "../..")
}

export function getLastResults(): Record<string, CheckResult> {
  return Object.fromEntries(lastResults)
}

export class InvalidCheckError extends Error {}

/**
 * Validates against what the repo actually declares. Nothing from the request
 * reaches a shell: turbo is spawned with an argv array and both halves are
 * whitelisted here first.
 */
function validate(task: string, target: string): { task: TaskName; target: string } {
  if (!TASKS.includes(task as TaskName)) throw new InvalidCheckError(`unknown task "${task}"`)
  if (target === "all") return { task: task as TaskName, target }

  const workspace = repoSnapshot.workspaces.find((candidate) => candidate.name === target)
  if (!workspace) throw new InvalidCheckError(`unknown workspace "${target}"`)
  if (!workspace.tasks.includes(task)) {
    throw new InvalidCheckError(`${target} does not declare a "${task}" script`)
  }
  return { task: task as TaskName, target }
}

function summarize(task: TaskName, output: string, ok: boolean): string {
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
  const failed = output.match(/Failed:\s+(.+)/)
  if (failed?.[1]) return `failed: ${failed[1].trim()}`
  return ok ? "passed" : "failed"
}

export async function runCheck(
  rawTask: string,
  rawTarget: string,
  options: { fresh?: boolean } = {},
): Promise<CheckResult> {
  if (!isAvailable()) {
    throw new InvalidCheckError("checks can only run in local development")
  }

  const { task, target } = validate(rawTask, rawTarget)
  const root = repoRoot()

  const args = ["run", task]
  if (target !== "all") args.push(`--filter=${target}`)
  if (options.fresh) args.push("--force")
  // Without --continue turbo stops at the first failing workspace, hiding every
  // failure after it — the opposite of what a status page is for.
  args.push("--output-logs=full", "--continue")

  const startedAt = Date.now()
  const turbo = path.join(root, "node_modules", ".bin", "turbo")

  const { code, output } = await new Promise<{ code: number; output: string }>((resolve) => {
    const child = spawn(turbo, args, {
      cwd: root,
      env: { ...process.env, FORCE_COLOR: "0", TURBO_UI: "false", CI: "1" },
    })
    const chunks: string[] = []
    const push = (buffer: Buffer) => {
      chunks.push(buffer.toString())
    }
    child.stdout.on("data", push)
    child.stderr.on("data", push)

    const timer = setTimeout(() => {
      child.kill("SIGKILL")
      chunks.push(`\n[status] killed after ${RUN_TIMEOUT_MS / 1000}s timeout\n`)
    }, RUN_TIMEOUT_MS)

    child.on("error", (error) => {
      clearTimeout(timer)
      resolve({ code: 127, output: `${chunks.join("")}\n[status] ${error.message}` })
    })
    child.on("close", (exitCode) => {
      clearTimeout(timer)
      resolve({ code: exitCode ?? 1, output: chunks.join("") })
    })
  })

  const lines = output.split("\n")
  const trimmed = lines.length > MAX_OUTPUT_LINES ? lines.slice(-MAX_OUTPUT_LINES) : lines
  const ok = code === 0

  const result: CheckResult = {
    task,
    target,
    ok,
    exitCode: code,
    cached: /cache hit/.test(output) && !/cache miss/.test(output),
    durationMs: Date.now() - startedAt,
    finishedAt: new Date().toISOString(),
    summary: summarize(task, output, ok),
    output: trimmed.join("\n").trim(),
  }
  lastResults.set(`${task}:${target}`, result)
  return result
}
