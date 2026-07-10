import type { Metadata } from 'next'
import PageHero from '@/components/pages/PageHero'
import CTABanner from '@/components/sections/CTABanner'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'Process - Atrium',
  description: 'How Atrium turns restaurant strategy, production, activation, and reporting into a monthly growth engine.',
}

const steps = [
  {
    label: '01',
    title: 'Discovery & brand immersion',
    body: 'We learn the restaurant: food, service model, audience, market position, current channels, and what the owner needs to see improve.',
  },
  {
    label: '02',
    title: 'Strategy lock + first shoot',
    body: 'The brand direction, content calendar, channel plan, and reporting targets get locked before cameras walk into the kitchen.',
  },
  {
    label: '03',
    title: 'Activate every channel',
    body: 'Content ships, local visibility gets tightened, campaigns go live, retention flows start, and reporting begins to show what is moving.',
  },
  {
    label: '04',
    title: 'Report, learn, repeat',
    body: 'Every cycle closes with a practical read on what worked, what needs a different creative angle, and where the next dollar should go.',
  },
]

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="HOW WE WORK"
        title={<>A monthly engine, <em>not random activity.</em></>}
        body="Atrium works in a tight operating rhythm: diagnose, shoot, publish, optimize, report, and repeat. The process is designed for restaurant teams that need momentum without managing every handoff."
        actions={[{ label: 'Start the process', href: '/contact' }, { label: 'See services', href: '/services', variant: 'ghostLight' }]}
        stats={[
          { value: '28d', label: 'typical engine cycle from plan to report' },
          { value: '4', label: 'operating stages' },
          { value: '1', label: 'team across strategy, creative, and performance' },
        ]}
      />

      <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <Eyebrow className="mb-5">Operating rhythm</Eyebrow>
            <h2 className="text-3xl font-medium leading-tight md:text-5xl">
              Every stage creates the input for the next one.
            </h2>
          </div>

          <div className="grid gap-4">
            {steps.map((step) => (
              <div
                key={step.label}
                className="grid gap-6 rounded-2xl border p-6 md:grid-cols-[120px_1fr]"
                style={{ borderColor: 'rgba(7,47,52,0.10)', background: 'var(--surface-card)' }}
              >
                <p className="text-4xl font-medium leading-none" style={{ color: 'var(--accent)' }}>
                  {step.label}
                </p>
                <div>
                  <h3 className="text-2xl font-medium">{step.title}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-24" style={{ background: 'var(--teal-900)', color: 'var(--text-on-dark)' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
          {[
            ['Strategy', 'What should the market understand about this restaurant?'],
            ['Production', 'What assets do we need to make that message visible?'],
            ['Performance', 'What changed after the market saw it?'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border p-7" style={{ borderColor: 'rgba(228,238,240,0.10)', background: 'rgba(7,47,52,0.38)' }}>
              <h3 className="text-3xl font-medium">{title}</h3>
              <p className="mt-5 text-sm leading-relaxed" style={{ opacity: 0.64 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CTABanner
        eyebrow="READY FOR A CLEANER RHYTHM?"
        headline={<>Marketing feels better when <em>the system is visible.</em></>}
        body="We will map the first cycle, identify the missing inputs, and show what needs to happen before the first shoot."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="A monthly restaurant marketing cycle mapped on a wall"
      />
    </>
  )
}
