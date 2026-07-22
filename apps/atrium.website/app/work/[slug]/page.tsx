import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'
import CaseCover from '@/components/work/CaseCover'
import DragGallery from '@/components/work/DragGallery'
import VideoMarquee from '@/components/work/VideoMarquee'
import { type CaseMetric, type CaseStudy, caseStudies, getCaseStudy, getCaseSummary } from '@/lib/work'

export async function generateStaticParams() {
  return caseStudies.map(study => ({ slug: study.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) return {}

  return {
    title: `${study.client} - Atrium Work`,
    description: getCaseSummary(study),
  }
}

function ServiceList({ services, dark = false }: { services: string[]; dark?: boolean }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0" aria-label="Services">
      {services.map((service, index) => (
        <li
          key={service}
          className="type-caption flex items-center gap-3"
          style={{ color: dark ? 'var(--mint-300)' : 'var(--text-muted)' }}
        >
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
      className={`rounded-[var(--radius-bento)] ${compact ? 'min-h-[20rem] md:min-h-[32rem]' : 'aspect-[4/3] min-h-[25rem] lg:aspect-auto lg:min-h-[38rem]'}`}
    />
  )
}

export function CaseHero({ study }: { study: CaseStudy }) {
  return (
    <section className="px-[var(--gutter)] pb-24 pt-32 md:pb-36 md:pt-40" style={{ background: 'var(--surface-page)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-16">
          <div className="h-full lg:col-span-8">
            <CaseMedia study={study} />
          </div>

          <div className="flex h-full flex-col justify-between gap-16 border-t pt-8 lg:col-span-4" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
            <div>
              <p className="type-eyebrow m-0 mb-6" style={{ color: 'var(--teal-500)' }}>
                Case {String(study.order).padStart(2, '0')} / {study.category}
              </p>
              <h1 className="type-section-title" style={{ color: 'var(--text-strong)' }}>
                {study.client}
              </h1>
            </div>

            <div>
              <p className="type-lead" style={{ color: 'var(--text-body)' }}>
                {getCaseSummary(study)}
              </p>
              <div className="mt-8 border-t pt-6" style={{ borderColor: 'rgba(7,47,52,0.14)' }}>
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
    <section id="story" className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid gap-10 border-t pt-8 lg:grid-cols-12 lg:gap-16" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
          <div className="lg:col-span-5">
            <Eyebrow className="mb-6">The story</Eyebrow>
            <h2 className="type-section-title max-w-[12ch]">
              From challenge to <em>working system.</em>
            </h2>
          </div>

          <div className="lg:col-span-7 lg:pt-14">
            {paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`${index === 0 ? 'type-lead' : 'type-body'} m-0 border-b py-7 first:pt-0 last:border-b-0`}
                style={{
                  borderColor: 'rgba(7,47,52,0.14)',
                  color: index === 0 ? 'var(--text-strong)' : 'var(--text-muted)',
                }}
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
    <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--surface-page)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-14 grid gap-8 border-t pt-8 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">Photo gallery</Eyebrow>
            <h2 className="type-section-title">
              The brand, <em>in frame.</em>
            </h2>
          </div>
          <p className="type-body m-0 max-w-md lg:col-span-5" style={{ color: 'var(--text-muted)' }}>
            A visual record of the atmosphere, details, people, and moments that made the work recognizable.
          </p>
        </div>

      </div>

      {/* Interactive draggable gallery — stock fillers until real assets land */}
      <div className="mt-14 overflow-hidden rounded-[var(--radius-bento)] md:mt-20">
        <DragGallery publicIds={study.galleryIds} images={study.gallery} />
      </div>
    </section>
  )
}

export function ApproachSection({ study }: { study: CaseStudy }) {
  const approach = study.howWeDidIt ?? []
  if (approach.length === 0) return null

  return (
    <section id="approach" className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--surface-page)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Eyebrow className="mb-6">The approach</Eyebrow>
            <h2 className="type-section-title max-w-[10ch]">
              What we <em>changed.</em>
            </h2>
          </div>

          <div className="border-t lg:col-span-8" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
            {approach.map((step, index) => (
              <article
                key={step.title}
                className="grid gap-6 border-b py-9 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-8 md:py-11"
                style={{ borderColor: 'rgba(7,47,52,0.18)' }}
              >
                <p className="type-eyebrow m-0" style={{ color: 'var(--teal-500)' }}>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="type-card-title max-w-[22ch]" style={{ color: 'var(--text-strong)' }}>
                    {step.title}
                  </h3>
                  <p className="type-body mt-5 max-w-3xl" style={{ color: 'var(--text-muted)' }}>
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
    <section className="overflow-hidden py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto mb-14 max-w-[var(--container-max)] px-[var(--gutter)] md:mb-20">
        <div className="grid gap-8 border-t pt-8 lg:grid-cols-12 lg:items-end lg:gap-16" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">Reels and short-form video</Eyebrow>
            <h2 className="type-section-title">
              Built to move. <em>Made to repeat.</em>
            </h2>
          </div>
          <p className="type-body m-0 max-w-md lg:col-span-5" style={{ color: 'var(--text-muted)' }}>
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
    <section id="results" className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--teal-900)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="grid gap-10 pb-16 lg:grid-cols-12 lg:gap-16 lg:pb-24">
          <div className="lg:col-span-7">
            <p className="type-eyebrow m-0 mb-6" style={{ color: 'var(--mint-400)' }}>
              Measurable growth
            </p>
            <h2 className="type-section-title" style={{ color: 'var(--text-on-dark)' }}>
              The work, <em>in numbers.</em>
            </h2>
          </div>
          <p className="type-lead m-0 lg:col-span-5 lg:self-end" style={{ color: 'var(--text-on-dark)', opacity: 0.72 }}>
            {study.resultHeadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
          {metrics.map(metric => (
            <article
              key={`${metric.number}-${metric.label}`}
              className="grid min-h-[14rem] grid-cols-1 items-center gap-7 border-t py-10 md:min-h-[17rem] md:grid-cols-[minmax(8rem,0.55fr)_minmax(0,1.45fr)] md:gap-8 md:py-12"
              style={{ borderColor: 'rgba(181,242,219,0.22)' }}
            >
              <p
                className="m-0 whitespace-nowrap font-normal italic leading-[0.76] tracking-[-0.065em] md:order-2 md:text-right"
                style={{
                  color: 'var(--mint-400)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: getMetricFontSize(metric.number),
                  fontVariantNumeric: 'lining-nums tabular-nums',
                }}
              >
                {metric.number}
              </p>
              <p className="type-body m-0 max-w-md md:order-1" style={{ color: 'var(--text-on-dark)', opacity: 0.78 }}>
                {metric.label}
              </p>
            </article>
          ))}
        </div>

        {study.takeaway && (
          <p
            className="type-lead m-0 mt-8 max-w-5xl border-t pt-10 md:mt-12 md:pt-14"
            style={{ borderColor: 'rgba(181,242,219,0.22)', color: 'var(--text-on-dark)', opacity: 0.78 }}
          >
            {study.takeaway}
          </p>
        )}
      </div>
    </section>
  )
}

export function NextCasePreview({ nextStudy }: { nextStudy: CaseStudy }) {
  return (
    <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-12 border-t pt-8 md:mb-16" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
          <Eyebrow>Continue exploring</Eyebrow>
        </div>

        <Link
          href={`/work/${nextStudy.slug}`}
          className="group grid grid-cols-1 gap-10 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-4 lg:grid-cols-12 lg:items-stretch lg:gap-16"
          aria-label={`Read next case study: ${nextStudy.client}`}
        >
          <div className="h-full lg:col-span-7">
            <CaseMedia study={nextStudy} compact />
          </div>

          <div className="flex h-full flex-col justify-between gap-14 border-t pt-8 lg:col-span-5" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
            <div>
              <p className="type-eyebrow m-0 mb-5" style={{ color: 'var(--teal-500)' }}>
                Next case study
              </p>
              <h2 className="type-section-title" style={{ color: 'var(--text-strong)' }}>
                {nextStudy.client}
              </h2>
            </div>

            <div>
              <p className="type-lead" style={{ color: 'var(--text-body)' }}>
                {getCaseSummary(nextStudy)}
              </p>
              <div className="mt-8 border-t pt-6" style={{ borderColor: 'rgba(7,47,52,0.14)' }}>
                <ServiceList services={nextStudy.serviceTags} />
              </div>
              <span className="type-caption mt-8 inline-flex items-center gap-3 font-medium" style={{ color: 'var(--teal-800)' }}>
                View case study
                <span className="transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true">
                  →
                </span>
              </span>
            </div>
          </div>
        </Link>
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
    <article style={{ background: 'var(--surface-page)', color: 'var(--text-strong)' }}>
      <CaseHero study={study} />
      <StorySection paragraphs={getStoryParagraphs(study)} />
      <PhotoGallerySection study={study} />
      <ApproachSection study={study} />
      <ReelsSection study={study} />
      <ResultsSection study={study} metrics={study.metrics} />
      <NextCasePreview nextStudy={nextStudy} />
      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Been burned by an agency <em>before?</em></>}
        body="If you've outgrown freelancers, been let down by generic agencies, or just want a team that reports revenue instead of vanity — we were built for you. See the system before you commit."
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </article>
  )
}
