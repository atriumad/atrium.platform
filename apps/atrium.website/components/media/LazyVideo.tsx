'use client'

import { useEffect, useRef, useState } from 'react'
import { reelDelivery } from '@/lib/reels'

type Props = {
  /** CDN reel URL, or any other video source. */
  src: string
  className?: string | undefined
  /** Overrides the manifest's poster — pass one for non-CDN sources. Explicitly
   *  `| undefined` so a caller whose own lookup may come up empty can hand the
   *  result straight over under exactOptionalPropertyTypes. */
  poster?: string | undefined
  loop?: boolean
  muted?: boolean
  controls?: boolean
  /** Play as soon as the element is on screen. Off means it waits for the
   *  viewer to press play, which only makes sense with `controls`. */
  playWhenVisible?: boolean
  decorative?: boolean
  onEnded?: () => void
}

/** Nothing is fetched until the element is close to the viewport: a page with
 *  a dozen reels on it used to open a dozen connections on first paint. 200px
 *  of margin means the poster is in place before it is scrolled to. */
const ROOT_MARGIN = '200px'

// Autoplaying, muted, looping reels are decoration, and a page full of them is
// the site's heaviest thing by an order of magnitude. This keeps one rule for
// all of them: show a poster, attach the source only once the element is near
// the viewport, play only while it is actually on screen, and pause the moment
// it leaves so a marquee of twelve reels never decodes twelve at once.
export default function LazyVideo({
  src,
  className,
  poster,
  loop = true,
  muted = true,
  controls = false,
  playWhenVisible = true,
  decorative = true,
  onEnded,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  // `attached` gates the src: until the element has been near the viewport
  // once, the <video> carries a poster and nothing else.
  const [attached, setAttached] = useState(false)
  const delivery = reelDelivery(src)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    // No IntersectionObserver (old Safari, jsdom) — attach and let the browser
    // decide, which is the behaviour this replaced.
    if (typeof IntersectionObserver === 'undefined') {
      setAttached(true)
      return
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            setAttached(true)
            if (playWhenVisible && !reduce) void video.play().catch(() => undefined)
          } else if (!video.paused) {
            video.pause()
          }
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0.01 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [playWhenVisible])

  return (
    <video
      aria-hidden={decorative ? 'true' : undefined}
      className={className}
      controls={controls}
      loop={loop}
      muted={muted}
      onEnded={onEnded}
      playsInline
      poster={poster ?? delivery.poster}
      // The poster carries the frame, so there is nothing to preload before
      // the element is attached and nothing to prefetch once it is playing.
      preload="none"
      ref={ref}
      src={attached ? delivery.src : undefined}
      tabIndex={decorative ? -1 : undefined}
    />
  )
}
