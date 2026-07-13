import type { ReactNode } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'

type HeroAction = {
  label: string
  href: string
  variant?: 'primary' | 'ghost' | 'ghostLight' | 'mint' | 'amber'
  external?: boolean
}

type HeroStat = {
  value: string
  label: string
}

type PageHeroProps = {
  eyebrow: string
  title: ReactNode
  body: string
  actions?: HeroAction[]
  stats?: HeroStat[]
}

export default function PageHero({ eyebrow, title, body, actions, stats }: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden px-6 pt-32 pb-20 md:px-12 md:pt-40 md:pb-28"
      style={{ background: 'var(--teal-800)', color: 'var(--text-on-dark)' }}
    >
      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.65fr)] lg:items-end">
        <div>
          <Eyebrow tone="onDark" className="mb-7">
            {eyebrow}
          </Eyebrow>
          <h1 className="type-page-title max-w-4xl">
            {title}
          </h1>
          <p className="type-lead mt-8 max-w-2xl" style={{ color: 'var(--text-on-dark)', opacity: 0.76 }}>
            {body}
          </p>
          {actions && actions.length > 0 && (
            <div className="mt-9 flex flex-wrap gap-4">
              {actions.map((action, index) => (
                <Button
                  key={action.href}
                  href={action.href}
                  variant={action.variant ?? (index === 0 ? 'mint' : 'ghostLight')}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="border-t md:grid md:grid-cols-3 lg:block" style={{ borderColor: 'rgba(181,242,219,0.28)' }}>
            {stats.map((stat) => (
              <div
                key={`${stat.value}-${stat.label}`}
                className="grid min-h-32 grid-cols-[minmax(5rem,0.72fr)_minmax(0,1fr)] items-center gap-5 border-b py-6 md:block md:px-5 lg:grid lg:px-0"
                style={{ borderColor: 'rgba(181,242,219,0.28)' }}
              >
                <p className="m-0 text-[clamp(3.25rem,5vw,5.75rem)] font-normal italic leading-none tracking-[-0.04em]" style={{ color: 'var(--mint-400)', fontFamily: 'var(--font-serif)' }}>
                  {stat.value}
                </p>
                <p className="type-caption m-0 md:mt-4 lg:mt-0" style={{ color: 'var(--text-on-dark)', opacity: 0.72 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
