// ─── Cloudinary delivery layer (launch phase) ──────────────────────────────
// Assets live in Cloudinary (mastered in Dropbox). Set the cloud name via
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME. Later this whole module gets swapped for
// Cloudflare R2 + Stream without touching component call sites.
//
// Usage: pass a Cloudinary *public ID* (e.g. "clients/taco-naco/hero"), never
// a raw Dropbox link.

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
const BASE = `https://res.cloudinary.com/${CLOUD}`

export const cloudinaryConfigured = Boolean(CLOUD)

type ImageOpts = { width?: number; height?: number; crop?: 'fill' | 'fit' | 'limit' }

/** Build an optimized delivery URL for a Cloudinary image public ID. */
export function cldImageUrl(publicId: string, opts: ImageOpts = {}): string {
  const t = [
    'f_auto',
    'q_auto',
    opts.width ? `w_${opts.width}` : null,
    opts.height ? `h_${opts.height}` : null,
    opts.crop ? `c_${opts.crop}` : null,
  ]
    .filter(Boolean)
    .join(',')
  return `${BASE}/image/upload/${t}/${publicId}`
}

/**
 * next/image loader. Use with <Image loader={cloudinaryLoader} src={publicId} />.
 * Next passes the responsive width; we let Cloudinary format/quality auto.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  const t = ['f_auto', `q_${quality ?? 'auto'}`, `w_${width}`, 'c_limit'].join(',')
  return `${BASE}/image/upload/${t}/${src}`
}

function normalizeVideoPublicId(publicId: string): string {
  return publicId.trim().replace(/^\/+/, '').replace(/\.mp4$/i, '')
}

/** Optimized MP4 for a Cloudinary video public ID (adaptive HLS comes with the Cloudflare phase). */
export function cldVideoUrl(publicId: string): string {
  return `${BASE}/video/upload/f_auto,q_auto/${normalizeVideoPublicId(publicId)}.mp4`
}

/** Poster frame (first frame) for a Cloudinary video public ID. */
export function cldVideoPoster(publicId: string): string {
  return `${BASE}/video/upload/f_auto,q_auto,so_0/${normalizeVideoPublicId(publicId)}.jpg`
}
