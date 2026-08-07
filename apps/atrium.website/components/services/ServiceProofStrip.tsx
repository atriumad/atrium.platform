import LogoTicker from '@/components/ui/LogoTicker'
import { clients } from '@/lib/clients'

export default function ServiceProofStrip() {
  return (
    <LogoTicker
      clients={clients}
      label="Trusted by hospitality brands building demand"
      size="compact"
    />
  )
}
