"use client"

import { useCallback, useEffect, useState } from "react"
import type { CheckResult, TaskName } from "@/lib/checks"

type State = Record<
  string,
  { running: boolean; result?: CheckResult | undefined; error?: string | undefined }
>

const TASK_HELP: Record<TaskName, string> = {
  typecheck: "tsc --noEmit",
  lint: "biome check",
  test: "bun test",
  build: "next build / node scripts",
}

export function CheckRunner({
  target,
  tasks,
  showOutput = true,
  allowFresh = false,
}: {
  /** workspace package name, or "all" */
  target: string
  tasks: TaskName[]
  showOutput?: boolean
  allowFresh?: boolean
}) {
  const [state, setState] = useState<State>({})
  const [fresh, setFresh] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  // Results live in the server process, so a page navigation should not lose
  // what was already run this session. `tasks` is a fresh array on every
  // render, so the effect keys off its contents rather than its identity.
  const taskKey = tasks.join(",")
  useEffect(() => {
    let cancelled = false
    fetch("/api/checks")
      .then((r) => r.json())
      .then((data: { results: Record<string, CheckResult> }) => {
        if (cancelled) return
        const hydrated: State = {}
        for (const task of taskKey.split(",").filter(Boolean) as TaskName[]) {
          const stored = data.results[`${task}:${target}`]
          if (stored) hydrated[task] = { running: false, result: stored }
        }
        setState((current) => ({ ...hydrated, ...current }))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [target, taskKey])

  const run = useCallback(
    async (task: TaskName) => {
      setState((s) => ({ ...s, [task]: { running: true } }))
      try {
        const response = await fetch("/api/checks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ task, target, fresh }),
        })
        const data = (await response.json()) as { result?: CheckResult; error?: string }
        if (!response.ok || !data.result) {
          setState((s) => ({ ...s, [task]: { running: false, error: data.error ?? "failed" } }))
          return
        }
        setState((s) => ({ ...s, [task]: { running: false, result: data.result } }))
        if (!data.result.ok) setOpen(task)
      } catch (error) {
        setState((s) => ({
          ...s,
          [task]: { running: false, error: error instanceof Error ? error.message : "failed" },
        }))
      }
    },
    [target, fresh],
  )

  const runAll = useCallback(async () => {
    for (const task of taskKey.split(",").filter(Boolean) as TaskName[]) await run(task)
  }, [run, taskKey])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {tasks.map((task) => {
          const entry = state[task]
          const result = entry?.result
          const tone = entry?.running
            ? "border-[color:var(--color-amber)] bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]"
            : entry?.error
              ? "border-[color:var(--color-error)] bg-[color:var(--color-red-soft)] text-[color:var(--color-error)]"
              : result
                ? result.ok
                  ? "border-transparent bg-[color:var(--color-green-soft)] text-[color:var(--color-green)]"
                  : "border-transparent bg-[color:var(--color-red-soft)] text-[color:var(--color-error)]"
                : "border-[color:var(--color-line)] bg-[color:var(--color-card)] text-[color:var(--color-body)]"

          return (
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors hover:border-[color:var(--color-ink)] disabled:opacity-70 ${tone}`}
              disabled={entry?.running}
              key={task}
              onClick={() => run(task)}
              title={TASK_HELP[task]}
              type="button"
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  entry?.running
                    ? "animate-pulse bg-current"
                    : result || entry?.error
                      ? "bg-current"
                      : "bg-[color:var(--color-pending)]"
                }`}
              />
              {task}
              {entry?.running ? <span className="opacity-70">running…</span> : null}
              {result ? <span className="opacity-70">{result.summary}</span> : null}
              {entry?.error ? <span className="opacity-70">{entry.error}</span> : null}
            </button>
          )
        })}

        {tasks.length > 1 ? (
          <button
            className="rounded-full bg-[color:var(--color-ink)] px-3.5 py-1.5 text-[0.8rem] font-medium text-[color:var(--color-lime)] transition-opacity hover:opacity-90"
            onClick={runAll}
            type="button"
          >
            run all
          </button>
        ) : null}

        {allowFresh ? (
          <label className="ml-1 flex items-center gap-1.5 text-[0.76rem] text-[color:var(--color-muted)]">
            <input checked={fresh} onChange={(e) => setFresh(e.target.checked)} type="checkbox" />
            ignore turbo cache
          </label>
        ) : null}
      </div>

      {showOutput
        ? tasks.map((task) => {
            const result = state[task]?.result
            if (!result) return null
            const isOpen = open === task
            return (
              <div key={task}>
                <button
                  className="text-[0.76rem] text-[color:var(--color-muted)] underline underline-offset-2"
                  onClick={() => setOpen(isOpen ? null : task)}
                  type="button"
                >
                  {isOpen ? "hide" : "show"} {task} output · {(result.durationMs / 1000).toFixed(1)}s
                  {result.cached ? " · cached" : ""}
                </button>
                {isOpen ? (
                  <pre className="mt-2 max-h-96 overflow-auto rounded-[14px] bg-[color:var(--color-ink)] p-4 font-mono text-[0.72rem] leading-relaxed text-[color:var(--color-off-white)]">
                    {result.output || "(no output)"}
                  </pre>
                ) : null}
              </div>
            )
          })
        : null}
    </div>
  )
}
