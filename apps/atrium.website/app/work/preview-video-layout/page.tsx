import CTABanner from '@/components/sections/CTABanner'
import VideoShowcaseSection from '@/components/work/VideoShowcaseSection'
import { getCaseStudy } from '@/lib/work'
import {
  ApproachSection,
  CaseHero,
  getNextStudy,
  getStoryParagraphs,
  NextCasePreview,
  ResultsSection,
  StorySection,
} from '../[slug]/page'

// Unlisted preview of the video-led case-study layout, built against the
// real Hotel Kansas City data (1 cover photo, 8 real reels). Delete once
// the layout is approved and folded into app/work/[slug]/page.tsx.
export default function PreviewVideoLayoutPage() {
  const study = getCaseStudy('hotel-kc')
  if (!study) return null

  const nextStudy = getNextStudy(study)
  if (!nextStudy) return null

  return (
    <article style={{ background: 'var(--surface-page)', color: 'var(--text-strong)' }}>
      <CaseHero study={study} />
      <StorySection paragraphs={getStoryParagraphs(study)} />
      <VideoShowcaseSection study={study} />
      <ApproachSection study={study} />
      <ResultsSection study={study} metrics={study.metrics} />
      <NextCasePreview nextStudy={nextStudy} />
      <CTABanner
        eyebrow="JOIN 15+ HOSPITALITY BRANDS"
        headline={<>Been burned by an agency <em>before?</em></>}
        body="If you've outgrown freelancers, been let down by generic agencies, or just want a team that reports revenue instead of vanity — we were built for you. See the system before you commit."
        cta="Book a Growth Diagnostic"
        ctaHref="/contact"
        coverAlt="Team at table in restaurant — natural, warm, working together"
      />
    </article>
  )
}
