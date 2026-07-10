import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CTABanner from '@/components/sections/CTABanner'
import ServiceBento from '@/components/services/ServiceBento'
import ServiceEditorialHero from '@/components/services/ServiceEditorialHero'
import ServiceMarquee from '@/components/services/ServiceMarquee'
import ServiceProofStrip from '@/components/services/ServiceProofStrip'
import ServiceStatsEditorial from '@/components/services/ServiceStatsEditorial'
import ServiceThesis from '@/components/services/ServiceThesis'
import ServiceTimelineEditorial from '@/components/services/ServiceTimelineEditorial'
import { getService, services } from '@/lib/services'

export async function generateStaticParams() {
  return services.map(s => ({ slug: s.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) return {}
  return {
    title: `${svc.name} — Atrium`,
    description: svc.hero.body,
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) notFound()

  return (
    <>
      <ServiceEditorialHero svc={svc} />

      <ServiceMarquee svc={svc} />

      <ServiceProofStrip />

      <ServiceThesis svc={svc} />

      <ServiceBento cards={svc.bentoCards} />

      <ServiceStatsEditorial stats={svc.stats} />

      {svc.timeline && <ServiceTimelineEditorial steps={svc.timeline} />}

      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Get marketing support <em>you can trust</em></>}
        body="If you've outgrown freelancers, feel held back by generic agencies, or need a creative team that actually understands restaurants — we were built for you."
        cta="Let's Talk"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </>
  )
}
