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
}

// How far a hovered panel grows. The two-up row starts from a wider share, so
// it needs less growth than the three-up row to read as the same gesture.
// Written as whole literal classes because Tailwind scans for them as text.
const GROW_TWO_UP = 'md:hover:grow-[1.7] md:focus-within:grow-[1.7]'
const GROW_THREE_UP = 'md:hover:grow-[2.2] md:focus-within:grow-[2.2]'

const PANEL =
  'work-panel group relative block aspect-[16/10] overflow-hidden no-underline opacity-0 md:aspect-auto md:h-full md:flex-1 md:basis-0 md:transition-[flex-grow] md:duration-700 md:ease-atrium'

function Panel({ project, growClass }: { project: Project; growClass: string }) {
  return (
    <TransitionLink href={`/work/${project.study.slug}`} className={`${PANEL} ${growClass}`}>
      <CaseCover study={project.study} />

      {/* Sits above CaseCover's own scrim and logo layers, which end at z-20. */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6 pt-20 md:p-8 md:pt-28">
        <p className="m-0 text-[1.0625rem] font-medium leading-snug text-white md:text-[1.25rem]">
          {project.study.client}
        </p>
        <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-white/80 transition-all duration-500 md:max-h-0 md:translate-y-2 md:overflow-hidden md:opacity-0 md:group-focus-within:max-h-24 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:max-h-24 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          {project.result}
        </p>
      </div>
    </TransitionLink>
  )
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
          three. Within a row the panels share the width until one is hovered,
          which takes the space from its siblings — the row never reflows the
          page, and the two rows stay independent. */}
      <div ref={galleryRef}>
        <div className="flex w-full flex-col md:h-[52vh] md:flex-row">
          {topRow.map((project) => (
            <Panel growClass={GROW_TWO_UP} key={project.study.slug} project={project} />
          ))}
        </div>
        <div className="flex w-full flex-col md:h-[44vh] md:flex-row">
          {bottomRow.map((project) => (
            <Panel growClass={GROW_THREE_UP} key={project.study.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
