#!/usr/bin/env node
// ─── CDN deploy: build + rsync to Hostinger over SSH ───────────────────────
// Stages dist/ via build.mjs, then mirrors it into the CDN document root.
// Zero credentials live in this repo — SSH identity comes from the
// `atrium-cdn` alias in ~/.ssh/config (HostName/User/Port/IdentityFile).
//
//   bun run deploy             # build + push
//   bun run deploy --dry-run   # build + preview what rsync would do
//
// Optional env overrides (values are read at runtime, never hardcoded):
//   CDN_SSH_HOST      SSH alias from ~/.ssh/config   (default: atrium-cdn)
//   CDN_REMOTE_PATH   remote docroot under $HOME     (default: domains/atriumad.com/public_html/cdn)
//
// The docroot also holds live client content under clients/ (~1 GB) that is NOT
// managed from this repo — it is excluded so `--delete` never touches it.

import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const DIST = join(ROOT, "dist")
const BUILD = join(ROOT, "scripts", "build.mjs")

const DRY = process.argv.includes("--dry-run")
const HOST = process.env.CDN_SSH_HOST ?? "atrium-cdn"
const REMOTE_PATH = process.env.CDN_REMOTE_PATH ?? "domains/atriumad.com/public_html/cdn"
const PROTECTED = process.env.CDN_PROTECTED ?? "clients/"

// 1. Build (validate + stage dist/)
execFileSync(process.execPath, [BUILD], { cwd: ROOT, stdio: "inherit" })

if (!existsSync(join(DIST, ".htaccess"))) {
  console.error("  error dist/ has no .htaccess — refusing to push a bare document root.")
  process.exit(1)
}

// 2. Make sure the remote docroot exists (mkdir -p is portable; --mkpath is not)
try {
  execFileSync("ssh", [HOST, `mkdir -p ${REMOTE_PATH}`], { stdio: "inherit" })
} catch {
  console.error(`\nCould not reach ssh ${HOST}.`)
  console.error("  - Fill in the placeholders in ~/.ssh/config (HostName / User / Port).")
  console.error("  - Add the public key in hPanel → Account → SSH Access.")
  console.error("  - Then verify with:  ssh atrium-cdn \"echo ok\"")
  process.exit(1)
}

// 3. Mirror dist/ → remote docroot. --delete keeps the managed area an exact
//    copy; PROTECTED (live client content) is excluded from deletion.
const remote = `${HOST}:${REMOTE_PATH}`
const args = ["-az", "--delete", "--exclude", PROTECTED, "-e", "ssh", `${DIST}/`, remote]
if (DRY) args.unshift("-n")

if (DRY) console.log("Dry run — nothing will change on the server.\n")
try {
  execFileSync("rsync", args, { stdio: "inherit" })
} catch {
  console.error("\nDeploy failed (dry-run above shows what would change).")
  process.exit(1)
}

if (!DRY) {
  console.log(`\nCDN synced → ${remote}`)
  console.log("Verify: curl -sI https://cdn.atriumad.com/robots.txt")
}
