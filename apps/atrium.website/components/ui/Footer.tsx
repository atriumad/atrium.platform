import Link from 'next/link'

const columns = [
  {
    label: 'Services',
    links: [
      { label: 'Brand Strategy', href: '/services/brand-strategy' },
      { label: 'Film & Photo', href: '/services/film-photo' },
      { label: 'Social Content', href: '/services/social-content' },
      { label: 'Social Management', href: '/services/social-management' },
      { label: 'Paid Media', href: '/services/paid-media' },
      { label: 'Google SEO', href: '/services/google-seo' },
      { label: 'Reputation', href: '/services/reputation' },
      { label: 'Experiential', href: '/services/experiential' },
      { label: 'Email & SMS', href: '/services/email-sms' },
      { label: 'CRM & Loyalty', href: '/services/crm-loyalty' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'Our Work', href: '/work' },
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="px-6 md:px-12 py-16 md:py-24" style={{ background: 'var(--color-primary)', color: 'var(--color-text-light)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
              <p className="type-card-title">Atrium</p>
            </div>
            <p className="type-caption" style={{ opacity: 0.72 }}>
              Smart creative for restaurants, hotels, and food brands. Hospitality is all we do.
            </p>
            <p className="type-caption mt-6 font-medium" style={{ color: 'var(--color-accent)' }}>
              Kansas City, MO · Cuba
            </p>
          </div>
          <div className="flex gap-16">
            {columns.map((col) => (
              <div key={col.label}>
                <p className="type-eyebrow mb-4" style={{ opacity: 0.52, color: 'var(--color-accent)' }}>{col.label}</p>
                <ul className={col.links.length > 6 ? 'grid grid-cols-2 gap-x-8 gap-y-3' : 'flex flex-col gap-3'}>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="type-caption inline-block whitespace-nowrap transition-transform duration-200 hover:translate-x-1" style={{ opacity: 0.72 }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div
          className="type-caption flex flex-col items-start justify-between gap-4 pt-8 md:flex-row md:items-center"
          style={{ borderTop: '1px solid var(--color-border-subtle)', opacity: 0.4 }}
        >
          <p>© 2026 Atrium. All rights reserved.</p>
          <p>Built for the people who feed people.</p>
        </div>
      </div>
    </footer>
  )
}
