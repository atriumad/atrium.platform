import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const cssDir = join(process.cwd(), ".next/static/css")
const css = readdirSync(cssDir)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(cssDir, f), "utf8"))
  .join("\n")

// Utilities that only exist because our theme defines the token behind them.
const required = [
  "#0d2f33",                  // rg-ink, via text-rg-ink
  "#f3c150",                  // rg-amber
  "26px",                     // rounded-rg
  "cubic-bezier(.2,.7,.2,1)", // ease-rg
  "rg-fade-up",               // keyframes behind animate-rg-up
]

const missing = required.filter((token) => !css.includes(token))

if (missing.length > 0) {
  console.error(`FAIL: these tokens never reached the built CSS:\n  ${missing.join("\n  ")}`)
  process.exit(1)
}

console.log(`PASS: all ${required.length} tokens present in built CSS`)
