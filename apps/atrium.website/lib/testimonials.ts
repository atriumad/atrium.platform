/** What operators said about working with us, in their own words.
 *
 *  It lives here rather than in the page because the set grows as clients are
 *  added, and a home page should not grow with it. The rail renders whatever it
 *  is handed, so adding a testimonial is an edit to this file alone. Order is
 *  the display order; the count does not have to balance, because a rail takes
 *  any number of cards.
 *
 *  Quotes are printed as given. Nothing here is paraphrased, and no role or
 *  surname is inferred — a name the client has not confirmed is worse than no
 *  name at all, so the card drops the line instead. */

/** Portraits are served from this app's own `public/`, not hotlinked from the
 *  press pages they came from: those hosts rate-limit and rotate URLs, one of
 *  them already answers 403 to an off-site request, and the originals ran to a
 *  megabyte and a half for a frame shown at 370px. Filenames are keyed to the
 *  restaurant rather than to the person, so a change of spokesperson does not
 *  strand the file. */
const PORTRAITS = '/testimonials'

export type TestimonialCard = {
  quote: string
  /** Optional: some operators are quoted by role or company alone, and the
   *  card drops the name line rather than showing an empty one. */
  author?: string
  /** Optional for the same reason — several of these are unconfirmed. */
  role?: string
  company: string
  /** Approved portrait. A card without one runs on a solid fill. */
  photo?: string
  /** `object-position` for the portrait, when the subject is not where a
   *  centred crop expects them. The card is a tall slice of what is often a
   *  landscape frame, so a person standing off to one side gets cropped out
   *  entirely by the default. Defaults to `center top`, which suits a portrait
   *  or a square. */
  focal?: string
}

export const testimonials: TestimonialCard[] = [
  {
    quote:
      'From day one, we connected with the Atrium team—their energy, creativity, and passion for what they do. They truly work with us as part of our team. More than feeling like we hired an agency, we feel like we found a true partner for our business.',
    author: 'Fernanda Reyes',
    company: 'Taco Naco KC',
    photo: `${PORTRAITS}/taco-naco.jpg`,
  },
  {
    quote:
      'Atrium took the time to really understand who we are and what we’re trying to do. We’ve seen the difference in our social media and engagement, but most importantly, it’s getting people through the doors. They’ve become more than an agency we hired—they’re a partner we trust.',
    author: 'William Walker',
    company: 'Old Shawnee Pizza',
    photo: `${PORTRAITS}/old-shawnee.jpg`,
  },
  {
    quote:
      'The impact on social media has been incredible. People are seeing and enjoying the content, and most importantly, it’s bringing new customers through our doors. The team is professional, attentive, and always brings great ideas.',
    author: 'Jesus Leon',
    company: 'Don Chuy’s Fresh Mex & Cantina',
    photo: `${PORTRAITS}/don-chuys.jpg`,
    // He stands in the left third of a wide frame; a centred crop keeps the
    // brick wall and loses him.
    focal: '27% 18%',
  },
  {
    quote:
      'The brunch campaign they built moved real revenue. Not followers — people sitting down on Sunday mornings.',
    role: 'Owner',
    company: 'T’ÄHÄ Mexican Kitchen',
  },
]

/** Filler for judging the rail with a fuller set — how the loop reads at eight
 *  cards, and how a card behaves when its quote is much shorter or much longer
 *  than the real ones.
 *
 *  These are invented. They are named and worded so nobody could mistake them
 *  for a client, and `railTestimonials` drops them in production, because a
 *  placeholder quote shipping as a restaurant's own words is the one failure
 *  mode this file has to make impossible. */
export const placeholderTestimonials: TestimonialCard[] = [
  {
    quote: 'Placeholder copy standing in for a short quote, to check how a card holds when the words run out well before the card does.',
    author: 'Sample Operator',
    company: 'Placeholder Kitchen',
  },
  {
    quote: 'Placeholder copy standing in for a long quote, the kind that runs past six lines and sets the height every other card in the row then has to match. It keeps going so the stretch behaviour is visible, and so the scrim can be judged against a text block that reaches high up the card.',
    author: 'Sample Operator',
    role: 'General Manager',
    company: 'Placeholder Taqueria',
  },
  {
    quote: 'Placeholder copy at roughly the length the real quotes run, which is what the type sizing and the leading were tuned against.',
    author: 'Sample Operator',
    company: 'Placeholder Cafe',
  },
  {
    quote: 'Placeholder copy for a card quoted by role alone, with no name confirmed — the case where the card drops its name line.',
    role: 'Owner',
    company: 'Placeholder Cantina',
  },
]

/** What the rail renders. Production gets the real set only. */
export const railTestimonials: TestimonialCard[] =
  process.env.NODE_ENV === 'production'
    ? testimonials
    : [...testimonials, ...placeholderTestimonials]
