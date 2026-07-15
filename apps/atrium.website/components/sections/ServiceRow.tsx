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
      style={{ borderTop: '1px solid rgba(228,238,240,0.06)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${color}0A` }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span
        className="type-caption w-8 flex-shrink-0 text-right font-medium tabular-nums"
        style={{ color: `${color}55` }}
      >
        {num}
      </span>

      <span
        className="flex-1 font-medium"
        style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)', lineHeight: 1.2, color: 'var(--text-on-dark)' }}
      >
        {name}
      </span>

      <span
        className="type-caption hidden w-72 flex-shrink-0 text-right lg:block"
        style={{ color: 'var(--text-on-dark)', opacity: 0.38 }}
      >
        {body}
      </span>

      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform duration-150 group-hover:translate-x-0.5"
        style={{ background: 'rgba(228,238,240,0.06)', color }}
      >
        →
      </span>
    </Link>
  )
}
