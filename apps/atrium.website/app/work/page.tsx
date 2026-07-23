import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'
import CaseCover from '@/components/work/CaseCover'
import { type CaseStudy, caseStudies, getCaseSummary } from '@/lib/work'

export const metadata: Metadata = {
  title: 'Atrium Case Studies — Hospitality Marketing Results',
  description: 'Hospitality-only case studies from Atrium across brand, content, social, retention, and reporting — real restaurants and hotels, real systems, real results.',
  alternates: { canonical: '/work' },
}

const sortedCases = [...caseStudies].sort((a, b) => a.order - b.order)

function CaseVisual({ study, index, featured = false }: { study: CaseStudy; index: number; featured?: boolean }) {
  return (
    <CaseCover
      study={study}
      priority={featured}
      className={`rounded-[var(--radius-bento)] lg:aspect-auto ${featured ? 'aspect-[16/10] min-h-[24rem] lg:min-h-[32rem]' : index % 2 === 0 ? 'aspect-[16/10] lg:min-h-[30rem]' : 'aspect-[4/3] lg:min-h-[30rem]'}`}
    />
  )
}

function ServiceList({ services }: { services: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0" aria-label="Services">
      {services.map((service, index) => (
        <li key={service} className="type-caption flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {service}
        </li>
      ))}
    </ul>
  )
}

function CaseText({ study }: { study: CaseStudy }) {
  return (
    <div className="flex h-full flex-col justify-between gap-14 border-t pt-8" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
      <h3 className="type-section-title" style={{ color: 'var(--text-strong)' }}>
        {study.client}
      </h3>

      <div>
        <p className="type-lead" style={{ color: 'var(--text-body)' }}>
          {getCaseSummary(study)}
        </p>
        <div className="mt-8 border-t pt-6" style={{ borderColor: 'rgba(7,47,52,0.14)' }}>
          <ServiceList services={study.serviceTags} />
        </div>
      </div>
    </div>
  )
}

export default function WorkPage() {
  const [featuredCase, ...archiveCases] = sortedCases

  return (
    <>
      <PageHero
        eyebrow="OUR WORK"
        title={<>Hospitality only. <em>Results first.</em></>}
        body="A visual archive of restaurant, hotel, and food brands built around measurable outcomes — not vanity metrics."
        actions={[{ label: 'Start a project', href: '/contact' }]}
      />

      {featuredCase && (
        <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--surface-page)' }}>
          <div className="mx-auto max-w-[var(--container-max)]">
            <div className="mb-12 border-t pt-8 md:mb-16" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
              <Eyebrow className="mb-6">Featured case</Eyebrow>
              <div className="grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16">
                <h2 className="type-section-title lg:col-span-8">
                  The work should look good. <em>The outcome should look better.</em>
                </h2>
                <p className="type-body max-w-md lg:col-span-4 lg:pb-2" style={{ color: 'var(--text-muted)' }}>
                  Strategy, creative, and operating systems documented with the proof behind them.
                </p>
              </div>
            </div>

            <Link
              href={`/work/${featuredCase.slug}`}
              className="group grid grid-cols-1 gap-10 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-4 lg:grid-cols-12 lg:items-stretch lg:gap-16"
              aria-label={`Read featured case study: ${featuredCase.client}`}
            >
              <div className="h-full lg:col-span-8">
                <CaseVisual study={featuredCase} index={0} featured />
              </div>
              <div className="h-full lg:col-span-4">
                <CaseText study={featuredCase} />
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-20 border-t pt-8 md:mb-28" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
            <Eyebrow className="mb-5">Case study archive</Eyebrow>
            <h2 className="type-section-title max-w-[14ch]">
              Different challenges. <em>Evidence in every story.</em>
            </h2>
          </div>

          <div className="space-y-24 md:space-y-36">
            {archiveCases.map((study, index) => {
              const visualOnRight = index % 2 === 1
              return (
                <Link
                  key={study.slug}
                  href={`/work/${study.slug}`}
                  className="group grid grid-cols-1 gap-9 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-4 lg:grid-cols-12 lg:items-stretch lg:gap-16"
                  style={{ borderColor: 'rgba(7,47,52,0.18)' }}
                  aria-label={`Read case study: ${study.client}`}
                >
                  <div className={`h-full lg:col-span-7 ${visualOnRight ? 'lg:order-2' : ''}`}>
                    <CaseVisual study={study} index={index + 1} />
                  </div>

                  <div className={`h-full lg:col-span-5 ${visualOnRight ? 'lg:order-1' : ''}`}>
                    <CaseText study={study} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="NEXT STEP"
        headline={<>Build the case study <em>your restaurant deserves.</em></>}
        body="If your marketing has activity but not a clear story of growth, Atrium can rebuild the system around outcomes."
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="A restaurant marketing result sheet being reviewed by the team"
      />
    </>
  )
}
