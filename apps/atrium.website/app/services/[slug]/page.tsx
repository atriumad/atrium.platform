import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CTABanner from '@/components/sections/CTABanner'
import IconGrid from '@/components/sections/IconGrid'
import ServiceTimeline from '@/components/sections/ServiceTimeline'
import SplitSection from '@/components/sections/SplitSection'
import StatsStrip from '@/components/sections/StatsStrip'
import Eyebrow from '@/components/ui/Eyebrow'
import type { BentoCard } from '@/lib/services'
import { getService, getSiblingServices, services } from '@/lib/services'

export async function generateStaticParams() {
  return services.map(s => ({ slug: s.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) return {}
  return {
    title: `${svc.name} — Atrium`,
    description: svc.hero.body,
  }
}

function parseHeadline(raw: string) {
  return raw.split('*').map((part, i) =>
    i % 2 === 1 ? <em key={part}>{part}</em> : part
  )
}

function ServiceBento({ cards }: { cards: BentoCard[] }) {
  const colSpan: Record<BentoCard['size'], string> = {
    large:  'md:col-span-7',
    medium: 'md:col-span-5',
    small:  'md:col-span-5',
  }

  /* group cards into 12-col rows */
  const rows: BentoCard[][] = []
  let row: BentoCard[] = []
  let span = 0
  for (const card of cards) {
    const w = card.size === 'large' ? 7 : 5
    if (span + w > 12 && row.length) { rows.push(row); row = []; span = 0 }
    row.push(card); span += w
  }
  if (row.length) rows.push(row)

  return (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--surface-page)' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.map(card => card.title).join('|')} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {r.map((card) => {
              const large = card.size === 'large'
              return (
                <div
                  key={card.title}
                  className={`col-span-1 ${colSpan[card.size]} flex flex-col gap-4 rounded-3xl p-8 md:p-10 overflow-hidden relative`}
                  style={{
                    background: large ? 'var(--teal-800)' : 'var(--teal-900)',
                    backgroundImage: large ? 'var(--grad-aurora-deep)' : undefined,
                    minHeight: large ? '320px' : '240px',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'var(--surface-grain)', backgroundSize: '380px auto', opacity: 0.06, mixBlendMode: 'overlay' }}
                  />
                  <div className="relative flex flex-col gap-3 h-full">
                    <h3
                      className="font-medium leading-tight"
                      style={{ fontSize: large ? 'var(--text-2xl)' : 'var(--text-xl)', color: 'var(--text-on-dark)' }}
                    >
                      {parseHeadline(card.title)}
                    </h3>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-on-dark)', opacity: 0.65 }}>
                      {card.copy}
                    </p>
                    <div
                      className="mt-auto rounded-2xl flex items-center justify-center text-xs text-center px-4"
                      style={{
                        background: 'rgba(228,238,240,0.05)',
                        border: '1px solid rgba(228,238,240,0.10)',
                        color: 'rgba(228,238,240,0.25)',
                        minHeight: large ? '140px' : '80px',
                      }}
                    >
                      [{card.coverAlt}]
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

const CATEGORY_COLOR: Record<string, string> = {
  'Generate Demand': 'var(--mint-400)',
  'Convert Demand':  'var(--amber-500)',
  'Retain Demand':   'var(--teal-300)',
}

function SiblingServices({ current }: { current: string }) {
  const siblings = getSiblingServices(current, 3)
  return (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--surface-page)' }}>
      <div className="max-w-6xl mx-auto">
        <Eyebrow className="mb-10">OTHER SERVICES</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {siblings.map(svc => (
            <Link
              key={svc.slug}
              href={`/services/${svc.slug}`}
              className="group flex flex-col gap-4 rounded-2xl p-8 no-underline"
              style={{ background: 'var(--cloud-100)', border: '1px solid var(--border-light)' }}
            >
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: CATEGORY_COLOR[svc.category] }}>
                {svc.category}
              </span>
              <h3 className="font-medium text-lg leading-snug" style={{ color: 'var(--text-strong)' }}>
                {svc.name}
              </h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-strong)', opacity: 0.55 }}>
                {svc.hero.body}
              </p>
              <span className="text-sm font-semibold" style={{ color: 'var(--teal-700)' }}>
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) notFound()

  return (
    <>
      <SplitSection
        eyebrow={svc.hero.eyebrow}
        headline={parseHeadline(svc.hero.headline)}
        body={svc.hero.body}
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt={svc.hero.coverAlt}
        bg="dark"
      />

      <IconGrid items={svc.perks} />

      <ServiceBento cards={svc.bentoCards} />

      <StatsStrip stats={svc.stats} />

      {svc.timeline && <ServiceTimeline steps={svc.timeline} />}

      <SiblingServices current={slug} />

      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Get marketing support <em>you can trust</em></>}
        body="If you've outgrown freelancers, feel held back by generic agencies, or need a creative team that actually understands restaurants — we were built for you."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </>
  )
}
