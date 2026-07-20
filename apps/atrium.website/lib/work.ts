import { cloudinaryAssets } from './cloudinary-assets.generated'

export type CaseMetric = { number: string; label: string }
export type HowStep = { title: string; body: string }
export type ScopeGroup = { label: string; items: string[] }
export type CaseQuote = { text: string; name: string; role: string; placeholder?: boolean }
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
  metrics: CaseMetric[]
  howWeDidIt?: HowStep[]
  scope?: ScopeGroup[]
  quote?: CaseQuote
  takeaway?: string
  gallery?: CaseGalleryImage[]
  /** Cloudinary public IDs for the draggable gallery (preferred over `gallery`). */
  galleryIds?: string[]
  /** Cloudinary public IDs for the case-study video marquee. */
  videoIds?: string[]
  order: number
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

export const caseStudies: CaseStudy[] = [
  // ─── 1. TACO NACO ───────────────────────────────────────────────────────
  {
    slug: 'taco-naco',
    client: 'Taco Naco KC',
    coverImageId: 'v1784223449/TNKC_FEB18_Slide_2_tiwzpa',
    coverLogo: '/logos/clients/tnkc.png',
    category: 'Fast-Casual Mexican · Multi-Location Engagement',
    serviceTags: ['Brand Strategy', 'Content', 'Social', 'Google', 'Reputation', 'Analytics'],
    resultHeadline: '3 locations. 23K followers. Over 1.2 million impressions. One brand.',
    story: [
      'Taco Naco KC has three locations — Overland Park, Westport, and State Line. Great food, loyal crowd, but online the brand was all over the place. No consistent look. No real strategy. No way to know what was working.',
      'We came in December 2025 and built the whole thing from scratch. One brand direction. One content system. One team managing every platform, every location, every day. We started shooting monthly, launched platforms they weren’t on, and connected their Google profiles to a real strategy.',
      'Five months in — 23K followers across every platform, over 713K impressions on social, and 504K impressions on Google alone across all three locations. Over 1,000 pieces of content published. The brand finally looks and sounds like one brand, no matter where you find it.',
    ],
    metrics: [
      { number: '23K', label: 'followers across all platforms (started at ~5.9K)' },
      { number: '1.2M+', label: 'total impressions (social + Google across 3 locations)' },
      { number: '1,031', label: 'pieces of content published in 5 months' },
      { number: '504K', label: 'Google impressions (168K per location × 3)' },
    ],
    quote: { text: '[Client quote pending]', name: 'Fernanda', role: 'Owner, Taco Naco KC', placeholder: true },
    order: 1,
  },

  // ─── 2. T'ÄHÄ (worked example, verbatim from brief) ────────────────────
  {
    slug: 'taha',
    client: 'T’ÄHÄ Mexican Kitchen',
    coverImageId: 'v1784146164/TAHA__MAY15_Slide_1_rn1svh',
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
    client: 'Aahaa Modern Indian Cuisine',
    coverImageId: 'v1784220815/AHAA_FEB13_CREATIVE_POST_PHOTO_3_juwr7s',
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
    client: 'Don Chuy’s Fresh Méx & Cantina',
    coverImageId: 'v1784309494/DCOP_FEB17_Slide_2_fe4upi',
    coverLogo: '/logos/clients/dcop.png',
    category: 'Full-Service Mexican · Multi-Location Growth',
    serviceTags: ['Brand Strategy', 'Content', 'Social', 'Google'],
    resultHeadline: '+839% impressions. +302% Instagram growth. +595% customer actions.',
    intro:
      'While competitors focused on food photography alone, we positioned Don Chuy’s around what customers were actually buying: the experience.',
    story: [
      'By showcasing the atmosphere, bar program, social energy, signature drinks, weekly promotions, and the overall destination appeal of the restaurant, we helped transform awareness into measurable business growth—supporting a period that culminated in the brand opening its fourth location.',
    ],
    metrics: [
      { number: '+839%', label: 'total impressions generated (876,640 organic impressions)' },
      { number: '+302%', label: 'Instagram audience growth (1,305 → 5,253 followers)' },
      { number: '+595%', label: 'customer actions from Google Business (22,860 actions)' },
      { number: '+1,430%', label: 'Instagram impressions (401,940 total)' },
      { number: '+4,671%', label: 'website visits from Google (10,400 visits)' },
      { number: '+610%', label: 'total interactions (30,620 interactions)' },
    ],
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
    client: 'Old Shawnee Pizza',
    coverImageId: 'v1784312607/OSPZ_FEB17_Slide_1_d9udr9',
    coverLogo: '/logos/clients/ospz.png',
    category: 'Pizza Restaurant · Legacy Brand Revitalization',
    serviceTags: ['Brand Strategy', 'Content', 'Social', 'Email & SMS', 'Google', 'CRM'],
    resultHeadline: '1.66 Million Impressions. 24,000+ Customer Actions. $250,000+ Annual Revenue Influenced.',
    intro:
      'Old Shawnee Pizza wasn’t a new restaurant trying to get noticed. It was already one of the most recognizable independent restaurant brands in Kansas City.',
    story: [
      'For more than 55 years, the Walker family built a loyal following through great food, strong community ties, and a reputation that generations of customers trusted.',
      'The challenge wasn’t awareness. The challenge was translating decades of local goodwill into a modern digital presence.',
      'When Atrium partnered with Old Shawnee Pizza, the brand had a compelling story, loyal customers, a thriving bar program, and two established locations—but very little of that was being consistently communicated online.',
      'Our objective was to turn Old Shawnee Pizza’s legacy into a growth asset. By highlighting the restaurant’s history, showcasing founder Joe Walker’s legacy through William Walker, promoting signature menu items, featuring the bar experience, and building recurring promotional campaigns, we transformed social media into a modern extension of the brand.',
      'The result was increased visibility, stronger customer engagement, measurable business activity, and a renewed connection between a Kansas City institution and the next generation of customers.',
    ],
    metrics: [
      { number: '1.66M+', label: 'organic impressions across Facebook, Instagram, TikTok, and Google Business Profile' },
      { number: '24,180', label: 'customer actions — website visits, calls, and direction requests' },
      { number: '$258,000+', label: 'estimated annual revenue influenced from owned channels' },
      { number: '313,080', label: 'Google Business impressions' },
      { number: '28,915', label: 'combined followers across Facebook, Instagram, and TikTok' },
      { number: '84,000+', label: 'monthly email opens driven by CRM automation' },
    ],
    howWeDidIt: [
      { title: 'We turned a legacy into a marketing asset', body: 'Most restaurants talk about their food. Old Shawnee Pizza had something more valuable: history. We built content around the story of Joe Walker, the family legacy, and William Walker’s leadership, creating a narrative that competitors simply couldn’t replicate. This transformed Old Shawnee Pizza from another local restaurant into a brand with authenticity, heritage, and personality.' },
      { title: 'We positioned the restaurant as a community gathering place', body: 'The strongest brands aren’t built around products. They’re built around experiences. Our content highlighted the atmosphere, neighborhood culture, bar program, live events, and social environment that customers already loved. The result was content that felt personal, local, and relevant.' },
      { title: 'We made William Walker the face of the brand', body: 'People connect with people. By featuring William throughout content, promotions, kitchen stories, behind-the-scenes videos, and menu features, we gave customers a face they could connect with. This increased trust, strengthened engagement, and reinforced the family-owned identity of the business.' },
      { title: 'We leveraged signature products to drive reach', body: 'Data quickly revealed clear customer favorites. Content featuring the Crab Rangoon Pizza, specialty pizzas, signature recipes, lunch specials, and unique menu offerings consistently generated some of the highest engagement across platforms. Rather than producing generic restaurant content, we doubled down on what customers already loved.' },
      { title: 'We built consistent traffic drivers', body: 'Awareness alone doesn’t fill restaurants. We developed campaigns around Lunch Specials, Game Day Promotions, Live Music Events, Whiskey Wednesdays, Tequila Nights, Seasonal Offers, and Family Meal Deals. These recurring promotions created reasons for customers to return throughout the week rather than only on weekends.' },
      { title: 'We connected awareness to revenue', body: 'Social media was only one part of the strategy. Email marketing, CRM automations, and customer retention campaigns allowed us to continue conversations long after customers left the restaurant. By consistently nurturing the customer database, Old Shawnee Pizza generated more than 84,000 monthly email opens and an estimated $21,500 in monthly revenue influence through owned marketing channels. This created a marketing ecosystem focused not only on acquiring customers—but keeping them.' },
    ],
    scope: [
      { label: 'Strategy', items: ['Brand Positioning', 'Content Strategy', 'Promotional Planning', 'Customer Retention Strategy', 'CRM Development', 'Email Marketing Strategy'] },
      { label: 'Content & Execution', items: ['Social Media Management', 'Photography', 'Video Production', 'Reels & TikTok Content', 'Community Management', 'Graphic Design', 'Copywriting', 'Google Business Optimization', 'Email Campaign Management', 'Marketing Automation'] },
    ],
    takeaway:
      'Old Shawnee Pizza didn’t need a rebrand. It needed a digital presence that reflected the strength of the brand it had already built over five decades. By combining storytelling, consistent content production, local market positioning, CRM marketing, and customer retention campaigns, we helped transform a Kansas City institution into a modern digital brand. 1.66 million impressions. 24,000+ customer actions. $258,000+ annual revenue influenced. Not by changing who Old Shawnee Pizza was. By making sure more people saw what made it special.',
    order: 5,
  },

  // ─── 6. CHICK-IN WAFFLE ─────────────────────────────────────────────────
  {
    slug: 'chick-in-waffle',
    client: 'Chick-in Waffle',
    coverImageId: 'v1784555394/CHWF_MAR13_Slide_1_jk9hcg',
    category: 'Fast-Casual · Multi-Location Growth Engine',
    serviceTags: ['Social', 'Content Strategy', 'CRM & Email', 'Loyalty Marketing', 'Google Ads'],
    resultHeadline: '750K+ Impressions. 25K+ Followers. 10x ROAS.',
    intro:
      'More customers. More repeat visits. More revenue. Through organic content, CRM automation, loyalty marketing, and localized Google Ads, Chick-in Waffle built a system designed to drive awareness, capture demand, and increase customer retention.',
    story: [
      'Through founder-led storytelling, product-focused creative, and a full retention system — CRM, loyalty, and localized Google Ads — Chick-in Waffle built a growth engine across multiple locations that turned first-time visits into repeat business.',
    ],
    metrics: [
      { number: '750K+', label: 'impressions generated through organic social content' },
      { number: '25K+', label: 'followers across Facebook, Instagram, and TikTok' },
      { number: '10x', label: 'average Google Ads ROAS across locations' },
      { number: '$9K+', label: 'average monthly revenue attributed to email marketing' },
      { number: '32%', label: 'email open rate across CRM campaigns' },
      { number: '90%', label: 'growth in engagement' },
    ],
    howWeDidIt: [
      { title: 'Made the food impossible to ignore', body: 'We moved beyond traditional food photography and created content designed to stop the scroll. Product launches, food-focused videos, menu features, and visually driven creative turned menu items into attention-grabbing content.' },
      { title: 'Turned the founder into a brand asset', body: 'Dennis became a recognizable face of the business. Founder-led content consistently generated strong engagement and helped build trust, familiarity, and connection with customers.' },
      { title: 'Showed the people behind the brand', body: 'The team, culture, hiring campaigns, community partnerships, and behind-the-scenes moments gave customers something bigger than a menu to connect with.' },
      { title: 'Built a customer retention system', body: 'CRM campaigns, loyalty marketing, and automated customer journeys helped keep Chick-in Waffle top-of-mind after the first visit, generating an average of $9K+ in monthly attributed revenue.' },
      { title: 'Captured high-intent demand', body: 'Location-specific Google Ads campaigns targeted customers actively searching for dining options nearby, delivering an average 10x return on ad spend.' },
    ],
    scope: [
      { label: 'Services Provided', items: ['Social Media Management', 'Content Strategy', 'Founder Storytelling', 'CRM & Email Marketing', 'Marketing Automation', 'Loyalty Marketing', 'Google Ads Management', 'Multi-Location Marketing Strategy'] },
    ],
    order: 6,
  },

  // ─── 7. JERUSALEM CAFE ──────────────────────────────────────────────────
  {
    slug: 'jerusalem-cafe',
    client: 'Jerusalem Cafe',
    coverImageId: 'v1784558603/JECA__APR26_Creative_Graphic_2_oemnjw',
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
    order: 9,
  },

  // ─── 10. THE TOWN COMPANY ───────────────────────────────────────────────
  {
    slug: 'town-company',
    client: 'The Town Company',
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
    order: 10,
  },

  // ─── 11. FARM FRESH ─────────────────────────────────────────────────────
  // TODO: placeholder copy — replace with real story/metrics before launch.
  {
    slug: 'farm-fresh',
    client: 'Farm Fresh',
    coverImageId: 'v1784559731/FFRB_JAN25_SLIDE_1_vnfwnb',
    coverLogo: '/logos/clients/ffrb.png',
    coverLogoScale: 3.0,
    category: 'Restaurant',
    serviceTags: ['Social', 'Content Strategy'],
    resultHeadline: 'Placeholder — copy pending',
    story: ['Placeholder — copy pending.'],
    metrics: [],
    order: 11,
  },
]

// Asset lists come straight from Cloudinary via scripts/sync-cloudinary-assets.ts
// — never hand-maintained. Generated IDs are the source of truth for the gallery
// and video marquee; a curated `coverImageId` (if set) wins for the cover surface.
for (const study of caseStudies) {
  const assets = cloudinaryAssets[study.slug]
  if (!assets) continue
  study.galleryIds = assets.images
  study.videoIds = assets.videos
  if (!study.coverImageId && assets.images[0]) study.coverImageId = assets.images[0]
}

const caseSummaries: Record<string, string> = {
  'taco-naco': 'A unified content and growth system built to make three locations feel like one unmistakable brand.',
  taha: 'An organic campaign system that turned culinary prestige into sold-out experiences and sustained demand.',
  aahaa: 'A premium repositioning that moved the conversation from Indian cuisine to a complete fine-dining experience.',
  'don-chuys': 'A multi-location strategy that made the atmosphere, bar program, and weekly rituals the engine of growth.',
  'old-shawnee-pizza': 'A modern digital presence designed to carry a 55-year local legacy into its next generation of customers.',
  'chick-in-waffle': 'A connected acquisition and retention system built to create demand, repeat visits, and measurable revenue.',
  'jerusalem-cafe': 'Consistent storytelling and owned-channel marketing that kept a Kansas City staple visible and relevant.',
  'grand-coffee': 'A lifestyle-led brand world connecting coffee, wellness, and community through a cohesive creative system.',
  'hotel-kc': 'Cinematic storytelling that translated a historic property into a contemporary hospitality destination.',
  'town-company': 'A culinary story shaped around the people, craft, and thoughtful details behind the guest experience.',
  'farm-fresh': 'Placeholder — copy pending.',
}

export function getCaseSummary(study: CaseStudy) {
  return caseSummaries[study.slug] ?? study.resultHeadline
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug)
}
