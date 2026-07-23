import type { Metadata } from 'next'
import Link from 'next/link'
import SceneWrapper from '@/components/3d/SceneWrapper'
import CTABanner from '@/components/sections/CTABanner'
import GrowthEngineDiagram, { stages } from '@/components/sections/GrowthEngineDiagram'
import Eyebrow from '@/components/ui/Eyebrow'
import { services } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Services — Atrium',
  description: 'Full-stack hospitality marketing across brand, content, paid media, SEO, email, CRM, and analytics.',
}

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
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ background: 'var(--teal-800)' }}
      >
        <SceneWrapper variant="services" />

        <div className="relative z-10 px-6 md:px-16 w-full">
          <div className="max-w-3xl mx-auto w-full">
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

      {/* ── The system before the parts ──────────────────────────────── */}
      <GrowthEngineDiagram />

      {/* ── Engines — full-screen split, one column per pillar ──────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 min-h-screen">
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
      </section>

      {/* ── Stats — quick proof before CTA, 3 columns matching the engine split ── */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 px-6 md:px-16 py-20 md:py-28"
        style={{ background: 'var(--teal-900)' }}
      >
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
