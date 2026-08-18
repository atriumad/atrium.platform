import { describe, expect, test } from 'bun:test'
import { type CaseStudy, getCaseCover, isVideoLed } from './work'

const study = {
  slug: 'sample',
  client: 'Sample Client',
  category: 'Restaurant',
  serviceTags: [],
  resultHeadline: 'Result',
  story: [],
  metrics: [],
  order: 1,
} satisfies CaseStudy

describe('getCaseCover', () => {
  test('prefers explicit cover metadata', () => {
    expect(getCaseCover({
      ...study,
      coverImageId: 'clients/sample/cover',
      coverLogo: '/logos/clients/sample.svg',
      coverPosition: 'center 35%',
      galleryIds: ['clients/sample/gallery'],
    })).toEqual({
      imageId: 'clients/sample/cover',
      logo: '/logos/clients/sample.svg',
      position: 'center 35%',
    })
  })

  test('falls back to the first gallery image', () => {
    expect(getCaseCover({ ...study, galleryIds: ['clients/sample/gallery'] }).imageId)
      .toBe('clients/sample/gallery')
  })

  test('returns an empty image fallback without throwing', () => {
    expect(getCaseCover(study)).toEqual({ imageId: undefined, logo: undefined, position: 'center' })
  })
})

describe('isVideoLed', () => {
  test('true when there are videos and at most one gallery image', () => {
    expect(isVideoLed({ ...study, videoIds: ['a', 'b'], galleryIds: ['only-one'] })).toBe(true)
    expect(isVideoLed({ ...study, videoIds: ['a'], galleryIds: [] })).toBe(true)
    expect(isVideoLed({ ...study, videoIds: ['a'] })).toBe(true)
  })

  test('false when there are no videos', () => {
    expect(isVideoLed({ ...study, videoIds: [], galleryIds: [] })).toBe(false)
    expect(isVideoLed({ ...study })).toBe(false)
  })

  test('false when there is a real photo gallery, even with videos', () => {
    expect(isVideoLed({ ...study, videoIds: ['a', 'b'], galleryIds: ['one', 'two', 'three'] })).toBe(false)
  })
})

import { heroGalleryTiles } from './work'

describe('heroGalleryTiles', () => {
  test('returns a non-empty, capped list of deliverable sources', () => {
    expect(heroGalleryTiles.length).toBeGreaterThan(0)
    expect(heroGalleryTiles.length).toBeLessThanOrEqual(30)
    expect(heroGalleryTiles.every((tile) => tile.src.length > 0)).toBe(true)
  })

  test('every source is a finished URL', () => {
    // A bare Cloudinary public ID here is a broken tile above the fold: that
    // account is disabled. This is the regression that put seven of them there.
    expect(heroGalleryTiles.every((tile) => /^https?:\/\//i.test(tile.src))).toBe(true)
  })

  test('carries both photography and reels', () => {
    expect(heroGalleryTiles.some((tile) => tile.kind === 'image')).toBe(true)
    expect(heroGalleryTiles.some((tile) => tile.kind === 'video')).toBe(true)
  })

  test('photography outnumbers the reels', () => {
    const reels = heroGalleryTiles.filter((tile) => tile.kind === 'video').length
    expect(reels).toBeLessThan(heroGalleryTiles.length - reels)
  })

  test('spreads the reels across all three columns', () => {
    // Round-robin over three columns, so a reel period of three would stack
    // them all into one column.
    const reelColumns = new Set(
      heroGalleryTiles.flatMap((tile, index) => (tile.kind === 'video' ? [index % 3] : [])),
    )
    expect(reelColumns.size).toBe(3)
  })

  test('contains no duplicate sources', () => {
    expect(new Set(heroGalleryTiles.map((tile) => tile.src)).size).toBe(heroGalleryTiles.length)
  })
})
