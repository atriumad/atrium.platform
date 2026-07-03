import type { Service } from '@/lib/services'

export default function ServicePerksRail({ svc }: { svc: Service }) {
  return (
    <section
      className="px-[var(--gutter)] pt-[3rem] pb-[5.5rem] max-sm:px-[var(--gutter)]"
      style={{ background: 'var(--cloud-100)' }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-[1px] max-w-[var(--container-max)] mx-auto overflow-hidden max-md:grid-cols-1"
        style={{
          background: 'rgba(7,47,52,0.08)',
          border: '1px solid rgba(7,47,52,0.08)',
          borderRadius: 'var(--radius-bento)',
        }}
      >
        {svc.perks.map((perk, index) => (
          <article
            key={perk.title}
            className="flex gap-[1.25rem] min-h-[13rem] p-[1.4rem] max-sm:min-h-auto"
            style={{ background: 'var(--cloud-100)' }}
          >
            <span
              className="text-[1.7rem] italic leading-[1] flex-shrink-0"
              style={{
                color: 'var(--teal-300)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3
                className="text-[1rem] font-semibold leading-[1.1] m-0 mb-[0.55rem]"
                style={{ color: 'var(--text-strong)' }}
              >
                {perk.title}
              </h3>
              <p
                className="text-[0.9rem] leading-[1.45] m-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {perk.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
