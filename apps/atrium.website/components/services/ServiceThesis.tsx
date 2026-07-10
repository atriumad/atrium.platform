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
            className="text-[0.78rem] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--teal-500)' }}
          >
            {svc.thesis.eyebrow}
          </span>
          <h2
            className="max-w-[17ch] text-[3rem] font-medium leading-[0.98] m-0 max-sm:text-[2.45rem]"
            style={{ color: 'var(--text-strong)' }}
          >
            {parseHeadline(svc.thesis.headline)}
          </h2>
          <p
            className="max-w-120 text-[1rem] m-0"
            style={{ color: 'var(--text-muted)', lineHeight: 'var(--leading-body)' }}
          >
            {svc.thesis.body}
          </p>
        </div>

        <div
          className="overflow-hidden relative min-h-124 max-md:min-h-112"
          style={{
            borderRadius: 'var(--radius-bento)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(4,32,36,0.24)), var(--surface-atmos)',
            backgroundSize: 'cover',
            boxShadow: 'var(--shadow-soft)',
          }}
          aria-label={svc.hero.coverAlt}
          role="img"
        >
          <div
            className="absolute inset-[9%_11%] p-4"
            style={{
              border: '1px solid rgba(255,255,255,0.48)',
              borderRadius: '1.8rem',
              background: 'rgba(255,255,255,0.76)',
              boxShadow: 'var(--shadow-pop)',
              transform: 'rotate(5deg)',
            }}
          >
            <div className="flex gap-1.8 mb-4">
              <span className="w-[0.64rem] h-[0.64rem] rounded-full" style={{ background: 'var(--teal-800)', opacity: 0.16 }} />
              <span className="w-[0.64rem] h-[0.64rem] rounded-full" style={{ background: 'var(--amber-500)', opacity: 0.72 }} />
              <span className="w-[0.64rem] h-[0.64rem] rounded-full" style={{ background: 'var(--teal-800)', opacity: 0.16 }} />
            </div>
            <div className="grid grid-cols-3 gap-2.2">
              {svc.perks.slice(0, 6).map((perk, index) => (
                <span
                  key={perk.title}
                  className="aspect-1 rounded-3.6"
                  style={{
                    background: index % 2 === 1
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(7,47,52,0.58)), var(--surface-atmos-deep)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(7,47,52,0.38)), var(--grad-aurora)',
                    backgroundSize: index % 2 === 1 ? 'cover' : undefined,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute left-4 bottom-4 right-4 truncate rounded-full px-3.6 py-3 text-12 font-semibold overflow-hidden"
              style={{
                background: 'var(--teal-800)',
                color: 'var(--mint-300)',
              }}
            >
              {svc.name}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
