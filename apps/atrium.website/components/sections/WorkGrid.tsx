'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
import { gsap } from '@/lib/gsap'

export type Project = {
  number: string
  client: string
  result: string
  cover: string
  href: string
  orientation: 'horizontal' | 'vertical' | 'square'
}

const aspectMap = { horizontal: 'aspect-[16/9]', vertical: 'aspect-[3/4]', square: 'aspect-square' }

export default function WorkGrid({ projects }: { projects: Project[] }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.work-card')
    const ctx = gsap.context(() => {
      gsap.fromTo(cards,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-14">
          <div>
            <Eyebrow className="mb-3">Selected Work</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-medium leading-tight">Results that speak.</h2>
          </div>
          <Button href="/work" variant="ghost" className="hidden md:flex">See all work →</Button>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <Link
              key={project.number}
              href={project.href}
              className="work-card group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              style={{ background: 'var(--color-surface-alt)', opacity: 0 }}
            >
              <div
                className={`${aspectMap[project.orientation]} relative flex items-end p-5`}
                style={{ background: i % 2 === 0 ? 'var(--color-forest)' : 'var(--color-forest-2)' }}
              >
                <span className="text-5xl font-medium leading-none" style={{ color: 'var(--color-accent)', opacity: 0.15 }}>
                  {project.number}
                </span>
              </div>
              <div className="p-6">
                <p className="text-lg font-medium mb-1">{project.client}</p>
                <p className="text-sm" style={{ opacity: 0.6 }}>{project.result}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 md:hidden">
          <Button href="/work" variant="ghost">See all work →</Button>
        </div>
      </div>
    </section>
  )
}
