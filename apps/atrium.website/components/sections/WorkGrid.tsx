'use client'
import { Eyebrow } from '@atrium/ui'
import { useEffect, useRef } from 'react'
import { OutlineCTA } from '@/components/ui/PillCTA'
import CasePanel, { CaseRow } from '@/components/work/CasePanel'
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
    <section className="bg-cream px-[var(--gutter)] py-20 md:py-28">
      <div>
        <div className="mx-auto mb-14 max-w-[var(--container-max)] md:mb-20">
          <Eyebrow className="mb-3">Selected Work</Eyebrow>
          <h2 className="max-w-3xl text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em]">
            See what changed. <em className="font-serif italic">Not just what shipped.</em>
          </h2>
          <div className="mt-10">
            <OutlineCTA href="/work">See all work</OutlineCTA>
          </div>
        </div>
      </div>

      {/* Inside the page container rather than full-bleed, so it starts on the
          same line as the heading. The rounded clip makes the two rows read as
          one block now that they no longer run to the screen edges. */}
      <div
        className="mx-auto max-w-[var(--container-max)] overflow-hidden rounded-card"
        ref={galleryRef}
      >
        <CaseRow tall>
          {topRow.map((project) => (
            <CasePanel
              detail={project.result}
              key={project.study.slug}
              revealClass="work-panel opacity-0"
              study={project.study}
            />
          ))}
        </CaseRow>
        <CaseRow>
          {bottomRow.map((project) => (
            <CasePanel
              detail={project.result}
              key={project.study.slug}
              revealClass="work-panel opacity-0"
              study={project.study}
            />
          ))}
        </CaseRow>
      </div>
    </section>
  )
}
