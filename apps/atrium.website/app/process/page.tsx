import type { Metadata } from 'next'
import CTABanner from '@/components/sections/CTABanner'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'How Atrium Works — The Hospitality Growth Engine',
  description: 'How Atrium turns restaurant strategy, production, and reporting into one monthly growth engine — content, channels, and measurement on a repeatable cycle.',
  alternates: { canonical: '/process' },
}

const heroStats = [
  { value: '28d', label: 'typical engine cycle from plan to report' },
  { value: '4', label: 'operating stages' },
  { value: '1', label: 'team across strategy, creative, and performance' },
]

const steps = [
  {
    label: '01',
    phase: 'Week 1',
    title: 'Discovery & brand immersion',
    body: 'We learn the restaurant: food, service model, audience, market position, current channels, and what the owner needs to see improve.',
    deliverables: ['Brand & channel audit', 'Market position review', 'Owner goals session'],
  },
  {
    label: '02',
    phase: 'Weeks 2–3',
    title: 'Strategy lock + first shoot',
    body: 'The brand direction, content calendar, channel plan, and reporting targets get locked before cameras walk into the kitchen.',
    deliverables: ['Brand direction', 'Content calendar', 'Channel plan', 'First production day'],
  },
  {
    label: '03',
    phase: 'Weeks 3–4',
    title: 'Activate every channel',
    body: 'Content ships, local visibility gets tightened, campaigns go live, retention flows start, and reporting begins to show what is moving.',
    deliverables: ['Content publishing', 'Local visibility & Google', 'Campaign launch', 'Retention flows'],
  },
  {
    label: '04',
    phase: 'Every 28 days',
    title: 'Report, learn, repeat',
    body: 'Every cycle closes with a practical read on what worked, what needs a different creative angle, and where the next dollar should go.',
    deliverables: ['Performance report', 'Creative learnings', 'Next-cycle priorities'],
  },
]

const pillars = [
  ['01', 'Strategy', 'What should the market understand about this restaurant?'],
  ['02', 'Production', 'What assets do we need to make that message visible?'],
  ['03', 'Performance', 'What changed after the market saw it?'],
]

function DeliverableList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0" aria-label="Deliverables">
      {items.map((item, index) => (
        <li key={item} className="type-caption flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ProcessPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="px-[var(--gutter)] pb-20 pt-32 md:pb-28 md:pt-40" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="grid gap-10 border-t pt-8 lg:grid-cols-12 lg:gap-16" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
            <div className="lg:col-span-7">
              <p className="type-eyebrow m-0 mb-6" style={{ color: 'var(--teal-500)' }}>
                How we work / Operating system
              </p>
              <h1 className="type-section-title" style={{ color: 'var(--text-strong)' }}>
                A monthly engine, <em>not random activity.</em>
              </h1>
            </div>

            <div className="flex flex-col justify-end gap-10 lg:col-span-5 lg:pt-14">
              <p className="type-lead m-0" style={{ color: 'var(--text-body)' }}>
                Atrium works in a tight operating rhythm: diagnose, shoot, publish, optimize, report, and repeat. The
                process is designed for restaurant teams that need momentum without managing every handoff.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="/contact" variant="primary" className="px-5 py-3 text-xs">
                  Start the process
                </Button>
                <Button href="/services" variant="outline" className="px-5 py-3 text-xs">
                  See services
                </Button>
              </div>
            </div>
          </div>

          {/* Editorial stat row */}
          <div className="mt-16 grid grid-cols-1 gap-8 border-t pt-8 sm:grid-cols-3 md:mt-24" style={{ borderColor: 'rgba(7,47,52,0.14)' }}>
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className={index > 0 ? 'sm:border-l sm:pl-8' : ''}
                style={{ borderColor: 'rgba(7,47,52,0.14)' }}
              >
                <p className="m-0 text-5xl font-medium leading-none" style={{ color: 'var(--text-strong)' }}>
                  {stat.value}
                </p>
                <p className="type-caption mt-3" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps index ── */}
      <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-14 grid gap-10 border-t pt-8 lg:grid-cols-12 lg:gap-16" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
            <div className="lg:col-span-5">
              <Eyebrow className="mb-6">Operating rhythm</Eyebrow>
              <h2 className="type-section-title max-w-[14ch]">
                Every stage creates the input for <em>the next one.</em>
              </h2>
            </div>
          </div>

          <div>
            {steps.map((step) => (
              <article
                key={step.label}
                className="group grid grid-cols-1 gap-6 border-t py-10 md:grid-cols-12 md:gap-8 md:py-12"
                style={{ borderColor: 'rgba(7,47,52,0.18)' }}
              >
                <p
                  className="m-0 text-4xl font-medium leading-none opacity-45 transition-opacity duration-300 group-hover:opacity-100 md:col-span-2 md:text-5xl"
                  style={{ color: 'var(--teal-500)' }}
                  aria-hidden="true"
                >
                  {step.label}
                </p>

                <div className="md:col-span-7">
                  <h3 className="type-card-title" style={{ color: 'var(--text-strong)' }}>
                    {step.title}
                  </h3>
                  <p className="type-body mt-4 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                    {step.body}
                  </p>
                  <div className="mt-6 border-t pt-5" style={{ borderColor: 'rgba(7,47,52,0.10)' }}>
                    <DeliverableList items={step.deliverables} />
                  </div>
                </div>

                <p className="type-eyebrow m-0 md:col-span-3 md:justify-self-end" style={{ color: 'var(--teal-500)' }}>
                  {step.phase}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strategy / Production / Performance ── */}
      <section className="px-[var(--gutter)] py-24 md:py-32" style={{ background: 'var(--teal-900)', color: 'var(--text-on-dark)' }}>
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="grid grid-cols-1 gap-12 border-t pt-10 md:grid-cols-3 md:gap-0" style={{ borderColor: 'rgba(228,238,240,0.14)' }}>
            {pillars.map(([number, title, question], index) => (
              <div
                key={title}
                className={index > 0 ? 'md:border-l md:pl-10' : 'md:pr-10'}
                style={{ borderColor: 'rgba(228,238,240,0.12)' }}
              >
                <p className="type-eyebrow m-0" style={{ color: 'var(--mint-300)', opacity: 0.65 }}>
                  {number}
                </p>
                <h3 className="type-card-title mt-5">{title}</h3>
                <p className="type-lead mt-6" style={{ opacity: 0.72 }}>
                  {question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="READY FOR A CLEANER RHYTHM?"
        headline={<>Marketing feels better when <em>the system is visible.</em></>}
        body="We will map the first cycle, identify the missing inputs, and show what needs to happen before the first shoot."
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="A monthly restaurant marketing cycle mapped on a wall"
      />
    </>
  )
}
