import type { Client } from '@/components/ui/LogoTicker'

// Single source of truth for the brand marquee — shared by the homepage and
// every service page so they never drift out of sync with each other.
//
// Logos only. Set-in-type names sat among real marks as plain words and broke
// the row; a brand either has a mark here or it waits until it does.
//
// Sizes come from the brand sheet and are deliberately not uniform; see the
// note on ClientLogo in components/ui/LogoTicker.tsx. Where a mark arrived
// without a sheet size, the box is set from its own aspect ratio and then
// judged against the mark nearest it in shape — a badge against Old Shawnee
// Pizza, a wordmark against Town Co — so the row keeps one optical weight.
//
// Hotel Kansas City, The Unbound Collection and Hyatt sit together on purpose:
// they are one relationship at three levels of the same brand, and reading them
// apart in the row would suggest three separate clients.
export const clients: Client[] = [
  { name: 'Taco Naco KC', logo: '/logos/clients/tknc.png', width: 136, height: 82 },
  { name: "T'ÄHÄ", logo: '/logos/clients/taha.png', width: 181, height: 37 },
  { name: 'Hotel Kansas City', logo: '/logos/clients/htkc.png', width: 299, height: 30 },
  { name: 'The Unbound Collection by Hyatt', logo: '/logos/clients/Unbound.png', width: 106, height: 107 },
  { name: 'Hyatt', logo: '/logos/clients/hyat.png', width: 200, height: 98 },
  { name: 'Grand Coffee', logo: '/logos/clients/grco.png', width: 317, height: 66 },
  { name: 'Town Co', logo: '/logos/clients/ttco.svg', width: 175, height: 62 },
  { name: 'Chick-in-Waffle', logo: '/logos/clients/chwf.png', width: 144, height: 68 },
  { name: 'AAHAA', logo: '/logos/clients/aahaa.png', width: 186, height: 75 },
  { name: 'Jerusalem Cafe', logo: '/logos/clients/jeca.png', width: 374, height: 23 },
  { name: 'Old Shawnee Pizza', logo: '/logos/clients/ospz.png', width: 121, height: 102 },
  { name: 'Farm Fresh', logo: '/logos/clients/ffrb.png', width: 153, height: 94 },
  { name: 'Don Chuy’s', logo: '/logos/clients/dcop.png', width: 213, height: 45 },
]
