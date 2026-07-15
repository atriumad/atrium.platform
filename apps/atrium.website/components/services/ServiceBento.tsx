import type { BentoCard } from '@/lib/services'
import { parseHeadline } from './utils'

function BentoCardPhoto({ card }: { card: BentoCard }) {
  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-bento)] p-4-5 max-sm:p-[1.25rem] md:row-span-2 min-h-[37rem] max-md:min-h-[30rem]"
      style={{
        background: 'linear-gradient(180deg, rgba(4,32,36,0.04) 20%, rgba(4,32,36,0.82)), var(--surface-atmos-deep)',
        backgroundSize: 'cover',
        color: 'var(--cloud-100)',
      }}
    >
      <div
        className="relative z-1 max-w-[15rem] rounded-full px-[0.85rem] py-[0.62rem] text-[0.75rem] leading-[1.25]"
        style={{
          background: 'rgba(255,255,255,0.17)',
          color: 'rgba(255,255,255,0.72)',
        }}
      >
        {card.coverAlt}
      </div>
      <div className="relative z-1 grid gap-[0.9rem]">
        <span className="type-eyebrow opacity-56">{card.size}</span>
        <h3 className="type-card-title m-0" style={{ color: 'inherit' }}>
          {parseHeadline(card.title)}
        </h3>
        <p className="type-caption m-0 opacity-76" style={{ color: 'inherit' }}>
          {card.copy}
        </p>
      </div>
    </article>
  )
}

function BentoCardStatement({ card }: { card: BentoCard }) {
  return (
    <article
      className="relative flex flex-col justify-between gap-[1rem] overflow-hidden rounded-[var(--radius-bento)] p-4-5 max-sm:p-[1.25rem]"
      style={{ background: 'var(--cloud-400)', color: 'var(--teal-800)' }}
    >
      <div className="flex flex-col gap-[0.9rem]">
        <h3
          className="type-card-title m-0 max-w-[11ch]"
          style={{ color: 'var(--amber-400)' }}
        >
          {parseHeadline(card.title)}
        </h3>
      </div>
      <p className="type-caption m-0 max-w-[31rem] opacity-72" style={{ color: 'var(--teal-800)' }}>
        {card.copy}
      </p>
    </article>
  )
}

function BentoCardPosition({ card }: { card: BentoCard }) {
  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-bento)] p-4-5 max-sm:p-[1.25rem]"
      style={{ background: 'var(--teal-300)', color: 'var(--teal-900)' }}
    >
      <span className="type-eyebrow opacity-56">{card.size}</span>
      <h3 className="type-card-title m-0 max-w-[15ch]">
        {parseHeadline(card.title)}
      </h3>
      <p className="type-caption m-0 opacity-76">
        {card.copy}
      </p>
    </article>
  )
}

function BentoCardMini({ card }: { card: BentoCard }) {
  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-bento)] p-4-5 max-sm:p-[1.25rem]"
      style={{ background: 'var(--mint-300)', color: 'var(--teal-800)' }}
    >
      <span className="type-eyebrow opacity-56">{card.size}</span>
      <h3 className="type-card-title m-0">
        {parseHeadline(card.title)}
      </h3>
      <p className="type-caption m-0 opacity-76">
        {card.copy}
      </p>
    </article>
  )
}

function BentoCardNeutral({ card }: { card: BentoCard }) {
  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-bento)] p-4-5 gap-3-5"
      style={{ background: 'var(--mint-300)', color: 'var(--teal-800)' }}
    >
      <h3 className="type-card-title m-0">
        {parseHeadline(card.title)}
      </h3>
      <p className="type-caption m-0 opacity-76">
        {card.copy}
      </p>
    </article>
  )
}

export default function ServiceBento({ cards }: { cards: BentoCard[] }) {
  const [feature, proof, position, extra] = cards
  const fallbackCards = cards.slice(0, 3)

  if (!feature || !proof || !position) {
    return (
      <section className="px-[var(--gutter)] pt-[1rem] pb-[6.5rem] max-sm:px-[var(--gutter)]" style={{ background: 'var(--cloud-100)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem] max-w-[var(--container-max)] mx-auto">
          {fallbackCards.map(card => (
            <BentoCardNeutral key={card.title} card={card} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="px-[var(--gutter)] pt-[1rem] pb-[6.5rem] max-sm:px-[var(--gutter)]" style={{ background: 'var(--cloud-100)' }}>
      <div className="grid md:grid-cols-[0.86fr_1.2fr] md:grid-rows-[minmax(20rem,auto)_16rem] gap-[1rem] max-w-[var(--container-max)] mx-auto max-md:grid-cols-1 max-md:grid-rows-auto">
        <BentoCardPhoto card={feature} />
        <BentoCardStatement card={proof} />
        <BentoCardPosition card={position} />
        {extra && <BentoCardMini card={extra} />}
      </div>
    </section>
  )
}
