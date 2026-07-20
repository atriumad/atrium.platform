import type { Client } from '@/components/ui/LogoTicker'

// Single source of truth for the brand marquee — shared by the homepage and
// every service page so they never drift out of sync with each other.
export const clients: Client[] = [
  { name: 'Taco Naco KC', logo: '/logos/clients/tnkc.png' },
  { name: "T'ÄHÄ", logo: '/logos/clients/taha.png' },
  { name: 'Aahaa Modern Indian', logo: '/logos/clients/aahaa.png' },
  { name: 'Hotel Kansas City', logo: '/logos/clients/htkc.png' },
  'Grand Coffee',
  { name: 'Town Co', logo: '/logos/clients/ttco.svg' },
  'Palacana', 'JECA', 'Foxx', 'KC Jazz', 'Pigwich', 'Tacos Borrachos',
  { name: 'Old Shawnee Pizza', logo: '/logos/clients/ospz.png' },
  { name: 'Farm Fresh', logo: '/logos/clients/ffrb.png', scale: 1.5 },
  { name: 'Don Chuy’s', logo: '/logos/clients/dcop.png' },
]
