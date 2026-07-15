import Link from 'next/link'
import Eyebrow from '@/components/ui/Eyebrow'
import type { Service } from '@/lib/services'

const modelByCategory = {
  'Generate Demand': {
    name: 'Foundation',
    href: '/pricing#foundation',
    fit: 'For operators who need a clear brand foundation, a dependable production rhythm, and stronger local demand.',
  },
  'Convert Demand': {
    name: 'Growth',
    href: '/pricing#growth',
    fit: 'For operators with attention already in market who need more of it turning into calls, orders, reservations, and measurable action.',
  },
  'Retain Demand': {
    name: 'Full System',
    href: '/pricing#full-system',
    fit: 'For operators ready to connect direct guest relationships, automation, attribution, and reporting across the full engine.',
  },
} as const

export default function ServiceEngagementModel({ svc }: { svc: Service }) {
  const model = modelByCategory[svc.category as keyof typeof modelByCategory]

  return (
    <section className="px-[var(--gutter)] py-24 md:py-32" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto grid max-w-[var(--container-max)] gap-10 border-y py-12 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-20" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
        <div className="min-w-0">
          <Eyebrow className="mb-6">Related engagement model</Eyebrow>
          <p className="m-0 max-w-full font-normal leading-[0.86] tracking-[-0.055em]" style={{ color: 'var(--teal-800)', fontFamily: 'var(--font-serif)', fontSize: 'clamp(3.5rem, 5.5vw, 6.75rem)' }}>
            {model.name}
          </p>
        </div>
        <div className="min-w-0">
          <h2 className="type-card-title max-w-[24ch]" style={{ color: 'var(--text-strong)' }}>
            The most common starting point for {svc.name.toLowerCase()}.
          </h2>
          <p className="type-body mt-5 max-w-2xl" style={{ color: 'var(--text-muted)' }}>{model.fit}</p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            <Link href={model.href} className="type-caption group inline-flex items-center gap-3 font-medium no-underline" style={{ color: 'var(--teal-800)' }}>
              Compare the {model.name} model <span className="transition-transform group-hover:translate-x-2" aria-hidden="true">→</span>
            </Link>
            <Link href={`/contact?service=${svc.slug}`} className="type-caption group inline-flex items-center gap-3 font-medium no-underline" style={{ color: 'var(--teal-500)' }}>
              Scope this service <span className="transition-transform group-hover:translate-x-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
