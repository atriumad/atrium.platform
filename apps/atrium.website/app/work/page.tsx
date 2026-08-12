import { Eyebrow } from '@atrium/ui'
import type { Metadata } from 'next'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import WorkStoryBlock from '@/components/work/WorkStoryBlock'
import { CTA } from '@/lib/cta'
import { type CaseStudy, caseStudies, getCaseSummary } from '@/lib/work'
import { workStories } from '@/lib/work-stories'

export const metadata: Metadata = {
  title: 'Atrium Case Studies — Hospitality Marketing Results',
  description:
    'Hospitality-only case studies from Atrium across brand, content, social, retention, and reporting — real restaurants and hotels, real systems, real results.',
  alternates: { canonical: '/work' },
}

const sortedCases = [...caseStudies].sort((a, b) => a.order - b.order)

/** One line of the full archive. The gallery above is the argument; this is
 *  the reference — scannable, every case, no pictures competing for the eye. */
function CaseIndexRow({ study, index }: { study: CaseStudy; index: number }) {
  const metric = study.metrics[0]

  return (
    <TransitionLink
      aria-label={`Read case study: ${study.client}`}
      className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-3 border-line border-b py-7 no-underline last:border-b-0 lg:grid-cols-[3rem_minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,1fr)_auto]"
      href={`/work/${study.slug}`}
    >
      <p className="m-0 font-serif text-[1.35rem] leading-none text-muted italic">
        {String(index + 1).padStart(2, '0')}
      </p>

      <div>
        <h3 className="m-0 text-[1.25rem] font-medium leading-[1.2] text-ink">{study.client}</h3>
        <p className="mt-1.5 text-[0.875rem] text-muted">{study.category}</p>
      </div>

      {metric ? (
        <p className="m-0 text-[0.9375rem] text-body">
          <span className="font-medium text-ink">{metric.number}</span> {metric.label}
        </p>
      ) : (
        <span />
      )}

      <p className="m-0 text-[0.875rem] text-muted">{study.serviceTags.slice(0, 3).join(' · ')}</p>

      <span
        aria-hidden="true"
        className="text-xl text-ink transition-transform duration-300 group-hover:translate-x-2"
      >
        →
      </span>
    </TransitionLink>
  )
}

export default function WorkPage() {
  const [featuredCase] = sortedCases
  // A story only renders if its case study still exists to link to.
  const stories = workStories.flatMap((story) => {
    const study = sortedCases.find((item) => item.slug === story.slug)
    return study ? [{ story, study }] : []
  })

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

      <section className="bg-cream px-[var(--gutter)] pt-24 md:pt-32">
        <div className="mx-auto max-w-[var(--container-max)] border-line border-t pt-10">
          <Eyebrow className="mb-5">How the work runs</Eyebrow>
          <h2 className="max-w-[18ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
            Different challenges. <em className="font-serif italic">Evidence in every story.</em>
          </h2>
          <p className="mt-6 max-w-2xl text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body">
            Two engagements, told the short way: what the room looked like when we arrived, how the
            work was actually run, and the pieces that came out of it.
          </p>
        </div>
      </section>

      {stories.map((entry, index) => (
        <WorkStoryBlock
          index={index}
          key={entry.story.slug}
          story={entry.story}
          study={entry.study}
        />
      ))}

      {/* The complete list, including the cases shown above. The gallery sells;
          this is for the visitor who wants to find a specific kind of client. */}
      <section className="bg-cream px-[var(--gutter)] py-24 md:py-32">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-12 md:mb-16">
            <Eyebrow className="mb-5">Full archive</Eyebrow>
            <h2 className="max-w-[18ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
              Every case, <em className="font-serif italic">start to finish.</em>
            </h2>
          </div>

          <div className="border-line border-t">
            {sortedCases.map((study, index) => (
              <CaseIndexRow index={index} key={study.slug} study={study} />
            ))}
          </div>
        </div>
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
