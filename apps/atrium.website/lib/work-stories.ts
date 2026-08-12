/** Narrative blocks for the Work page.
 *
 *  These are not the case studies — a case study is the full record. A story
 *  is the short version told on the index: how the engagement ran and what
 *  came out of it, next to a handful of the actual pieces we made.
 *
 *  Only clients whose media is served from our own CDN belong here. A story
 *  block is mostly photographs; one pointed at the disabled Cloudinary account
 *  would render as a wall of empty frames. */

export type WorkStory = {
  /** Case study this story summarises and links to. */
  slug: string
  eyebrow: string
  headline: string
  /** Kicker above the images — what the pieces on the right actually are. */
  craft: string
  body: string[]
  metrics: { number: string; label: string }[]
}

export const workStories: WorkStory[] = [
  {
    slug: 'taco-naco',
    eyebrow: 'Taco Naco KC',
    headline: 'Three locations that finally sound like one restaurant.',
    craft: 'Monthly production · Menu and lifestyle photography · Platform-native edits',
    body: [
      'Three rooms in Kansas City — Overland Park, Westport, State Line. The food had a following; online it read as three different businesses. No consistent look, no calendar, and no way to tell which post had done anything.',
      'We started in December and rebuilt it from the ground: one brand direction, one content system, one team shooting every month and running every platform for every location. We opened the channels they were missing and connected all three Google profiles to an actual strategy rather than leaving them as listings.',
    ],
    metrics: [
      { number: '1,031', label: 'pieces published in five months' },
      { number: '23K', label: 'followers, from 5.9K' },
      { number: '504K', label: 'Google impressions across three locations' },
    ],
  },
  {
    slug: 'taha',
    eyebrow: 'T’ÄHÄ Mexican Kitchen',
    headline: 'Michelin-star dinners, sold out without a dollar of paid media.',
    craft: 'Campaign photography · Event films · Email and PR sequences',
    body: [
      'Every campaign ran a full cycle rather than a burst of posts: awareness content to build anticipation, PR outreach to earn coverage, an email sequence to turn interest into a booking, and a call to action at every touchpoint. Reservations stopped arriving in spikes and started arriving predictably.',
      'For Mar & Tierra — a collaboration with Chef Alberto Ferruz of BonAmb, two Michelin stars, and the first dinner of its kind in Kansas City — targeted PR, a carousel campaign, Story countdowns and a multi-step email sequence sold out both nights. The T’ÄHÄ Takeover series repeated it. We also wrote the line the restaurant now prints on its menus: Crafting Mexican Excellence.',
    ],
    metrics: [
      { number: '5.24M+', label: 'total impressions, up 544%' },
      { number: '4+', label: 'sold-out events, organic only' },
      { number: '30%', label: 'email open rate — twice the industry average' },
    ],
  },
]
