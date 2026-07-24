'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
import { CTA } from '@/lib/cta'
import { gsap } from '@/lib/gsap'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), { ssr: false })

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
      className="flex overflow-hidden relative flex-col justify-center pt-14 min-h-screen"
      style={{ background: '#0a0806' }}
    >
      <HeroScene />

      <div className="relative z-10 px-6 py-20 mx-auto w-full max-w-7xl md:px-16">
        <div ref={textRef} className="max-w-4xl">
          <Eyebrow className="mb-6" tone="onDark">
            The hospitality-only growth team
          </Eyebrow>

          <h1
            className="type-page-title mb-6"
            style={{
              color: 'var(--text-on-dark)',
            }}
          >
            Turn attention into reservations. And first visits into{' '}
            <em style={{ color: 'var(--mint-400)' }}>
              regulars.
            </em>
          </h1>

          <p
            className="type-lead mb-10 max-w-xl"
            style={{
              color: 'var(--text-on-dark)',
              opacity: 0.78,
            }}
          >
            One accountable team — strategy, content, Google, retention and reporting
            in a single system. Hospitality is all we do.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button href={CTA.primary.href} variant="mint">{CTA.primary.label}</Button>
            <Button href={CTA.proof.href} variant="ghostLight">{CTA.proof.label}</Button>
          </div>
        </div>

        <div ref={tagsRef} className="flex flex-wrap gap-3 mt-16">
          {tags.map((tag) => (
            <div
              key={tag}
              className="type-caption rounded-full px-5 py-2 font-medium"
              style={{
                background: 'rgba(228,238,240,0.07)',
                color: 'var(--mint-400)',
                border: '1px solid rgba(181,242,219,0.15)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
