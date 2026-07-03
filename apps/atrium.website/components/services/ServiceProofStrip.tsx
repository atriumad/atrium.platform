import LogoTicker from '@/components/ui/LogoTicker'

const brands = ['Taco Naco', "T'\u00c4H\u00c4", 'Aahaa', 'Hotel KC', 'Grand Coffee']

export default function ServiceProofStrip() {
  return (
    <section className="pt-[3.25rem] pb-[3.75rem]" style={{ background: 'var(--cloud-100)' }}>
      <LogoTicker
        clients={brands}
        label="Trusted by hospitality brands building demand"
        size="compact"
        bg="var(--cloud-100)"
      />
    </section>
  )
}
