import Image from 'next/image'
import type { Service } from '@/lib/services'
import { parseHeadline } from './utils'

export default function ServiceThesis({ svc }: { svc: Service }) {
  return (
    <section
      className="px-(--gutter) pt-20 pb-26 max-sm:px-(--gutter)"
      style={{ background: 'var(--cloud-100)' }}
    >
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] items-center gap-16 max-w-6xl mx-auto max-md:grid-cols-1 max-md:gap-10">
        <div className="flex flex-col gap-[1.2rem]">
          <span
            className="type-eyebrow"
            style={{ color: 'var(--teal-500)' }}
          >
            {svc.thesis.eyebrow}
          </span>
          <h2
            className="type-section-title m-0 max-w-[17ch]"
            style={{ color: 'var(--text-strong)' }}
          >
            {parseHeadline(svc.thesis.headline)}
          </h2>
          <p
            className="type-body m-0 max-w-120"
            style={{ color: 'var(--text-muted)' }}
          >
            {svc.thesis.body}
          </p>
        </div>

        <div
          className="overflow-hidden relative min-h-124 max-md:min-h-112"
          style={{
            borderRadius: 'var(--radius-bento)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <Image
            src={svc.thesis.image}
            alt={svc.hero.coverAlt}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--teal-900) 4%, transparent), color-mix(in srgb, var(--teal-900) 22%, transparent))',
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
