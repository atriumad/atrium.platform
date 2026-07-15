import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CTABanner from '@/components/sections/CTABanner'
import PurchaseFAQ from '@/components/sections/PurchaseFAQ'
import ServiceTimeline from '@/components/sections/ServiceTimeline'
import RelatedCase from '@/components/services/RelatedCase'
import ServiceBento from '@/components/services/ServiceBento'
import ServiceDeliverables from '@/components/services/ServiceDeliverables'
import ServiceEditorialHero from '@/components/services/ServiceEditorialHero'
import ServiceEngagementModel from '@/components/services/ServiceEngagementModel'
import ServiceProofStrip from '@/components/services/ServiceProofStrip'
import ServiceStatsEditorial from '@/components/services/ServiceStatsEditorial'
import ServiceSystemMap from '@/components/services/ServiceSystemMap'
import ServiceThesis from '@/components/services/ServiceThesis'
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

      <ServiceProofStrip />

      <ServiceThesis svc={svc} />

      <ServiceSystemMap svc={svc} />

      <ServiceDeliverables svc={svc} />

      <ServiceBento cards={svc.bentoCards} />

      <ServiceStatsEditorial stats={svc.stats} />

      {svc.timeline && <ServiceTimeline steps={svc.timeline} />}

      <RelatedCase serviceSlug={svc.slug} />

      <ServiceEngagementModel svc={svc} />

      <PurchaseFAQ
        limit={5}
        dark
        heading="What operators ask before this goes live."
        intro="The service changes by channel. The rules do not: one owner, an agreed cadence, and measurement that matches the systems you actually use."
      />

      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Been burned by an agency <em>before?</em></>}
        body="If you've outgrown freelancers, been let down by generic agencies, or just want a team that reports revenue instead of vanity — we were built for you. See the system before you commit."
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </>
  )
}
