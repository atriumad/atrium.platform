// @ts-expect-error -- Bun provides this module at test runtime; the app does not install Bun's ambient types.
import { describe, expect, test } from 'bun:test'
import { blueprintLabel, isRealMedia, type MediaBlueprint } from './media-blueprints'

function mediaWith(src: string, alt: string): MediaBlueprint {
  return {
    kind: 'cinematic',
    assetType: 'photo',
    code: 'PHOTO 01',
    title: 'Kitchen in motion',
    direction: 'Dinner service',
    ratio: '16:9',
    src,
    alt,
  }
}

describe('media blueprints', () => {
  test('recognizes a planned blueprint', () => {
    const item: MediaBlueprint = {
      kind: 'cinematic',
      assetType: 'photo',
      code: 'PHOTO 01',
      title: 'Kitchen in motion',
      direction: 'Candid dinner service, warm light, hands and steam',
      ratio: '16:9',
    }
    expect(isRealMedia(item)).toBe(false)
    expect(blueprintLabel(item)).toBe('PHOTO 01 · 16:9')
  })

  test('recognizes real media', () => {
    const item: MediaBlueprint = {
      kind: 'cinematic',
      assetType: 'photo',
      code: 'PHOTO 01',
      title: 'Kitchen in motion',
      direction: 'Dinner service',
      ratio: '16:9',
      src: '/media/kitchen.jpg',
      alt: 'Chef plating during dinner service',
    }
    expect(isRealMedia(item)).toBe(true)
  })

  test('rejects real media with an empty src', () => {
    expect(isRealMedia(mediaWith('', 'Chef plating during dinner service'))).toBe(false)
  })

  test('rejects real media with a whitespace-only src', () => {
    expect(isRealMedia(mediaWith('   ', 'Chef plating during dinner service'))).toBe(false)
  })

  test('rejects real media with an empty alt', () => {
    expect(isRealMedia(mediaWith('/media/kitchen.jpg', ''))).toBe(false)
  })

  test('rejects real media with a whitespace-only alt', () => {
    expect(isRealMedia(mediaWith('/media/kitchen.jpg', '   '))).toBe(false)
  })
})
