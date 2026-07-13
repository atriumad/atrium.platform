'use client'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
import { gsap } from '@/lib/gsap'

type Props = {
  eyebrow?: string
  headline: ReactNode
  body: string
  cta: string
  ctaHref: string
  ctaExternal?: boolean
  coverAlt: string
  bg?: string
}

export default function CTABanner({ eyebrow, headline, body, cta, ctaHref, ctaExternal, coverAlt }: Props) {
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
    <section className="px-6 md:px-12 py-24 md:py-32 overflow-hidden relative" style={{ background: 'var(--color-primary)' }}>
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, var(--color-accent) 0%, transparent 60%),
                            radial-gradient(circle at 70% 80%, var(--color-accent) 0%, transparent 50%)`,
        }}
      />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 flex flex-col gap-6">
          {eyebrow && <Eyebrow style={{ color: 'var(--color-text-light)' } as React.CSSProperties}>{eyebrow}</Eyebrow>}
          <h2 className="type-section-title" style={{ color: 'var(--color-text-light)' }}>{headline}</h2>
          <p className="type-body max-w-md" style={{ color: 'var(--color-text-light)', opacity: 0.76 }}>{body}</p>
          <div className="mt-2">
            <Button
              href={ctaHref}
              variant="ghostLight"
              {...(ctaExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {cta}
            </Button>
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
              <p className="type-caption max-w-[180px]" style={{ color: 'rgba(228,238,240,0.62)' }}>
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
