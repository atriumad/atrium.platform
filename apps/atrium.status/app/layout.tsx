import type { Metadata } from "next"
import Link from "next/link"
import { instrumentSerif, interTight } from "@/lib/fonts"
import { repoSnapshot } from "@/lib/repo-data"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Atrium — system status",
    template: "%s · Atrium status",
  },
  description: "Health of every agency system, and the documentation for each one.",
  robots: { index: false, follow: false },
}

const NAV = [
  { href: "/", label: "Status" },
  { href: "/systems", label: "Systems" },
  { href: "/incidents", label: "Incidents" },
  { href: "/repo", label: "Repo" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { git } = repoSnapshot

  return (
    <html className={`${interTight.variable} ${instrumentSerif.variable}`} lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-[color:var(--color-line)] bg-[color:var(--color-cream)]/85 backdrop-blur">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3.5">
            <Link className="flex items-baseline gap-2" href="/">
              <span className="font-serif text-[1.35rem] leading-none text-[color:var(--color-ink)]">
                Atrium
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                status
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-1">
              {NAV.map((item) => (
                <Link
                  className="rounded-full px-3 py-1.5 text-[0.83rem] font-medium text-[color:var(--color-body)] transition-colors hover:bg-[color:var(--color-cool)] hover:text-[color:var(--color-ink)]"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="ml-auto flex items-center gap-2 font-mono text-[0.72rem] text-[color:var(--color-muted)]">
              <span className="rounded-full bg-[color:var(--color-ink)] px-2 py-0.5 text-[color:var(--color-lime)]">
                {git.branch || "detached"}
              </span>
              <span>{git.head.slice(0, 7)}</span>
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-[1180px] px-6 pb-24 pt-10">{children}</main>

        <footer className="border-t border-[color:var(--color-line)] px-6 py-8">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 text-[0.78rem] text-[color:var(--color-muted)]">
            <span>
              Checks run on a schedule, not on page load — what you see is the last recorded sweep.
            </span>
            <Link className="underline underline-offset-4" href="/api/health">
              /api/health
            </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
