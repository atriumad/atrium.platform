'use client'
import { Button, Eyebrow } from '@atrium/ui'
import { useEffect, useRef } from 'react'
import HeroPerspectiveGallery from '@/components/sections/HeroPerspectiveGallery'
import TransitionLink from '@/components/ui/TransitionLink'
import { CTA } from '@/lib/cta'
import { gsap } from '@/lib/gsap'
import { heroGalleryIds } from '@/lib/work'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(Array.from(textRef.current?.children ?? []), {
        y: 32, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.2,
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen overflow-hidden bg-dark pt-14 lg:h-screen"
    >
      <div className="flex w-full flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-center px-6 py-20 md:px-16 lg:w-1/2">
          <div ref={textRef} className="max-w-4xl">
            <Eyebrow className="mb-6" tone="on-dark">
              The hospitality-only growth team
            </Eyebrow>

            <h1 className="mb-6 text-[clamp(2.6rem,6vw,4.6rem)] font-normal leading-[1.02] tracking-[-0.02em] text-cream">
              Turn attention into reservations. And first visits into{' '}
              <em className="font-serif italic">regulars.</em>
            </h1>

            <p className="mb-10 max-w-lg text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/[0.78]">
              Strategy, content, Google, retention and reporting — one accountable
              team, one system.
            </p>

            {/* One button, one link: the pair used to read as two competing
                choices. The link carries the same weight as body text. */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button href={CTA.primary.href} target="_blank" rel="noopener noreferrer" variant="accent">
                {CTA.primary.label}
              </Button>
              <TransitionLink
                href={CTA.proof.href}
                className="group inline-flex items-center gap-2 text-[0.9375rem] text-cream/[0.78] underline decoration-cream/25 underline-offset-[6px] transition-colors hover:text-mint hover:decoration-mint/50"
              >
                {CTA.proof.label}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </TransitionLink>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2">
          <HeroPerspectiveGallery publicIds={heroGalleryIds} />
        </div>
      </div>
    </section>
  )
}
