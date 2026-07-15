// @ts-ignore -- Bun provides this module at test runtime; the app does not install Bun's ambient types.
import { describe, expect, test } from 'bun:test'
import { blueprintLabel, isRealMedia, type MediaBlueprint } from './media-blueprints'

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
})
