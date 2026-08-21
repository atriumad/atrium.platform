#!/usr/bin/env node
// ─── Reel optimization ──────────────────────────────────────────────────────
// The reels under `clients/<CODE>/reels/` are delivery copies of what the edit
// bay exports: 1080x1920 at ~19 Mbps, which is a 17 MB file for seven seconds
// of video. The site plays them in columns a few hundred pixels wide, so the
// home page was pulling ~180 MB to paint its hero.
//
// This builds one web variant and one poster per reel, uploads them into a
// `web/` folder beside the sources, and records what landed there in
// `reels.manifest.json` — the file the website reads. Sources are never
// touched, and a reel only appears in the manifest once its variant is on the
// CDN, so a half-finished run thins the savings and can never point the site
// at a URL the CDN would 404.
//
//   node scripts/optimize-reels.mjs               # encode whatever has no variant
//   node scripts/optimize-reels.mjs --only DCOP   # one client code
//   node scripts/optimize-reels.mjs --limit 6     # the first six
//   node scripts/optimize-reels.mjs --jobs 4      # encoders in flight
//   node scripts/optimize-reels.mjs --force       # re-encode and re-upload
//   node scripts/optimize-reels.mjs --posters     # redo posters at a better frame
//   node scripts/optimize-reels.mjs --manifest    # just re-read what is on the CDN
//
// The encode runs here rather than on the CDN box. Hostinger ships no ffmpeg,
// and a static build inside the account's cage ran its memory and process
// limits dry — those transcodes were competing with the web server that has to
// keep serving the site. So each source is pulled over HTTPS into `.cache/src/`,
// encoded into `.cache/web/`, and only the (much smaller) variants go back.
// Both cache folders are disposable: a re-run re-downloads what is missing.

import { execFile } from "node:child_process"
import { createWriteStream } from "node:fs"
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { cpus } from "node:os"
import { dirname, join } from "node:path"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const run = promisify(execFile)

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const CACHE = join(ROOT, ".cache")
const SRC_DIR = join(CACHE, "src")
const WEB_DIR = join(CACHE, "web")
const MANIFEST = fileURLToPath(new URL("../../atrium.website/lib/reels.manifest.json", import.meta.url))

const BASE = "https://cdn.atriumad.com"
const HOST = process.env.CDN_SSH_HOST ?? "atrium-cdn"
const REMOTE_ROOT = process.env.CDN_REMOTE_PATH ?? "domains/atriumad.com/public_html/cdn"

// 1280 tall keeps a 9:16 reel sharp on a phone at full width and on every tile
// the site renders it in. CRF 27 measured ~9x smaller than the source with no
// visible difference at these sizes. Audio survives at 96k: the hero is muted,
// but the case-study showcase player is not, and a silent variant there would
// be a regression rather than an optimization.
const HEIGHT = 1280
const CRF = 27
const PRESET = "medium"
const AUDIO_BITRATE = "96k"
// The first frame of a reel is usually its worst: an empty table, a storefront,
// the beat before the edit starts. A poster is what the site shows until the
// viewer scrolls a tile into view, so it is taken a third of the way in, where
// the food is already on screen.
const POSTER_AT = 0.33

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}

const FORCE = flag("force")
const MANIFEST_ONLY = flag("manifest")
const POSTERS_ONLY = flag("posters")
const LIMIT = Number(value("limit") ?? 0)
const ONLY = value("only")
// Half the cores: ffmpeg threads each encode internally, so one job per core
// leaves nothing for the machine this is running on.
const JOBS = Number(value("jobs") ?? Math.max(2, Math.floor(cpus().length / 2)))

/** Run a command on the CDN host and return its stdout. */
async function ssh(command) {
  const { stdout } = await run("ssh", ["-o", "BatchMode=yes", HOST, command], {
    maxBuffer: 1024 * 1024 * 32,
  })
  return stdout
}

/** CDN filenames carry spaces, %-escapes and non-breaking spaces — the naming
 *  the edit bay exports. Variants get a slug instead, so the delivery URLs are
 *  clean and nothing downstream has to guess at an encoding. */
function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

/** Every reel on the CDN, and every variant already sitting beside one, as
 *  paths relative to the CDN root (`clients/DCOP/reels/x.mp4`). One round trip:
 *  this listing is what decides how much work there is to do. */
async function listRemote() {
  const out = await ssh(
    `find ${REMOTE_ROOT}/clients -type f \\( -name '*.mp4' -o -name '*.jpg' \\) | sed 's|^${REMOTE_ROOT}/||'`,
  )
  const all = out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  return {
    sources: all.filter((path) => path.endsWith(".mp4") && !path.includes("/web/")).sort(),
    variants: new Set(all.filter((path) => path.includes("/web/"))),
  }
}

/** The variant paths a source should have, once it has been encoded. */
function variantPaths(source) {
  const dir = dirname(source)
  const slug = slugify(source.slice(dir.length + 1))
  return { dir, slug, web: `${dir}/web/${slug}.mp4`, poster: `${dir}/web/${slug}.jpg` }
}

async function exists(path) {
  try {
    return (await stat(path)).size > 0
  } catch {
    return false
  }
}

async function download(remotePath, dest) {
  if (await exists(dest)) return
  // The path is the CDN's own naming; encode each segment so spaces and
  // non-breaking spaces survive the request the way a browser sends them.
  const url = `${BASE}/${remotePath.split("/").map(encodeURIComponent).join("/")}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  await mkdir(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

/** Seconds of a file ffprobe can reach — a local path or an https URL. */
async function duration(input) {
  const { stdout } = await run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", input,
  ])
  return Number.parseFloat(stdout.trim()) || 0
}

/** One frame, a third of the way in. `-ss` before `-i` seeks first, which over
 *  https turns into a range request instead of a full download. */
async function poster(input, out, seconds) {
  await mkdir(dirname(out), { recursive: true })
  await run("ffmpeg", [
    "-y", "-v", "error", "-nostdin",
    "-ss", String(seconds.toFixed(2)),
    "-i", input,
    "-frames:v", "1",
    "-vf", `scale=-2:${HEIGHT}`,
    "-q:v", "6",
    out,
  ])
}

async function encode(src, outVideo, outPoster) {
  await mkdir(dirname(outVideo), { recursive: true })
  await run("ffmpeg", [
    "-y", "-v", "error", "-nostdin",
    "-i", src,
    // -2 keeps the width even, which yuv420p requires.
    "-vf", `scale=-2:${HEIGHT}`,
    "-c:v", "libx264", "-profile:v", "high", "-preset", PRESET, "-crf", String(CRF),
    "-pix_fmt", "yuv420p",
    // faststart moves the index to the front so playback can begin on the first
    // chunk instead of waiting for the whole file.
    "-movflags", "+faststart",
    "-g", "60",
    "-c:a", "aac", "-b:a", AUDIO_BITRATE, "-ac", "2",
    outVideo,
  ])
  await poster(src, outPoster, (await duration(src)) * POSTER_AT)
}

/** Run `worker` over `items` with a fixed number in flight. */
async function pool(items, size, worker) {
  const queue = [...items]
  const workers = Array.from({ length: Math.max(1, size) }, async () => {
    for (;;) {
      const item = queue.shift()
      if (!item) return
      await worker(item)
    }
  })
  await Promise.all(workers)
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)

/** Mirror `.cache/web/clients/` into the CDN's `clients/`. The local tree is
 *  built to match the remote one, so this only ever adds `web/` folders — no
 *  --delete, nothing that can reach a source file. */
async function upload() {
  if (!(await exists(join(WEB_DIR, "clients")))) return
  const { stdout } = await run(
    "rsync",
    ["-rt", "--stats", `${join(WEB_DIR, "clients")}/`, `${HOST}:${REMOTE_ROOT}/clients/`],
    { maxBuffer: 1024 * 1024 * 16 },
  )
  // rsync 3 says "regular files transferred", rsync 2.6 (what ships
  // with macOS) just says "files transferred".
  const sent = stdout.match(/Number of (?:regular )?files transferred: (\d+)/)?.[1]
  console.log(`uploaded ${sent ?? "?"} file(s)`)
}

/** Pair every source on the CDN with the variant beside it, if there is one,
 *  and write the site's manifest. The remote listing is the authority: what
 *  this machine encoded is irrelevant until it has actually landed. */
async function writeManifest(remote) {
  const { sources, variants } = remote ?? (await listRemote())
  const reels = []
  for (const source of sources) {
    const { web, poster } = variantPaths(source)
    if (!variants.has(web) || !variants.has(poster)) continue
    reels.push({ source: `/${source}`, web: `/${web}`, poster: `/${poster}` })
  }

  const previous = await readFile(MANIFEST, "utf8").catch(() => null)
  await writeFile(MANIFEST, `${JSON.stringify({ base: BASE, generated: reels.length, reels }, null, 2)}\n`)

  const before = previous ? (JSON.parse(previous).reels?.length ?? 0) : 0
  console.log(`\nmanifest: ${reels.length}/${sources.length} reels optimized (was ${before})`)
}

// ─── Run ────────────────────────────────────────────────────────────────────

if (MANIFEST_ONLY) {
  await writeManifest()
} else if (POSTERS_ONLY) {
  // Re-shot from the variants already on the CDN rather than from the sources:
  // the variant is a twentieth of the size and the frame is identical.
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"))
  console.log(`re-shooting ${manifest.reels.length} posters at ${POSTER_AT * 100}% (${JOBS} jobs)\n`)

  let shot = 0
  await pool(manifest.reels, JOBS, async (reel) => {
    const url = `${BASE}/${reel.web.replace(/^\//, "").split("/").map(encodeURIComponent).join("/")}`
    const out = join(WEB_DIR, reel.poster.replace(/^\//, ""))
    try {
      await poster(url, out, (await duration(url)) * POSTER_AT)
      shot += 1
      console.log(`  ok   ${shot}/${manifest.reels.length}  ${reel.poster.split("/").pop()}`)
    } catch (error) {
      console.error(`  fail ${reel.poster}: ${error?.message ?? error}`)
    }
  })

  if (shot > 0) {
    console.log(`\nuploading to ${HOST}`)
    await upload()
  }
} else {
  const remote = await listRemote()
  let reels = remote.sources
  if (ONLY) reels = reels.filter((path) => path.includes(`/${ONLY}/`))
  if (LIMIT > 0) reels = reels.slice(0, LIMIT)

  // Anything already on the CDN is done, whoever encoded it and whenever.
  const pending = FORCE
    ? reels
    : reels.filter((source) => {
        const { web, poster } = variantPaths(source)
        return !remote.variants.has(web) || !remote.variants.has(poster)
      })

  console.log(
    `${remote.sources.length} reels on ${HOST}, ${reels.length - pending.length} already optimized, ` +
      `${pending.length} to encode (${JOBS} jobs)\n`,
  )

  let done = 0
  const failures = []

  await pool(pending, JOBS, async (source) => {
    const { slug } = variantPaths(source)
    const dir = dirname(source)
    const cachedSource = join(SRC_DIR, dir, source.slice(dir.length + 1))
    const outVideo = join(WEB_DIR, dir, "web", `${slug}.mp4`)
    const outPoster = join(WEB_DIR, dir, "web", `${slug}.jpg`)

    try {
      if (FORCE || !(await exists(outVideo)) || !(await exists(outPoster))) {
        await download(source, cachedSource)
        await encode(cachedSource, outVideo, outPoster)
        // The source is only cached to feed ffmpeg; keeping 2.5 GB of it around
        // afterwards serves nothing.
        await rm(cachedSource, { force: true })
      }
      done += 1
      const info = await stat(outVideo)
      console.log(`  ok   ${done}/${pending.length}  ${slug}.mp4 (${mb(info.size)} MB)`)
    } catch (error) {
      failures.push(`${source}: ${error?.message ?? error}`)
      console.error(`  fail ${source}: ${error?.message ?? error}`)
    }
  })

  if (done > 0) {
    console.log(`\nuploading to ${HOST}`)
    await upload()
  }
  for (const failure of failures) console.error(`  fail ${failure}`)

  // Re-listed rather than assumed: the manifest describes what the CDN serves.
  await writeManifest()
}
