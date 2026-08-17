'use client'

import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import { type CaseStudy, getCaseCover } from '@/lib/work'

/** The two claims that sit on the picture. A study that has not had its
 *  `highlights` written yet falls back to its first two metrics, so a card
 *  never renders empty while the numbers are still being gathered. */
function caseHighlights(study: CaseStudy): string[] {
  if (study.highlights?.length) return study.highlights.slice(0, 2)
  return study.metrics.slice(0, 2).map((metric) => `${metric.number} ${metric.label}`)
}

/** The reel that fills the card, or null to fall back to the cover photograph.
 *
 *  Only an absolute URL qualifies. `videoIds` still carries bare Cloudinary
 *  public IDs for the clients that have not moved to our CDN, and that account
 *  is disabled — building a delivery URL from one gives a video element that
 *  can only fail. Absolute means CDN-hosted, which means it plays. Migrate a
 *  client's reels and its card picks this up with no change here. */
function caseReel(study: CaseStudy): string | null {
  const first = study.videoIds?.[0]
  if (!first) return null
  return /^https?:\/\//i.test(first.trim()) ? first.trim() : null
}

/** Still frame to hold the card while the reel downloads. The reels are large
 *  files served straight from the CDN with no transcode, so without a poster
 *  the card sits black for as long as the first frame takes to arrive. Same
 *  absolute-URL rule as the reel: a Cloudinary ID would build a dead URL. */
function casePoster(study: CaseStudy): string | undefined {
  const cover = getCaseCover(study).imageId
  return cover && /^https?:\/\//i.test(cover.trim()) ? cover.trim() : undefined
}

/** One case study as a 9:16 card. The reel is the ground; the numbers sit on
 *  it and the name sits under it, so nothing competes with the footage. */
export default function CasePanel({
  study,
  revealClass = '',
}: {
  study: CaseStudy
  /** Hook and starting opacity for a scroll reveal. Cards without a reveal
   *  driving them must not start hidden, or they never appear. */
  revealClass?: string
}) {
  const highlights = caseHighlights(study)
  const reel = caseReel(study)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Five autoplaying reels on one row is a lot of decoding for footage that is
  // mostly off screen. Each one plays only while it is actually in view.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '200px' },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <TransitionLink
      className={`group block no-underline ${revealClass}`}
      href={`/work/${study.slug}`}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-card bg-dark">
        {reel ? (
          <>
            {/* No `controls` and no caption track: this is wallpaper, not a
                player. Left out of the tab order rather than aria-hidden,
                which would be wrong on an element that can take focus. */}
            <video
              className="absolute inset-0 h-full w-full object-cover"
              loop
              muted
              playsInline
              poster={casePoster(study)}
              preload="metadata"
              ref={videoRef}
              src={reel}
              tabIndex={-1}
            />
            {/* The reel is graded footage, so it needs less help than a photo,
                but the pills still land on whatever frame is playing. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <CaseCover
            scrimClassName="bg-black/35 transition-opacity duration-500 ease-atrium md:group-focus-visible:opacity-0 md:group-hover:opacity-0"
            study={study}
          />
        )}

        {highlights.length > 0 && (
          <ul className="absolute inset-x-0 bottom-0 z-30 m-0 flex list-none flex-col items-start gap-2 p-5">
            {highlights.map((highlight) => (
              <li
                className="rounded-full bg-cream px-3.5 py-1.5 text-[0.8125rem] text-charcoal leading-none"
                key={highlight}
              >
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* The label is taken out of the flow rather than sat beside the name.
          Sharing the row meant the longest client name lost the argument for
          width and wrapped the moment the label arrived. Now the name holds
          one line whatever its length, and the label comes in over it. */}
      <div className="relative mt-4 flex items-center">
        <p className="m-0 min-w-0 flex-1 truncate pr-8 text-[1.0625rem] text-charcoal leading-snug">
          {study.client}
        </p>

        <span className="absolute inset-y-0 right-0 flex items-center gap-1.5 text-charcoal">
          {/* Frosts whatever the label lands on. Masked so it dissolves in
              from the left instead of cutting the name at a hard edge. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 left-[-2.75rem] bg-cream/55 opacity-0 backdrop-blur-[3px] transition-opacity duration-300 ease-atrium group-focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 45%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 45%)',
            }}
          />

          {/* The arrow is always there, so the card reads as clickable before
              anyone touches it. Animating max-width rather than mounting the
              span keeps the arrow from jumping as the label arrives. */}
          <span className="relative max-w-0 overflow-hidden whitespace-nowrap text-[0.875rem] underline underline-offset-4 opacity-0 transition-all duration-300 ease-atrium group-focus-visible:max-w-[6rem] group-focus-visible:opacity-100 group-hover:max-w-[6rem] group-hover:opacity-100 motion-reduce:transition-none">
            See detail
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="relative h-4 w-4 transition-transform duration-300 ease-atrium group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </span>
      </div>
    </TransitionLink>
  )
}

/** Splits a list into gallery rows, cycling through a pattern of row sizes. */
export function chunkRows<T>(items: T[], pattern: number[]): T[][] {
  const rows: T[][] = []
  let index = 0
  let step = 0

  while (index < items.length) {
    const size = pattern[step % pattern.length] ?? 2
    rows.push(items.slice(index, index + size))
    index += size
    step += 1
  }

  return rows
}
