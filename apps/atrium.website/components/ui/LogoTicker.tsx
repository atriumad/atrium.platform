export type ClientLogo = {
  name: string
  logo: string
  /** Size in px at --logo-scale 1, taken from the brand sheet.
   *
   *  These are per-logo on purpose. A common height cannot work across marks
   *  this different: Jerusalem Cafe is 16:1 and Old Shawnee Pizza is 1.2:1, so
   *  matching their heights makes one absurdly wide and the other a speck.
   *  The sheet sizes each mark to read at the same optical weight on a shared
   *  baseline, which means different heights. */
  width: number
  height: number
}

export type Client = string | ClientLogo

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
        width={client.width}
        height={client.height}
        loading="lazy"
        className="shrink-0 object-contain opacity-90"
        style={{
          width: `calc(${client.width}px * var(--logo-scale))`,
          height: `calc(${client.height}px * var(--logo-scale))`,
        }}
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
            // One knob scales the whole set, so the sheet's relative sizing
            // survives every breakpoint.
            className="brand-marquee-set flex shrink-0 items-center gap-12 pr-12 [--logo-scale:0.28] md:gap-16 md:pr-16 md:[--logo-scale:0.39] lg:[--logo-scale:0.5]"
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
