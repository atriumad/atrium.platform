// ─── Cloudinary delivery layer ─────────────────────────────────────────────
// URLs are built with the official `next-cloudinary` helpers. Set the cloud
// name via NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.
//
// Pass a Cloudinary *public ID* (e.g. "taco-naco/TNKC_FEB18_Slide_2"), never a
// raw Dropbox/Cloudinary URL.
//
// NOTE: next-cloudinary prepends its own `v1/` version segment, so a public ID
// that still carries an embedded `v<digits>/` prefix (the delivery version) is
// mis-read as a folder and 404s. `stripVersion` drops that prefix defensively
// so both clean IDs and legacy version-prefixed IDs resolve correctly.

import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

export const cloudinaryConfigured = Boolean(CLOUD)

/** Normalize a public ID: drop a leading `v1784223449/` delivery-version
 *  prefix and any trailing file extension (Cloudinary public IDs carry neither). */
function stripVersion(publicId: string): string {
  return publicId
    .trim()
    .replace(/^\/+/, '')
    .replace(/^v\d+\//, '')
    .replace(/\.(mp4|mov|webm|jpg|jpeg|png|webp|avif|gif)$/i, '')
}

type ImageOpts = { width?: number; height?: number; crop?: 'fill' | 'fit' | 'limit' }

/** Build an optimized delivery URL for a Cloudinary image public ID. */
export function cldImageUrl(publicId: string, opts: ImageOpts = {}): string {
  return getCldImageUrl({
    src: stripVersion(publicId),
    width: opts.width,
    height: opts.height,
    crop: opts.crop ?? 'limit',
  })
}

/** Optimized MP4 for a Cloudinary video public ID. */
export function cldVideoUrl(publicId: string): string {
  return getCldVideoUrl({ src: stripVersion(publicId) })
}

/** Poster frame for a Cloudinary video public ID (first frame). */
export function cldVideoPoster(publicId: string): string {
  return getCldImageUrl({
    src: stripVersion(publicId),
    assetType: 'video',
    format: 'jpg',
    rawTransformations: ['so_0'],
  })
}
