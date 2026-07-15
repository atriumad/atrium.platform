import Link from 'next/link'
import Eyebrow from '@/components/ui/Eyebrow'

const paths = [
  {
    count: '1',
    label: 'Independent restaurant',
    tension: 'Fill the room consistently without handing your voice to another generic agency.',
    outcome: 'Build a dependable local demand system.',
    href: '/pricing#foundation',
    cta: 'See the Foundation model',
  },
  {
    count: '3–10',
    label: 'Multi-location group',
    tension: 'Stop asking five operators and five vendors to execute one brand differently.',
    outcome: 'Run every location from one accountable system.',
    href: '/pricing#growth',
    cta: 'See the Growth model',
  },
  {
    count: '10+',
    label: 'Franchise or enterprise',
    tension: 'Keep national consistency while each market stays locally relevant and measurable.',
    outcome: 'Create a playbook that repeats without flattening the brand.',
    href: '/pricing#full-system',
    cta: 'See the Full System model',
  },
]

export default function AudiencePaths() {
  return (
    <section className="px-[var(--gutter)] py-24 md:py-36" style={{ background: 'var(--cloud-100)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-14 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">Built for your stage</Eyebrow>
            <h2 className="type-section-title max-w-[13ch]">
              Different footprint. <em>Different first move.</em>
            </h2>
          </div>
          <p className="type-body max-w-lg border-t pt-6 lg:col-span-5" style={{ color: 'var(--text-muted)', borderColor: 'rgba(7,47,52,0.18)' }}>
            A single dining room, a regional group, and a national rollout should not enter through the same scope. Start with the operating problem that matches your footprint.
          </p>
        </div>

        <div className="border-y" style={{ borderColor: 'rgba(7,47,52,0.18)' }}>
          {paths.map((path, index) => (
            <Link
              key={path.label}
              href={path.href}
              className="group grid gap-7 border-b py-9 no-underline last:border-b-0 md:grid-cols-[8rem_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-10 md:py-11"
              style={{ borderColor: 'rgba(7,47,52,0.18)' }}
            >
              <p className="m-0 font-normal leading-none tracking-[-0.05em]" style={{ color: 'var(--teal-800)', fontFamily: 'var(--font-serif)', fontSize: 'clamp(4rem,7vw,7rem)' }}>
                {path.count}
              </p>
              <div>
                <p className="type-eyebrow m-0" style={{ color: 'var(--teal-500)' }}>
                  Path {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="type-card-title mt-3" style={{ color: 'var(--text-strong)' }}>
                  {path.label}
                </h3>
              </div>
              <div>
                <p className="type-body m-0 max-w-xl" style={{ color: 'var(--text-body)' }}>{path.tension}</p>
                <p className="type-caption mt-3 font-medium" style={{ color: 'var(--teal-800)' }}>{path.outcome}</p>
              </div>
              <span className="type-caption inline-flex items-center gap-3 font-medium" style={{ color: 'var(--teal-800)' }}>
                <span className="max-w-[10rem]">{path.cta}</span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
