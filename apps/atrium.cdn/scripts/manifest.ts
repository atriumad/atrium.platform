#!/usr/bin/env bun
// ─── CDN manifest ───────────────────────────────────────────────────────────
// Lists every asset staged under public/clients/<CODE>/ and prints the delivery
// URL each one maps to, so case-study asset lists never have to be hand-copied.
// Report only; nothing is written.
//
//   bun run manifest            # report
//   bun run manifest --snippet  # also print a case-assets-style snippet
//
// The snippet keys by client folder code (TNKC…); the website maps codes to
// slugs in its own SLUG_MAP when pasting into lib/case-assets.overrides.ts.

import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const CLIENTS = join(ROOT, "public", "clients")
const BASE = "https://cdn.atriumad.com"
const SNIPPET = process.argv.includes("--snippet")

const FORBIDDEN = /[\s()%]/

type Bucket = { images: string[]; videos: string[] }

async function walk(dir: string, rel = ""): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    const relPath = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      out.push(...(await walk(full, relPath)))
    } else if (!entry.name.startsWith(".")) {
      out.push(relPath)
    }
  }
  return out
}

function encode(name: string): string {
  return name.split("/").map(encodeURIComponent).join("/")
}

async function main(): Promise<void> {
  const codes = (await readdir(CLIENTS, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort()

  if (codes.length === 0) {
    console.log("No client folders under public/clients/ yet.")
    return
  }

  const buckets = new Map<string, Bucket>()
  const warnings: string[] = []

  for (const code of codes) {
    const bucket: Bucket = { images: [], videos: [] }
    const base = join(CLIENTS, code)
    for (const kind of ["photos", "reels"]) {
      for (const path of await walk(join(base, kind))) {
        const name = path.split("/").pop() ?? path
        if (FORBIDDEN.test(name)) {
          warnings.push(`naming: ${code}/${path} — rename to slug-style`)
        }
        ;(kind === "photos" ? bucket.images : bucket.videos).push(path)
      }
    }
    bucket.images.sort()
    bucket.videos.sort()
    buckets.set(code, bucket)
  }

  console.log("\nCDN assets\n")
  for (const [code, bucket] of [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(
      `  ${code.padEnd(6)} images:${String(bucket.images.length).padStart(4)}  videos:${String(bucket.videos.length).padStart(4)}`,
    )
  }

  const total = [...buckets.values()].reduce((n, b) => n + b.images.length + b.videos.length, 0)
  console.log(`\n${buckets.size} clients, ${total} assets.`)

  for (const warning of warnings) console.warn(`  warn  ${warning}`)

  if (SNIPPET) {
    console.log("\nSnippet (keys are folder codes — map to slugs in the website):\n")
    const body = [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, bucket]) => {
        const imgs = bucket.images.map((p) => `      '${BASE}/clients/${code}/${encode(p)}',`).join("\n")
        const vids = bucket.videos.map((p) => `      '${BASE}/clients/${code}/${encode(p)}',`).join("\n")
        return `  '${code}': {\n    images: [\n${imgs}\n    ],\n    videos: [\n${vids}\n    ],\n  },`
      })
      .join("\n")
    console.log(`export const cdnAssets: Record<string, { images: string[]; videos: string[] }> = {\n${body}\n}`)
  }
}

await main()
