export type Client = string | { name: string; logo: string }

type Props = {
  clients: Client[]
  bg?: string
  label?: string
  size?: 'default' | 'compact'
}

type BrandNameProps = {
  client: Client
  index: number
}

function BrandName({ client, index }: BrandNameProps) {
  if (typeof client !== 'string') {
    return (
      // biome-ignore lint/performance/noImgElement: decorative marquee logos with variable aspect ratios; next/image adds no value here
      <img
        src={client.logo}
        alt={client.name}
        loading="lazy"
        className="h-[clamp(2.1rem,2.8vw,2.6rem)] w-auto max-w-[20rem] shrink-0 object-contain opacity-90"
      />
    )
  }
  return (
    <span
      className={`shrink-0 whitespace-nowrap text-[clamp(1.05rem,1.55vw,1.45rem)] leading-none text-ink ${index % 5 === 1 ? 'font-serif italic' : 'font-sans'}`}
      style={{
        fontWeight: index % 3 === 0 ? 600 : 500,
        letterSpacing: index % 4 === 0 ? '-0.04em' : '-0.015em',
        opacity: index % 7 === 0 ? 0.34 : index % 4 === 0 ? 0.52 : 0.82,
      }}
    >
      {client}
    </span>
  )
}

function BrandRow({ brands, reverse = false, indexOffset = 0 }: { brands: Client[]; reverse?: boolean; indexOffset?: number }) {
  return (
    <div className="brand-marquee-window overflow-hidden">
      <div className={`brand-marquee-track flex w-max ${reverse ? 'brand-marquee-track--reverse' : ''}`}>
        {[0, 1].map(copyIndex => (
          <div
            key={copyIndex}
            className="brand-marquee-set flex shrink-0 items-center gap-12 pr-12"
            aria-hidden={copyIndex > 0}
          >
            {brands.map((brand, index) => {
              const name = typeof brand === 'string' ? brand : brand.name
              return <BrandName key={name} client={brand} index={index + indexOffset} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogoTicker({ clients, bg, label, size = 'default' }: Props) {
  const sectionPadding = size === 'compact' ? 'py-20 md:py-28' : 'py-24 md:py-36'

  return (
    <section
      className={`relative overflow-hidden px-[var(--gutter)] ${sectionPadding} ${bg ? '' : 'bg-cream'}`}
      style={bg ? { background: bg } : undefined}
      aria-label={label ?? 'Client brands'}
    >
      {label && (
        <p className="m-0 mx-auto mb-14 text-center text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-ink md:mb-20">
          {label}
        </p>
      )}

      <div className="mx-auto max-w-[var(--container-max)]">
        <BrandRow brands={clients} />
      </div>
    </section>
  )
}
