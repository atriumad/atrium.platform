import { Eyebrow, NumberReel } from '@atrium/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CTABanner from '@/components/sections/CTABanner'
import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import DragGallery from '@/components/work/DragGallery'
import VideoBentoGrid from '@/components/work/VideoBentoGrid'
import VideoMarquee from '@/components/work/VideoMarquee'
import VideoShowcaseSection from '@/components/work/VideoShowcaseSection'
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
    <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0" aria-label="Services">
      {services.map((service, index) => (
        <li key={service} className="flex items-center gap-3 text-[0.875rem] text-muted">
          {index > 0 && <span aria-hidden="true">/</span>}
          {service}
        </li>
      ))}
    </ul>
  )
}

function CaseMedia({ study, compact = false }: { study: CaseStudy; compact?: boolean }) {
  return (
    <CaseCover
      study={study}
      priority={!compact}
      className={`${compact ? 'rounded-card-sm min-h-[20rem] md:min-h-[32rem]' : 'rounded-card aspect-[4/3] min-h-[25rem] lg:aspect-auto lg:min-h-[38rem]'}`}
    />
  )
}

export function CaseHero({ study }: { study: CaseStudy }) {
  return (
    <section className="bg-cream px-[var(--gutter)] pb-24 pt-32 md:pb-36 md:pt-40">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-16">
          <div className="h-full lg:col-span-8">
            <CaseMedia study={study} />
          </div>

          <div className="flex h-full flex-col justify-between gap-16 border-t border-line pt-8 lg:col-span-4">
            <div>
              <Eyebrow className="mb-6">
                Case {String(study.order).padStart(2, '0')} / {study.category}
              </Eyebrow>
              <h1 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
                {study.client}
              </h1>
            </div>

            <div>
              <p className="text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body">
                {getCaseSummary(study)}
              </p>
              <div className="mt-8 border-t border-line pt-6">
                <ServiceList services={study.serviceTags} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function StorySection({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section id="story" className="bg-dark px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid gap-10 border-t border-cream/20 pt-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow tone="on-dark" className="mb-6">The story</Eyebrow>
            <h2 className="max-w-[12ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
              From challenge to <em>working system.</em>
            </h2>
          </div>

          <div className="lg:col-span-7 lg:pt-14">
            {paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`m-0 border-b border-cream/20 py-7 first:pt-0 last:border-b-0 ${
                  index === 0
                    ? 'text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream'
                    : 'text-base leading-relaxed text-cream/70'
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
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
              <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
                The brand, <em>in frame.</em>
              </h2>
            </div>
            <p className="m-0 max-w-md text-base leading-relaxed text-muted lg:col-span-5">
              A visual record of the atmosphere, details, people, and moments that made the work recognizable.
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
            <h2 className="max-w-[10ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
              What we <em>changed.</em>
            </h2>
          </div>

          <div className="border-t border-line lg:col-span-8">
            {approach.map((step, index) => (
              <article
                key={step.title}
                className="grid gap-6 border-b border-line py-9 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-8 md:py-11"
              >
                <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="max-w-[22ch] text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15] text-ink">
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

function ReelsSection({ study }: { study: CaseStudy }) {
  if (!study.videoIds?.length) return null

  return (
    <section className="overflow-hidden bg-cream py-24 md:py-36">
      <div className="mx-auto mb-14 max-w-[var(--container-max)] px-[var(--gutter)] md:mb-20">
        <div className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">Reels and short-form video</Eyebrow>
            <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
              Built to move. <em>Made to repeat.</em>
            </h2>
          </div>
          <p className="m-0 max-w-md text-base leading-relaxed text-muted lg:col-span-5">
            A continuous stream of vertical stories designed for attention, consistency, and everyday brand recall.
          </p>
        </div>
      </div>

      <VideoMarquee publicIds={study.videoIds} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
          {metrics.map(metric => (
            <article
              key={`${metric.number}-${metric.label}`}
              className="grid min-h-[14rem] grid-cols-1 items-center gap-7 border-t border-cream/20 py-10 md:min-h-[17rem] md:grid-cols-[minmax(8rem,0.55fr)_minmax(0,1.45fr)] md:gap-8 md:py-12"
            >
              <p
                className="m-0 flex whitespace-nowrap font-normal italic leading-none tracking-[-0.065em] text-cream md:order-2 md:justify-end"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: getMetricFontSize(metric.number),
                  fontVariantNumeric: 'lining-nums tabular-nums',
                }}
              >
                <NumberReel value={metric.number} />
              </p>
              <p className="m-0 max-w-md text-base leading-relaxed text-cream/70 md:order-1">
                {metric.label}
              </p>
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
            <CaseMedia study={nextStudy} compact />
          </div>

          <div className="flex h-full flex-col justify-between gap-14 border-t border-line pt-8 lg:col-span-5">
            <div>
              <Eyebrow className="mb-5">Next case study</Eyebrow>
              <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
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
              <span className="mt-8 inline-flex items-center gap-3 text-[0.875rem] font-medium text-ink">
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
    <article className="bg-cream text-ink">
      <CaseHero study={study} />
      <StorySection paragraphs={getStoryParagraphs(study)} />
      {isVideoLed(study) ? (
        <>
          {(study.videoIds?.length ?? 0) <= 3 ? (
            <VideoBentoGrid ids={study.videoIds ?? []} />
          ) : (
            <VideoShowcaseSection study={study} />
          )}
          <ApproachSection study={study} />
        </>
      ) : (
        <>
          <PhotoGallerySection study={study} />
          <ApproachSection study={study} />
          <ReelsSection study={study} />
        </>
      )}
      <ResultsSection study={study} metrics={study.metrics} />
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
