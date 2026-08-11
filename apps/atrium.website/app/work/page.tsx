import { Eyebrow } from '@atrium/ui'
import type { Metadata } from 'next'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import CasePanel, { chunkRows, GROW_THREE_UP, GROW_TWO_UP } from '@/components/work/CasePanel'
import { CTA } from '@/lib/cta'
import { type CaseStudy, caseStudies, getCaseSummary } from '@/lib/work'

export const metadata: Metadata = {
  title: 'Atrium Case Studies — Hospitality Marketing Results',
  description:
    'Hospitality-only case studies from Atrium across brand, content, social, retention, and reporting — real restaurants and hotels, real systems, real results.',
  alternates: { canonical: '/work' },
}

const sortedCases = [...caseStudies].sort((a, b) => a.order - b.order)

// Rows alternate two-up and three-up, the same rhythm the home gallery uses.
const ROW_PATTERN = [2, 3, 2, 2]

/** The line a panel holds back until hover: the case's headline metric, or its
 *  sector when it has no metric to lead with. */
function panelDetail(study: CaseStudy): string {
  const metric = study.metrics[0]
  return metric ? `${metric.number} ${metric.label}` : study.category
}

export default function WorkPage() {
  const [featuredCase, ...archiveCases] = sortedCases
  const rows = chunkRows(archiveCases, ROW_PATTERN)

  return (
    <>
      <PageHero
        body="A visual archive of restaurant, hotel, and food brands built around measurable outcomes — not vanity metrics."
        eyebrow="OUR WORK"
        title={
          <>
            Hospitality only. <em className="font-serif italic">Results first.</em>
          </>
        }
      />

      {featuredCase && (
        <section className="bg-cream px-[var(--gutter)] py-24 md:py-32">
          <div className="mx-auto max-w-[var(--container-max)]">
            <div className="mb-12 md:mb-16">
              <Eyebrow className="mb-5">Featured case</Eyebrow>
              <h2 className="max-w-[20ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
                The work should look good.{' '}
                <em className="font-serif italic">The outcome should look better.</em>
              </h2>
            </div>

            <TransitionLink
              aria-label={`Read featured case study: ${featuredCase.client}`}
              className="group block no-underline"
              href={`/work/${featuredCase.slug}`}
            >
              <div className="h-[26rem] overflow-hidden rounded-card md:h-[34rem]">
                <CaseCover priority study={featuredCase} />
              </div>
              <div className="mt-7 grid gap-6 border-line border-t pt-7 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <h3 className="m-0 text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15] text-ink">
                    {featuredCase.client}
                  </h3>
                  <p className="mt-2 text-[0.875rem] text-muted">{featuredCase.category}</p>
                </div>
                <div className="lg:col-span-7">
                  <p className="m-0 max-w-2xl text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body">
                    {getCaseSummary(featuredCase)}
                  </p>
                  <p className="mt-4 text-[0.875rem] text-muted">
                    {featuredCase.serviceTags.join(' · ')}
                  </p>
                </div>
              </div>
            </TransitionLink>
          </div>
        </section>
      )}

      <section className="bg-cream pb-0">
        <div className="px-[var(--gutter)]">
          <div className="mx-auto mb-14 max-w-[var(--container-max)] border-line border-t pt-10 md:mb-20">
            <Eyebrow className="mb-5">Case study archive</Eyebrow>
            <h2 className="max-w-[16ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
              Different challenges. <em className="font-serif italic">Evidence in every story.</em>
            </h2>
          </div>
        </div>

        {/* Full-bleed and flush with the CTA below, same as the home gallery. */}
        {rows.map((row) => (
          <div
            className={`flex w-full flex-col md:flex-row ${row.length > 2 ? 'md:h-[44vh]' : 'md:h-[52vh]'}`}
            key={row.map((study) => study.slug).join('-')}
          >
            {row.map((study) => (
              <CasePanel
                detail={panelDetail(study)}
                growClass={row.length > 2 ? GROW_THREE_UP : GROW_TWO_UP}
                key={study.slug}
                study={study}
              />
            ))}
          </div>
        ))}
      </section>

      <CTABanner
        body="If your marketing has activity but not a clear story of growth, Atrium can rebuild the system around outcomes."
        coverAlt="A restaurant marketing result sheet being reviewed by the team"
        cta={CTA.primary.label}
        ctaExternal={CTA.primary.external}
        ctaHref={CTA.primary.href}
        eyebrow="NEXT STEP"
        headline={
          <>
            Build the case study <em>your restaurant deserves.</em>
          </>
        }
      />
    </>
  )
}
