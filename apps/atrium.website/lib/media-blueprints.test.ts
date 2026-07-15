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

  test('recognizes a real silent video with an explicit audio mode', () => {
    const item: MediaBlueprint = {
      kind: 'device',
      assetType: 'reel',
      code: 'REEL 01',
      title: 'Service in motion',
      direction: 'Fast vertical edit from dinner service',
      ratio: '9:16',
      src: '/media/service-reel.mp4',
      alt: 'A sequence of silent dinner service shots',
      audio: 'silent',
    }

    expect(isRealMedia(item)).toBe(true)
  })

  test('recognizes a speech video with a required caption source', () => {
    const item: MediaBlueprint = {
      kind: 'cinematic',
      assetType: 'video',
      code: 'VIDEO 01',
      title: 'Operator interview',
      direction: 'Owner describes the launch strategy',
      ratio: '16:9',
      src: '/media/operator-interview.mp4',
      alt: 'Restaurant owner speaking in the dining room',
      audio: 'speech',
      captionsSrc: '/media/operator-interview.en.vtt',
      captionsLanguage: 'en-US',
      captionsLabel: 'English (US)',
    }

    expect(isRealMedia(item)).toBe(true)
  })

  test('requires caption media for speech video at the type boundary', () => {
    // @ts-expect-error -- Speech media must supply captionsSrc.
    const item: MediaBlueprint = {
      kind: 'cinematic',
      assetType: 'video',
      code: 'VIDEO 02',
      title: 'Uncaptioned interview',
      direction: 'This invalid fixture verifies the discriminated union',
      ratio: '16:9',
      src: '/media/uncaptioned-interview.mp4',
      alt: 'Restaurant owner speaking in the dining room',
      audio: 'speech',
    }

    expect(isRealMedia(item)).toBe(false)
  })

  test('requires every real video to declare its audio mode', () => {
    // @ts-expect-error -- Real video must explicitly declare silent or speech audio.
    const item: MediaBlueprint = {
      kind: 'device',
      assetType: 'reel',
      code: 'REEL 02',
      title: 'Unclassified reel',
      direction: 'This invalid fixture verifies explicit audio classification',
      ratio: '9:16',
      src: '/media/unclassified-reel.mp4',
      alt: 'A vertical reel from dinner service',
    }

    expect(isRealMedia(item)).toBe(false)
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
