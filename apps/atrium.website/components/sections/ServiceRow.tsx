'use client'
import Link from 'next/link'

type Props = {
  slug: string
  name: string
  body: string
  num: string
  color: string
}

export default function ServiceRow({ slug, name, body, num, color }: Props) {
  return (
    <Link
      href={`/services/${slug}`}
      className="group flex items-center gap-6 md:gap-10 px-6 md:px-16 py-7 md:py-8 no-underline transition-[background] duration-150"
      style={{ borderTop: '1px solid rgba(7,47,52,0.08)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${color} 8%, transparent)` }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span
        className="w-16 flex-shrink-0 text-right italic leading-none"
        style={{
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          fontFamily: 'var(--font-serif)',
          color: `color-mix(in srgb, ${color} 55%, var(--teal-800) 45%)`,
        }}
      >
        {num}
      </span>

      <span
        className="type-card-title flex-1 m-0"
        style={{ color: 'var(--text-strong)' }}
      >
        {name}
      </span>

      <span
        className="type-caption hidden w-72 flex-shrink-0 text-right lg:block"
        style={{ color: 'var(--text-muted)' }}
      >
        {body}
      </span>

      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform duration-150 group-hover:translate-x-0.5"
        style={{ background: 'rgba(7,47,52,0.05)', color }}
      >
        →
      </span>
    </Link>
  )
}
