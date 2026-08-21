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

import { reelDelivery } from './reels'
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

  test('is reels only', () => {
    // A still among a wall of moving tiles reads as a video that failed to
    // start, which is why the hero was made video-only.
    expect(heroGalleryTiles.every((tile) => tile.kind === 'video')).toBe(true)
  })

  test('every reel has an optimized variant to play', () => {
    // The hero is the heaviest thing on the site. A tile whose source never got
    // encoded falls back to a ~17 MB delivery copy, which is the bill this was
    // meant to end.
    for (const tile of heroGalleryTiles) {
      expect(reelDelivery(tile.src).src).toContain('/web/')
    }
  })

  test('no two neighbouring tiles come from the same client', () => {
    // Tiles are dealt round-robin into three columns, so neighbours in this
    // list land in different columns — and a run of one client here would put
    // that brand down a whole column.
    const codes = heroGalleryTiles.map((tile) => tile.src.match(/\/clients\/([^/]+)\//)?.[1])
    for (let i = 1; i < codes.length; i += 1) expect(codes[i]).not.toBe(codes[i - 1])
  })

  test('contains no duplicate sources', () => {
    expect(new Set(heroGalleryTiles.map((tile) => tile.src)).size).toBe(heroGalleryTiles.length)
  })
})
