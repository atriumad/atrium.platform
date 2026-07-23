import Eyebrow from '@/components/ui/Eyebrow'

// ─── Atrium Growth Engine (doc vs.md §2.1 / §5 / §7.5) ──────────────────────
// A horizontal flow — Generate → Convert → Retain read as one connected system
// on a shared rail, bracketed by the Brand Foundation it's built on and the
// Measure · Learn · Optimize loop that feeds the next 28-day cycle. Editorial,
// light, hairline-driven — the same language as the rest of the site, but
// horizontal so it reads as flow, not another vertical index.

const HAIRLINE = 'rgba(7,47,52,0.18)'

// Exported so other services-page sections (the engine split, stats) can
// share this exact copy/color data instead of maintaining their own.
export const stages = [
  { n: '01', id: 'Generate', dot: '#2FB98A', tagline: 'Create awareness and desire.', caps: ['Film & Photo', 'Social', 'Paid Media'] },
  { n: '02', id: 'Convert', dot: '#D69445', tagline: 'Turn interest into reservations.', caps: ['Google & Local SEO', 'Reputation', 'Offers & Campaigns'] },
  { n: '03', id: 'Retain', dot: '#3E9FA1', tagline: 'Bring guests back.', caps: ['Email & SMS', 'CRM & Loyalty', 'Win-back Flows'] },
]

export default function GrowthEngineDiagram() {
  return (
    <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        {/* Header — matches the AudiencePaths / WorkGrid rhythm */}
        <div className="mb-14 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20">
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

        {/* Opening frame — the foundation everything is built on */}
        <div className="flex flex-col gap-1 border-t pt-5 pb-10 md:flex-row md:items-baseline md:gap-6" style={{ borderColor: HAIRLINE }}>
          <span className="type-eyebrow whitespace-nowrap" style={{ color: 'var(--teal-500)' }}>Brand Foundation</span>
          <span className="type-caption" style={{ color: 'var(--text-muted)' }}>
            Positioning, identity, and creative direction — everything the engine runs on.
          </span>
        </div>

        {/* The rail — one connected line carrying the three stages */}
        <div className="relative mb-10 hidden md:block" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ background: HAIRLINE }} />
          <div className="relative grid grid-cols-3">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center md:px-10 md:first:pl-0">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: stage.dot, boxShadow: '0 0 0 6px var(--cloud-100)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Three stages as flowing columns — divided by hairlines, not boxed */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col gap-4 border-t py-9 first:border-t-0 md:border-t-0 md:border-l md:py-0 md:px-10 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="leading-none tracking-[-0.04em]"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.75rem,4.5vw,4rem)', color: 'var(--teal-800)' }}
                >
                  {stage.n}
                </span>
                <span className="h-2 w-2 rounded-full md:hidden" style={{ background: stage.dot }} />
              </div>
              <div>
                <h3 className="type-card-title flex flex-col leading-[1.05]" style={{ color: 'var(--text-strong)' }}>
                  {stage.id}
                  <span className="type-eyebrow mt-2 font-normal" style={{ color: 'var(--teal-500)' }}>Demand</span>
                </h3>
                <p className="type-body mt-2.5 max-w-xs" style={{ color: 'var(--text-body)' }}>{stage.tagline}</p>
              </div>
              <ul className="mt-1 flex flex-col gap-1.5" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {stage.caps.map((cap) => (
                  <li key={cap} className="type-caption" style={{ color: 'var(--text-muted)' }}>{cap}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Closing frame — the loop that feeds the next cycle */}
        <div className="mt-2 flex flex-col gap-1 border-t pt-5 md:flex-row md:items-baseline md:gap-6" style={{ borderColor: HAIRLINE }}>
          <span className="type-eyebrow flex items-center gap-1.5 whitespace-nowrap" style={{ color: 'var(--teal-800)' }}>
            <span aria-hidden>↺</span> Measure · Learn · Optimize
          </span>
          <span className="type-caption" style={{ color: 'var(--text-muted)' }}>
            POS attribution and monthly reporting feed the next 28-day cycle — every stage, measured.
          </span>
        </div>
      </div>
    </section>
  )
}
