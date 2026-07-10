import { Button, Chip } from '@atrium/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import CaseGallery from '@/components/work/CaseGallery'
import { type CaseMetric, type CaseStudy, caseStudies, getCaseStudy } from '@/lib/work'

export async function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) return {}
  return {
    title: `${study.client} - Atrium Work`,
    description: study.resultHeadline,
  }
}

const fallbackMetric: CaseMetric = {
  number: 'TBD',
  label: 'Result details pending final media package',
}
const storyStageLabels = ['Starting point', 'System built', 'Proof of growth', 'What changed', 'Takeaway']

function CaseHero({ study, metrics }: { study: CaseStudy; metrics: CaseMetric[] }) {
  return (
    <PageHero
      eyebrow={`Case ${String(study.order).padStart(2, '0')} / ${study.category}`}
      title={study.client}
      body={study.resultHeadline}
      actions={[
        { label: 'Read the story', href: '#story' },
        { label: 'View results', href: '#results', variant: 'ghostLight' },
      ]}
      stats={metrics.slice(0, 3).map((metric) => ({ value: metric.number, label: metric.label }))}
    />
  )
}

function StorySection({ study, intro, storyBody }: { study: CaseStudy; intro: string; storyBody: string[] }) {
  const paragraphs = [intro, ...storyBody].filter((paragraph, index, all) => all.indexOf(paragraph) === index)

  return (
    <section id="story" className="px-[var(--gutter)] py-20 md:py-28" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div className="min-w-0">
          <h2
            className="m-0 max-w-[13ch] text-[2.65rem] font-medium leading-[0.98] md:text-[3.45rem]"
            style={{ color: 'var(--text-strong)', letterSpacing: 0 }}
          >
            The problem, the operating system, the proof.
          </h2>
          <p className="m-0 mt-6 max-w-sm text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {study.client} did not need more disconnected activity. The work was to make the brand easier to recognize, manage, and measure.
          </p>
        </div>

        <div className="min-w-0 border-t" style={{ borderColor: 'rgba(7,47,52,0.14)' }}>
          {paragraphs.map((paragraph, index) => (
            <article
              key={paragraph}
              className="grid grid-cols-1 gap-5 border-b py-7 md:grid-cols-[minmax(10rem,0.42fr)_minmax(0,1fr)] md:gap-10"
              style={{ borderColor: 'rgba(7,47,52,0.14)' }}
            >
              <div className="flex min-w-0 items-center gap-3 md:items-start">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: 'var(--mint-300)', color: 'var(--teal-800)' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="m-0 text-sm font-semibold uppercase" style={{ color: 'var(--teal-500)', letterSpacing: 'var(--tracking-wider)' }}>
                  {storyStageLabels[index] ?? `Layer ${index + 1}`}
                </h3>
              </div>
              <p
                className={index === 0 ? 'm-0 max-w-2xl text-xl font-medium leading-snug md:text-2xl' : 'm-0 max-w-2xl text-base leading-relaxed md:text-lg'}
                style={{ color: index === 0 ? 'var(--text-strong)' : 'var(--text-muted)' }}
              >
                {paragraph}
              </p>
            </article>
          ))}

          <div className="grid grid-cols-1 gap-5 py-7 md:grid-cols-[minmax(10rem,0.42fr)_minmax(0,1fr)] md:gap-10">
            <p className="m-0 text-sm font-semibold uppercase" style={{ color: 'var(--teal-500)', letterSpacing: 'var(--tracking-wider)' }}>
              Services
            </p>
            <div className="flex flex-wrap gap-2">
              {study.serviceTags.map((tag) => (
                <Chip key={tag} variant="outline-soft" size="sm">
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScopeSection({ study }: { study: CaseStudy }) {
  const approach = study.howWeDidIt ?? []
  if (approach.length === 0) return null

  return (
    <section id="approach" className="px-[var(--gutter)] py-20 md:py-28" style={{ background: 'var(--surface-page)' }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div className="min-w-0">
          <h2 className="m-0 max-w-[13ch] text-[2.5rem] font-medium leading-none md:text-[3.25rem]" style={{ color: 'var(--text-strong)', letterSpacing: 0 }}>
            How we built it.
          </h2>
          <p className="m-0 mt-6 max-w-sm text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Each case breaks down the strategic moves behind the result. No generic service menu, just the operating decisions that mattered.
          </p>
        </div>

        <div className="min-w-0 border-t" style={{ borderColor: 'rgba(7,47,52,0.14)' }}>
          {approach.map((step, index) => (
            <article
              key={step.title}
              className="grid grid-cols-1 gap-5 border-b py-7 md:grid-cols-[minmax(4rem,0.2fr)_minmax(0,1fr)] md:gap-10"
              style={{ borderColor: 'rgba(7,47,52,0.14)' }}
            >
              <p className="m-0 text-sm font-semibold" style={{ color: 'var(--teal-500)' }}>
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="min-w-0">
                <h3 className="m-0 text-2xl font-medium leading-tight" style={{ color: 'var(--text-strong)' }}>
                  {step.title}
                </h3>
                <p className="m-0 mt-4 max-w-3xl text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResultsSection({ study, metrics }: { study: CaseStudy; metrics: CaseMetric[] }) {
  return (
    <section id="results" className="px-[var(--gutter)] py-20 md:py-28" style={{ background: 'var(--teal-900)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] md:items-end">
          <div>
            <h2 className="m-0 max-w-[12ch] text-[2.75rem] font-medium leading-none md:text-[4rem]" style={{ color: 'var(--text-on-dark)', letterSpacing: 0 }}>
              Proof, not decoration.
            </h2>
          </div>
          <p className="m-0 max-w-2xl text-lg font-medium leading-snug md:text-2xl" style={{ color: 'var(--text-on-dark)', opacity: 0.76 }}>
            {study.takeaway ?? `${study.client} moved from scattered marketing activity to a clearer brand system built around measurable outcomes.`}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 border-t pt-10 md:grid-cols-3" style={{ borderColor: 'rgba(181,242,219,0.16)' }}>
          {metrics.map((metric) => (
            <div key={`${metric.number}-${metric.label}`} className="min-w-0">
              <p className="m-0 text-6xl italic font-medium leading-none md:text-7xl" style={{ color: 'var(--mint-400)', fontFamily: 'var(--font-serif)' }}>
                {metric.number}
              </p>
              <p className="m-0 mt-4 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--text-on-dark)', opacity: 0.68 }}>
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NextCaseBand({ nextStudy }: { nextStudy: CaseStudy }) {
  return (
    <section className="px-[var(--gutter)] py-16" style={{ background: 'var(--surface-page)' }}>
      <div
        className="flex flex-col gap-5 pt-10 mx-auto max-w-6xl border-t md:flex-row md:items-center md:justify-between"
        style={{ borderColor: 'rgba(7,47,52,0.10)' }}
      >
        <div>
          <p className="m-0 text-sm" style={{ color: 'var(--text-muted)' }}>
            Next case study
          </p>
          <h2 className="mt-2 text-3xl font-medium" style={{ color: 'var(--text-strong)' }}>
            {nextStudy.client}
          </h2>
        </div>
        <Button href={`/work/${nextStudy.slug}`} variant="outline">
          Read next case
        </Button>
      </div>
    </section>
  )
}

function getCaseIntro(study: CaseStudy) {
  return study.intro ?? study.story[0] ?? study.resultHeadline
}

function getCaseBody(study: CaseStudy, intro: string) {
  return study.intro ? study.story : study.story.filter((paragraph) => paragraph !== intro)
}

function getNextStudy(study: CaseStudy) {
  const sortedCases = [...caseStudies].sort((a, b) => a.order - b.order)
  const currentIndex = sortedCases.findIndex((item) => item.slug === study.slug)
  return sortedCases[(currentIndex + 1) % sortedCases.length]
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) notFound()

  const nextStudy = getNextStudy(study)
  if (!nextStudy) notFound()

  const intro = getCaseIntro(study)
  const storyBody = getCaseBody(study, intro)
  const metrics = study.metrics.length > 0 ? study.metrics : [fallbackMetric]

  return (
    <article style={{ background: 'var(--surface-page)', color: 'var(--text-strong)' }}>
      <CaseHero study={study} metrics={metrics} />
      <StorySection study={study} intro={intro} storyBody={storyBody} />
      <ScopeSection study={study} />
      {study.gallery && study.gallery.length > 0 ? <CaseGallery client={study.client} images={study.gallery} /> : null}
      <ResultsSection study={study} metrics={metrics} />
      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Get marketing support <em>you can trust</em></>}
        body="If you've outgrown freelancers, feel held back by generic agencies, or need a creative team that actually understands restaurants — we were built for you."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
      <NextCaseBand nextStudy={nextStudy} />
    </article>
  )
}
