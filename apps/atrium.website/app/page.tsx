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

const bentoItems: BentoItem[] = [
  { size: 'large', title: <>Content from <em>your</em> kitchen</>, body: "We don't use stock. We shoot on location — your food, your team, your energy. Every frame has a job on the content calendar before we press record.", cover: 'BTS wide shot — camera, chef plating, warm restaurant lighting' },
  { size: 'small', title: <>Brand consistency that <em>compounds</em></>, body: 'Same voice, same look, same energy — across 3 platforms, 3 locations, or 30 posts.', cover: 'Side-by-side IG grids showing visual consistency' },
  { size: 'small', title: <>Reviews managed <em>before they go public</em></>, body: 'Happy guests → Google review. Unhappy guests → private feedback.', cover: 'Survey flow diagram' },
  { size: 'medium', title: <>The guest who returns <em>is the business</em></>, body: '65% of restaurant revenue comes from repeat customers. We build the email flows, SMS sequences, and loyalty systems that earn the next visit.', cover: 'Email campaign on phone + POS order confirmation' },
  { size: 'medium', title: <>Found when they&apos;re <em>ready to decide</em></>, body: '46% of Google searches have local intent. When someone nearby is hungry, your profile is what they find.', cover: 'Google Maps view with client pin highlighted' },
  { size: 'small', title: <>One dashboard. <em>Everything visible.</em></>, body: 'Sales, social, email, reviews, campaigns — aggregated in one clean interface.', cover: 'Dashboard mobile view, clean data' },
]

const selectedWork: Project[] = [
  { number: '01', client: 'Taco Naco KC', result: '3 locations. One brand. Full system activation.', cover: 'hero image', href: '/work/taco-naco', orientation: 'horizontal' },
  { number: '02', client: "T'ÄHÄ Mexican Kitchen", result: 'Single campaign. Measurable revenue lift.', cover: 'hero image', href: '/work/taha', orientation: 'vertical' },
  { number: '03', client: 'Aahaa Modern Indian', result: 'Visual identity that found its voice.', cover: 'hero image', href: '/work/aahaa', orientation: 'square' },
  { number: '04', client: 'Hotel Kansas City', result: 'Two-part campaign storytelling.', cover: 'hero image', href: '/work/hotel-kc', orientation: 'horizontal' },
  { number: '05', client: 'Grand Coffee', result: 'Brand system from the ground up.', cover: 'hero image', href: '/work/grand-coffee', orientation: 'vertical' },
]

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
  { type: 'testimonial', quote: 'The brunch campaign they built moved real revenue. Not followers — people sitting down on Sunday mornings.', author: 'TBD', role: 'Owner', company: "T'ÄHÄ Mexican Kitchen", bg: 'var(--color-forest-2)' },
  { type: 'stat', stat: '88%', statLabel: 'of diners trust online reviews as much as personal recommendations. We manage every one of yours.' },
]

const clients = [
  'Taco Naco KC', "T'ÄHÄ", 'Aahaa Modern Indian', 'Hotel Kansas City', 'Grand Coffee',
  'Town Co', 'Palacana', 'JECA', 'Foxx', 'KC Jazz', 'Pigwich', 'Tacos Borrachos', 'OSPZ', 'FFRB', 'DCOP',
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
        bg="var(--surface-page)"
      />
      <AudiencePaths />
      <BentoGrid
        items={bentoItems}
        eyebrow="One system, six leaks closed"
        headline={<>What changes when every channel <em>shares a job.</em></>}
      />
      <GrowthEngineDiagram />
      <WorkGrid projects={selectedWork} />
      <ComparisonMatrix />
      <StatsStrip stats={homeStats} />
      <TestimonialBento items={testimonialCards} eyebrow="Evidence from the operators" />
      <DarkProcess
        eyebrow="How We Work"
        headline={<>A monthly engine. <em>Not random posts.</em></>}
        body="Strategy, content, and technology run as one system on a 28-day cycle — so marketing stops being guesswork and you can focus on the food."
        cta="See the process"
        ctaHref="/process"
        steps={processSteps}
        stats={processStats}
      />
      <CTABanner
        eyebrow="Free tool"
        headline={<>Know your growth score. <em>In 2 minutes.</em></>}
        body="The Atrium Growth Grader scores your Google presence, website, and social — then shows you exactly what's leaking revenue. No signup required."
        cta="Try the Growth Grader"
        ctaHref="https://atrium-grader.vercel.app"
        ctaExternal
        coverAlt="Free restaurant marketing audit — Atrium Growth Grader"
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
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </>
  )
}
