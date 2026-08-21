import { describe, expect, test } from 'bun:test'
import { reelDelivery } from './reels'
import manifest from './reels.manifest.json'

const BASE = manifest.base
const first = manifest.reels[0]

describe('reel delivery', () => {
  test('a manifested source resolves to its web variant and poster', () => {
    if (!first) return // nothing encoded yet; the rest of the suite still holds
    const delivery = reelDelivery(`${BASE}${first.source}`)
    expect(delivery.src).toContain('/web/')
    expect(delivery.src).toEndWith('.mp4')
    expect(delivery.poster).toEndWith('.jpg')
  })

  test('the CDN naming is matched whether the caller escapes it or not', () => {
    // Call sites carry the CDN's own filenames: %-escaped in the hand-authored
    // override lists, literal elsewhere. Both have to find the same entry.
    if (!first) return
    const escaped = `${BASE}/${first.source
      .replace(/^\/+/, '')
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`
    expect(reelDelivery(escaped).src).toBe(reelDelivery(`${BASE}${first.source}`).src)
  })

  test('the delivered URL is escaped, so a filename with spaces still resolves', () => {
    if (!first) return
    expect(reelDelivery(`${BASE}${first.source}`).src).not.toContain(' ')
  })

  test('an unencoded CDN reel keeps its source URL rather than a 404', () => {
    // The whole safety property of the manifest: a reel that has no variant on
    // disk is not listed, and must fall through untouched.
    const missing = `${BASE}/clients/NOPE/reels/not-encoded-yet.mp4`
    expect(reelDelivery(missing)).toEqual({ src: missing })
  })

  test('non-CDN sources pass through untouched', () => {
    const cloudinary = 'https://res.cloudinary.com/demo/video/upload/v1/clip.mp4'
    expect(reelDelivery(cloudinary)).toEqual({ src: cloudinary })
    expect(reelDelivery('folder/public-id')).toEqual({ src: 'folder/public-id' })
  })

  test('every manifest entry names a web variant, never a source', () => {
    for (const reel of manifest.reels) {
      expect(reel.web).toContain('/web/')
      expect(reel.poster).toContain('/web/')
      expect(reel.web).not.toBe(reel.source)
    }
  })
})
