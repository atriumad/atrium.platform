'use client'

import { useEffect, useRef } from 'react'
import { cldVideoPoster, cldVideoUrl } from '@/lib/cloudinary'

function BentoClip({ videoId }: { videoId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    void video.play().catch(() => undefined)
  }, [])

  return (
    <video
      ref={videoRef}
      src={cldVideoUrl(videoId, { width: 1200 })}
      poster={cldVideoPoster(videoId)}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
      className="block h-full w-full object-cover"
    />
  )
}

// Bento layout for video-led studies with too few clips for the hero+marquee
// treatment: one clip full-width on top, two side by side below.
export default function VideoBentoGrid({ ids }: { ids: string[] }) {
  const [top, bottomLeft, bottomRight] = ids
  if (!top) return null

  return (
    <section className="py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
      <div className="grid">
        <div className="overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <BentoClip videoId={top} />
        </div>

        {(bottomLeft || bottomRight) && (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {bottomLeft && (
              <div className="overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                <BentoClip videoId={bottomLeft} />
              </div>
            )}
            {bottomRight && (
              <div className="overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                <BentoClip videoId={bottomRight} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
