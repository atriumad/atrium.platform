import type { Metadata } from 'next'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'Contact - Atrium',
  description: 'Start a hospitality marketing conversation with Atrium.',
}

const email = 'hello@atrium.studio'

const briefItems = [
  'Restaurant, hotel, or food brand name',
  'Location count and market',
  'Current channels you are using',
  'What you need to improve in the next 90 days',
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title={<>Tell us what needs <em>to grow.</em></>}
        body="The fastest first step is context: where the brand is now, what is already working, and what has become too hard for the team to manage alone."
        actions={[
          { label: 'Email Atrium', href: `mailto:${email}?subject=New%20Atrium%20project` },
          { label: 'View pricing models', href: '/pricing', variant: 'ghostLight' },
        ]}
        stats={[
          { value: 'KC', label: 'Kansas City home base' },
          { value: 'CU', label: 'production hub in Cuba' },
          { value: '15+', label: 'hospitality brands in the operating network' },
        ]}
      />

      <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Eyebrow className="mb-5">Direct line</Eyebrow>
            <h2 className="text-3xl font-medium leading-tight md:text-5xl">
              Start with the messy version.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              You do not need a perfect brief. Send the business context, the current pressure, and the outcome you want to make visible.
            </p>
            <a href={`mailto:${email}`} className="mt-8 inline-flex text-2xl font-medium" style={{ color: 'var(--teal-800)' }}>
              {email}
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border p-7" style={{ borderColor: 'rgba(7,47,52,0.10)', background: 'var(--surface-card)' }}>
              <h3 className="text-2xl font-medium">Include this</h3>
              <ul className="mt-6 space-y-4">
                {briefItems.map((item) => (
                  <li key={item} className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border p-7" style={{ borderColor: 'rgba(7,47,52,0.10)', background: 'var(--surface-card)' }}>
              <h3 className="text-2xl font-medium">Good reasons to reach out</h3>
              <div className="mt-6 space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                <p>Your content has activity but no clear system.</p>
                <p>Your restaurant has more locations than your current process can support.</p>
                <p>Your reporting does not explain what marketing actually changed.</p>
                <p>Your team needs a partner that understands hospitality before the first meeting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="WHAT HAPPENS NEXT"
        headline={<>A short conversation, then <em>a practical scope.</em></>}
        body="We will look at the current system, identify the missing operating pieces, and recommend whether Foundation, Growth, or Full System makes sense."
        cta="Email Atrium"
        ctaHref={`mailto:${email}?subject=New%20Atrium%20project`}
        coverAlt="Atrium contact path from project context to practical scope"
      />
    </>
  )
}
