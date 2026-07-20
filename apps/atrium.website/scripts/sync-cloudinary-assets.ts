#!/usr/bin/env bun
// ─── Cloudinary asset sync ──────────────────────────────────────────────────
// Lists every image + video in the Cloudinary account and groups them by
// folder, so case-study asset lists never have to be hand-copied.
//
//   bun run scripts/sync-cloudinary-assets.ts            # report only
//   bun run scripts/sync-cloudinary-assets.ts --write    # write generated file
//
// Needs in .env:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
//
// Output (--write): lib/cloudinary-assets.generated.ts, a map of
//   folder -> { images: string[]; videos: string[] } with clean public IDs.

import { writeFile } from 'node:fs/promises'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
const KEY = process.env.CLOUDINARY_API_KEY ?? ''
const SECRET = process.env.CLOUDINARY_API_SECRET ?? ''

if (!CLOUD || !KEY || !SECRET) {
  console.error(
    'Missing credentials. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.',
  )
  process.exit(1)
}

const WRITE = process.argv.includes('--write')
const AUTH = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString('base64')}`
const ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD}/resources/search`

// Cloudinary client folder code (cases/<CODE>/…) → case-study slug in work.ts.
const SLUG_MAP: Record<string, string> = {
  TNKC: 'taco-naco',
  TAHA: 'taha',
  AHAA: 'aahaa',
  DCOP: 'don-chuys',
  OSPZ: 'old-shawnee-pizza',
  CHWF: 'chick-in-waffle',
  JECA: 'jerusalem-cafe',
  FFRB: 'farm-fresh',
}

type Resource = {
  public_id: string
  resource_type: 'image' | 'video' | string
  asset_folder?: string
  folder?: string
}

type Bucket = { images: string[]; videos: string[] }

async function fetchAll(): Promise<Resource[]> {
  const out: Resource[] = []
  let cursor: string | undefined
  do {
    const body: Record<string, unknown> = {
      expression: 'resource_type:image OR resource_type:video',
      max_results: 500,
      sort_by: [{ public_id: 'asc' }],
    }
    if (cursor) body.next_cursor = cursor

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`Cloudinary search failed: ${res.status} ${await res.text()}`)
    }
    const json = (await res.json()) as { resources: Resource[]; next_cursor?: string }
    out.push(...json.resources)
    cursor = json.next_cursor
    process.stderr.write(`  fetched ${out.length} assets…\r`)
  } while (cursor)
  process.stderr.write('\n')
  return out
}

/** Folder for a resource: prefer asset_folder, fall back to a `/`-delimited
 *  public_id prefix, else 'root'. */
function folderOf(r: Resource): string {
  if (r.asset_folder) return r.asset_folder
  if (r.folder) return r.folder
  const slash = r.public_id.lastIndexOf('/')
  return slash > 0 ? r.public_id.slice(0, slash) : 'root'
}

/** Case-study slug for a resource, from its `cases/<CODE>/…` folder. Null when
 *  the folder isn't a known client (reported, never silently dropped). */
function slugOf(r: Resource): string | null {
  const parts = folderOf(r).split('/')
  const code = parts[0] === 'cases' ? parts[1] : parts[0]
  return (code && SLUG_MAP[code]) ?? null
}

type Grouped = { bySlug: Map<string, Bucket>; unmapped: Map<string, number> }

function group(resources: Resource[]): Grouped {
  const bySlug = new Map<string, Bucket>()
  const unmapped = new Map<string, number>()
  for (const r of resources) {
    const slug = slugOf(r)
    if (!slug) {
      const f = folderOf(r)
      unmapped.set(f, (unmapped.get(f) ?? 0) + 1)
      continue
    }
    const bucket = bySlug.get(slug) ?? { images: [], videos: [] }
    if (r.resource_type === 'video') bucket.videos.push(r.public_id)
    else bucket.images.push(r.public_id)
    bySlug.set(slug, bucket)
  }
  // Stable order within each case.
  for (const b of bySlug.values()) {
    b.images.sort()
    b.videos.sort()
  }
  return { bySlug, unmapped }
}

function report({ bySlug, unmapped }: Grouped): void {
  console.log('\nMapped cases:\n')
  for (const [slug, b] of [...bySlug.entries()].sort(([a], [c]) => a.localeCompare(c))) {
    console.log(`  ${slug.padEnd(20)} images:${String(b.images.length).padStart(4)}  videos:${String(b.videos.length).padStart(4)}`)
  }
  if (unmapped.size > 0) {
    console.log('\nUnmapped folders (add the client code to SLUG_MAP to include):\n')
    for (const [folder, count] of [...unmapped.entries()].sort(([a], [c]) => a.localeCompare(c))) {
      console.log(`  ${folder.padEnd(28)} ${count} assets`)
    }
  }
  const total = [...bySlug.values()].reduce((n, b) => n + b.images.length + b.videos.length, 0)
  console.log(`\n${bySlug.size} cases mapped, ${total} assets.`)
}

function serialize(bySlug: Map<string, Bucket>): string {
  const entries = [...bySlug.entries()].sort(([a], [b]) => a.localeCompare(b))
  const body = entries
    .map(([slug, b]) => {
      const imgs = b.images.map((id) => `      '${id}',`).join('\n')
      const vids = b.videos.map((id) => `      '${id}',`).join('\n')
      return `  '${slug}': {\n    images: [\n${imgs}\n    ],\n    videos: [\n${vids}\n    ],\n  },`
    })
    .join('\n')
  return `// AUTO-GENERATED by scripts/sync-cloudinary-assets.ts — do not edit by hand.
// Run \`bun run scripts/sync-cloudinary-assets.ts --write\` to refresh.
// Keyed by case-study slug; values are delivery-ready Cloudinary public IDs.

export type CaseAssets = { images: string[]; videos: string[] }

export const cloudinaryAssets: Record<string, CaseAssets> = {
${body}
}
`
}

const resources = await fetchAll()
const grouped = group(resources)
report(grouped)

if (WRITE) {
  const path = new URL('../lib/cloudinary-assets.generated.ts', import.meta.url)
  await writeFile(path, serialize(grouped.bySlug))
  console.log('\nWrote lib/cloudinary-assets.generated.ts')
} else {
  console.log('\n(report only — re-run with --write to generate lib/cloudinary-assets.generated.ts)')
}
