import { Button, Card, Eyebrow, Input, Logo, Meter, Stat, Tag } from '@atrium/ui'

const swatches = [
  {
    group: 'Warm neutrals',
    tokens: [
      { name: 'cream', className: 'bg-cream' },
      { name: 'off-white', className: 'bg-off-white' },
      { name: 'card', className: 'bg-card' },
      { name: 'track', className: 'bg-track' },
      { name: 'track-soft', className: 'bg-track-soft' },
      { name: 'pending', className: 'bg-pending' },
    ],
  },
  {
    group: 'Greens',
    tokens: [
      { name: 'ink', className: 'bg-ink' },
      { name: 'dark', className: 'bg-dark' },
      { name: 'green', className: 'bg-green' },
      { name: 'green-fill', className: 'bg-green-fill' },
      { name: 'green-soft', className: 'bg-green-soft' },
      { name: 'green-ink', className: 'bg-green-ink' },
      { name: 'mint', className: 'bg-lime' },
    ],
  },
  {
    group: 'Accent',
    tokens: [
      { name: 'amber', className: 'bg-amber' },
      { name: 'amber-fill', className: 'bg-amber-fill' },
      { name: 'amber-soft', className: 'bg-amber-soft' },
      { name: 'amber-ink', className: 'bg-amber-ink' },
    ],
  },
  {
    group: 'State',
    tokens: [
      { name: 'red-fill', className: 'bg-red-fill' },
      { name: 'red-soft', className: 'bg-red-soft' },
      { name: 'red-ink', className: 'bg-red-ink' },
      { name: 'red-tint', className: 'bg-red-tint' },
      { name: 'error', className: 'bg-error' },
    ],
  },
  {
    group: 'Text and line',
    tokens: [
      { name: 'body', className: 'bg-body' },
      { name: 'muted', className: 'bg-muted' },
      { name: 'muted-soft', className: 'bg-muted-soft' },
      { name: 'line', className: 'bg-line' },
    ],
  },
  {
    group: 'Editorial — campaign rotation only',
    tokens: [
      { name: 'coral', className: 'bg-coral' },
      { name: 'lilac', className: 'bg-lilac' },
      { name: 'sage', className: 'bg-sage' },
      { name: 'periwinkle', className: 'bg-periwinkle' },
    ],
  },
] as const

const buttonVariants = ['primary', 'secondary', 'accent', 'ghost'] as const
const buttonSizes = ['sm', 'md', 'lg'] as const
const tagVariants = ['outline', 'filled', 'solid', 'mint'] as const
const cardTones = ['surface', 'warm', 'dark', 'amber'] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <Eyebrow>{title}</Eyebrow>
      {children}
    </section>
  )
}

export default function Specimen() {
  return (
    <main className="min-h-svh bg-cream px-8 py-16 font-sans text-charcoal max-[560px]:px-5">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-16">
        <header className="flex flex-col gap-4">
          <Logo height={28} variant="lockup" />
          <h1 className="text-[clamp(1.95rem,4.6vw,3.5rem)] font-normal leading-[1.06]">
            Design system <em className="font-serif italic text-green">specimen</em>
          </h1>
          <p className="max-w-[52ch] leading-relaxed text-body">
            Every token and primitive in <code>@atrium/ui</code>, rendered from the live package.
          </p>
        </header>

        <Section title="Colour">
          {swatches.map(({ group, tokens }) => (
            <div key={group} className="flex flex-col gap-3">
              <h2 className="text-[1.1rem] font-medium">{group}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                {tokens.map((token) => (
                  <div key={token.name} className="flex flex-col gap-2">
                    <div className={`h-16 rounded-card-sm ring-1 ring-line ${token.className}`} />
                    <code className="text-[0.78rem] text-muted">{token.name}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Type">
          <div className="flex flex-col gap-4">
            <p className="text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none">
              Find the <em className="font-serif italic text-green">leaks</em>
            </p>
            <p className="text-[2rem] font-normal">Regular 400 — headings</p>
            <p className="text-[2rem] font-medium">Medium 500 — headings</p>
            <p className="max-w-[60ch] leading-relaxed text-body">
              Body copy at the system's default leading. Inter Tight carries everything functional;
              Instrument Serif appears once per composition, in italic.
            </p>
            <Eyebrow>Eyebrow — 600, 0.14em, uppercase</Eyebrow>
          </div>
        </Section>

        <Section title="Button">
          <div className="flex flex-col gap-5">
            {buttonSizes.map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} size={size} variant={variant}>
                    {variant}
                  </Button>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>disabled</Button>
              <Button href="#" variant="secondary">as a link</Button>
            </div>
          </div>
        </Section>

        <Section title="Tag and Stat">
          <div className="flex flex-wrap items-center gap-3">
            {tagVariants.map((variant) => (
              <Tag key={variant} variant={variant}>{variant}</Tag>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Stat label="Discovery" tone="good" value={80} />
            <Stat label="Reputation" tone="warn" value={68} />
            <Stat label="Social" tone="bad" value={11} />
          </div>
        </Section>

        <Section title="Card">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {cardTones.map((tone) => (
              <Card key={tone} hairline tone={tone}>
                <Eyebrow tone={tone === 'dark' ? 'on-dark' : 'default'}>{tone}</Eyebrow>
                <p className="mt-3 leading-relaxed">Card body copy at the default padding.</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Input">
          <div className="grid max-w-[520px] gap-5">
            <Input hint="Name and city" label="Restaurant" placeholder="The Original Ninfa's" />
            <Input error="Enter at least 3 characters" label="Restaurant" defaultValue="Ni" />
          </div>
        </Section>

        <Section title="Meter">
          <Card elevation="soft">
            <Meter description="Discovery is helping the restaurant compete." label="Discovery" tone="hi" value={80} />
            <Meter description="Weak reputation makes guests compare alternatives." label="Reputation" tone="mid" value={68} />
            <Meter description="Social signals are thin." label="Social" tone="lo" value={11} />
          </Card>
        </Section>
      </div>
    </main>
  )
}
