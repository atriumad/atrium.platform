#!/usr/bin/env node
// ─── Film ingest: masters from a local folder onto the CDN ──────────────────
// The reels under `clients/<CODE>/reels/` are social cuts, all 9:16, and they
// already live on the CDN — `optimize-reels.mjs` transcodes them in place.
// Film work does not arrive that way. It comes off the edit as 4K masters at
// 60–80 Mbps sitting in a folder on someone's laptop: a 69-second interview is
// half a gigabyte, and there are eleven of them.
//
// So this is the other direction: encode here, upload only the web variants,
// and leave the masters where they are. Nothing 500 MB ever reaches the CDN.
//
//   node scripts/ingest-films.mjs ~/Downloads/HOKC --client HOKC
//   node scripts/ingest-films.mjs "~/Downloads/TOWN CO" --client TWCO --dry-run
//
// Variants land in `clients/<CODE>/films/web/`, beside the same `web/` naming
// the reels use, and the script prints the finished URLs so they can be pasted
// into the case study. It reports orientation and duration for each one,
// because a landscape film and a vertical cut are shown differently on the site.

import { execFile } from "node:child_process"
import { mkdir, readdir, stat } from "node:fs/promises"
import { cpus } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const run = promisify(execFile)

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const CACHE = join(ROOT, ".cache", "films")

const BASE = "https://cdn.atriumad.com"
const HOST = process.env.CDN_SSH_HOST ?? "atrium-cdn"
const REMOTE_ROOT = process.env.CDN_REMOTE_PATH ?? "domains/atriumad.com/public_html/cdn"

// A film is watched, not glanced at: 1080p for landscape rather than the reels'
// 720p, and CRF 23 rather than 27. Vertical cuts are the same shape as a reel
// and get the reels' treatment. Audio is 128k either way — these carry speech,
// and the interviews are the point of the piece.
const LANDSCAPE_HEIGHT = 1080
const PORTRAIT_HEIGHT = 1280
const CRF = 23
const PRESET = "medium"
const AUDIO_BITRATE = "128k"
// Same reasoning as the reels: the opening frame is usually a fade-in or an
// empty room, so the poster is taken once the piece has started.
const POSTER_AT = 0.35

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}

const SOURCE_DIR = resolve((argv[0] ?? "").replace(/^~/, process.env.HOME ?? "~"))
const CLIENT = value("client")
const DRY = flag("dry-run")
const JOBS = Number(value("jobs") ?? Math.max(2, Math.floor(cpus().length / 2)))

if (!SOURCE_DIR || !CLIENT) {
  console.error("usage: ingest-films.mjs <folder> --client CODE [--jobs n] [--dry-run]")
  process.exit(1)
}

const REMOTE_DIR = `clients/${CLIENT}/films/web`
const OUT_DIR = join(CACHE, REMOTE_DIR)

/** Same slug rule as the reels: masters are named for the edit bay, variants
 *  are named for the URL bar. */
function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

async function probe(path) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration",
    "-of", "json", path,
  ])
  const info = JSON.parse(stdout)
  const stream = info.streams?.[0] ?? {}
  return {
    width: Number(stream.width) || 0,
    height: Number(stream.height) || 0,
    duration: Number.parseFloat(info.format?.duration) || 0,
  }
}

async function encode(src, out, height) {
  await mkdir(dirname(out), { recursive: true })
  await run("ffmpeg", [
    "-y", "-v", "error", "-nostdin",
    "-i", src,
    // -2 keeps the other dimension even, which yuv420p requires.
    "-vf", `scale=-2:${height}`,
    "-c:v", "libx264", "-profile:v", "high", "-preset", PRESET, "-crf", String(CRF),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-g", "60",
    "-c:a", "aac", "-b:a", AUDIO_BITRATE, "-ac", "2",
    out,
  ], { maxBuffer: 1024 * 1024 * 8 })
}

async function poster(src, out, height, seconds) {
  await run("ffmpeg", [
    "-y", "-v", "error", "-nostdin",
    "-ss", seconds.toFixed(2),
    "-i", src,
    "-frames:v", "1",
    "-vf", `scale=-2:${height}`,
    "-q:v", "5",
    out,
  ])
}

async function pool(items, size, worker) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: Math.max(1, size) }, async () => {
      for (;;) {
        const item = queue.shift()
        if (!item) return
        await worker(item)
      }
    }),
  )
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)

// ─── Run ────────────────────────────────────────────────────────────────────

const masters = (await readdir(SOURCE_DIR)).filter((name) => name.toLowerCase().endsWith(".mp4")).sort()
if (masters.length === 0) {
  console.error(`no .mp4 in ${SOURCE_DIR}`)
  process.exit(1)
}

console.log(`${masters.length} masters in ${SOURCE_DIR} → ${REMOTE_DIR} (${JOBS} jobs)\n`)

const results = []

await pool(masters, JOBS, async (name) => {
  const src = join(SOURCE_DIR, name)
  const slug = slugify(name)
  const outVideo = join(OUT_DIR, `${slug}.mp4`)
  const outPoster = join(OUT_DIR, `${slug}.jpg`)

  try {
    const info = await probe(src)
    const portrait = info.height > info.width
    const height = portrait ? PORTRAIT_HEIGHT : LANDSCAPE_HEIGHT

    if (DRY) {
      console.log(`  dry  ${name} → ${slug}.mp4 (${portrait ? "9:16" : "16:9"}, ${info.duration.toFixed(0)}s)`)
      results.push({ name, slug, portrait, duration: info.duration, bytes: 0 })
      return
    }

    await mkdir(OUT_DIR, { recursive: true })
    await encode(src, outVideo, height)
    await poster(src, outPoster, height, info.duration * POSTER_AT)

    const [master, variant] = await Promise.all([stat(src), stat(outVideo)])
    results.push({ name, slug, portrait, duration: info.duration, bytes: variant.size })
    console.log(
      `  ok   ${slug}.mp4  ${portrait ? "9:16" : "16:9"}  ${info.duration.toFixed(0)}s  ` +
        `${mb(master.size)} MB → ${mb(variant.size)} MB`,
    )
  } catch (error) {
    console.error(`  fail ${name}: ${error?.message ?? error}`)
  }
})

if (!DRY && results.length > 0) {
  console.log(`\nuploading ${results.length} film(s) to ${HOST}`)
  await run("ssh", ["-o", "BatchMode=yes", HOST, `mkdir -p ${REMOTE_ROOT}/${REMOTE_DIR}`])
  await run("rsync", ["-rt", `${OUT_DIR}/`, `${HOST}:${REMOTE_ROOT}/${REMOTE_DIR}/`], {
    maxBuffer: 1024 * 1024 * 16,
  })
}

// Printed rather than written into the case study: which film is the feature,
// which are the interviews, and what each one is called are editorial calls.
console.log(`\n─── ${CLIENT} ───`)
for (const item of results.sort((a, b) => Number(a.portrait) - Number(b.portrait))) {
  const url = `${BASE}/${REMOTE_DIR}/${item.slug}.mp4`
  console.log(`${item.portrait ? "9:16" : "16:9"}  ${item.duration.toFixed(0)}s  ${url}`)
}
