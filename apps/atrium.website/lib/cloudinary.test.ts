import { describe, expect, test } from 'bun:test'
import { cldVideoPoster, cldVideoUrl } from './cloudinary'

describe('Cloudinary video delivery', () => {
  test('builds delivery URLs from canonical public IDs', () => {
    expect(cldVideoUrl('v123/folder/clip')).toEndWith('/video/upload/f_auto,q_auto/v123/folder/clip.mp4')
    expect(cldVideoPoster('v123/folder/clip')).toEndWith('/video/upload/f_auto,q_auto,so_0/v123/folder/clip.jpg')
  })

  test('normalizes path-form MP4 public IDs', () => {
    expect(cldVideoUrl(' /v123/folder/clip.mp4 ')).toEndWith('/video/upload/f_auto,q_auto/v123/folder/clip.mp4')
    expect(cldVideoPoster('/v123/folder/clip.mp4')).toEndWith('/video/upload/f_auto,q_auto,so_0/v123/folder/clip.jpg')
  })
})
