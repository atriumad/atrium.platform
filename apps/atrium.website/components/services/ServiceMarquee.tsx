'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import type { Service } from '@/lib/services'

type Props = { svc: Service }

export default function ServiceMarquee({ svc }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)
  const lastYRef = useRef(0)
  // Copies of the perks set rendered back-to-back. Needs enough to cover
  // viewport + one set so the wrap never reveals empty space.
  const [copies, setCopies] = useState(2)

  const items = svc.perks

  // Measure one set, compute how many copies fill the viewport (recompute on resize).
  // biome-ignore lint/correctness/useExhaustiveDependencies: recompute copies when the perks set changes
  useEffect(() => {
    const set = setRef.current
    if (!set) return
    const compute = () => {
      const setW = set.getBoundingClientRect().width
      if (setW === 0) return
      const needed = Math.ceil(window.innerWidth / setW) + 1
      setCopies((c) => (c === Math.max(2, needed) ? c : Math.max(2, needed)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [items])

  // Seamless infinite scroll: translate by exactly one set width and wrap.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart animation after copy count changes the track width
  useEffect(() => {
    const track = trackRef.current
    const set = setRef.current
    if (!track || !set) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const singleW = set.getBoundingClientRect().width
      if (singleW === 0) return
      let direction = -1

      const startAnim = (dir: number) => {
        gsap.to(track, {
          x: `${dir * singleW}`,
          duration: singleW / 40, // constant speed regardless of set width
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: (raw) => {
              const x = parseFloat(raw)
              const wrapped = (((x % singleW) + singleW) % singleW) - singleW
              return `${wrapped}px`
            },
          },
        })
      }

      startAnim(direction)

      const handleScroll = () => {
        const y = window.scrollY
        if (lastYRef.current === 0) lastYRef.current = y
        const delta = y - lastYRef.current
        if (Math.abs(delta) > 5) {
          const newDir = delta > 0 ? -1 : 1
          if (newDir !== direction) {
            direction = newDir
            gsap.killTweensOf(track)
            startAnim(direction)
          }
        }
        lastYRef.current = y
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    })

    return () => mm.revert()
  }, [copies])

  let keyCounter = 0

  return (
    <section className="overflow-hidden relative py-6 bg-teal-900">
      <div ref={trackRef} className="flex w-max will-change-transform">
        {Array.from({ length: copies }).map((_, copyIndex) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed structural copies
            key={copyIndex}
            ref={copyIndex === 0 ? setRef : undefined}
            className="flex gap-4 pr-4 shrink-0"
            aria-hidden={copyIndex > 0}
          >
            {items.map((item) => {
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
                  <span
                    className="type-caption whitespace-nowrap font-medium"
                    style={{ color: 'var(--mint-400)' }}
                  >
                    {item.title}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
