#!/usr/bin/env node
// ─── CDN build: validate naming, then stage the docroot ─────────────────────
// `public/` maps 1:1 to the CDN document root. This script validates the tree
// (naming conventions, no executables) and stages a clean copy into `dist/`
// ready to upload to `public_html/cdn` on Hostinger.
//
//   bun run build     # validate + stage
//
// Hidden files are dropped from the staging copy except `.htaccess` and
// `robots.txt`. Errors abort the build; naming warnings do not.

import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const SRC = join(ROOT, "public")
const OUT = join(ROOT, "dist")

const FORBIDDEN = /[\s()%]/
const KEEP_HIDDEN = new Set([".htaccess", "robots.txt"])

const errors = []
const warnings = []
const files = []
const byTop = new Map()
let bytes = 0

async function walk(dir, rel = "") {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    const relPath = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      await walk(full, relPath)
      continue
    }
    if (entry.name.startsWith(".") && !KEEP_HIDDEN.has(entry.name)) continue
    files.push(relPath)
    const top = relPath.split("/")[0]
    byTop.set(top, (byTop.get(top) ?? 0) + 1)
    const info = await stat(full)
    bytes += info.size
    if (FORBIDDEN.test(entry.name)) {
      warnings.push(`naming: "${relPath}" has spaces/parentheses/% — rename to slug-style`)
    }
    if (/\.(php\d*|cgi|pl|sh|py)$/i.test(entry.name)) {
      errors.push(`forbidden executable: "${relPath}"`)
    }
  }
}

await walk(SRC)

for (const warning of warnings) console.warn(`  warn  ${warning}`)
if (errors.length > 0) {
  for (const error of errors) console.error(`  error ${error}`)
  console.error("\nBuild aborted. Fix the issues above and rebuild.")
  process.exit(1)
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })
for (const rel of files) {
  const dest = join(OUT, rel)
  await mkdir(dirname(dest), { recursive: true })
  await copyFile(join(SRC, rel), dest)
}

const mb = (bytes / 1024 / 1024).toFixed(1)
console.log(`\nStaged ${files.length} files (${mb} MB) into dist/`)
for (const [top, count] of [...byTop.entries()].sort()) {
  console.log(`  ${top}/  ${count} files`)
}
console.log("\nUpload the contents of dist/ to the CDN document root (bun run deploy).")
