import { describe, expect, test } from 'bun:test'
import { cldImageUrl, cldVideoPoster, cldVideoUrl } from './cloudinary'

describe('Cloudinary delivery URLs', () => {
  test('strips a legacy version prefix so the id is not read as a folder', () => {
    // The bug this guards: next-cloudinary prepends its own `v1/`, so an
    // embedded `v123/` prefix becomes a (non-existent) folder and 404s.
    expect(cldImageUrl('v123/folder/clip')).not.toContain('/v123/')
    expect(cldImageUrl('v123/folder/clip')).toContain('folder/clip')
    expect(cldVideoUrl('v123/folder/clip')).not.toContain('/v123/')
    expect(cldVideoPoster('v123/folder/clip')).not.toContain('/v123/')
  })

  test('image URL targets the image endpoint with the requested width', () => {
    const url = cldImageUrl('folder/clip', { width: 800 })
    expect(url).toContain('/image/upload/')
    expect(url).toContain('w_800')
    expect(url).toContain('folder/clip')
  })

  test('video URL targets the video endpoint; poster is a first-frame jpg', () => {
    expect(cldVideoUrl('folder/clip')).toContain('/video/upload/')
    const poster = cldVideoPoster('folder/clip')
    expect(poster).toContain('/video/upload/')
    expect(poster).toContain('f_jpg')
    expect(poster).toContain('so_0')
  })

  test('trims whitespace and drops a trailing media extension', () => {
    expect(cldVideoUrl(' /v123/folder/clip.mp4 ')).not.toContain('/v123/')
    expect(cldVideoUrl(' /v123/folder/clip.mp4 ')).not.toContain('.mp4')
  })
})
