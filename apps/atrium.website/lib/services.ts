export type IconItem    = { title: string; description: string }
export type BentoCard   = { size: 'large' | 'medium' | 'small'; title: string; copy: string; coverAlt: string }
export type TimelineStep = { title: string; body: string }
export type StatItem    = { number: string; label: string }

export type Service = {
  slug: string
  name: string
  category: string
  hero: { eyebrow: string; headline: string; body: string; coverAlt: string }
  thesis: { eyebrow: string; headline: string; body: string }
  perks: IconItem[]
  bentoCards: BentoCard[]
  stats: StatItem[]
  timeline?: TimelineStep[]
}

export const services: Service[] = [
  // ─── GENERATE DEMAND ──────────────────────────────────────────────────────
  {
    slug: 'brand-strategy',
    name: 'Brand Strategy & Creative Direction',
    category: 'Generate Demand',
    hero: {
      eyebrow: 'GENERATE DEMAND',
      headline: 'Before anyone sees your content, *they need to feel your brand*',
      body: 'We define how you look, sound, and position — so everything else works harder.',
      coverAlt: 'Mood board flat lay — colors, type samples, reference images',
    },
    thesis: {
      eyebrow: 'BUILDING BRAND IDENTITY',
      headline: 'Your brand is the first thing people *feel* before they taste anything.',
      body: "When your Instagram, your Google, your menu, and your email all feel like different restaurants, you're losing trust at every touchpoint — before anyone even orders.",
    },
    perks: [
      { title: 'Visual identity',         description: 'Colors, typography, photo style, brand marks — your complete visual system.' },
      { title: 'Voice & tone',            description: 'How your brand sounds across captions, emails, menus, ads, and signage.' },
      { title: 'Creative direction',      description: 'A playbook your photographer, editor, and ads team follow without asking.' },
      { title: 'Competitive positioning', description: 'What separates you from every other restaurant in your market. Defined, not assumed.' },
      { title: 'Brand guidelines',        description: 'A living document every vendor, designer, and new team member gets on day one.' },
      { title: 'Multi-location scaling',  description: 'Same brand, adapted per location. Consistency without sameness.' },
    ],
    bentoCards: [
      { size: 'large',  title: 'A brand that *makes sense at first glance*', copy: "Your IG, your Google, your menu, your email — if they don't feel like the same restaurant, you're leaking trust every day. We build the system that locks it in.", coverAlt: '4-panel showing same brand across IG, Google, email, menu' },
      { size: 'medium', title: "Your photographer isn't *guessing anymore*", copy: 'We hand your team a playbook. Angles, lighting, mood, crop ratios, color grading — documented so every shoot matches the last one, even with a different crew.', coverAlt: 'Creative brief with photo examples' },
      { size: 'small',  title: 'Positioning that survives *a competitor opening next door*', copy: "We don't write taglines. We define the space your brand owns in people's heads — so when a new place opens nearby, your regulars don't even flinch.", coverAlt: 'Competitive landscape diagram' },
    ],
    timeline: [
      { title: 'Brand audit',         body: 'We review everything — your current visual assets, competitors, audience, and market positioning.' },
      { title: 'Strategy workshop',   body: 'A working session where we define your visual system, voice, and competitive position together.' },
      { title: 'System build',        body: 'We create the full identity system — logo refinement, color, type, photo direction, brand guidelines.' },
      { title: 'Team handoff',        body: "Your brand book gets shared with your photographer, editor, social team, and printer. Everyone aligned." },
      { title: 'Ongoing stewardship', body: 'We apply and protect the brand across every channel, every month. It compounds.' },
    ],
    stats: [
      { number: '23%',  label: 'Revenue lift from consistent branding across channels' },
      { number: '5–7',  label: "Impressions before someone remembers your brand — make each one count" },
      { number: '80%',  label: 'Of recognition driven by color and visual consistency' },
    ],
  },

  {
    slug: 'film-photo',
    name: 'Film & Photo Production',
    category: 'Generate Demand',
    hero: {
      eyebrow: 'GENERATE DEMAND',
      headline: 'The food is doing the hard part. *We just make sure people see it.*',
      body: 'On-location production built around your menu, your space, your people.',
      coverAlt: 'Wide BTS — camera rig, chef plating, restaurant interior',
    },
    thesis: {
      eyebrow: 'PRODUCTION, NOT A STUDIO',
      headline: 'Great food deserves to *look* like great food.',
      body: 'Most restaurant photos are shot once, used everywhere, and forgotten. We build a library that keeps working long after the shoot day ends.',
    },
    perks: [
      { title: 'On-location photo',    description: 'Shot inside your restaurant with your actual food and team. No studio.' },
      { title: 'Reels & video',        description: 'Short-form content built for social performance — hooks, pacing, music.' },
      { title: 'Strategic shot lists', description: 'Every frame planned against the content calendar before we arrive.' },
      { title: 'Visual library',       description: 'A bank of assets for social, ads, website, Google, and print.' },
      { title: 'Signature style dev',  description: "When standard doesn't fit, we find what does. Then we own it." },
      { title: 'Multi-POV coverage',   description: 'Single flash, diffuser, overhead, 45°, detail, environment — every item covered.' },
    ],
    bentoCards: [
      { size: 'large',  title: 'Shoot once, *use everywhere*', copy: "One production day gives you Reels, carousels, hero shots, stories, graphics, Google photos, and ad creative. We don't shoot for Instagram — we shoot for the entire system.", coverAlt: 'Grid showing 8+ content pieces from one shoot day' },
      { size: 'medium', title: "The appetizer that *changed a brand's entire look*", copy: "At Aahaa, a single appetizer shoot with a diffuser and deep shadows replaced their entire visual direction. That pivot didn't come from a trend — it came from understanding the food.", coverAlt: 'Aahaa appetizer — before (flat flash) vs after (moody diffused)' },
      { size: 'small',  title: 'Different photos *you must have of every item*', copy: 'Not just the hero angle. The cut, the steam, the hand reaching in, the table context, the ingredient close-up. 6 photos of one dish gives you 6 months of content.', coverAlt: '6-panel grid of same dish, different angles' },
      { size: 'small',  title: 'Photos of *no food* that matter more than food', copy: "Your team laughing. The bar at golden hour. A hand wiping down a table. The stuff that makes someone feel what it's like to be there — not just what's on the plate.", coverAlt: 'Collage — team culture, environment, vibe shots' },
    ],
    stats: [
      { number: '40%',  label: 'Of people visit a restaurant after seeing food photos online' },
      { number: '6',    label: 'Different angles of one dish = 6 months of content' },
      { number: '2.3x', label: 'More saves on food Reels vs. any other Instagram category' },
    ],
  },

  {
    slug: 'social-content',
    name: 'Social Content',
    category: 'Generate Demand',
    hero: {
      eyebrow: 'GENERATE DEMAND',
      headline: "Posting isn't a strategy. *Never was.*",
      body: 'Platform-native content built around business goals, not trending audio.',
      coverAlt: 'Phone showing archetype-driven IG feed with labels',
    },
    thesis: {
      eyebrow: 'CONTENT WITH A JOB',
      headline: 'Every post should be *working* toward something.',
      body: 'We build content around archetypes — crave, vibe, chef POV, proof — so nothing you post is just filler between campaigns.',
    },
    perks: [
      { title: 'Content archetypes',      description: 'Crave, vibe, chef POV, social proof, education, culture — strategic variety.' },
      { title: 'Platform-native strategy', description: 'IG, TikTok, Facebook, YouTube — each treated as its own channel.' },
      { title: 'Content calendar',         description: 'Built around your business goals and seasonal pushes.' },
      { title: 'Compilations vs. process', description: 'Mood collections and start-to-finish narratives. Two styles, two editing approaches.' },
      { title: 'Performance tracking',     description: 'Tied to real outcomes — not follower counts.' },
      { title: 'Series development',       description: 'When a theme + pillar combo works, it graduates into a named recurring series.' },
    ],
    bentoCards: [
      { size: 'large',  title: 'Your content *has a system behind it*', copy: 'Every post belongs to an archetype. Every archetype has a job. Crave makes them hungry. Vibe makes them feel it. Chef POV builds authority. Social proof builds trust. Nothing random.', coverAlt: 'Archetype grid — 6 post types labeled and color-coded' },
      { size: 'medium', title: 'The brunch campaign that *moved actual revenue*', copy: "T'ÄHÄ. One focused push. One theme. One month. The result wasn't more followers — it was more people sitting down on Sunday mornings. That's what a campaign does vs. random content.", coverAlt: "T'ÄHÄ brunch content carousel + revenue metric overlay" },
      { size: 'small',  title: 'Compilations vs. process — *know the difference*', copy: 'Compilations are mood-driven collections (no sequence required). Process formats are start-to-finish narratives (order matters). Using the wrong one makes great content feel off.', coverAlt: 'Side-by-side example — compilation cut vs. process cut' },
    ],
    stats: [
      { number: '74%', label: 'Of diners use social media to decide where to eat' },
      { number: '3x',  label: 'More engagement on carousel posts vs. single images' },
      { number: '1',   label: "Month. One campaign. T'ÄHÄ brunch. Measurable revenue lift." },
    ],
  },

  {
    slug: 'social-management',
    name: 'Social Media Management',
    category: 'Generate Demand',
    hero: {
      eyebrow: 'GENERATE DEMAND',
      headline: 'Your brand should be *present, not just posting.*',
      body: 'Daily engagement, community management, and the small interactions that build real followings.',
      coverAlt: 'Comment thread showing thoughtful brand reply',
    },
    thesis: {
      eyebrow: 'SHOWING UP, DAILY',
      headline: 'The comments and DMs are *where trust is actually built.*',
      body: 'Most restaurants post and disappear. We keep the conversation going — replying, listening, and showing up every single day.',
    },
    perks: [
      { title: 'Community management', description: 'Comments, DMs, story replies — daily. Your brand talks back.' },
      { title: 'Calendar execution',   description: 'Scheduling, publishing, cross-posting — handled completely.' },
      { title: 'Engagement strategy',  description: 'Who to follow, what to comment on, which hashtags matter in your market.' },
      { title: 'Social listening',     description: 'Mentions, tags, stories — we catch every time someone talks about you.' },
      { title: 'Reporting',            description: 'Weekly activity, monthly performance, quarterly trends.' },
      { title: 'Crisis response',      description: "Negative comment? Viral complaint? We have a protocol before you even see it." },
    ],
    bentoCards: [
      { size: 'large',  title: "The comment you didn't respond to *cost you a table tonight*", copy: '7x more conversions from brands that respond within 1 hour. Most restaurants never respond at all. We respond to every single one — with your brand voice, not a template.', coverAlt: 'Comment thread showing thoughtful brand reply' },
      { size: 'medium', title: 'Social listening that *catches what you miss*', copy: "Someone posted a story from your restaurant and tagged you. Someone complained about wait time in a comment. Someone asked if you're open on Mondays. We catch all of it.", coverAlt: 'Social listening feed with tagged content' },
      { size: 'medium', title: "Your feed stays active *even when you're slammed*", copy: "You run the restaurant. We run the brand. Content goes out on schedule, DMs get answered, comments get replied to — whether you had a good Tuesday or a disaster.", coverAlt: 'Calendar with auto-published content' },
    ],
    stats: [
      { number: '7x',   label: 'More conversions from brands that respond within 1 hour' },
      { number: '40%',  label: 'Follower retention increase with active community management' },
      { number: '100%', label: 'Response rate we maintain for every client, every platform' },
    ],
  },

  {
    slug: 'paid-media',
    name: 'Paid Media Strategies',
    category: 'Generate Demand',
    hero: {
      eyebrow: 'GENERATE DEMAND',
      headline: "We don't boost posts. *We build campaigns.*",
      body: 'Budget behind creative that already proved it resonates. Every dollar tracked.',
      coverAlt: 'Organic post analytics → arrow → same post as ad with results',
    },
    thesis: {
      eyebrow: 'PROOF BEFORE SPEND',
      headline: 'We only put money behind what *already works.*',
      body: 'Every ad starts as organic content with real signal — saves, shares, comments — then we amplify it with budget, not guesswork.',
    },
    perks: [
      { title: 'Proven creative first',  description: 'We only run ads on content with strong organic signal.' },
      { title: 'Geo-targeting',          description: 'People within driving distance, during dining decision hours.' },
      { title: 'A/B testing',            description: 'Multiple creative and copy variations. Optimize toward conversions.' },
      { title: 'Cross-platform',         description: 'Meta, TikTok, Google — wherever your audience makes decisions.' },
      { title: 'Transparent reporting',  description: 'Reach, clicks, CTR, CPM, cost per action — plain language.' },
      { title: 'Paid vs organic view',   description: "See the relationship between what's earned and what's amplified." },
    ],
    bentoCards: [
      { size: 'large',  title: 'We never put money behind *a guess*', copy: "Every ad we run started as organic content that already proved it resonates. We look at saves, shares, comments — then we amplify. Most agencies start with the budget. We start with the proof.", coverAlt: 'Organic post analytics → arrow → same post as ad with results' },
      { size: 'medium', title: 'Geo-targeted to the people *who are deciding right now*', copy: "Your ad reaches someone 4 miles away, at 5:30pm, scrolling Instagram while thinking 'what's for dinner tonight.' That's the window. We build for it.", coverAlt: 'Map with radius highlighting + time-of-day overlay' },
      { size: 'small',  title: 'Restaurant CPM is *half* of most industries', copy: "Your paid dollar goes further in hospitality than almost any other category. $6–$12 CPM vs. $15–$25 for SaaS. We make sure you're not overpaying for reach you could earn cheaper.", coverAlt: 'CPM comparison bar chart — restaurants vs other industries' },
    ],
    stats: [
      { number: '3x',    label: 'Higher conversion on geo-targeted restaurant ads' },
      { number: '$6–12', label: 'Restaurant CPM — half the industry average' },
      { number: '100%',  label: 'Of our ad creative starts with organic proof' },
    ],
  },

  // ─── CONVERT DEMAND ───────────────────────────────────────────────────────
  {
    slug: 'google-seo',
    name: 'Google & Local SEO',
    category: 'Convert Demand',
    hero: {
      eyebrow: 'CONVERT DEMAND',
      headline: "If they can't find you, *they can't choose you.*",
      body: 'Your Google profile is the new front door. We make sure it converts.',
      coverAlt: 'Side-by-side GBP comparison — neglected vs. optimized',
    },
    thesis: {
      eyebrow: 'YOUR NEW FRONT DOOR',
      headline: 'Being *findable* is the first job of your brand.',
      body: 'A stale, incomplete Google profile loses the decision before you ever get the chance to make an impression.',
    },
    perks: [
      { title: 'GBP optimization',          description: 'Every field, every location, always current.' },
      { title: 'Local search strategy',      description: 'Category + keyword targeting for local pack visibility.' },
      { title: 'Weekly GBP posts',           description: 'Updates that keep your profile active and ranking.' },
      { title: 'Search tracking',            description: 'Discovery vs. direct, views, direction requests, calls — measured monthly.' },
      { title: 'Q&A management',             description: 'Questions answered before prospects have to ask twice.' },
      { title: 'Multi-location consistency', description: 'NAP, hours, categories — matched across every listing.' },
    ],
    bentoCards: [
      { size: 'large',  title: 'Your Google profile is *being judged right now*', copy: "Someone just searched 'tacos near me.' Three profiles showed up. Yours has 4 photos from 2022, last post 6 months ago, 3 unanswered questions. The competitor's profile is full, active, and fresh. Guess who gets the visit.", coverAlt: 'Side-by-side GBP comparison — neglected vs. optimized' },
      { size: 'medium', title: 'The restaurant that posts weekly on Google *gets 2x the actions*', copy: "Not social. Google. Posts, offers, updates — directly on your business profile. Most restaurants don't know this exists. Their competitors do.", coverAlt: 'GBP post examples + profile actions chart' },
      { size: 'small',  title: 'We track the searches *that actually matter*', copy: '"Best tacos KC" vs. "Taco Naco KC" — discovery vs. direct. The ratio tells us whether your brand is growing or coasting. We track it monthly.', coverAlt: 'Discovery vs direct search trend chart' },
    ],
    stats: [
      { number: '46%', label: 'Of all Google searches have local intent' },
      { number: '70%', label: 'More likely to attract visits with a complete, active profile' },
      { number: '2x',  label: 'More profile actions from weekly GBP posting' },
    ],
  },

  {
    slug: 'reputation',
    name: 'Reputation Management & Reviews',
    category: 'Convert Demand',
    hero: {
      eyebrow: 'CONVERT DEMAND',
      headline: 'Your rating is your resume. *We manage it like one.*',
      body: 'Every review answered. Every rating tracked. Every location covered.',
      coverAlt: 'Review feed with response rate stats overlaid',
    },
    thesis: {
      eyebrow: 'MANAGED LIKE A RESUME',
      headline: 'Your star rating is doing *more selling* than you think.',
      body: "Every unanswered review tells the next guest you don't care. We answer every one, in your voice, before it costs you the table.",
    },
    perks: [
      { title: 'Review response',          description: 'Every Google review answered within 24 hours, in your brand voice.' },
      { title: 'Rating monitoring',         description: 'Trends, volume, and star distribution tracked across all locations.' },
      { title: 'Sentiment analysis',        description: "What people praise and what they complain about, turned into patterns your kitchen can act on." },
      { title: 'Survey pipeline',           description: 'Post-visit survey via SMS. Score 4-5? Guided to Google review. Score 1-3? Caught privately.' },
      { title: 'Competitive monitoring',    description: 'How your ratings compare to competitors in your zip code.' },
      { title: 'Response rate tracking',    description: 'Your response percentage, average response time, and unresponded count flagged.' },
    ],
    bentoCards: [
      { size: 'large',  title: "The review you didn't respond to *is still sitting there*", copy: "53% of customers expect a response within 7 days. Only 36% of restaurants respond at all. Every unanswered review tells the next prospect: 'this place doesn't care.' We answer every single one — within 24 hours, in your brand voice.", coverAlt: 'Review feed with response rate stats overlay' },
      { size: 'medium', title: 'One star is worth *5–9% more revenue*', copy: "Not a marketing stat. A P&L stat. A 4.2 to a 4.5 on Google can mean the difference between a slow Tuesday and a full house. We build the systems that move the number.", coverAlt: 'Star rating → revenue impact chart' },
      { size: 'medium', title: 'We catch the unhappy guest *before they go public*', copy: 'Our survey-to-review pipeline sends a 1-question check after every order. Score 4-5? Guided to Google. Score 1-3? Caught privately. Problem resolved before it becomes a 1-star review.', coverAlt: 'Survey flow — order → SMS → score → branch' },
      { size: 'small',  title: 'Sentiment patterns that *tell your kitchen what to fix*', copy: "When 14 reviews mention 'long wait' in the same month, that's not a marketing problem — it's an operations insight. We surface the patterns your team needs to see.", coverAlt: 'Word frequency chart from review sentiment' },
    ],
    stats: [
      { number: '88%',  label: 'Of diners trust online reviews as much as personal recommendations' },
      { number: '5–9%', label: 'Revenue increase per 1-star improvement on Google' },
      { number: '24hr', label: 'Our maximum response time on every review, every platform' },
    ],
  },

  {
    slug: 'experiential',
    name: 'Experiential & Collabs',
    category: 'Convert Demand',
    hero: {
      eyebrow: 'CONVERT DEMAND',
      headline: "The best marketing *doesn't feel like marketing.*",
      body: 'Creator partnerships, events, activations. Your brand in rooms you can\'t buy into.',
      coverAlt: 'Creator at restaurant table shooting content — natural, not staged',
    },
    thesis: {
      eyebrow: 'EARNED, NOT BOUGHT',
      headline: 'The right creator can do what *ads can\'t.*',
      body: "One authentic post from someone whose audience trusts their taste outperforms a month of paid media — if you find the right one.",
    },
    perks: [
      { title: 'Creator matching',      description: 'We find creators who actually eat at places like yours, not just big follower counts.' },
      { title: 'Event activations',     description: 'One well-designed moment that generates content and foot traffic at the same time.' },
      { title: 'UGC programs',          description: "Your best guests get a simple guide so their content is usable, not just a blurry story." },
      { title: 'Creator Box',           description: 'Branded welcome kit before day one: materials, guidelines, handwritten note.' },
      { title: 'Influencer management', description: 'Outreach to approval to tracking, end to end.' },
      { title: 'Collab strategy',       description: 'The right local partners and brands in your market that actually make sense.' },
    ],
    bentoCards: [
      { size: 'large',  title: "Your next 50 guests *are following someone who hasn't visited yet*", copy: "We find the right creators — not the biggest, the right ones. People who eat at places like yours, whose audience trusts their taste. One authentic post from the right person outperforms a month of ads.", coverAlt: "Creator's post with engagement metrics overlaid" },
      { size: 'medium', title: 'Creator Box — *set the standard before day one*', copy: 'When a creator partners with your brand, they receive a box: branded materials, key messages, content guidelines, and a handwritten note. It sets the tone. They remember it. Their content shows it.', coverAlt: 'Branded creator box — unboxing style' },
      { size: 'small',  title: 'UGC that *you can actually use*', copy: 'Most user-generated content is unusable — bad lighting, wrong angle, no strategy. We give creators a simple guide: what to shoot, how to shoot it, what to say. The result looks organic but performs like produced content.', coverAlt: 'UGC guide page + resulting content side by side' },
    ],
    stats: [
      { number: '92%', label: 'Of consumers trust earned media over traditional advertising' },
      { number: '4x',  label: 'Higher CTR on UGC-based ads vs. branded creative' },
      { number: '1',   label: 'Right creator outperforms a month of paid ads' },
    ],
  },

  // ─── RETAIN DEMAND ────────────────────────────────────────────────────────
  {
    slug: 'email-sms',
    name: 'Email & SMS Marketing',
    category: 'Retain Demand',
    hero: {
      eyebrow: 'RETAIN DEMAND',
      headline: 'The guest who already trusts you *is your most valuable audience.*',
      body: 'Direct communication. Not rented reach. $42 return per $1 spent.',
      coverAlt: 'Automated flow diagram with revenue tags per step',
    },
    thesis: {
      eyebrow: 'THE HIGHEST-ROI CHANNEL',
      headline: 'You already have their attention. *Use it well.*',
      body: "Segmented, behavior-triggered email and SMS turns guests who've already said yes once into guests who keep coming back.",
    },
    perks: [
      { title: 'Automated flows',      description: 'Welcome, lapsed reactivation, birthday, post-visit follow-up, VIP recognition — triggered by real behavior.' },
      { title: 'Segmented campaigns',  description: 'Right message, right segment, right time. New vs returning vs lapsed vs VIP.' },
      { title: 'Revenue attribution',  description: 'Every send tracked against POS orders within 14 days. You see exactly which email drove which orders.' },
      { title: 'SMS + email together', description: 'Two channels, different jobs, same strategy. Not competing — complementing.' },
      { title: 'List health',          description: 'Subscriber growth, opt-outs, bounce rates, deliverability monitored. Your audience stays clean.' },
      { title: 'Campaign reporting',   description: 'Open rates, click rates, revenue per send, best day and time — all in your dashboard.' },
    ],
    bentoCards: [
      { size: 'large',  title: 'Segmented sends drive *760% more revenue* than blasts', copy: "Not 7%. Not 76%. Seven hundred and sixty percent. Because '20% off everything' sent to everyone is noise. 'We miss you — here's your favorite order, 20% off' sent to a lapsed guest at 5pm on a Thursday? That's a sale.", coverAlt: 'Blast vs. segmented send — open rate + revenue comparison' },
      { size: 'medium', title: 'Your welcome flow *earns money while you sleep*', copy: 'New subscriber → welcome email (day 0) → location guide (day 2) → first-visit offer (day 5) → menu highlight (day 10). Automated. Triggered. Revenue attributed. You never touch it.', coverAlt: 'Automated flow diagram with revenue tags per step' },
      { size: 'medium', title: 'Every send *tracked to actual orders*', copy: 'We match Twilio send timestamps to Toast POS orders within a 14-day window. You see exactly how many orders came from that Thursday email. Not estimated. Measured.', coverAlt: 'Attribution table — send → orders → revenue' },
      { size: 'small',  title: 'The birthday email that *actually works*', copy: "Not 'Happy birthday! Here's 10% off.' We send it 3 days early with a specific menu recommendation based on their past orders. Redemption rate: significantly above industry average.", coverAlt: 'Birthday email mockup' },
    ],
    stats: [
      { number: '$42',  label: 'Return per $1 on restaurant email — highest ROI channel in hospitality' },
      { number: '760%', label: 'More revenue from segmented vs. broadcast email campaigns' },
      { number: '14d',  label: 'Attribution window — every send matched to POS orders' },
    ],
  },

  {
    slug: 'crm-loyalty',
    name: 'CRM & Loyalty',
    category: 'Retain Demand',
    hero: {
      eyebrow: 'RETAIN DEMAND',
      headline: 'A regular is worth more than *a hundred new followers.*',
      body: 'Guest segmentation, lifecycle flows, VIP recognition. Relationships, not transactions.',
      coverAlt: 'Guest lifecycle funnel — visit 1 → silence → lost vs visit 1 → follow-up → regular',
    },
    thesis: {
      eyebrow: 'RELATIONSHIPS, NOT TRANSACTIONS',
      headline: 'Most guests never come back. *Not because of the food.*',
      body: 'Because nobody followed up. We build the systems that make the second visit feel inevitable — automatically, for every guest.',
    },
    perks: [
      { title: 'Guest segmentation',      description: 'New, returning, VIP, at-risk, lapsed, big spenders — every guest tagged and treated differently.' },
      { title: 'Lifecycle automations',   description: 'Triggered by real behavior: 5th visit, 60-day absence, birthday, first order, big spend.' },
      { title: 'Survey → review pipeline',description: 'Happy guests guided to Google review, unhappy guests caught privately.' },
      { title: 'VIP recognition',          description: 'Your best customers get acknowledged automatically, not ignored.' },
      { title: 'Lapsed reactivation',      description: '60 days no visit triggers an SMS. 22% come back. $47 average return spend.' },
      { title: 'Direct ownership',         description: "You own the guest list, not Meta, not DoorDash, not any third-party platform." },
    ],
    bentoCards: [
      { size: 'large',  title: "78% of your guests *never come back* — not because the food was bad", copy: "Because nobody asked them to. No follow-up. No 'thanks for coming.' No reason to choose you over the new place that opened last week. We build the systems that make the second visit feel inevitable.", coverAlt: 'Churn funnel — visit 1 → silence → lost → vs → visit 1 → follow-up → return → regular' },
      { size: 'medium', title: "Your VIP *doesn't know they're a VIP*", copy: '5+ visits. Top 10% spend. Orders every other week. And they\'ve never received a single acknowledgment from your brand. We fix that — automatically.', coverAlt: 'VIP recognition email/SMS mockup' },
      { size: 'medium', title: 'The lapsed guest *reactivation that pays for itself*', copy: "60 days since last visit → triggered SMS: 'It's been a minute. Your usual?' → 22% reactivation rate → average reactivated guest spends $47 in first return visit. The flow costs nothing to run after setup.", coverAlt: 'Reactivation flow with conversion metrics' },
      { size: 'small',  title: 'You own the relationship. *Not Meta. Not DoorDash. You.*', copy: "Your email list doesn't disappear when an algorithm changes. Your SMS subscribers don't vanish when a platform goes down. Direct customer relationships are the only asset that compounds without a platform tax.", coverAlt: 'Owned vs rented audience comparison diagram' },
    ],
    stats: [
      { number: '67%',  label: 'More spent per visit by repeat guests vs. first-timers' },
      { number: '5–7x', label: 'More expensive to acquire a new customer than retain an existing one' },
      { number: '78%',  label: 'Of guests never return without a system in place' },
    ],
  },

  {
    slug: 'analytics',
    name: 'Analytics & Reporting',
    category: 'Retain Demand',
    hero: {
      eyebrow: 'RETAIN DEMAND',
      headline: "You can't fix *what you can't see.*",
      body: 'One dashboard. Sales, social, email, reviews, campaigns. Every dollar accounted for.',
      coverAlt: 'Direct + Influence ROI dashboard cards side by side',
    },
    thesis: {
      eyebrow: 'EVERY DOLLAR, VISIBLE',
      headline: "Marketing that *can't be measured* can't be trusted.",
      body: "We connect every channel to real revenue — so you know exactly what's working, not just what feels like it is.",
    },
    perks: [
      { title: 'Direct + Influence ROI',   description: 'Email sent Tuesday, 14 orders by Friday, $658 attributed (direct). Plus influence revenue modeled. Both numbers.' },
      { title: 'POS integration',          description: 'Real revenue matched to campaigns within 14 days, not guesses.' },
      { title: 'Platform aggregation',     description: 'Social, Google, email, SMS, surveys — all in one dashboard.' },
      { title: 'Monthly branded reports',  description: 'Visual, presentation-ready. Hand to your investor and say "this is what we delivered."' },
      { title: 'Performance tracking',     description: 'What drives visits and orders, not follower counts.' },
      { title: 'KPI monitoring',           description: 'Impressions, engagement, conversions, revenue per channel — all visible.' },
    ],
    bentoCards: [
      { size: 'large',  title: "Two kinds of ROI — *because one isn't enough*", copy: 'Direct ROI: email sent Tuesday → 14 orders placed by Friday → $658 attributed revenue. Influence ROI: 340K impressions × 0.5% conversion estimate × $18 avg check → $30,600 modeled influence. You get both numbers.', coverAlt: 'Direct + Influence ROI side-by-side dashboard cards' },
      { size: 'medium', title: 'The campaign timeline that *shows cause and effect*', copy: 'Email blast Tuesday. Social push Wednesday–Friday. Paid campaign Saturday. Revenue spike Saturday–Monday. When you see the timeline, the correlation is obvious. When you don\'t, everything feels random.', coverAlt: 'Horizontal timeline — efforts on top, revenue below, visual correlation' },
      { size: 'small',  title: "Reports your *investors can present to partners*", copy: "Not a PDF dump. A branded, visual, presentation-ready report that a restaurant owner can hand to their investor, landlord, or partner and say 'this is what our marketing team delivered this month.'", coverAlt: 'Monthly report page spread — clean, branded' },
    ],
    stats: [
      { number: '5',   label: 'Data sources feeding one dashboard — POS, social, email, Google, surveys' },
      { number: '30%', label: 'More efficient budget allocation for brands that track ROI' },
      { number: '28d', label: 'Per reporting cycle — aligned to billing, never a surprise' },
    ],
  },
]

export function getService(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}

export function getSiblingServices(current: string, count = 3): Service[] {
  const svc = services.find(s => s.slug === current)
  if (!svc) return services.slice(0, count)
  const sameCategory = services.filter(s => s.category === svc.category && s.slug !== current)
  const others = services.filter(s => s.category !== svc.category)
  return [...sameCategory, ...others].slice(0, count)
}
