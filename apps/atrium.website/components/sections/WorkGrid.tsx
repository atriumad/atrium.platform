'use client'
import { Eyebrow } from '@atrium/ui'
import { useEffect, useRef } from 'react'
import TransitionCTA from '@/components/ui/TransitionCTA'
import CasePanel, { GROW_THREE_UP, GROW_TWO_UP } from '@/components/work/CasePanel'
import { gsap } from '@/lib/gsap'
import type { CaseStudy } from '@/lib/work'

export type Project = {
  study: CaseStudy
  result: string
}

export default function WorkGrid({ projects }: { projects: Project[] }) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const topRow = projects.slice(0, 2)
  const bottomRow = projects.slice(2)

  useEffect(() => {
    if (!galleryRef.current) return
    const panels = galleryRef.current.querySelectorAll('.work-panel')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panels,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-cream pt-20 md:pt-28">
      {/* Gutter and container width live on the header, not the section: the
          gallery below has to reach both edges. Nested so the header lines up
          with the rest of the page's sections. */}
      <div className="px-[var(--gutter)]">
        <div className="mx-auto mb-14 max-w-[var(--container-max)] md:mb-20">
          <Eyebrow className="mb-3">Selected Work</Eyebrow>
          <h2 className="max-w-3xl text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em]">
            See what changed. <em className="font-serif italic">Not just what shipped.</em>
          </h2>
          <div className="mt-10">
            <TransitionCTA href="/work" variant="outline">
              See all work
            </TransitionCTA>
          </div>
        </div>
      </div>

      {/* Full-bleed, flush with the sections above and below: two panels over
          three. The two rows stay independent of each other. */}
      <div ref={galleryRef}>
        <div className="flex w-full flex-col md:h-[52vh] md:flex-row">
          {topRow.map((project) => (
            <CasePanel
              detail={project.result}
              growClass={GROW_TWO_UP}
              key={project.study.slug}
              revealClass="work-panel opacity-0"
              study={project.study}
            />
          ))}
        </div>
        <div className="flex w-full flex-col md:h-[44vh] md:flex-row">
          {bottomRow.map((project) => (
            <CasePanel
              detail={project.result}
              growClass={GROW_THREE_UP}
              key={project.study.slug}
              revealClass="work-panel opacity-0"
              study={project.study}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
