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
          <h1 className="max-w-4xl text-5xl font-medium leading-none md:text-7xl" style={{ letterSpacing: 0 }}>
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-on-dark)', opacity: 0.68 }}>
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
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div
                key={`${stat.value}-${stat.label}`}
                className="rounded-[var(--radius-bento)] border p-5"
                style={{ borderColor: 'rgba(181,242,219,0.16)', background: 'rgba(181,242,219,0.05)' }}
              >
                <p className="text-3xl font-medium leading-none md:text-4xl" style={{ color: 'var(--mint-400)' }}>
                  {stat.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-on-dark)', opacity: 0.62 }}>
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
