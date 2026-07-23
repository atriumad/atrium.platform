import type { Metadata } from 'next'
import Link from 'next/link'
import CTABanner from '@/components/sections/CTABanner'
import { stages } from '@/components/sections/GrowthEngineDiagram'
import Eyebrow from '@/components/ui/Eyebrow'
import { services } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Services — Atrium',
  description: 'Full-stack hospitality marketing across brand, content, paid media, SEO, email, CRM, and analytics.',
}

const HAIRLINE = 'rgba(7,47,52,0.18)'

const STATS = [
  { number: '11', label: 'Disciplines under one roof — strategy to analytics' },
  { number: '15+', label: 'Active hospitality brand partnerships' },
  { number: '28d', label: 'Engine cycle — first shoot to first report' },
]

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col justify-center overflow-hidden px-[var(--gutter)]"
        style={{ background: 'var(--teal-800)' }}
      >
        <div className="mx-auto w-full max-w-[var(--container-max)]">
          <div className="max-w-3xl">
            <Eyebrow tone="onDark" className="mb-6">HOSPITALITY MARKETING</Eyebrow>
            <h1
              className="type-page-title mb-6"
              style={{ color: 'var(--text-on-dark)' }}
            >
              One team. <em style={{ color: 'var(--mint-400)' }}>Every stage of growth.</em>
            </h1>
            <p
              className="type-lead max-w-xl"
              style={{ color: 'var(--text-on-dark)', opacity: 0.78 }}
            >
              The complete hospitality marketing engine — one team across all 11 disciplines, no handoffs, no briefing from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Atrium Growth Engine — framing + the three engines as full-bleed columns ── */}
      <section style={{ background: 'var(--cloud-100)' }}>
        <div className="px-[var(--gutter)] pt-24 pb-14 md:pt-36 md:pb-20">
          <div className="mx-auto max-w-[var(--container-max)]">
            <div className="grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16">
              <div className="lg:col-span-7">
                <Eyebrow className="mb-6">The Atrium Growth Engine</Eyebrow>
                <h2 className="type-section-title max-w-[14ch]">
                  Not eleven services. <em>One system.</em>
                </h2>
              </div>
              <p className="type-body max-w-lg border-t pt-6 lg:col-span-5" style={{ color: 'var(--text-muted)', borderColor: HAIRLINE }}>
                The services are just the components. What you buy is the engine that runs
                them — on a 28-day cycle, measured end to end.
              </p>
            </div>

            <div className="flex flex-col gap-1 border-t pt-5 mt-14 md:mt-20 md:flex-row md:items-baseline md:gap-6" style={{ borderColor: HAIRLINE }}>
              <span className="type-eyebrow whitespace-nowrap" style={{ color: 'var(--teal-500)' }}>Brand Foundation</span>
              <span className="type-caption" style={{ color: 'var(--text-muted)' }}>
                Positioning, identity, and creative direction — everything the engine runs on.
              </span>
            </div>

            <div className="flex flex-col gap-1 border-t pt-5 mt-8 md:flex-row md:items-baseline md:gap-6" style={{ borderColor: HAIRLINE }}>
              <span className="type-eyebrow flex gap-1.5 items-center whitespace-nowrap" style={{ color: 'var(--teal-800)' }}>
                <span aria-hidden>↺</span> Measure · Learn · Optimize
              </span>
              <span className="type-caption" style={{ color: 'var(--text-muted)' }}>
                POS attribution and monthly reporting feed the next 28-day cycle — every stage, measured.
              </span>
            </div>
          </div>
        </div>

        {/* Engines — full-bleed, one solid-color column per pillar */}
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen">
          {stages.map((stage) => {
            const category = `${stage.id} Demand`
            const catServices = services.filter(s => s.category === category)
            return (
              <div
                key={stage.id}
                className="flex flex-col gap-10 px-8 md:px-10 py-20 md:py-24"
                style={{ background: stage.dot }}
              >
                <div>
                  <span className="type-eyebrow" style={{ color: 'var(--teal-800)', opacity: 0.6 }}>
                    {category}
                  </span>
                  <p className="type-lead mt-4" style={{ color: 'var(--teal-800)' }}>
                    {stage.tagline}
                  </p>
                </div>

                <ul className="flex flex-col m-0 p-0 list-none">
                  {catServices.map((svc) => (
                    <li key={svc.slug} className="border-t" style={{ borderColor: 'rgba(7,47,52,0.15)' }}>
                      <Link
                        href={`/services/${svc.slug}`}
                        className="group flex items-center justify-between gap-3 py-4 no-underline"
                      >
                        <span className="type-card-title m-0" style={{ color: 'var(--teal-800)' }}>
                          {svc.name}
                        </span>
                        <span
                          className="flex-shrink-0 transition-transform duration-150 group-hover:translate-x-1"
                          style={{ color: 'var(--teal-800)' }}
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Stats — quick proof before CTA, 3 columns matching the engine split ── */}
      <section
        className="px-6 md:px-16 py-20 md:py-28"
        style={{ background: 'var(--teal-900)' }}
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="max-w-2xl pb-14 md:pb-20">
            <p className="type-eyebrow m-0" style={{ color: 'var(--mint-400)' }}>The full picture</p>
            <h2 className="type-section-title m-0 mt-5" style={{ color: 'var(--text-on-dark)' }}>
              Eleven disciplines. <em style={{ fontFamily: 'var(--font-serif)' }}>One engine.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.number}
                className={`flex flex-col gap-4 py-8 md:py-0 ${i > 0 ? 'border-t md:border-t-0 md:border-l md:pl-10' : ''}`}
                style={{ borderColor: 'rgba(228,238,240,0.10)' }}
              >
                <strong
                  className="text-[clamp(4rem,8vw,7rem)] font-normal italic leading-[0.85] tracking-[-0.03em]"
                  style={{ color: 'var(--mint-400)', fontFamily: 'var(--font-serif)' }}
                >
                  {stat.number}
                </strong>
                <p className="type-body m-0 max-w-xs" style={{ color: 'var(--text-on-dark)', opacity: 0.76 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Been burned by an agency <em>before?</em></>}
        body="If you've outgrown freelancers, been let down by generic agencies, or just want a team that reports revenue instead of vanity — we were built for you. See the system before you commit."
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </>
  )
}
