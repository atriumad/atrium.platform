'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
import CaseCover from '@/components/work/CaseCover'
import { gsap } from '@/lib/gsap'
import type { CaseStudy } from '@/lib/work'

export type Project = {
  study: CaseStudy
  result: string
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
            <h2 className="type-section-title">See what changed. <em>Not just what shipped.</em></h2>
          </div>
          <Button href="/work" variant="ghost" className="hidden md:flex">See all work →</Button>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <Link
              key={project.study.slug}
              href={`/work/${project.study.slug}`}
              className="work-card group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              style={{ background: 'var(--color-surface-alt)', opacity: 0 }}
            >
              <CaseCover study={project.study} className={aspectMap[project.orientation]} />
              <div className="p-6">
                <p className="type-card-title mb-1">{project.study.client}</p>
                <p className="type-caption" style={{ opacity: 0.72 }}>{project.result}</p>
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
