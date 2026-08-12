'use client'
import { Eyebrow } from '@atrium/ui'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import TransitionCTA from '@/components/ui/TransitionCTA'
import { CAL_CONFIG } from '@/lib/cal'
import { gsap } from '@/lib/gsap'

type Props = {
  eyebrow?: string
  headline: ReactNode
  body: string
  cta: string
  /** Real destination — also the fallback if the Cal.com embed script fails to load. */
  ctaHref: string
  /** When set, the CTA opens this Cal.com event as a popup instead of navigating. */
  ctaCalLink?: string
  ctaExternal?: boolean
  coverAlt: string
  bg?: string
}

export default function CTABanner({ eyebrow, headline, body, cta, ctaHref, ctaCalLink, ctaExternal, coverAlt }: Props) {
  const decorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!decorRef.current) return
    const ctx = gsap.context(() => {
      gsap.to(decorRef.current, {
        y: -30, ease: 'none',
        scrollTrigger: { trigger: decorRef.current as HTMLElement, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, decorRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="px-[var(--gutter)] py-24 md:py-32 overflow-hidden relative" style={{ background: 'var(--color-primary)' }}>
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, var(--color-accent) 0%, transparent 60%),
                            radial-gradient(circle at 70% 80%, var(--color-accent) 0%, transparent 50%)`,
        }}
      />
      <div className="max-w-[var(--container-max)] mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 flex flex-col gap-6">
          {eyebrow && <Eyebrow tone="on-dark">{eyebrow}</Eyebrow>}
          {/* Was .type-section-title, an older and larger scale than the rest
              of the site had moved to. */}
          <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
            {headline}
          </h2>
          <p className="max-w-md text-base leading-relaxed text-cream/[0.78]">{body}</p>
          <div className="mt-2">
            {ctaCalLink ? (
              <Button href={ctaHref} variant="ghostLight" data-cal-link={ctaCalLink} data-cal-config={CAL_CONFIG}>
                {cta}
              </Button>
            ) : (
              <TransitionCTA
                href={ctaHref}
                variant="ghostLight"
                {...(ctaExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {cta}
              </TransitionCTA>
            )}
          </div>
        </div>
        <div ref={decorRef} className="flex-1 flex justify-center">
          <div className="relative w-64 h-80 md:w-80 md:h-96">
            <div
              className="absolute inset-0 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(181,242,219,0.08) 0%, rgba(14,58,64,0.4) 100%)', border: '1px solid rgba(181,242,219,0.12)' }}
            />
            <div
              className="absolute top-6 left-6 right-6 bottom-6 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center"
              style={{ background: 'rgba(7,47,52,0.5)', backdropFilter: 'blur(4px)' }}
            >
              <span className="text-6xl font-serif italic leading-none" style={{ color: 'var(--color-accent)' }}>&</span>
              <p className="max-w-[180px] text-[0.875rem] text-cream/[0.62]">
                {coverAlt}
              </p>
              <div className="w-8 h-px" style={{ background: 'var(--color-accent)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
