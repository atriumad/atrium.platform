import { Highlight } from '@atrium/ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'
import { caseStudies } from '@/lib/work'

export const metadata: Metadata = {
  title: 'Our Work - Atrium',
  description: 'Hospitality-only case studies from Atrium across brand, content, social, retention, and reporting.',
}

const sortedCases = [...caseStudies].sort((a, b) => a.order - b.order)

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="OUR WORK"
        title={<>Hospitality only. <em>Results first.</em></>}
        body="A working library of restaurant, hotel, and food brand case studies. Every story is tied to a business outcome, not a vanity metric."
        actions={[{ label: 'Start a project', href: '/contact' }, { label: 'Explore services', href: '/services', variant: 'ghostLight' }]}
        stats={[
          { value: String(sortedCases.length), label: 'case studies currently online' },
          { value: '11', label: 'marketing disciplines represented' },
          { value: '3', label: 'demand pillars: generate, convert, retain' },
        ]}
      />

      <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow className="mb-4">Case study index</Eyebrow>
              <h2 className="max-w-2xl text-3xl font-medium leading-tight md:text-5xl">
                Work with enough detail to make a <Highlight>decision.</Highlight>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              The full V1 plan calls for 15 case studies. The data-backed set currently ready in the codebase is live here.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {sortedCases.map((item) => (
              <Link
                key={item.slug}
                href={`/work/${item.slug}`}
                className="group block overflow-hidden rounded-[var(--radius-bento)] border no-underline transition-transform duration-200 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 active:scale-[0.99]"
                style={{ borderColor: 'rgba(7,47,52,0.10)', background: 'var(--surface-card)' }}
                aria-label={`Read case study: ${item.client}`}
              >
                <div
                  className="relative flex min-h-56 items-end overflow-hidden p-6"
                  style={{
                    background: item.order % 3 === 0 ? 'var(--surface-mint)' : item.order % 2 === 0 ? 'var(--surface-amber)' : 'var(--surface-dark)',
                    color: item.order % 3 === 0 || item.order % 2 === 0 ? 'var(--text-strong)' : 'var(--text-on-dark)',
                  }}
                >
                  <p
                    aria-hidden="true"
                    className="absolute -right-2 bottom-2 select-none text-[9rem] font-medium uppercase leading-none opacity-10"
                    style={{ letterSpacing: 0 }}
                  >
                    {String(item.order).padStart(2, '0')}
                  </p>
                  <div className="absolute right-5 top-5">
                    <span
                      className="inline-flex rounded-[var(--radius-pill)] px-[14px] py-[5px] text-[13px] font-medium leading-none"
                      style={{
                        background: item.order % 3 === 0 || item.order % 2 === 0 ? 'var(--teal-800)' : 'var(--mint-400)',
                        color: item.order % 3 === 0 || item.order % 2 === 0 ? 'var(--mint-400)' : 'var(--teal-800)',
                        border: item.order % 3 === 0 || item.order % 2 === 0 ? '1.5px solid var(--teal-800)' : '1.5px solid var(--mint-400)',
                      }}
                    >
                      {String(item.order).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase" style={{ opacity: 0.72, letterSpacing: 'var(--tracking-wide)' }}>
                      {item.category}
                    </p>
                    <h3 className="mt-3 text-3xl font-medium leading-tight">
                      {item.client}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xl font-medium leading-snug">{item.resultHeadline}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.serviceTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded-[var(--radius-pill)] px-[14px] py-[5px] text-[13px] font-medium leading-none"
                        style={{
                          background: 'var(--cloud-100)',
                          color: 'var(--teal-800)',
                          border: '1.5px solid var(--cloud-400)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className="mt-6 inline-flex rounded-[var(--radius-pill)] px-[18px] py-[8px] text-[14px] font-medium leading-none transition-colors duration-200 ease-out group-hover:bg-[var(--teal-800)] group-hover:text-[var(--mint-400)]"
                    style={{ border: '1.5px solid var(--teal-800)', color: 'var(--teal-800)' }}
                  >
                    Read case study
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="NEXT STEP"
        headline={<>Build the case study <em>your restaurant deserves.</em></>}
        body="If your marketing has activity but not a clear story of growth, Atrium can rebuild the system around outcomes."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="A restaurant marketing result sheet being reviewed by the team"
      />
    </>
  )
}
