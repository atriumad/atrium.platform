'use client'

import { Eyebrow, NumberReel } from '@atrium/ui'
import CldImage from '@/components/media/CldImage'
import TransitionLink from '@/components/ui/TransitionLink'
import { relatedCaseBySlug } from '@/lib/services'
import { getCaseCover, getCaseStudy } from '@/lib/work'

// Connects a service to the case study that proves it (doc vs.md §1.6 / §9.7).
// Renders nothing when no mapping or case exists — safe to drop on every service.
export default function RelatedCase({ serviceSlug }: { serviceSlug: string }) {
  const caseSlug = relatedCaseBySlug[serviceSlug]
  if (!caseSlug) return null
  const study = getCaseStudy(caseSlug)
  if (!study) return null

  const metrics = study.metrics.slice(0, 3)
  const cover = getCaseCover(study)

  return (
    <section className="bg-cream px-[var(--gutter)] py-24 md:py-32">
      <div className="max-w-[var(--container-max)] mx-auto">
        <Eyebrow className="mb-8">Related case</Eyebrow>
        <TransitionLink
          href={`/work/${study.slug}`}
          className="group relative isolate overflow-hidden grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-end rounded-card border border-line p-8 md:p-12 min-h-[26rem] md:min-h-[32rem] transition-colors"
        >
          {cover.imageId && (
            <CldImage
              publicId={cover.imageId}
              alt=""
              fill
              sizes="(min-width: 768px) 72rem, 100vw"
              className="object-cover -z-20 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              style={{ objectPosition: cover.position }}
            />
          )}
          <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden="true" />

          <div className="flex flex-col gap-4">
            <span className="text-[0.875rem] font-medium text-cream/80">{study.client}</span>
            <h2 className="max-w-[18ch] text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15] text-cream">
              {study.resultHeadline}
            </h2>
            <span className="inline-flex items-center gap-2 mt-2 text-[0.875rem] text-cream/90 transition-transform group-hover:translate-x-1">
              Read the full case study
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          <div className="grid grid-cols-3 md:flex md:flex-col gap-6 md:gap-5 md:min-w-[13rem]">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-1">
                <span className="flex text-3xl md:text-4xl font-medium tabular-nums leading-none text-cream">
                  <NumberReel value={m.number} />
                </span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] leading-tight text-cream/70">{m.label}</span>
              </div>
            ))}
          </div>
        </TransitionLink>
      </div>
    </section>
  )
}
