import { describe, expect, test } from 'bun:test'
import { type CaseStudy, getCaseCover } from './work'

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
