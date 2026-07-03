'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { Service } from '@/lib/services'

type Props = { svc: Service }

export default function ServiceMarquee({ svc }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const lastYRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const singleW = track.scrollWidth / 2
      let direction = -1

      const startAnim = (dir: number) => {
        gsap.to(track, {
          x: `${dir * singleW}`,
          duration: 40,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: (raw) => {
              const x = parseFloat(raw)
              const wrapped = ((x % singleW) + singleW) % singleW - singleW
              return `${wrapped}px`
            },
          },
        })
      }

      startAnim(direction)

      const handleScroll = () => {
        const dir = window.scrollY
        if (lastYRef.current === 0) lastYRef.current = dir

        const delta = dir - lastYRef.current
        if (Math.abs(delta) > 5) {
          const newDir = delta > 0 ? -1 : 1
          if (newDir !== direction) {
            direction = newDir
            gsap.killTweensOf(track)
            startAnim(direction)
          }
        }
        lastYRef.current = dir
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    })

    return () => mm.revert()
  }, [])

  const items = svc.perks

  let keyCounter = 0

  return (
    <section
      className="overflow-hidden relative py-6"
      style={{ background: 'var(--teal-900)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'var(--surface-grain)',
          backgroundSize: '380px auto',
          opacity: 0.05,
          mixBlendMode: 'overlay',
        }}
      />
      <div ref={trackRef} className="flex gap-4 w-max">
        {items.concat(items).map((item) => {
          const key = keyCounter++
          return (
            <div
              key={key}
              className="flex gap-3 items-center px-5 py-3 rounded-full shrink-0"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--mint-400)' }}>
                {item.title}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
