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
