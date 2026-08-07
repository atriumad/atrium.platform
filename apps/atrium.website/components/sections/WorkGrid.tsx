'use client'
import { Eyebrow } from '@atrium/ui'
import { useEffect, useRef } from 'react'
import TransitionCTA from '@/components/ui/TransitionCTA'
import TransitionLink from '@/components/ui/TransitionLink'
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
    <section className="bg-cream px-6 py-20 md:px-12 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-14">
          <div>
            <Eyebrow className="mb-3">Selected Work</Eyebrow>
            <h2 className="text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em]">
              See what changed. <em className="font-serif italic text-green">Not just what shipped.</em>
            </h2>
          </div>
          <TransitionCTA href="/work" variant="ghost" className="hidden md:flex">See all work →</TransitionCTA>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <TransitionLink
              key={project.study.slug}
              href={`/work/${project.study.slug}`}
              className="work-card group block overflow-hidden rounded-card bg-card opacity-0 shadow-soft transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            >
              <CaseCover study={project.study} className={aspectMap[project.orientation]} />
              <div className="p-6">
                <p className="mb-1 text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15]">{project.study.client}</p>
                <p className="text-[0.875rem] text-muted">{project.result}</p>
              </div>
            </TransitionLink>
          ))}
        </div>
        <div className="mt-10 md:hidden">
          <TransitionCTA href="/work" variant="ghost">See all work →</TransitionCTA>
        </div>
      </div>
    </section>
  )
}
