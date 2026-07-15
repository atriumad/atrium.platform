import Eyebrow from '@/components/ui/Eyebrow'

// ─── Atrium Growth Engine (doc vs.md §2.1 / §5 / §7.5) ──────────────────────
// Makes the offer a named *system*, not eleven separate services:
// Brand Foundation underneath, Generate → Convert → Retain across, and
// Measure · Learn · Optimize looping around every stage.

const STAGE_COLORS = {
  generate: 'var(--mint-400)',
  convert: '#D69445',
  retain: '#5ABABC',
} as const

const stages = [
  { id: 'Generate', color: STAGE_COLORS.generate, tagline: 'Create awareness and desire.', caps: ['Film & Photo', 'Social', 'Paid Media'] },
  { id: 'Convert', color: STAGE_COLORS.convert, tagline: 'Turn interest into reservations.', caps: ['Google & Local SEO', 'Reputation', 'Offers & Campaigns'] },
  { id: 'Retain', color: STAGE_COLORS.retain, tagline: 'Bring guests back.', caps: ['Email & SMS', 'CRM & Loyalty', 'Win-back Flows'] },
]

export default function GrowthEngineDiagram() {
  return (
    <section className="px-6 md:px-16 py-24 md:py-32" style={{ background: 'var(--teal-900)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14 md:mb-20">
          <Eyebrow tone="onDark" className="mb-4">The Atrium Growth Engine</Eyebrow>
          <h2 className="type-section-title" style={{ color: 'var(--text-on-dark)' }}>
            Not eleven services. <em>One system.</em>
          </h2>
          <p className="type-body mt-5 max-w-md" style={{ color: 'var(--text-on-dark)', opacity: 0.66 }}>
            The services are just the components. What you buy is the engine that runs
            them — on a 28-day cycle, measured end to end.
          </p>
        </div>

        {/* Brand Foundation — the base everything sits on */}
        <div
          className="rounded-[var(--radius-md)] px-6 py-4 mb-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"
          style={{ background: 'rgba(228,238,240,0.05)', border: '1px solid rgba(228,238,240,0.10)' }}
        >
          <span className="type-eyebrow" style={{ color: 'var(--mint-400)' }}>Brand Foundation</span>
          <span className="type-caption" style={{ color: 'var(--text-on-dark)', opacity: 0.6 }}>
            Positioning, identity, and creative direction everything else is built on.
          </span>
        </div>

        {/* Generate → Convert → Retain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {stages.map((stage, i) => (
            <div key={stage.id} className="relative">
              <div
                className="h-full rounded-[var(--radius-md)] p-6 flex flex-col gap-4"
                style={{ background: 'rgba(228,238,240,0.04)', border: `1px solid ${stage.color}33` }}
              >
                <span className="type-eyebrow" style={{ color: stage.color }}>{stage.id} Demand</span>
                <p className="type-caption font-medium" style={{ color: 'var(--text-on-dark)', opacity: 0.82 }}>
                  {stage.tagline}
                </p>
                <div className="flex flex-col gap-1.5 mt-auto pt-3" style={{ borderTop: `1px solid ${stage.color}22` }}>
                  {stage.caps.map((cap) => (
                    <span key={cap} className="type-eyebrow leading-tight" style={{ color: 'var(--text-on-dark)', opacity: 0.5 }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
              {/* connector arrow — horizontal on desktop, vertical on mobile */}
              {i < stages.length - 1 && (
                <>
                  <span
                    className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 items-center justify-center w-4 text-lg select-none pointer-events-none z-10"
                    style={{ color: 'var(--mint-400)', opacity: 0.7 }}
                    aria-hidden
                  >
                    →
                  </span>
                  <span
                    className="md:hidden flex justify-center py-1 text-lg select-none pointer-events-none"
                    style={{ color: 'var(--mint-400)', opacity: 0.7 }}
                    aria-hidden
                  >
                    ↓
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Measure · Learn · Optimize — loops around everything */}
        <div
          className="rounded-[var(--radius-md)] px-6 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"
          style={{ background: 'color-mix(in srgb, var(--mint-400) 8%, transparent)', border: '1px solid rgba(181,242,219,0.20)' }}
        >
          <span className="type-eyebrow" style={{ color: 'var(--mint-400)' }}>↺ Measure · Learn · Optimize</span>
          <span className="type-caption" style={{ color: 'var(--text-on-dark)', opacity: 0.6 }}>
            POS attribution and monthly reporting feed the next 28-day cycle — every stage, measured.
          </span>
        </div>
      </div>
    </section>
  )
}
