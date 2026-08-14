import { Eyebrow, NumberReel } from '@atrium/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CTABanner from '@/components/sections/CTABanner'
import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import DragGallery from '@/components/work/DragGallery'
import VideoMarquee from '@/components/work/VideoMarquee'
import { CTA } from '@/lib/cta'
import { type CaseMetric, type CaseStudy, caseStudies, getCaseStudy, getCaseSummary, isVideoLed } from '@/lib/work'

export async function generateStaticParams() {
  return caseStudies.map(study => ({ slug: study.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) return {}

  return {
    title: `${study.client} — Atrium Case Study`,
    description: getCaseSummary(study),
    alternates: { canonical: `/work/${slug}` },
  }
}

function ServiceList({ services }: { services: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0" aria-label="Services">
      {services.map((service) => (
        <li
          className="rounded-full border border-line px-3.5 py-1.5 text-[0.8125rem] text-body leading-none"
          key={service}
        >
          {service}
        </li>
      ))}
    </ul>
  )
}

/** Type only, then the work itself. The cover photograph is gone: the reels
 *  are the first thing a case study should show, and a still of the same
 *  footage above them was saying it twice. */
export function CaseHero({ study }: { study: CaseStudy }) {
  return (
    <section className="overflow-hidden bg-cream pt-32 pb-24 md:pt-40 md:pb-36">
      <div className="px-[var(--gutter)]">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="mb-6">{study.client}</Eyebrow>
          <h1 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-charcoal">
            {study.heroHeadline ?? study.client}
          </h1>
          <div className="mt-8">
            <ServiceList services={study.serviceTags} />
          </div>
        </div>
      </div>

      {study.videoIds?.length ? (
        <div className="mt-16 md:mt-20">
          <VideoMarquee publicIds={study.videoIds} />
        </div>
      ) : null}
    </section>
  )
}

/** The story as the two things a reader actually wants: what was wrong, and
 *  what we did about it. */
export function ChallengeSolutionSection({ study }: { study: CaseStudy }) {
  const challenge = study.challenge ?? study.story[0]
  const solution = study.solution ?? study.story[1] ?? study.story[0]
  if (!challenge) return null

  const columns = [
    { label: 'Challenge', body: challenge },
    { label: 'Solution', body: solution },
  ]

  return (
    <section id="story" className="bg-dark px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <Eyebrow tone="on-dark" className="mb-6">The story</Eyebrow>
          <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
            {study.storyHeadline ?? <>From challenge to <em>working system.</em></>}
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {columns.map(({ label, body }) => (
            <div className="border-t border-cream/20 pt-8" key={label}>
              <Eyebrow tone="on-dark" className="mb-6">{label}</Eyebrow>
              <p className="m-0 text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/80">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PhotoGallerySection({ study }: { study: CaseStudy }) {
  return (
    <section className="bg-cream py-24 md:py-36">
      <div className="px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-14 grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-6">Photo gallery</Eyebrow>
              <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-charcoal">
                The brand, <em>in frame.</em>
              </h2>
            </div>
            <p className="m-0 max-w-md text-base leading-relaxed text-muted lg:col-span-5">
              {study.galleryNote ??
                'A visual record of the atmosphere, details, people, and moments that made the work recognizable.'}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive draggable gallery — stock fillers until real assets land */}
      <div className="mt-14 overflow-hidden md:mt-20">
        <DragGallery publicIds={study.galleryIds} images={study.gallery} />
      </div>
    </section>
  )
}

export function ApproachSection({ study }: { study: CaseStudy }) {
  const approach = study.howWeDidIt ?? []
  if (approach.length === 0) return null

  return (
    <section id="approach" className="bg-cream px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Eyebrow className="mb-6">The approach</Eyebrow>
            <h2 className="max-w-[10ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-charcoal">
              What we <em>changed.</em>
            </h2>
          </div>

          <div className="border-t border-line lg:col-span-8">
            {approach.map((step, index) => (
              <article
                key={step.title}
                className="grid gap-6 border-b border-line py-9 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-8 md:py-11"
              >
                <p className="m-0 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="max-w-[22ch] text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15] text-charcoal">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ResultsSection({ study, metrics }: { study: CaseStudy; metrics: CaseMetric[] }) {
  if (metrics.length === 0) return null

  const getMetricFontSize = (value: string) => {
    if (value.length >= 8) return 'clamp(4rem, 5vw, 6rem)'
    if (value.length >= 6) return 'clamp(4.5rem, 5.8vw, 7rem)'
    return 'clamp(5rem, 6.5vw, 8rem)'
  }

  return (
    <section id="results" className="bg-dark px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid gap-10 pb-16 lg:grid-cols-12 lg:gap-16 lg:pb-24">
          <div className="lg:col-span-7">
            <Eyebrow tone="on-dark" className="mb-6">Measurable growth</Eyebrow>
            <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
              The work, <em>in numbers.</em>
            </h2>
          </div>
          <p className="m-0 text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/70 lg:col-span-5 lg:self-end">
            {study.resultHeadline}
          </p>
        </div>

        {/* One column per metric, number over label over detail. Three across
            is the shape the copy is written for — the label is a heading now,
            not a sentence, so setting it beside the figure wastes the width. */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-12 lg:gap-x-16">
          {metrics.map(metric => (
            <article
              key={`${metric.number}-${metric.label}`}
              className="flex flex-col gap-5 border-t border-cream/20 py-10 md:py-12"
            >
              <p
                className="m-0 flex whitespace-nowrap font-normal leading-none tracking-[-0.02em] text-cream"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: getMetricFontSize(metric.number),
                  fontVariantNumeric: 'lining-nums tabular-nums',
                }}
              >
                <NumberReel value={metric.number} />
              </p>
              <div>
                <p className="m-0 text-[0.8125rem] uppercase tracking-[0.12em] text-cream">
                  {metric.label}
                </p>
                {metric.detail && (
                  <p className="m-0 mt-3 max-w-sm text-base leading-relaxed text-cream/70">
                    {metric.detail}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {study.takeaway && (
          <p className="m-0 mt-8 max-w-5xl border-t border-cream/20 pt-10 text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/70 md:mt-12 md:pt-14">
            {study.takeaway}
          </p>
        )}
      </div>
    </section>
  )
}

export function TestimonialSection({ study }: { study: CaseStudy }) {
  const testimonial = study.testimonial
  if (!testimonial) return null

  return (
    <section className="bg-cream px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow className="mb-6">Client testimonial</Eyebrow>
        <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-charcoal">
          More than an agency. <em>A true partner.</em>
        </h2>

        <blockquote className="m-0 mt-10">
          <p className="m-0 text-[clamp(1.15rem,1.6vw,1.4rem)] leading-relaxed text-body">
            “{testimonial.quote}”
          </p>
          {/* `text-center` is set again here rather than inherited: the
              browser's own blockquote/footer styling resets alignment, so the
              attribution drifts left of the quote it belongs to. */}
          <footer className="mt-8 text-center">
            <p className="m-0 text-charcoal">{testimonial.name}</p>
            <p className="m-0 mt-1 font-serif text-muted italic">{testimonial.role}</p>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}

export function NextCasePreview({ nextStudy }: { nextStudy: CaseStudy }) {
  return (
    <section className="bg-cream px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-12 border-t border-line pt-8 md:mb-16">
          <Eyebrow>Continue exploring</Eyebrow>
        </div>

        <TransitionLink
          href={`/work/${nextStudy.slug}`}
          className="group grid grid-cols-1 gap-10 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-4 lg:grid-cols-12 lg:items-stretch lg:gap-16"
          aria-label={`Read next case study: ${nextStudy.client}`}
        >
          <div className="h-full lg:col-span-7">
            <CaseCover
              className="min-h-[20rem] rounded-card-sm md:min-h-[32rem]"
              study={nextStudy}
            />
          </div>

          <div className="flex h-full flex-col justify-between gap-14 border-t border-line pt-8 lg:col-span-5">
            <div>
              <Eyebrow className="mb-5">Next case study</Eyebrow>
              <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-charcoal">
                {nextStudy.client}
              </h2>
            </div>

            <div>
              <p className="text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body">
                {getCaseSummary(nextStudy)}
              </p>
              <div className="mt-8 border-t border-line pt-6">
                <ServiceList services={nextStudy.serviceTags} />
              </div>
              <span className="mt-8 inline-flex items-center gap-3 text-[0.875rem] text-charcoal">
                View case study
                <span className="transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true">
                  →
                </span>
              </span>
            </div>
          </div>
        </TransitionLink>
      </div>
    </section>
  )
}

export function getStoryParagraphs(study: CaseStudy) {
  const intro = study.intro ?? study.story[0] ?? study.resultHeadline
  return [intro, ...study.story].filter((paragraph, index, all) => all.indexOf(paragraph) === index)
}

export function getNextStudy(study: CaseStudy) {
  const sortedCases = [...caseStudies].sort((a, b) => a.order - b.order)
  const currentIndex = sortedCases.findIndex(item => item.slug === study.slug)
  return sortedCases[(currentIndex + 1) % sortedCases.length]
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) notFound()

  const nextStudy = getNextStudy(study)
  if (!nextStudy) notFound()

  return (
    <article className="bg-cream text-charcoal">
      {/* Hero carries the reels, so the page opens on the work itself. Then
          the story, the numbers, the pictures — the reels no longer need a
          section of their own further down. A video-led study has no photo
          shoot to build a gallery from, so that one section drops out. */}
      <CaseHero study={study} />
      <ChallengeSolutionSection study={study} />
      <ResultsSection study={study} metrics={study.metrics.slice(0, 3)} />
      {!isVideoLed(study) && <PhotoGallerySection study={study} />}
      <ApproachSection study={study} />
      <TestimonialSection study={study} />
      <NextCasePreview nextStudy={nextStudy} />
      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Been burned by an agency <em>before?</em></>}
        body="If you've outgrown freelancers, been let down by generic agencies, or just want a team that reports revenue instead of vanity — we were built for you. See the system before you commit."
        cta={CTA.primary.label}
        ctaHref={CTA.primary.href}
        ctaExternal={CTA.primary.external}
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </article>
  )
}
