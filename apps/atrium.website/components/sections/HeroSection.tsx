'use client'
import { Button, Eyebrow } from '@atrium/ui'
import { useEffect, useRef } from 'react'
import HeroPerspectiveGallery from '@/components/sections/HeroPerspectiveGallery'
import TransitionCTA from '@/components/ui/TransitionCTA'
import { CTA } from '@/lib/cta'
import { gsap } from '@/lib/gsap'
import { heroGalleryIds } from '@/lib/work'

const tags = [
  'Hospitality-only expertise',
  'Full-stack creative + systems',
  'Every dollar tracked to revenue',
]

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current || !tagsRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(Array.from(textRef.current?.children ?? []), {
        y: 32, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.2,
      })
      gsap.from(Array.from(tagsRef.current?.children ?? []), {
        y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 1,
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

            <p className="mb-10 max-w-xl text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/[0.78]">
              One accountable team — strategy, content, Google, retention and reporting
              in a single system. Hospitality is all we do.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button href={CTA.primary.href} target="_blank" rel="noopener noreferrer" variant="accent">
                {CTA.primary.label}
              </Button>
              <TransitionCTA href={CTA.proof.href} variant="ghostLight">
                {CTA.proof.label}
              </TransitionCTA>
            </div>
          </div>

          <div ref={tagsRef} className="flex flex-wrap gap-3 mt-16">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-cream/15 bg-cream/[0.07] px-5 py-2 text-[0.875rem] font-medium text-mint"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2">
          <HeroPerspectiveGallery publicIds={heroGalleryIds} />
        </div>
      </div>
    </section>
  )
}
