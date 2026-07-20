import LogoTicker from '@/components/ui/LogoTicker'
import { clients } from '@/lib/clients'

export default function ServiceProofStrip() {
  return (
    <section style={{ background: 'var(--cloud-100)' }}>
      <LogoTicker
        clients={clients}
        label="Trusted by hospitality brands building demand"
        size="compact"
        bg="var(--cloud-100)"
      />
    </section>
  )
}
