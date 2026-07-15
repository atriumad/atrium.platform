'use client'

import { useEffect, useMemo, useRef } from 'react'
import { cldVideoPoster, cldVideoUrl } from '@/lib/cloudinary'

// ─── Reels marquee — curved 3D auto-scroll ─────────────────────────────────
// Vertical (9:16) videos flow across a concave, perspective-curved wall (each
// card rotates toward the viewer by its distance from center). Every clip
// autoplays, muted, looping — no controls, no audio, no interaction.

export type Reel = { src: string; poster?: string }

type Props = {
  /** Cloudinary video public IDs — resolved to optimized MP4 internally (preferred). */
  publicIds?: string[] | undefined
  /** Explicit sources (src is any URL). */
  videos?: Reel[] | undefined
  /** Card height in px (width follows a 9:16 ratio). */
  height?: number
  gap?: number
  /** Scroll speed in px/second. */
  speed?: number
}

const STOCK: Reel[] = [
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
]

const MIN_ITEMS = 8
const MAX_ANGLE = 28 // degrees at the edges
const DEPTH = 240 // px pulled toward the viewer at the edges

export default function VideoMarquee({ publicIds, videos, height = 380, gap = 24, speed = 60 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])
  const videoRefs = useRef<HTMLVideoElement[]>([])
  const rafRef = useRef<number | undefined>(undefined)

  const width = Math.round((height * 9) / 16)

  const reels = useMemo<Reel[]>(() => {
    const base =
      publicIds && publicIds.length > 0
        ? publicIds.map((id) => ({ src: cldVideoUrl(id), poster: cldVideoPoster(id) }))
        : videos && videos.length > 0
          ? videos
          : STOCK
    const filled: Reel[] = []
    while (filled.length < MIN_ITEMS) filled.push(...base)
    // Two copies → seamless wrap by one set width.
    return [...filled, ...filled]
  }, [publicIds, videos])

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the resolved reel set changes
  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const trackGap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
    const setWidth = (track.scrollWidth + trackGap) / 2

    let x = 0
    let last = performance.now()

    const applyCurve = () => {
      const cw = container.getBoundingClientRect().width
      const center = cw / 2
      for (const card of cardRefs.current) {
        if (!card) continue
        const cardCenter = card.offsetLeft + x + width / 2
        const rel = Math.max(-1.25, Math.min(1.25, (cardCenter - center) / (cw / 2)))
        const arc = Math.abs(rel) ** 1.35
        const rotateY = -rel * MAX_ANGLE
        const translateZ = arc * DEPTH
        card.style.transform = `translateZ(${translateZ}px) rotateY(${rotateY}deg)`
      }
    }

    if (reduce) {
      applyCurve()
      return
    }

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      x -= speed * dt
      if (x <= -setWidth) x += setWidth
      track.style.transform = `translateX(${x}px)`
      applyCurve()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reels, speed, width])

  const reelCount = reels.length

  useEffect(() => {
    const container = containerRef.current
    if (!container || reelCount === 0) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      for (const video of videoRefs.current) video.pause()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined)
          } else {
            video.pause()
          }
        }
      },
      { root: container, rootMargin: '0px 40%', threshold: 0.01 },
    )

    for (const video of videoRefs.current) observer.observe(video)
    return () => observer.disconnect()
  }, [reelCount])

  cardRefs.current = []
  videoRefs.current = []

  return (
    <div className="overflow-hidden py-16 md:py-24">
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{ maxWidth: '1920px', height: `${height + 80}px`, perspective: '1600px', perspectiveOrigin: 'center' }}
      >
        <div
          ref={trackRef}
          className="absolute top-1/2 left-0 flex will-change-transform"
          style={{ gap: `${gap}px`, transformStyle: 'preserve-3d', translate: '0 -50%' }}
        >
          {reels.map((reel, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed repeated structural set
              key={i}
              ref={(el) => {
                if (el) cardRefs.current[i] = el
              }}
              className="shrink-0 overflow-hidden rounded-[var(--radius-md)]"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                background: 'rgba(255,255,255,0.04)',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
              }}
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current[i] = el
                }}
                src={reel.src}
                poster={reel.poster}
                muted
                loop
                playsInline
                preload="metadata"
                tabIndex={-1}
                aria-hidden="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
