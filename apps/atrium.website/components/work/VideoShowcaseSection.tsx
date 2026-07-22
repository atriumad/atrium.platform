'use client'

import { useEffect, useRef } from 'react'
import Eyebrow from '@/components/ui/Eyebrow'
import VideoMarquee from '@/components/work/VideoMarquee'
import { cldVideoPoster, cldVideoUrl } from '@/lib/cloudinary'
import type { CaseStudy } from '@/lib/work'

function CinematicHero({ videoId }: { videoId: string }) {
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
      // Capped to 1600px: a full-bleed hero rarely renders wider than that in
      // practice, and shipping the source resolution when the video plays far
      // smaller on screen is the main cause of stutter on slower connections.
      src={cldVideoUrl(videoId, { width: 1600 })}
      poster={cldVideoPoster(videoId)}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
      className="block h-[70vh] w-full object-cover md:h-[85vh]"
    />
  )
}

export default function VideoShowcaseSection({ study }: { study: CaseStudy }) {
  const videoIds = study.videoIds ?? []
  const [heroId, ...restIds] = videoIds
  if (!heroId) return null

  return (
    <section className="overflow-hidden" style={{ background: 'var(--cloud-100)' }}>
      <CinematicHero videoId={heroId} />

      <div className="mx-auto mt-14 max-w-[var(--container-max)] px-[var(--gutter)] md:mt-20">
        <div
          className="grid gap-8 border-t pt-8 lg:grid-cols-12 lg:items-end lg:gap-16"
          style={{ borderColor: 'rgba(7,47,52,0.18)' }}
        >
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">Reels and short-form video</Eyebrow>
            <h2 className="type-section-title">
              Built to move. <em>Made to repeat.</em>
            </h2>
          </div>
          <p className="type-body m-0 max-w-md lg:col-span-5" style={{ color: 'var(--text-muted)' }}>
            A continuous stream of vertical stories designed for attention, consistency, and everyday brand recall.
          </p>
        </div>
      </div>

      <VideoMarquee publicIds={restIds} />
    </section>
  )
}
