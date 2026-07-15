import type { Service } from '@/lib/services'

const stages = [
  {
    name: 'Generate Demand',
    short: 'Generate',
    job: 'Create awareness and desire.',
    handoff: 'Hands qualified attention to conversion.',
  },
  {
    name: 'Convert Demand',
    short: 'Convert',
    job: 'Turn intent into visits and orders.',
    handoff: 'Captures the guest relationship for retention.',
  },
  {
    name: 'Retain Demand',
    short: 'Retain',
    job: 'Earn the next visit.',
    handoff: 'Feeds revenue evidence into the next cycle.',
  },
] as const

export default function ServiceSystemMap({ svc }: { svc: Service }) {
  return (
    <section className="px-[var(--gutter)] py-24 md:py-32" style={{ background: 'var(--teal-900)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-12 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-16">
          <div className="lg:col-span-7">
            <p className="type-eyebrow m-0 mb-5" style={{ color: 'var(--mint-400)' }}>Inside the Growth Engine</p>
            <h2 className="type-section-title max-w-[14ch]" style={{ color: 'var(--text-on-dark)' }}>
              This service has a job <em>before and after launch.</em>
            </h2>
          </div>
          <p className="type-body max-w-lg border-t pt-6 lg:col-span-5" style={{ color: 'var(--cloud-300)', opacity: 0.7, borderColor: 'rgba(181,242,219,0.2)' }}>
            {svc.name} sits inside {svc.category.toLowerCase()}. It does not operate as an isolated deliverable; it passes signal and demand into the next stage.
          </p>
        </div>

        <div className="grid border-y md:grid-cols-3" style={{ borderColor: 'rgba(181,242,219,0.2)' }}>
          {stages.map((stage, index) => {
            const active = stage.name === svc.category
            return (
              <article
                key={stage.name}
                className={`relative flex min-h-[17rem] flex-col border-b px-6 py-8 last:border-b-0 md:min-h-[19rem] md:border-b-0 md:px-8 md:py-9 ${index > 0 ? 'md:border-l' : ''}`}
                style={{
                  borderColor: 'rgba(181,242,219,0.2)',
                  background: active ? 'color-mix(in srgb, var(--mint-400) 8%, transparent)' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="type-eyebrow m-0" style={{ color: active ? 'var(--mint-400)' : 'var(--cloud-300)', opacity: active ? 1 : 0.52 }}>
                    {String(index + 1).padStart(2, '0')} · {stage.short}
                  </p>
                  {active && <span className="type-eyebrow rounded-full px-3 py-1" style={{ color: 'var(--teal-900)', background: 'var(--mint-400)' }}>This service</span>}
                </div>
                <h3 className="type-card-title mt-8" style={{ color: 'var(--text-on-dark)' }}>{stage.job}</h3>
                <p className="type-caption mt-auto max-w-xs pt-8" style={{ color: 'var(--cloud-300)', opacity: 0.64 }}>{stage.handoff}</p>
              </article>
            )
          })}
        </div>

        <div className="flex flex-col gap-2 border-b py-6 md:flex-row md:items-center md:gap-6" style={{ borderColor: 'rgba(181,242,219,0.2)' }}>
          <p className="type-eyebrow m-0" style={{ color: 'var(--mint-400)' }}>↺ Measure · learn · optimize</p>
          <p className="type-caption m-0" style={{ color: 'var(--cloud-300)', opacity: 0.64 }}>Every stage returns evidence to the next 28-day cycle.</p>
        </div>
      </div>
    </section>
  )
}
