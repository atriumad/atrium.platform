type Props = {
  clients: string[]
  bg?: string
  label?: string
  size?: 'default' | 'compact'
}

type BrandNameProps = {
  name: string
  index: number
}

function BrandName({ name, index }: BrandNameProps) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap text-[clamp(1.05rem,1.55vw,1.45rem)] leading-none ${index % 5 === 1 ? 'italic' : ''}`}
      style={{
        color: 'var(--text-strong)',
        fontFamily: index % 5 === 1 ? 'var(--font-serif)' : 'var(--font-sans)',
        fontWeight: index % 3 === 0 ? 600 : 500,
        letterSpacing: index % 4 === 0 ? '-0.04em' : '-0.015em',
        opacity: index % 7 === 0 ? 0.34 : index % 4 === 0 ? 0.52 : 0.82,
      }}
    >
      {name}
    </span>
  )
}

function BrandRow({ brands, reverse = false, indexOffset = 0 }: { brands: string[]; reverse?: boolean; indexOffset?: number }) {
  return (
    <div className="brand-marquee-window overflow-hidden">
      <div className={`brand-marquee-track flex w-max ${reverse ? 'brand-marquee-track--reverse' : ''}`}>
        {[0, 1].map(copyIndex => (
          <div
            key={copyIndex}
            className="brand-marquee-set flex shrink-0 items-center justify-around gap-12 px-6 md:px-10"
            aria-hidden={copyIndex > 0}
          >
            {brands.map((name, index) => (
              <BrandName key={name} name={name} index={index + indexOffset} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogoTicker({ clients, bg, label, size = 'default' }: Props) {
  const splitAt = Math.ceil(clients.length / 2)
  const firstRow = clients.slice(0, splitAt)
  const secondRow = clients.slice(splitAt)
  const sectionPadding = size === 'compact' ? 'py-20 md:py-28' : 'py-24 md:py-36'

  return (
    <section
      className={`relative overflow-hidden px-[var(--gutter)] ${sectionPadding}`}
      style={{ background: bg ?? 'var(--surface-page)' }}
      aria-label={label ?? 'Client brands'}
    >
      {label && (
        <p
          className="type-lead m-0 mx-auto mb-14 text-center md:mb-20"
          style={{ color: 'var(--text-strong)' }}
        >
          {label}
        </p>
      )}

      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="hidden flex-col gap-14 md:flex md:gap-16">
          <BrandRow brands={firstRow} />
          <BrandRow brands={secondRow} reverse indexOffset={splitAt} />
        </div>

        <div className="md:hidden">
          <BrandRow brands={clients} />
        </div>
      </div>
    </section>
  )
}
