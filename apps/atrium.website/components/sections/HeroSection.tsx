'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
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
            Smart Creative for Hospitality
          </Eyebrow>

          <h1
            className="mb-6 font-medium"
            style={{
              fontSize: 'var(--text-display-lg)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-on-dark)',
            }}
          >
            We use strategy, creative, and data to grow{' '}
            <em style={{ color: 'var(--mint-400)' }}>
              restaurants, hotels, and food brands.
            </em>
          </h1>

          <p
            className="mb-10 max-w-xl"
            style={{
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--text-on-dark)',
              opacity: 0.7,
            }}
          >
            One team. Full-stack. Hospitality is all we do.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button href="/work" variant="mint">See Our Work</Button>
            <Button href="/contact" variant="ghostLight">
              Let&apos;s Talk
            </Button>
          </div>
        </div>

        <div ref={tagsRef} className="flex flex-wrap gap-3 mt-16">
          {tags.map((tag) => (
            <div
              key={tag}
              className="px-5 py-2 text-sm font-medium rounded-full"
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
