import type { Metadata } from 'next'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'Pricing - Atrium',
  description: 'Custom Atrium engagement models for hospitality marketing: Foundation, Growth, and Full System.',
}

const tiers = [
  {
    name: 'Foundation',
    tagline: 'Strategy, content, social. The essentials.',
    fit: 'Best for restaurants that need consistency and a stronger local presence.',
    includes: ['Brand strategy', 'Monthly content production', 'Social management', 'Google optimization', 'Monthly reporting'],
  },
  {
    name: 'Growth',
    tagline: 'Paid, email, SMS, reputation. Ready to scale.',
    fit: 'Best for operators with proven demand who want more channels working together.',
    includes: ['Everything in Foundation', 'Email & SMS', 'Paid media', 'Reputation management', 'CRM setup'],
  },
  {
    name: 'Full System',
    tagline: 'Everything. Dashboard, automations, dedicated team.',
    fit: 'Best for multi-location brands or high-growth concepts that need a complete engine.',
    includes: ['Everything in Growth', 'Custom dashboard', 'Advanced automations', 'Dedicated strategy team', 'Multi-location support'],
  },
]

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="PRICING"
        title={<>Custom scope. <em>Clear operating model.</em></>}
        body="Atrium pricing is built around the restaurant's stage, channel mix, location count, and internal team capacity. We start with the system you need, then scope the monthly rhythm around it."
        actions={[{ label: 'Request a scope', href: '/contact' }, { label: 'Compare services', href: '/services', variant: 'ghostLight' }]}
        stats={[
          { value: '3', label: 'engagement models' },
          { value: '28d', label: 'monthly engine cycle' },
          { value: 'Custom', label: 'pricing after scope, not before context' },
        ]}
      />

      <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <Eyebrow className="mb-5">Engagement models</Eyebrow>
            <h2 className="text-3xl font-medium leading-tight md:text-5xl">
              Pick the level of operating support your restaurant actually needs.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className="flex min-h-[520px] flex-col rounded-2xl border p-7"
                style={{
                  borderColor: index === 1 ? 'rgba(181,242,219,0.42)' : 'rgba(7,47,52,0.10)',
                  background: index === 1 ? 'var(--teal-800)' : 'var(--surface-card)',
                  color: index === 1 ? 'var(--text-on-dark)' : 'var(--text-strong)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: index === 1 ? 'var(--mint-400)' : 'var(--accent)' }}>
                  0{index + 1}
                </p>
                <h3 className="mt-5 text-3xl font-medium">{tier.name}</h3>
                <p className="mt-4 text-base leading-relaxed" style={{ opacity: 0.72 }}>
                  {tier.tagline}
                </p>
                <p className="mt-6 text-sm leading-relaxed" style={{ opacity: 0.58 }}>
                  {tier.fit}
                </p>
                <div className="mt-8 border-t pt-6" style={{ borderColor: index === 1 ? 'rgba(228,238,240,0.12)' : 'rgba(7,47,52,0.10)' }}>
                  <p className="text-xs font-medium" style={{ opacity: 0.58 }}>
                    Includes
                  </p>
                  <ul className="mt-5 space-y-3">
                    {tier.includes.map((item) => (
                      <li key={item} className="text-sm leading-relaxed" style={{ opacity: 0.74 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-auto pt-8 text-sm font-medium" style={{ color: index === 1 ? 'var(--mint-400)' : 'var(--teal-800)' }}>
                  Custom pricing after discovery
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-24" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto grid max-w-6xl gap-8 border-t pt-12 md:grid-cols-3" style={{ borderColor: 'rgba(7,47,52,0.10)' }}>
          {[
            ['Scope first', 'We confirm your location count, channel gaps, production needs, and internal capacity before recommending a model.'],
            ['Month-to-month rhythm', 'The operating cadence is built around content production, campaign launches, reporting, and optimization cycles.'],
            ['No generic bundle', 'A coffee shop, a fine-dining concept, and a multi-location group should not buy the same marketing package.'],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="text-2xl font-medium">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CTABanner
        eyebrow="SCOPE THE WORK"
        headline={<>The right number comes <em>after the right diagnosis.</em></>}
        body="Tell us what you are trying to grow, what channels are already active, and what has stopped working. We will map the practical scope."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="Engagement model notes for a hospitality marketing plan"
      />
    </>
  )
}
