import type { Metadata } from 'next'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'About - Atrium',
  description: 'Atrium is a hospitality-native marketing studio with a Kansas City base and a production team spanning Cuba and the US.',
}

const principles = [
  {
    title: 'Hospitality-native',
    body: 'Restaurants, hotels, and food brands are not a vertical for us. They are the only context we build for.',
  },
  {
    title: 'Creative with a job',
    body: 'A campaign has to look right, but it also has to move reservations, repeat visits, reviews, and revenue signals.',
  },
  {
    title: 'One team, one system',
    body: 'Strategy, production, content, paid media, CRM, and reporting sit close together so operators do not manage agency handoffs.',
  },
]

const teamCards = [
  {
    label: 'Creative Director & Founder',
    title: 'Carlos',
    body: 'Inside the kitchens, on the shoots, and behind the dashboards for 15+ hospitality brands across Kansas City and beyond.',
  },
  {
    label: 'Marketing Coordination',
    title: 'Litzabel',
    body: 'Keeps campaigns moving across calendars, approvals, content delivery, and the details that make the system feel calm.',
  },
  {
    label: 'Production Hub',
    title: 'Cuba + US team',
    body: 'A distributed creative crew built for on-location shoots, edits, campaign assets, and monthly execution rhythm.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="OUR TEAM"
        title={<>When we say hospitality-native, <em>we mean it.</em></>}
        body="Atrium lives inside the industry: Kansas City home base, production team spanning Cuba and the US, and strategy, creative, and performance reporting under one roof."
        actions={[{ label: 'Meet through a project', href: '/contact' }, { label: 'See the work', href: '/work', variant: 'ghostLight' }]}
        stats={[
          { value: '15+', label: 'active hospitality brand partnerships' },
          { value: 'KC', label: 'home base for strategy and client work' },
          { value: 'US/CU', label: 'production team across the US and Cuba' },
        ]}
      />

      <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <Eyebrow className="mb-5">Operating principles</Eyebrow>
            <h2 className="text-3xl font-medium leading-tight md:text-5xl">
              Built for the rhythm of restaurants.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {principles.map((item) => (
              <div key={item.title} className="rounded-2xl border p-7" style={{ borderColor: 'rgba(7,47,52,0.10)', background: 'var(--surface-card)' }}>
                <h3 className="text-2xl font-medium">{item.title}</h3>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: 'var(--teal-900)', color: 'var(--text-on-dark)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <Eyebrow tone="onDark" className="mb-5">Team shape</Eyebrow>
              <h2 className="text-3xl font-medium leading-tight md:text-5xl">
                Strategy close to execution. Execution close to reporting.
              </h2>
            </div>
            <p className="text-base leading-relaxed" style={{ opacity: 0.64 }}>
              The work is organized around a simple promise: fewer handoffs, faster feedback, and creative that improves because the same team sees the performance data.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {teamCards.map((card) => (
              <div key={card.title} className="rounded-2xl border p-7" style={{ borderColor: 'rgba(228,238,240,0.10)', background: 'rgba(7,47,52,0.42)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--mint-400)' }}>
                  {card.label}
                </p>
                <h3 className="mt-5 text-3xl font-medium">{card.title}</h3>
                <p className="mt-5 text-sm leading-relaxed" style={{ opacity: 0.64 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="START HERE"
        headline={<>Bring us the restaurant. <em>We will bring the system.</em></>}
        body="If your team needs senior creative, operational rhythm, and reporting in the same room, the next step is a short conversation."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="Atrium team planning a hospitality campaign"
      />
    </>
  )
}
