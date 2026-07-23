import type { Metadata } from 'next'
import SceneWrapper from '@/components/3d/SceneWrapper'
import CTABanner from '@/components/sections/CTABanner'
import GrowthEngineDiagram from '@/components/sections/GrowthEngineDiagram'
import ServiceRow from '@/components/sections/ServiceRow'
import ServiceStatsEditorial from '@/components/services/ServiceStatsEditorial'
import Eyebrow from '@/components/ui/Eyebrow'
import { services } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Services — Atrium',
  description: 'Full-stack hospitality marketing across brand, content, paid media, SEO, email, CRM, and analytics.',
}

// Single source of truth for the three pillar accent colors, shared by the
// PILLARS data and the hero headline. #B5F2DB is the brand mint token; the
// other two are deliberate page-specific accents with no brand-token equivalent.
const PILLAR_COLORS = {
  generate: 'var(--mint-400)',
  convert: '#D69445',
  retain: '#5ABABC',
} as const

const PILLARS = [
  {
    num: '01',
    id: 'Generate Demand',
    color: PILLAR_COLORS.generate,
    tagline: 'Create awareness and desire.',
    services: ['Brand Strategy', 'Film & Photo', 'Social Content', 'Social Management', 'Paid Media'],
  },
  {
    num: '02',
    id: 'Convert Demand',
    color: PILLAR_COLORS.convert,
    tagline: 'Turn interest into reservations.',
    services: ['Google & Local SEO', 'Reputation Management', 'Experiential & Collabs'],
  },
  {
    num: '03',
    id: 'Retain Demand',
    color: PILLAR_COLORS.retain,
    tagline: 'Keep guests coming back.',
    services: ['Email & SMS', 'CRM & Loyalty', 'Analytics & Reporting'],
  },
]

export default function ServicesPage() {
  let globalIndex = 0

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: 'var(--teal-800)' }}
      >
        <SceneWrapper variant="services" />

        {/* top area — headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-16 pt-28 pb-12">
          <div className="max-w-6xl mx-auto w-full">
            <Eyebrow tone="onDark" className="mb-8">HOSPITALITY MARKETING</Eyebrow>
            <h1
              className="type-page-title"
              style={{ color: 'var(--text-on-dark)' }}
            >
              <span style={{ color: PILLAR_COLORS.generate }}>Generate.</span>{' '}
              <span style={{ color: PILLAR_COLORS.convert }}>Convert.</span>{' '}
              <em style={{ color: PILLAR_COLORS.retain, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Retain.</em>
            </h1>
            <p
              className="type-lead mt-6 max-w-xl"
              style={{ color: 'var(--text-on-dark)', opacity: 0.72 }}
            >
              The complete hospitality marketing engine — one team across all 11 disciplines, no handoffs, no briefing from scratch.
            </p>
          </div>
        </div>

        {/* bottom area — three pillars */}
        <div
          className="relative z-10 grid grid-cols-1 md:grid-cols-3"
          style={{ borderTop: '1px solid rgba(228,238,240,0.10)' }}
        >
          {PILLARS.map((p, i) => (
            <div
              key={p.id}
              className="px-6 md:px-10 py-8 flex flex-col gap-4 relative"
              style={{
                borderLeft: i > 0 ? '1px solid color-mix(in srgb, var(--cloud-300) 8%, transparent)' : undefined,
              }}
            >
              {/* faint large number */}
              <span
                className="absolute right-6 top-4 italic leading-none select-none pointer-events-none"
                style={{ fontSize: '6rem', fontFamily: 'var(--font-serif)', color: p.color, opacity: 0.09 }}
                aria-hidden
              >
                {p.num}
              </span>

              {/* category label */}
              <span
                className="type-eyebrow"
                style={{ color: p.color }}
              >
                {p.id}
              </span>

              {/* service names */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {p.services.map((s) => (
                  <span
                    key={s}
                    className="type-eyebrow leading-tight"
                    style={{ color: 'var(--text-on-dark)', opacity: 0.45 }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* tagline */}
              <p
                className="type-caption mt-auto pt-4 font-medium"
                style={{ color: 'var(--text-on-dark)', opacity: 0.7, borderTop: `1px solid ${p.color}22` }}
              >
                {p.tagline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The system before the parts ──────────────────────────────── */}
      <GrowthEngineDiagram />

      {/* ── Service index ────────────────────────────────────────────── */}
      <section style={{ background: 'var(--cloud-100)' }}>
        {PILLARS.map((cat) => {
          const catServices = services.filter(s => s.category === cat.id)
          return (
            <div key={cat.id}>
              {/* Category divider */}
              <div
                className="px-6 md:px-16 py-5 flex items-center gap-6"
                style={{ borderTop: '1px solid rgba(7,47,52,0.08)' }}
              >
                <span
                  className="type-eyebrow"
                  style={{ color: `color-mix(in srgb, ${cat.color} 60%, var(--teal-800) 40%)` }}
                >
                  {cat.id}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(7,47,52,0.06)' }} />
              </div>

              {/* Service rows */}
              {catServices.map((svc) => {
                globalIndex++
                const num = String(globalIndex).padStart(2, '0')
                return (
                  <ServiceRow
                    key={svc.slug}
                    slug={svc.slug}
                    name={svc.name}
                    body={svc.hero.body}
                    num={num}
                    color={cat.color}
                  />
                )
              })}
            </div>
          )
        })}

        {/* bottom rule */}
        <div style={{ borderTop: '1px solid rgba(7,47,52,0.08)' }} />
      </section>

      {/* ── Stats — quick proof before CTA ──────────────────────────── */}
      <ServiceStatsEditorial
        eyebrow="The full picture"
        headline={<>Eleven disciplines. <em style={{ fontFamily: 'var(--font-serif)' }}>One engine.</em></>}
        stats={[
          { number: '11', label: 'Disciplines under one roof — strategy to analytics' },
          { number: '15+', label: 'Active hospitality brand partnerships' },
          { number: '28d', label: 'Engine cycle — first shoot to first report' },
        ]}
      />

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
