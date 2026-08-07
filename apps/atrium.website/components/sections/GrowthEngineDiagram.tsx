import { Eyebrow } from '@atrium/ui'

// ─── Atrium Growth Engine (doc vs.md §2.1 / §5 / §7.5) ──────────────────────
// A horizontal flow — Generate → Convert → Retain read as one connected system
// on a shared rail, bracketed by the Brand Foundation it's built on and the
// Measure · Learn · Optimize loop that feeds the next 28-day cycle. Editorial,
// light, hairline-driven — the same language as the rest of the site, but
// horizontal so it reads as flow, not another vertical index.

// Exported so other services-page sections (the engine split, stats) can
// share this exact copy/color data instead of maintaining their own.
export const stages = [
  { n: '01', id: 'Generate', dot: 'var(--stage-generate)', tagline: 'Create awareness and desire.', caps: ['Film & Photo', 'Social', 'Paid Media'] },
  { n: '02', id: 'Convert', dot: 'var(--stage-convert)', tagline: 'Turn interest into reservations.', caps: ['Google & Local SEO', 'Reputation', 'Offers & Campaigns'] },
  { n: '03', id: 'Retain', dot: 'var(--stage-retain)', tagline: 'Bring guests back.', caps: ['Email & SMS', 'CRM & Loyalty', 'Win-back Flows'] },
]

export default function GrowthEngineDiagram() {
  return (
    <section className="bg-card px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        {/* Header — matches the AudiencePaths / WorkGrid rhythm */}
        <div className="mb-14 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">The Atrium Growth Engine</Eyebrow>
            <h2 className="max-w-[14ch] text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em]">
              Not eleven services. <em className="font-serif italic text-green">One system.</em>
            </h2>
          </div>
          <p className="max-w-lg border-t border-line pt-6 text-base leading-relaxed text-muted lg:col-span-5">
            The services are just the components. What you buy is the engine that runs
            them — on a 28-day cycle, measured end to end.
          </p>
        </div>

        {/* Opening frame — the foundation everything is built on */}
        <div className="flex flex-col gap-1 border-t border-line pt-5 pb-10 md:flex-row md:items-baseline md:gap-6">
          <Eyebrow as="span" className="whitespace-nowrap">Brand Foundation</Eyebrow>
          <span className="text-[0.875rem] text-muted">
            Positioning, identity, and creative direction — everything the engine runs on.
          </span>
        </div>

        {/* The rail — one connected line carrying the three stages */}
        <div className="relative mb-10 hidden md:block" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <div className="relative grid grid-cols-3">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center md:px-10 md:first:pl-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_6px_var(--color-card)]"
                  style={{ background: stage.dot }}
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
              className="flex flex-col gap-4 border-t border-line py-9 first:border-t-0 md:border-t-0 md:border-l md:py-0 md:px-10 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[clamp(2.75rem,4.5vw,4rem)] leading-none tracking-[-0.04em] text-ink">
                  {stage.n}
                </span>
                <span className="h-2 w-2 rounded-full md:hidden" style={{ background: stage.dot }} />
              </div>
              <div>
                <h3 className="flex flex-col text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.05] text-ink">
                  {stage.id}
                  <Eyebrow as="span" className="mt-2">Demand</Eyebrow>
                </h3>
                <p className="mt-2.5 max-w-xs text-base leading-relaxed text-body">{stage.tagline}</p>
              </div>
              <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0">
                {stage.caps.map((cap) => (
                  <li key={cap} className="text-[0.875rem] text-muted">{cap}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Closing frame — the loop that feeds the next cycle */}
        <div className="mt-2 flex flex-col gap-1 border-t border-line pt-5 md:flex-row md:items-baseline md:gap-6">
          <Eyebrow as="span" className="flex items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden>↺</span> Measure · Learn · Optimize
          </Eyebrow>
          <span className="text-[0.875rem] text-muted">
            POS attribution and monthly reporting feed the next 28-day cycle — every stage, measured.
          </span>
        </div>
      </div>
    </section>
  )
}
