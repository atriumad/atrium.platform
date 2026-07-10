import Link from 'next/link'

const columns = [
  {
    label: 'Services',
    links: [
      { label: 'Brand Strategy', href: '/services/brand-strategy' },
      { label: 'Film & Photo', href: '/services/film-photo' },
      { label: 'Social Content', href: '/services/social-content' },
      { label: 'Paid Media', href: '/services/paid-media' },
      { label: 'Google SEO', href: '/services/google-seo' },
      { label: 'Email & SMS', href: '/services/email-sms' },
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
              <p className="text-2xl font-medium">Atrium</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ opacity: 0.65 }}>
              Smart creative for restaurants, hotels, and food brands. Hospitality is all we do.
            </p>
            <p className="text-sm mt-6 font-medium" style={{ color: 'var(--color-accent)' }}>
              Kansas City, MO · Cuba
            </p>
          </div>
          <div className="flex gap-16">
            {columns.map((col) => (
              <div key={col.label}>
                <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ opacity: 0.4, color: 'var(--color-accent)' }}>{col.label}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm transition-all duration-200 hover:pl-2" style={{ opacity: 0.65 }}>
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
          className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
          style={{ borderTop: '1px solid var(--color-border-subtle)', opacity: 0.4 }}
        >
          <p>© 2026 Atrium. All rights reserved.</p>
          <p>Built for the people who feed people.</p>
        </div>
      </div>
    </footer>
  )
}
