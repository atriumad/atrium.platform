import { caseAssetOverrides } from './case-assets.overrides'
import { cloudinaryAssets } from './cloudinary-assets.generated'

export type CaseMetric = {
  number: string
  label: string
  /** A sentence under the label, where the number needs context to mean
   *  anything. Optional — older studies carry the label alone. */
  detail?: string
}

export type CaseTestimonial = { quote: string; name: string; role: string }
export type HowStep = { title: string; body: string }
export type ScopeGroup = { label: string; items: string[] }
export type CaseGalleryImage = {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  width?: number
  height?: number
}

export type CaseStudy = {
  slug: string
  client: string
  /** Canonical Cloudinary public ID for cover surfaces. */
  coverImageId?: string
  /** Local transparent brand mark displayed over the cover. */
  coverLogo?: string
  /** CSS object-position override for the cover photograph. */
  coverPosition?: string
  /** Vertical nudge for the cover logo (CSS translateY, e.g. '-5%'). */
  coverLogoOffsetY?: string
  /** Scale multiplier for the cover logo, for marks with heavy internal whitespace. */
  coverLogoScale?: number
  location?: string
  category: string
  serviceTags: string[]
  resultHeadline: string
  intro?: string
  story: string[]
  /** The two halves of the story told side by side. Both fall back to `story`
   *  — the paragraphs were already written in that order — so a study reads
   *  correctly before anyone gets round to splitting it by hand. */
  challenge?: string
  solution?: string
  /** The case study's own H1. Falls back to the client name. */
  heroHeadline?: string
  /** Heading over the challenge/solution pair. */
  storyHeadline?: string
  /** Heading over the photo gallery. Falls back to the section default. */
  galleryHeadline?: string
  /** Standfirst under the photo-gallery heading. */
  galleryNote?: string
  /** Heading over the client testimonial. Falls back to the section default. */
  testimonialHeadline?: string
  testimonial?: CaseTestimonial
  metrics: CaseMetric[]
  /** Two short claims for the card in Selected Work, where a full metric label
   *  is too long to sit in a pill. Drawn from `metrics` — same numbers, fewer
   *  words. A study with none falls back to its first two metrics. */
  highlights?: string[]
  howWeDidIt?: HowStep[]
  scope?: ScopeGroup[]
  takeaway?: string
  gallery?: CaseGalleryImage[]
  /** Cloudinary public IDs for the draggable gallery (preferred over `gallery`). */
  galleryIds?: string[]
  /** Cloudinary public IDs for the case-study video marquee. */
  videoIds?: string[]
  /** Film work, for the studies whose deliverable was a shoot rather than a
   *  social calendar. Set this and the case study renders film-led. */
  films?: CaseFilms
  order: number
}

/** One person on camera. The interviews are the argument in a film-led case —
 *  the client saying what changed, in their own words — so they get a section
 *  rather than a slot in a rail. */
export type CaseInterview = { src: string; poster?: string; name: string; role?: string }

/** The films a case study delivered, sorted by the job each one does.
 *
 *  Unlike `videoIds`, these are finished CDN URLs: film masters are 4K at
 *  60–80 Mbps and never lived on the CDN, so `apps/atrium.cdn/ingest-films.mjs`
 *  encodes them locally and uploads only the web variants. */
export type CaseFilms = {
  /** The one that opens the page, in place of the reel rail. */
  feature: string
  /** Everything else shot landscape. */
  films?: string[]
  interviews?: CaseInterview[]
  /** Vertical cuts off the same shoot. */
  cuts?: string[]
}

/** Every film variant is uploaded with a poster of the same name beside it. */
export function filmPoster(src: string): string {
  return src.replace(/\.mp4$/i, '.jpg')
}

/** The reel a case study's card plays, and therefore the frame it sits on.
 *
 *  `videoIds` is delivery order, not editorial order: its first entry is
 *  whatever the folder happened to list first, which for two clients is a promo
 *  card of type. A card is one tile on the homepage, so it gets the one reel
 *  that shows the work — food, a pour, a plate going out. Anything not named
 *  here falls back to the first reel it has. */
const CASE_CARD_REELS: Record<string, string> = {
  'taco-naco': "https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20APR29_Ceviche%20Tostada-.mp4", // TNKC_ APR29_Ceviche Tostada-
  'taha': "https://cdn.atriumad.com/clients/TAHA/reels/TAHA_%20AUG22%20Grilled%20Salmon%20Prep.mp4", // TAHA_ AUG22 Grilled Salmon Prep
  'don-chuys': "https://cdn.atriumad.com/clients/DCOP/reels/DCOP_%20AUG01%20Taco%20Tuesday%20-%2001.mp4", // DCOP_ AUG01 Taco Tuesday - 01
  'chick-in-waffle': "https://cdn.atriumad.com/clients/CHWF/reels/CHWF_%20JUN18%20THE%20TENDER%20COMBO%C2%A0PREP%20-%2001.mp4", // CHWF_ JUN18 THE TENDER COMBO PREP - 01
  'aahaa': "https://cdn.atriumad.com/clients/AAHA/reels/AAHA_%20JUL15%20New%20chef%20specialty%20Zafrani%20Chicken%C2%A0Tikka%20-%2001.mp4", // AAHA_ JUL15 New chef specialty Zafrani Chicken Tikka - 01
  'jerusalem-cafe': "https://cdn.atriumad.com/clients/JECA/reels/JECA_%20JUL01%20Build%20a%20bowl-prep%20-%2001.mp4", // JECA_ JUL01 Build a bowl-prep - 01
  'old-shawnee-pizza': "https://cdn.atriumad.com/clients/OSPZ/reels/OSPZ_%20JUL28%20Big%20Joe%20Pizza.mp4", // OSPZ_ JUL28 Big Joe Pizza
}

/** Absolute URL of the reel a card should play, or null to fall back to the
 *  cover photograph. Only an absolute URL qualifies: `videoIds` still carries
 *  bare Cloudinary public IDs for clients that have not moved to our CDN, and
 *  that account is disabled. */
export function getCaseCardReel(study: CaseStudy): string | null {
  const curated = CASE_CARD_REELS[study.slug]
  if (curated) return curated
  const first = study.videoIds?.[0]?.trim()
  return first && /^https?:\/\//i.test(first) ? first : null
}

export function getCaseCover(study: CaseStudy) {
  return {
    imageId: study.coverImageId ?? study.galleryIds?.[0],
    logo: study.coverLogo,
    position: study.coverPosition ?? 'center',
    logoOffsetY: study.coverLogoOffsetY,
    logoScale: study.coverLogoScale,
  }
}

/** True when a case study's only real media is video — no traditional photo
 *  shoot to build a gallery from. Computed from synced Cloudinary asset
 *  counts, never hand-flagged, so any future all-video client picks up the
 *  video-led layout automatically once its folder is mapped in
 *  scripts/sync-cloudinary-assets.ts. */
export function isVideoLed(study: CaseStudy): boolean {
  return (study.videoIds?.length ?? 0) > 0 && (study.galleryIds?.length ?? 0) <= 1
}

export const caseStudies: CaseStudy[] = [
  // ─── 1. TACO NACO ───────────────────────────────────────────────────────
  {
    slug: 'taco-naco',
    highlights: ['23K Followers', '1.2M+ Impressions'],
    client: 'Taco Naco KC',
    coverImageId: 'https://cdn.atriumad.com/clients/TNKC/photos/TNKC_%20APR05%20Slide%205.jpg',
    coverLogo: '/logos/clients/tknc.png',
    category: 'Fast-Casual Mexican · Multi-Location Engagement',
    serviceTags: [
      'Professional Content',
      'Brand Strategy',
      'Social Media Marketing',
      'UGC Collabs',
      'Discoverability Strategy',
    ],
    heroHeadline: 'Turning local flavor into a brand people follow.',
    resultHeadline: '3 locations. 23K followers. Over 1.2 million impressions. One brand.',
    storyHeadline: 'From local favorite to digital momentum.',
    challenge:
      'Taco Naco had the food, personality, and loyal local following. The challenge was translating that energy into a consistent digital presence that could grow with the brand and keep people engaged across every location.',
    solution:
      'We built a content-first system around Taco Naco’s personality—combining brand strategy, professional content, social media marketing, and UGC collaborations to create a recognizable presence designed for consistency, community, and growth.',
    story: [
      'Taco Naco KC has three locations — Overland Park, Westport, and State Line. Great food, loyal crowd, but online the brand was all over the place. No consistent look. No real strategy. No way to know what was working.',
      'We came in December 2025 and built the whole thing from scratch. One brand direction. One content system. One team managing every platform, every location, every day. We started shooting monthly, launched platforms they weren’t on, and connected their Google profiles to a real strategy.',
      'Five months in — 23K followers across every platform, over 713K impressions on social, and 504K impressions on Google alone across all three locations. Over 1,000 pieces of content published. The brand finally looks and sounds like one brand, no matter where you find it.',
    ],
    metrics: [
      {
        number: '2.47M',
        label: 'Total impressions',
        detail: 'Building visibility across Taco Naco’s digital ecosystem.',
      },
      {
        number: '23.58K',
        label: 'Total followers',
        detail: 'A growing community across Taco Naco’s social platforms.',
      },
      {
        number: '+19.2%',
        label: 'Google visibility',
        detail:
          'Growth in Google Business Profile impressions, reaching 333.45K impressions.',
      },
    ],
    galleryNote:
      'Professional content captures the color, texture, people, and personality that make the Taco Naco experience instantly recognizable.',
    testimonial: {
      quote:
        'From day one, we connected with the Atrium team—their energy, creativity, and passion for what they do. They truly work with us as part of our team. More than feeling like we hired an agency, we feel like we found a true partner for our business.',
      name: 'Fernanda Reyes',
      role: 'Taco Naco KC',
    },
    order: 1,
  },

  // ─── 2. T'ÄHÄ (worked example, verbatim from brief) ────────────────────
  {
    slug: 'taha',
    highlights: ['5.24M+ Impressions', '30% Open Rate'],
    client: 'T’ÄHÄ Mexican Kitchen',
    coverImageId: 'https://cdn.atriumad.com/clients/TAHA/photos/TAHA_%20JUL15%20Lifestyle%20Photo.jpg',
    coverLogo: '/logos/clients/taha.png',
    location: 'Kansas City, MO',
    category: 'Fine Dining · Full-Service Engagement',
    serviceTags: ['Brand Strategy', 'Content', 'Social', 'PR', 'Email & SMS', 'Google'],
    resultHeadline: 'Sold-out Michelin dinners. 5.24M+ impressions. Zero paid ads.',
    intro:
      'No paid ads. No celebrity backing. No existing audience. Just strategy, content, and a multi-step funnel — and we sold out Michelin-star dinners, built a 30% email open rate, and turned a restaurant into a brand that creators choose to be associated with.',
    story: [
      'Every campaign ran a full cycle: awareness content to build anticipation, PR outreach to earned media, email sequences to convert interest into reservations, and CTAs embedded at every touchpoint. The result was consistent, predictable reservation flow — not random spikes.',
    ],
    metrics: [
      { number: '5.24M+', label: 'total impressions (+544% period over period)' },
      { number: '30%', label: 'email open rate — 2× industry average' },
      { number: '4+', label: 'sold-out events — organic only, zero paid ads' },
      { number: '537K', label: 'Google Business reach (+508% YoY)' },
      { number: '217K+', label: 'cross-platform reach on one offer ($1 Oysters)' },
      { number: '43.2K', label: 'GBP action clicks (+193%) — calls, maps, website' },
    ],
    howWeDidIt: [
      { title: 'We built a multi-step funnel — not just posts', body: 'Awareness content, PR outreach, email sequences, and CTAs at every touchpoint produced consistent, predictable reservation flow.' },
      { title: 'PR + email sold out Michelin-star events with no paid spend', body: 'For the Mar & Tierra collaboration with Chef Alberto Ferruz (2 Michelin Stars, BonAmb, Spain) — the first event of its caliber in Kansas City — targeted PR, a carousel campaign, Story countdowns, and a multi-step email sequence sold out both nights. Same for the T’ÄHÄ Takeover series.' },
      { title: 'One offer. Every platform. Compounding reach.', body: 'The $1 Oysters Wednesday campaign generated 33K+ impressions on Instagram, 33K+ on TikTok, plus Facebook and Stories reach — compounding week over week into the Plaza’s most-anticipated weekly standing.' },
      { title: 'We built a brand creators want to belong to', body: 'Creators visited specifically to shoot content — drawn by the aesthetic and culinary prestige — generating an estimated 100K+ additional impressions at zero production cost.' },
      { title: 'We created the tagline — and it stuck', body: '“Crafting Mexican Excellence” was originated by Atrium and now appears across all channels, printed menus, event materials, and in-house signage.' },
    ],
    order: 2,
  },

  // ─── 3. AAHAA ───────────────────────────────────────────────────────────
  {
    slug: 'aahaa',
    highlights: ['460K+ Organic Impressions', '+19.6% Instagram Growth'],
    client: 'Aahaa Modern Indian Cuisine',
    coverImageId: 'https://cdn.atriumad.com/clients/AAHA/photos/AAHA_%20JUN06%20Slide%201.jpg',
    coverLogo: '/logos/clients/aahaa.png',
    coverLogoOffsetY: '-5%',
    location: 'Overland Park, Kansas',
    category: 'Modern Indian Cuisine · Social Media & Brand Positioning',
    serviceTags: ['Brand Positioning', 'Content Strategy', 'Social Media Management', 'Photography', 'Paid Social'],
    resultHeadline:
      'How a Modern Indian Restaurant Generated 460,000+ Organic Impressions by Repositioning Itself as Fine Dining—Not Just Indian Food.',
    intro:
      'Aahaa faced a common challenge: consumers often viewed Indian cuisine through a casual dining lens. The opportunity wasn’t to sell dishes—it was to elevate perception.',
    story: [
      'Our strategy focused on transforming Aahaa into a fine dining experience through visual storytelling, chef-led authority, and premium hospitality content.',
      'Aahaa successfully repositioned itself from a restaurant known primarily for its cuisine into a destination recognized for its experience. The outcome was stronger engagement, accelerated audience growth, increased visibility, and a brand presence that aligns with the expectations of a modern fine dining establishment.',
    ],
    metrics: [
      { number: '460,000+', label: 'organic impressions' },
      { number: '322,000+', label: 'Instagram views' },
      { number: '8,697', label: 'total audience (followers)' },
      { number: '+19.6%', label: 'Instagram growth' },
      { number: '570', label: 'pieces of content published' },
      { number: '4.18%', label: 'paid social ad CTR' },
    ],
    howWeDidIt: [
      { title: 'Sold the experience before the food', body: 'Most restaurants showcase menu items. We showcased atmosphere. Elegant interiors, thoughtful design details, patio moments, and guest experience content positioned Aahaa alongside premium dining destinations rather than traditional ethnic restaurants.' },
      { title: 'Made the chef part of the brand', body: 'Fine dining is built on credibility. By highlighting Executive Chef Anjoy Mukherjee, culinary craftsmanship became part of the story. The restaurant gained authority beyond its cuisine and established a stronger premium identity.' },
      { title: 'Elevated every dish into a visual statement', body: 'Instead of documenting food, we curated it. Rich colors, plating details, texture, and presentation transformed dishes into aspirational content that encouraged saves, shares, and repeat engagement.' },
      { title: 'Shifted the conversation from “Indian food” to “modern dining”', body: 'Every caption, reel, and campaign reinforced one message: Modern Indian Cuisine. Refined. Contemporary. Elevated. The content strategy focused on experience, hospitality, and craftsmanship rather than cultural familiarity alone.' },
      { title: 'Built consistency at scale', body: 'Premium positioning requires repetition. Through a high-volume content cadence across Instagram, Facebook, TikTok, Stories, and Reels, the brand stayed visible enough to change perception and build momentum organically.' },
    ],
    scope: [
      { label: 'Strategy', items: ['Brand Positioning', 'Content Strategy', 'Fine Dining Messaging', 'Audience Growth Strategy', 'Campaign Planning', 'Performance Analysis'] },
      { label: 'Execution', items: ['Social Media Management', 'Reels Production', 'Photography Direction', 'Community Management', 'Story Content', 'Paid Social Support'] },
    ],
    order: 3,
  },

  // ─── 4. DON CHUY'S ──────────────────────────────────────────────────────
  {
    slug: 'don-chuys',
    client: 'Don Chuy’s Fresh Mex & Cantina',
    highlights: ['1M+ Social Impressions', '7.2K+ Social Followers'],
    coverImageId: 'https://cdn.atriumad.com/clients/DCOP/photos/DCOP_MAR21%20Full%20tabel.jpg',
    coverLogo: '/logos/clients/dcop.png',
    category: 'Full-Service Mexican · Multi-Location Growth',
    serviceTags: [
      'Professional Content',
      'Brand Strategy',
      'Social Media Marketing',
      'UGC Collabs',
      'Content Strategy',
    ],
    heroHeadline: 'Turning bold flavor into a brand people follow.',
    resultHeadline: '1M+ social impressions. 7.2K+ followers. +40% revenue growth.',
    storyHeadline: 'From restaurant experience to digital momentum.',
    challenge:
      'Don Chuy’s already had what mattered—the food, cocktails, atmosphere, and personality. The opportunity was translating that energy into a digital presence that felt just as distinctive, while building a larger audience and creating stronger visibility around the restaurant.',
    solution:
      'We built a content-first system around the Don Chuy’s experience—combining professional content, social media strategy, creative storytelling, and consistent publishing. Food, cocktails, culture, and atmosphere became the foundation for a recognizable social presence designed to capture attention, build community, and keep Don Chuy’s top of mind.',
    story: [
      'We built a content-first system around the Don Chuy’s experience—combining professional content, social media strategy, creative storytelling, and consistent publishing. Food, cocktails, culture, and atmosphere became the foundation for a recognizable social presence designed to capture attention, build community, and keep Don Chuy’s top of mind.',
    ],
    metrics: [
      {
        number: '1M+',
        label: 'Social media impressions',
        detail:
          'Building visibility across Instagram, Facebook, and TikTok through consistent, high-impact content.',
      },
      {
        number: '7.2K+',
        label: 'Social followers',
        detail:
          'Growing an audience of more than 7,200 followers across Don Chuy’s social platforms.',
      },
      {
        number: '+40%',
        label: 'Revenue growth',
        detail:
          'Stronger marketing and brand visibility contributed to measurable business growth.',
      },
    ],
    galleryHeadline: 'The experience, in full color.',
    galleryNote:
      'Professional content captures the bold food, cocktails, people, and energy that make the Don Chuy’s experience instantly recognizable.',
    testimonialHeadline: 'A stronger brand. A growing business.',
    testimonial: {
      quote:
        'The impact on social media has been incredible. People are seeing and enjoying the content, and most importantly, it’s bringing new customers through our doors. The team is professional, attentive, and always brings great ideas.',
      name: 'Jesus Leon',
      role: 'Don Chuy’s Fresh Mex & Cantina',
    },
    howWeDidIt: [
      { title: 'We sold the destination, not the menu', body: 'Most restaurant marketing focuses on dishes. We focused on the environment, atmosphere, bar experience, design, and energy of the restaurant—creating demand for the experience itself.' },
      { title: 'We built signature weekly traffic drivers', body: 'Taco Tuesday, Ladies Night, Happy Hour, Lazy Thursday, margarita campaigns, and seasonal promotions gave customers recurring reasons to visit throughout the week.' },
      { title: 'We turned the bar program into a growth engine', body: 'Cocktails, margarita flights, specialty drinks, and visual beverage content consistently became some of the highest-performing assets across platforms.' },
      { title: 'We positioned Don Chuy’s as a category leader', body: 'Rather than competing as another Mexican restaurant, we established Don Chuy’s as one of the most visually recognizable and experience-driven dining destinations in the market.' },
    ],
    order: 4,
  },

  // ─── 5. OLD SHAWNEE PIZZA ───────────────────────────────────────────────
  {
    slug: 'old-shawnee-pizza',
    highlights: ['$363K+ Retention Revenue', '2.69M+ Social Impressions'],
    client: 'Old Shawnee Pizza',
    coverImageId: 'https://cdn.atriumad.com/clients/OSPZ/photos/DSC03168.jpg',
    coverLogo: '/logos/clients/ospz.png',
    category: 'Pizza Restaurant · Legacy Brand Revitalization',
    serviceTags: [
      'Professional Content',
      'Brand Strategy',
      'Social Media Marketing',
      'Paid Media',
      'Email Retention',
      'Discoverability Strategy',
    ],
    heroHeadline: 'Turning decades of local loyalty into a modern growth engine.',
    resultHeadline:
      '$363K+ in retention revenue. 2.69M+ social impressions. 31.72X return on ad spend.',
    storyHeadline: 'From local legacy to measurable momentum.',
    challenge:
      'Old Shawnee Pizza already had decades of history, a loyal customer base, and strong recognition across Kansas City. The opportunity was connecting that legacy to a more consistent digital system—one that could keep both locations visible, engage longtime and new customers, and turn marketing activity into measurable revenue.',
    solution:
      'We connected content, social media, paid acquisition, local discoverability, and email retention into one growth system—giving Old Shawnee Pizza a consistent digital presence while creating more ways to turn attention into visits, orders, and repeat business.',
    story: [
      'We connected content, social media, paid acquisition, local discoverability, and email retention into one growth system—giving Old Shawnee Pizza a consistent digital presence while creating more ways to turn attention into visits, orders, and repeat business.',
    ],
    // The 2.69M social figure is the sum of the two location reports, counting
    // the shared Instagram account once: Facebook Lenexa 1.03M + Facebook
    // Shawnee 1.21M + Instagram 332.11K + TikTok 72.09K (current) + ~50K
    // (previous account). Google Business reach (357.79K + 379.60K ≈ 737K) is
    // deliberately excluded — it is discovery, not social.
    metrics: [
      {
        number: '$363K+',
        label: 'Retention revenue',
        detail:
          'Attributed sales generated through email campaigns and automated customer retention flows.',
      },
      {
        number: '2.69M+',
        label: 'Social media impressions',
        detail: 'Building visibility across both locations on Facebook, Instagram, and TikTok.',
      },
      {
        number: '31.72X',
        label: 'Return on ad spend',
        detail:
          'Turning Google Ads into measurable restaurant revenue with high-intent customers.',
      },
    ],
    galleryHeadline: 'A local institution, in frame.',
    galleryNote:
      'Professional content captures the food, people, history, and personality behind a restaurant that has been part of the Kansas City community for generations.',
    testimonialHeadline: 'Built on history. Growing with intention.',
    testimonial: {
      quote:
        'Atrium took the time to really understand who we are and what we’re trying to do. We’ve seen the difference in our social media and engagement, but most importantly, it’s getting people through the doors. They’ve become more than an agency we hired—they’re a partner we trust.',
      name: 'William Walker',
      role: 'Old Shawnee Pizza',
    },
    howWeDidIt: [
      { title: 'We turned a legacy into a marketing asset', body: 'Most restaurants talk about their food. Old Shawnee Pizza had something more valuable: history. We built content around the story of Joe Walker, the family legacy, and William Walker’s leadership, creating a narrative that competitors simply couldn’t replicate. This transformed Old Shawnee Pizza from another local restaurant into a brand with authenticity, heritage, and personality.' },
      { title: 'We positioned the restaurant as a community gathering place', body: 'The strongest brands aren’t built around products. They’re built around experiences. Our content highlighted the atmosphere, neighborhood culture, bar program, live events, and social environment that customers already loved. The result was content that felt personal, local, and relevant.' },
      { title: 'We made William Walker the face of the brand', body: 'People connect with people. By featuring William throughout content, promotions, kitchen stories, behind-the-scenes videos, and menu features, we gave customers a face they could connect with. This increased trust, strengthened engagement, and reinforced the family-owned identity of the business.' },
      { title: 'We leveraged signature products to drive reach', body: 'Data quickly revealed clear customer favorites. Content featuring the Crab Rangoon Pizza, specialty pizzas, signature recipes, lunch specials, and unique menu offerings consistently generated some of the highest engagement across platforms. Rather than producing generic restaurant content, we doubled down on what customers already loved.' },
      { title: 'We built consistent traffic drivers', body: 'Awareness alone doesn’t fill restaurants. We developed campaigns around Lunch Specials, Game Day Promotions, Live Music Events, Whiskey Wednesdays, Tequila Nights, Seasonal Offers, and Family Meal Deals. These recurring promotions created reasons for customers to return throughout the week rather than only on weekends.' },
      { title: 'We connected awareness to revenue', body: 'Social media was only one part of the strategy. Email marketing, CRM automations, and customer retention campaigns allowed us to continue conversations long after customers left the restaurant. Consistently nurturing the customer database turned owned channels into $363K+ in attributed retention revenue, while high-intent Google Ads returned 31.72X on ad spend. This created a marketing ecosystem focused not only on acquiring customers—but keeping them.' },
    ],
    scope: [
      { label: 'Strategy', items: ['Brand Positioning', 'Content Strategy', 'Promotional Planning', 'Customer Retention Strategy', 'CRM Development', 'Email Marketing Strategy'] },
      { label: 'Content & Execution', items: ['Social Media Management', 'Photography', 'Video Production', 'Reels & TikTok Content', 'Community Management', 'Graphic Design', 'Copywriting', 'Google Business Optimization', 'Email Campaign Management', 'Marketing Automation'] },
    ],
    takeaway:
      'Old Shawnee Pizza didn’t need a rebrand. It needed a digital presence that reflected the strength of the brand it had already built over five decades. By combining storytelling, consistent content production, local discoverability, paid acquisition, and email retention, we helped turn a Kansas City institution into a modern growth engine. $363K+ in retention revenue. 2.69M+ social impressions. 31.72X return on ad spend. Not by changing who Old Shawnee Pizza was. By making sure more people saw what made it special.',
    order: 5,
  },

  // ─── 6. CHICK-IN-WAFFLE ─────────────────────────────────────────────────
  {
    slug: 'chick-in-waffle',
    highlights: ['$74K+ Email Sales', '1M+ Social Views'],
    client: 'Chick-in-Waffle',
    coverImageId: 'https://cdn.atriumad.com/clients/CHWF/photos/CHWF_%20APR22_Photo%202.jpg',
    coverLogo: '/logos/clients/chwf.png',
    category: 'Fast-Casual · Multi-Location Growth Engine',
    serviceTags: [
      'Professional Content',
      'Brand Strategy',
      'Social Media Marketing',
      'Paid Media',
      'Email Retention',
      'SEO',
      'Google Business Profile',
    ],
    heroHeadline: 'Turning a bold vision into a brand built to scale.',
    resultHeadline:
      '$74K+ in email-attributed sales. Over a million social views. 12.36X blended Google Ads ROAS.',
    storyHeadline: 'From founder vision to a working growth system.',
    challenge:
      'Chick-in-Waffle already had a bold vision and personality driven by its founder, Dennis. The opportunity was turning that vision into a consistent brand voice and marketing system that could connect content, customer acquisition, retention, and growth across multiple locations.',
    solution:
      'We built a scalable system around Chick-in-Waffle’s personality—sharpening its bold, sarcastic voice and translating it into content formats, copywriting, professional creative, social media, paid campaigns, email retention, and SEO designed to work together across the customer journey.',
    story: [
      'We built a scalable system around Chick-in-Waffle’s personality—sharpening its bold, sarcastic voice and translating it into content formats, copywriting, professional creative, social media, paid campaigns, email retention, and SEO designed to work together across the customer journey.',
    ],
    metrics: [
      {
        number: '$74K+',
        label: 'Email-attributed sales',
        detail: 'Turning retention campaigns into measurable repeat revenue.',
      },
      {
        number: '1M+',
        label: 'Social media views',
        detail: 'Building visibility across Facebook, Instagram, and TikTok.',
      },
      {
        number: '12.36X',
        label: 'Blended Google Ads ROAS',
        detail: 'Turning paid search demand into measurable restaurant revenue.',
      },
    ],
    galleryHeadline: 'The brand, turned all the way up.',
    galleryNote:
      'Professional content brings Chick-in-Waffle’s bold personality to life through craveable food, energetic visuals, and a style designed to be instantly recognizable.',
    testimonialHeadline: 'More than marketing. A system built around the vision.',
    howWeDidIt: [
      { title: 'Sharpened the voice into a format', body: 'The bold, sarcastic personality Dennis already had was translated into repeatable content formats and copywriting — so the brand sounds like itself on every platform, not just when the founder is in frame.' },
      { title: 'Made the food impossible to ignore', body: 'We moved beyond traditional food photography and created content designed to stop the scroll. Product launches, food-focused videos, menu features, and visually driven creative turned menu items into attention-grabbing content.' },
      { title: 'Turned the founder into a brand asset', body: 'Dennis became a recognizable face of the business. Founder-led content consistently generated strong engagement and helped build trust, familiarity, and connection with customers.' },
      { title: 'Showed the people behind the brand', body: 'The team, culture, hiring campaigns, community partnerships, and behind-the-scenes moments gave customers something bigger than a menu to connect with.' },
      { title: 'Built a retention system, not a newsletter', body: 'Email campaigns and automated customer journeys kept Chick-in-Waffle top-of-mind after the first visit, turning an existing customer base into $74K+ in attributed sales.' },
      { title: 'Captured high-intent demand', body: 'Location-specific paid search campaigns targeted customers actively searching for dining options nearby, delivering a 12.36X blended return on ad spend, while SEO and Google Business Profile work made the brand easier to find without paying for the click.' },
    ],
    scope: [
      { label: 'Strategy', items: ['Brand Strategy', 'Brand Voice & Copywriting', 'Content Strategy', 'Multi-Location Marketing Strategy', 'Email Retention Strategy'] },
      { label: 'Content & Execution', items: ['Professional Content', 'Social Media Marketing', 'Founder Storytelling', 'Paid Media', 'Email Marketing & Automation', 'SEO', 'Google Business Profile'] },
    ],
    order: 6,
  },

  // ─── 7. JERUSALEM CAFE ──────────────────────────────────────────────────
  {
    slug: 'jerusalem-cafe',
    client: 'Jerusalem Cafe',
    coverImageId: 'https://cdn.atriumad.com/clients/JECA/photos/JECA_MAR26%20Photo%20creative%20compilation.jpg',
    coverLogo: '/logos/clients/jeca.png',
    location: 'Kansas City, Missouri',
    category: 'Multi-Location Restaurant Group',
    serviceTags: ['Social', 'Content Strategy', 'Email Marketing', 'CRM', 'Brand Storytelling'],
    resultHeadline: '565,000+ impressions. 31.7% email open rate. 15.5x return on email marketing investment.',
    intro:
      'Jerusalem Cafe has been a Kansas City staple for years. The challenge wasn’t introducing the restaurant to the market. It was keeping the brand relevant, visible, and top-of-mind in an increasingly competitive dining landscape while creating measurable revenue opportunities through owned marketing channels.',
    story: [
      'Through content strategy, social media management, and email marketing, we transformed everyday restaurant moments into a consistent growth engine.',
    ],
    metrics: [
      { number: '565,000+', label: 'total impressions generated' },
      { number: '25,000+', label: 'audience interactions' },
      { number: '31.7%', label: 'email open rate' },
      { number: '15.5x', label: 'return on email marketing investment' },
      { number: '9,900+', label: 'combined followers across platforms' },
    ],
    howWeDidIt: [
      { title: 'We turned food into the marketing', body: 'The highest-performing content wasn’t promotional. It was simple, craveable storytelling. Fresh pita coming out of the oven. Signature dishes. Colorful spreads. Texture, movement, and appetite appeal became the foundation of the content strategy.' },
      { title: 'We showed the people behind the brand', body: 'Restaurants are built by people, not menus. By highlighting staff, kitchen moments, and behind-the-scenes content, we made the brand feel more human while strengthening the connection between the restaurant and its community.' },
      { title: 'We created consistent visibility', body: 'Rather than relying on occasional viral moments, we focused on sustained presence. A structured content calendar across Instagram, Facebook, TikTok, Google Business Profile, and email ensured the brand stayed visible throughout the customer journey.' },
      { title: 'We leveraged owned media', body: 'Social media created attention. Email marketing converted that attention into revenue. With a 31.7% open rate and 117 attributed orders, email became a reliable channel for driving repeat visits and measurable sales.' },
      { title: 'We focused on long-term brand equity', body: 'Every piece of content was designed to reinforce what made Jerusalem Cafe successful in the first place: authentic food, genuine hospitality, and a local reputation built over years of serving Kansas City. The strategy wasn’t about changing the brand. It was about making more people experience it.' },
    ],
    scope: [
      { label: 'Brand & Content', items: ['Social Media Management', 'Content Strategy', 'Photography & Video Direction', 'Community Management', 'Brand Storytelling', 'Multi-Platform Distribution'] },
      { label: 'Growth Marketing', items: ['Email Marketing', 'CRM Campaigns', 'Audience Retention', 'Revenue Attribution', 'Performance Reporting', 'Organic Growth Strategy'] },
    ],
    takeaway:
      'By combining consistent content production, strategic storytelling, and retention marketing, Jerusalem Cafe expanded its digital reach, strengthened engagement, and generated measurable revenue without relying on aggressive promotional tactics. The result was a stronger online presence, increased customer engagement, and a marketing system designed to support long-term growth across multiple locations.',
    order: 7,
  },

  // ─── 8. GRAND COFFEE ────────────────────────────────────────────────────
  {
    slug: 'grand-coffee',
    client: 'Grand Coffee',
    coverImageId: 'v1784743609/GRCO_JAN18_BPM__CLOSE-UP_DETAIL_2_2_gccyjg',
    coverLogo: '/logos/clients/grco.png',
    category: 'Coffee Shop · Lifestyle Brand Positioning',
    serviceTags: ['Brand Strategy', 'Content Strategy', 'Community Marketing', 'Social Media Management'],
    resultHeadline: 'Building a Lifestyle Brand Through Coffee, Wellness & Community',
    intro:
      'Position Grand Coffee as more than a coffee shop by highlighting the experiences and values that make the brand unique to young professionals and active consumers.',
    story: [
      'We developed a content strategy centered around real experiences, community engagement, and high-end visual storytelling. Every piece of content reinforced the idea that Grand Coffee is where wellness, productivity, and community come together.',
      'By consistently showcasing the Run Club, functional beverages, premium coffee offerings, and brand aesthetics, we transformed Grand Coffee’s social presence into a lifestyle brand that resonates with health-conscious, ambitious consumers.',
    ],
    metrics: [],
    howWeDidIt: [
      { title: 'Grand Run Club', body: 'Weekly community-driven runs that foster connection, accountability, and an active lifestyle.' },
      { title: 'Functional Smoothies', body: 'Performance-focused drinks designed to support energy, recovery, and overall wellness.' },
      { title: 'Premium Coffee Culture', body: 'Specialty coffee presented through elevated visuals and everyday moments of productivity.' },
      { title: 'Modern Aesthetics', body: 'A clean, lifestyle-focused visual identity that reflects the brand’s premium and aspirational positioning.' },
    ],
    order: 8,
  },

  // ─── 9. HOTEL KANSAS CITY (worked example, verbatim from brief) ────────
  {
    slug: 'hotel-kc',
    highlights: ['250K+ Audience Reach', '10+ Films Delivered'],
    client: 'Hotel Kansas City',
    coverLogo: '/logos/clients/htkc.png',
    category: 'Hospitality · Cinematic Content',
    serviceTags: ['Film & Photo', 'Brand Film', 'Social Content'],
    resultHeadline: 'Elevating a historic property through cinematic storytelling',
    story: [
      'Hotel Kansas City needed content that differentiated the property beyond traditional hospitality marketing. Rather than competing on amenities, the goal was to position the hotel as a cultural and experiential destination.',
      'We developed a story-driven content campaign centered on atmosphere, architecture, and the guest experience. Through a cinematic hero film, social-first edits, and visual storytelling assets, we transformed the hotel’s identity into a compelling brand narrative.',
    ],
    metrics: [
      { number: '250K+', label: 'estimated audience reach' },
      { number: '2-day', label: 'production shoot' },
      { number: '10+', label: 'films & social cuts delivered' },
    ],
    howWeDidIt: [
      { title: 'A destination, not a place to stay', body: 'Positioned Hotel Kansas City as a destination through atmosphere and architecture-led storytelling.' },
      { title: 'An evergreen content library', body: 'Created reusable assets for social, web, and paid media, extending campaign reach across platforms.' },
    ],
    takeaway:
      'A premium content ecosystem that strengthened brand perception, increased content versatility, and showcased the unique character of Hotel Kansas City.',
    coverImageId: 'https://cdn.atriumad.com/clients/HOKC/films/web/hotel-spaces-highlight.jpg',
    films: {
      // The ballroom piece opens the page: it is the property, and the reason
      // the campaign existed was to sell the property as a destination.
      feature: 'https://cdn.atriumad.com/clients/HOKC/films/web/hotel-spaces-highlight.mp4',
      films: [
        'https://cdn.atriumad.com/clients/HOKC/films/web/guest-hotel-room.mp4',
        'https://cdn.atriumad.com/clients/HOKC/films/web/guest-hotel-city.mp4',
      ],
      interviews: [
        { src: 'https://cdn.atriumad.com/clients/HOKC/films/web/hotel-christopher-speach.mp4', name: 'Christopher' },
      ],
      cuts: [
        'https://cdn.atriumad.com/clients/HOKC/films/web/hero-kc-hotel-ambience.mp4',
        'https://cdn.atriumad.com/clients/HOKC/films/web/hokc-welcome-to-nighthawk.mp4',
        'https://cdn.atriumad.com/clients/HOKC/films/web/hotel-a-taste-of-hotel-kc.mp4',
        'https://cdn.atriumad.com/clients/HOKC/films/web/hotel-speach-experience.mp4',
      ],
    },
    order: 9,
  },

  // ─── 10. THE TOWN COMPANY ───────────────────────────────────────────────
  {
    slug: 'town-company',
    client: 'The Town Company',
    coverImageId: 'https://cdn.atriumad.com/clients/TWCO/films/web/town-co-helen-jo.jpg',
    coverLogo: '/logos/clients/ttco.svg',
    category: 'Restaurant · Cinematic Content',
    serviceTags: ['Film & Photo', 'Brand Film', 'Social Content'],
    resultHeadline: 'Building a Culinary Brand Around the People Behind the Experience',
    story: [
      'The Town Company needed content that went beyond showcasing dishes and interiors. The goal was to create an emotional connection with the brand by highlighting the personalities, craftsmanship, and culture that define the restaurant experience.',
      'We developed a story-driven content campaign centered around Executive Chef Johnny Leach and Helen Jo, positioning them as the faces of the brand. Through cinematic storytelling, we captured their creative process, leadership, and the energy behind one of Kansas City’s most celebrated dining destinations.',
    ],
    metrics: [
      { number: '2', label: 'featured leads — Chef Johnny Leach & Helen Jo' },
      { number: '5+', label: 'branded films & social-first cuts delivered' },
      { number: '1', label: 'premium content library for social, PR & brand' },
    ],
    howWeDidIt: [
      { title: 'Humanizing the brand through the people who run it', body: 'Founder and chef storytelling put Executive Chef Johnny Leach and Helen Jo at the center of the brand, elevating The Town Company’s identity beyond food photography and menu promotion.' },
      { title: 'A premium content library for social, PR, and brand marketing', body: 'Behind-the-scenes and character-driven storytelling assets strengthened the connection between guests and the people behind the dining experience.' },
    ],
    takeaway:
      'By making Johnny Leach and Helen Jo the central characters, the campaign transformed The Town Company from a restaurant people visit into a story people want to be part of.',
    films: {
      // Chef Johnny Leach opens it: the campaign's whole idea was to put the
      // people who run the room in front of the food.
      feature: 'https://cdn.atriumad.com/clients/TWCO/films/web/town-co-jonny.mp4',
      // No library section here: what this shoot delivered that is worth
      // showing is the two people, and a single vertical cut under them was
      // padding a section out rather than filling one.
      interviews: [
        { src: 'https://cdn.atriumad.com/clients/TWCO/films/web/town-co-helen-jo.mp4', name: 'Helen Jo' },
      ],
    },
    order: 10,
  },

]

// Asset lists come straight from Cloudinary via scripts/sync-cloudinary-assets.ts
// — never hand-maintained. Generated IDs are the source of truth for the gallery
// and video marquee; a curated `coverImageId` (if set) wins for the cover surface.
for (const study of caseStudies) {
  const assets = caseAssetOverrides[study.slug] ?? cloudinaryAssets[study.slug]
  if (!assets) continue
  study.galleryIds = assets.images
  study.videoIds = assets.videos
  if (!study.coverImageId && assets.images[0]) study.coverImageId = assets.images[0]
}

export type HeroTile = { kind: 'image' | 'video'; src: string }

/** The reels the homepage hero plays, in the order they are dealt out.
 *
 *  Hand-picked rather than derived: the hero is the first thing anyone sees,
 *  and what belongs there is food — a dish being plated, a drink being poured,
 *  a preparation shot. The library also holds skits, giveaways and promo cards,
 *  which read as social posts rather than as the work, so they are left out.
 *
 *  Ordered client-by-client on rotation. The gallery deals tiles round-robin
 *  into three columns, so listing a client's reels together would stack one
 *  brand into one column. */
const HERO_REELS = [
  "https://cdn.atriumad.com/clients/AAHA/reels/AAHA_%20JUL13%20New%20chef%20specialties%20general%C2%A0presentation%20-%2001.mp4", // AAHA_ JUL13 New chef specialties general presentation - 01
  "https://cdn.atriumad.com/clients/CHWF/reels/CHWF_%20APR24%20GARLIC%20PARM%20CHICK%20IN%20BUN-%20PREPARATION%20-%2001.mp4", // CHWF_ APR24 GARLIC PARM CHICK IN BUN- PREPARATION - 01
  "https://cdn.atriumad.com/clients/DCOP/reels/DCOP_%20AUG01%20Taco%20Tuesday%20-%2001.mp4", // DCOP_ AUG01 Taco Tuesday - 01
  "https://cdn.atriumad.com/clients/JECA/reels/JECA_%20AUG10%20Compilation%20Build%20a%C2%A0bowl%20-%2001.mp4", // JECA_ AUG10 Compilation Build a bowl - 01
  "https://cdn.atriumad.com/clients/OSPZ/reels/OSPZ_%20AUG02%20Doing%20the%20OSP%20Sandwich-.mp4", // OSPZ_ AUG02 Doing the OSP Sandwich-
  "https://cdn.atriumad.com/clients/TAHA/reels/TAHA_%20AUG22%20Grilled%20Salmon%20Prep.mp4", // TAHA_ AUG22 Grilled Salmon Prep
  "https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20APR29_Ceviche%20Tostada-.mp4", // TNKC_ APR29_Ceviche Tostada-
  "https://cdn.atriumad.com/clients/AAHA/reels/AAHA_%20JUL15%20New%20chef%20specialty%20Zafrani%20Chicken%C2%A0Tikka%20-%2001.mp4", // AAHA_ JUL15 New chef specialty Zafrani Chicken Tikka - 01
  "https://cdn.atriumad.com/clients/CHWF/reels/CHWF_%20JUL17%20Dipping%20a%20lot%20of%C2%A0syrup%20-%2001.mp4", // CHWF_ JUL17 Dipping a lot of syrup - 01
  "https://cdn.atriumad.com/clients/DCOP/reels/DCOP_%20AUG18%20Lunch%20Special%20-%2001.mp4", // DCOP_ AUG18 Lunch Special - 01
  "https://cdn.atriumad.com/clients/JECA/reels/JECA_%20JUL01%20Build%20a%20bowl-prep%20-%2001.mp4", // JECA_ JUL01 Build a bowl-prep - 01
  "https://cdn.atriumad.com/clients/OSPZ/reels/OSPZ_%20AUG05%20Presentation%20Cellar%20Door.mp4", // OSPZ_ AUG05 Presentation Cellar Door
  "https://cdn.atriumad.com/clients/TAHA/reels/TAHA_%20AUG30%20Oysters%20Day.mp4", // TAHA_ AUG30 Oysters Day
  "https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20AUG06%20Loaded%20Nachos%20-Prep%20Reedit-.mp4", // TNKC_ AUG06 Loaded Nachos -Prep Reedit-
  "https://cdn.atriumad.com/clients/AAHA/reels/AAHA_%20MAY18%20Compialion%20Food(Cooking%C2%A0and%C2%A0Plating%C2%A0)%20-%2001.mp4", // AAHA_ MAY18 Compialion Food(Cooking and Plating ) - 01
  "https://cdn.atriumad.com/clients/CHWF/reels/CHWF_%20JUN18%20THE%20TENDER%20COMBO%C2%A0PREP%20-%2001.mp4", // CHWF_ JUN18 THE TENDER COMBO PREP - 01
  "https://cdn.atriumad.com/clients/DCOP/reels/DCOP_%20APR18%20MANGO%20VODKA%20FLIGTH%20-%20DRINK%201%20PREPDCOP_%20APR18%20MANGO%20VODKA%20FLIGTH%20-%20DRINK%201%20PREP%20-%2001.mp4", // DCOP_ APR18 MANGO VODKA FLIGTH - DRINK 1 PREPDCOP_ APR18 MANGO VODKA FLIGTH - DRINK 1 PREP - 01
  "https://cdn.atriumad.com/clients/JECA/reels/JECA_%20JUN10%20Compilation%201%20Serving%20%2B%C2%A0Texture%20-%2001.mp4", // JECA_ JUN10 Compilation 1 Serving + Texture - 01
  "https://cdn.atriumad.com/clients/OSPZ/reels/OSPZ_%20JUL28%20Big%20Joe%20Pizza.mp4", // OSPZ_ JUL28 Big Joe Pizza
  "https://cdn.atriumad.com/clients/TAHA/reels/TAHA_FEB31%20croquetas.mp4", // TAHA_FEB31 croquetas
  "https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20JUL01%20Chilaquiles.mp4", // TNKC_ JUL01 Chilaquiles
  "https://cdn.atriumad.com/clients/JECA/reels/JECA_%20MAY02_Jerusalem%20Combo%20Appetizer%20Assambly-serving%20-%2001.mp4", // JECA_ MAY02_Jerusalem Combo Appetizer Assambly-serving - 01
  "https://cdn.atriumad.com/clients/TNKC/reels/TNKC_%20JUL06%20Tosta-Guac%20Build%20Up.mp4", // TNKC_ JUL06 Tosta-Guac Build Up
  "https://cdn.atriumad.com/clients/CHWF/reels/CHWF_%20JUL12%20POV%20Preparation%20-%2001.mp4", // CHWF_ JUL12 POV Preparation - 01
]

/** Tiles for the hero's perspective gallery — real client work, not stock.
 *  Every one is a reel: a wall of moving food is the point, and a still tile
 *  among them reads as a video that failed to start. */
export const heroGalleryTiles: HeroTile[] = HERO_REELS.map((src) => ({ kind: 'video', src }))

const caseSummaries: Record<string, string> = {
  'taco-naco': 'A unified content and growth system built to make three locations feel like one unmistakable brand.',
  taha: 'An organic campaign system that turned culinary prestige into sold-out experiences and sustained demand.',
  aahaa: 'A premium repositioning that moved the conversation from Indian cuisine to a complete fine-dining experience.',
  'don-chuys': 'A content-first system that turned the food, cocktails, and atmosphere into a social presence people follow.',
  'old-shawnee-pizza': 'A growth system that turned decades of local loyalty into visits, orders, and repeat revenue.',
  'chick-in-waffle': 'A founder’s bold vision turned into a brand voice and a growth system built to scale across locations.',
  'jerusalem-cafe': 'Consistent storytelling and owned-channel marketing that kept a Kansas City staple visible and relevant.',
  'grand-coffee': 'A lifestyle-led brand world connecting coffee, wellness, and community through a cohesive creative system.',
  'hotel-kc': 'Cinematic storytelling that translated a historic property into a contemporary hospitality destination.',
  'town-company': 'A culinary story shaped around the people, craft, and thoughtful details behind the guest experience.',
}

export function getCaseSummary(study: CaseStudy) {
  return caseSummaries[study.slug] ?? study.resultHeadline
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug)
}
