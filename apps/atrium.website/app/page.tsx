import AudiencePaths from '@/components/sections/AudiencePaths'
import BentoGrid, { type BentoItem } from '@/components/sections/BentoGrid'
import ComparisonMatrix from '@/components/sections/ComparisonMatrix'
import CTABanner from '@/components/sections/CTABanner'
import DarkProcess, { type ProcessStat, type ProcessStep } from '@/components/sections/DarkProcess'
import GrowthEngineDiagram from '@/components/sections/GrowthEngineDiagram'
import HeroSection from '@/components/sections/HeroSection'
import PurchaseFAQ from '@/components/sections/PurchaseFAQ'
import SplitSection from '@/components/sections/SplitSection'
import StatsStrip, { type Stat } from '@/components/sections/StatsStrip'
import TestimonialBento, { type BentoCard } from '@/components/sections/TestimonialBento'
import WorkGrid, { type Project } from '@/components/sections/WorkGrid'
import LogoTicker from '@/components/ui/LogoTicker'
import { clients } from '@/lib/clients'
import { CTA } from '@/lib/cta'
import { type CaseStudy, caseStudies } from '@/lib/work'

// Shot for the home bento and staged on our own CDN. Absolute URLs: next/image
// cannot take a bare public ID.
const BENTO_CDN = 'https://cdn.atriumad.com/clients/ATRM/photos/home_bento'

const bentoItems: BentoItem[] = [
  { size: 'large', title: <>Content that <em>shows you at your best</em></>, body: 'Your food, your chef, your room, whatever makes people crave you. We shoot what you already have and make it the reason they came.', cover: 'BTS wide shot — camera, chef plating, warm restaurant lighting', image: `${BENTO_CDN}/hf_20260813_164837_3011f832-4f1b-4a17-944e-3b46fa35fe40.png.jpg` },
  { size: 'small', fill: 'lime', title: <>Reviews caught <em>before they go public</em></>, body: 'The happy guest goes to Google. The unhappy one comes to you first. We catch the problems early and push the rating up over time.' },
  { size: 'medium', title: <>Traffic that <em>turns into tables</em></>, body: 'We send people from Instagram and Google straight to your reservation and your online order, not just to your profile.', cover: 'Instagram profile linking through to a reservation confirmation', image: `${BENTO_CDN}/hf_20260813_163511_10455442-be91-4766-a01f-3352da1c3d85.png` },
  { size: 'medium', fill: 'coral', title: <>The guest who returns <em>is the business</em></>, body: "Sixty five percent of a restaurant's revenue is the guest who comes back. We make sure they do, without you paying to win them twice." },
  { size: 'medium', title: <>Found when they&apos;re <em>ready to decide</em></>, body: 'Forty six percent of Google searches are local. When someone three blocks away is hungry, you are what they find.' },
  { size: 'small', title: <>A brand that sounds like <em>you</em></>, body: 'We set the look, the voice, and the plan, so you show up the same and on purpose across every platform.', cover: 'Side-by-side IG grids showing visual consistency', image: `${BENTO_CDN}/hf_20260813_174647_f38cf676-2e0f-46e9-91eb-6424b5608163.png` },
]

const selectedWorkDetails = [
  { slug: 'taco-naco', result: '3 locations. One brand. Full system activation.' },
  { slug: 'taha', result: 'Single campaign. Measurable revenue lift.' },
  { slug: 'aahaa', result: 'Visual identity that found its voice.' },
  { slug: 'hotel-kc', result: 'Two-part campaign storytelling.' },
  { slug: 'grand-coffee', result: 'Brand system from the ground up.' },
] as const

const selectedWork: Project[] = selectedWorkDetails.flatMap(({ slug, ...details }) => {
  const study = caseStudies.find(item => item.slug === slug)
  return study ? [{ study: study satisfies CaseStudy, ...details }] : []
})

const processSteps: ProcessStep[] = [
  { eyebrow: 'STRATEGIC', title: 'Discovery & brand immersion', body: 'We learn your restaurant — the food, the culture, the numbers, the competition. Not a questionnaire. A real conversation.' },
  { eyebrow: 'CREATIVE', title: 'Strategy lock + first shoot', body: 'Brand direction, visual system, and content calendar defined. Then we walk into your kitchen with cameras.' },
  { eyebrow: 'SYSTEMATIC', title: 'Activate every channel', body: 'Content goes live. Google optimized. Email flows activated. Ads launched on proven creative.' },
]
const processStats: ProcessStat[] = [
  { number: '15+', label: 'Active hospitality brand partnerships' },
  { number: '28', label: 'Day engine cycle — shoot to report' },
]

const testimonialCards: BentoCard[] = [
  { type: 'stat', stat: '74%', statLabel: 'of diners use social media to decide where to eat. Your feed is their first impression.' },
  { type: 'testimonial', quote: 'Working with Atrium across our 3 Taco Naco locations changed how we think about marketing. One system, one voice, real results.', author: 'Brian Goldman Ruiz', role: 'Owner', company: 'Taco Naco KC' },
  { type: 'testimonial', quote: 'The brunch campaign they built moved real revenue. Not followers — people sitting down on Sunday mornings.', author: '', role: 'Owner', company: "T'ÄHÄ Mexican Kitchen" },
  { type: 'stat', stat: '88%', statLabel: 'of diners trust online reviews as much as personal recommendations. We manage every one of yours.' },
]

const homeStats: Stat[] = [
  { number: '$42', label: 'return on every $1 spent on restaurant email. The highest-ROI channel in hospitality.' },
  { number: '70%', label: "of first-time diners never return. The problem isn't your food. It's the silence after they leave." },
  { number: '2.7x', label: 'more guests retained by brands using direct 1:1 engagement vs those relying on broad marketing.' },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LogoTicker
        clients={clients}
        label="Trusted by hospitality brands building demand"
        size="compact"
      />
      <BentoGrid
        items={bentoItems}
        eyebrow="One system, six leaks closed"
        headline={<>What changes when every channel <em>shares a job.</em></>}
      />
      <AudiencePaths />
      <GrowthEngineDiagram />
      <WorkGrid projects={selectedWork} />
      <ComparisonMatrix />
      <StatsStrip stats={homeStats} />
      <TestimonialBento items={testimonialCards} eyebrow="Evidence from the operators" />
      <DarkProcess
        eyebrow="How We Work"
        headline={<>A monthly engine. <em className="font-serif italic">Not random posts.</em></>}
        body="Strategy, content, and technology run as one system on a 28-day cycle — so marketing stops being guesswork and you can focus on the food."
        cta="See the process"
        ctaHref="/process"
        steps={processSteps}
        stats={processStats}
      />
      <SplitSection
        eyebrow="One team, not five vendors"
        headline={<>You don&apos;t need five vendors. <em>You need one system.</em></>}
        body="Brand strategy to CRM, shoots to dashboards — 11 disciplines under one roof, run as a single system. No hand-offs. No briefing your business twice."
        cta="Explore services →"
        ctaHref="/services"
        coverAlt="Icons representing the 11 services flowing into one output"
      />
      <PurchaseFAQ limit={6} />
      <CTABanner
        eyebrow="Join 15+ Hospitality Brands"
        headline={<>Been burned by an agency <em>before?</em></>}
        body="If you've outgrown freelancers, been let down by generic agencies, or just want a team that reports revenue instead of vanity — we were built for you. See the system before you commit."
        cta={CTA.primary.label}
        ctaHref={CTA.primary.href}
        ctaExternal={CTA.primary.external}
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </>
  )
}
