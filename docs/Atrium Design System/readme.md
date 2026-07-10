# Atrium — Design System

> A creative + marketing studio identity. **"We're humans."** Atrium pairs
> warm, hand-written personality with confident, experimental display
> typography on a deep-teal / mint / amber palette.

---

## 1. Brand & product context

**Atrium** is a full-service creative and marketing studio (Kansas City) that
positions itself as *"Marketing experts and simple software for better
Business."* The brand voice is human, warm and a little cheeky — it greets
visitors with *"Congratulations – you've found your people. Tens of thousands of
us. Welcome to atrium."*

Core services seen across the identity work:

- **SEO**
- **Marketing** (media & advertising — *"we build growth engines, not just ads"*)
- **Graphic Design**
- **Photography**

Recurring brand campaign lines: **"The Experience Era"**, **"Together is more
fun"**, **"We're the team you call when you need help yesterday."**, and the
**"At The Door"** sub-brand/lockup.

This system is an **identity / brand system** (not a shipping software product).
It captures the logo suite, type system, color, and the brand's signature
typographic treatments, then provides reusable web components and a marketing-
site UI kit built from them.

### Sources provided
- Local folder **`ATRIUM IDENTITY/`** (File System Access mount) containing:
  - `Typography/` — **Nimora** (experimental display sans, single weight),
    **Spectral** (serif family), **Swarsh Daisy** (elegant display serif,
    roman + italic), **Nothing You Could Do** (Google handwriting script).
    Nothing You Could Do.)*
  - `LOGO SVG/SVG/` — `Artboard 3–10.svg` (α mark + horizontal wordmark).
  - `Exportables/` — `Atrium Works -01…13.png` brand applications,
    `Atrium Works .svg`, `Atrium_Deep Teal Transparency.png`,
    `Atrium – Quick Visual Guide.png` (the α monogram).
  - `Typography treatments and Color .pdf` and `Brandign Atrium .ai` (source
    art — colors below were sampled from the raster/SVG exports, since the PDF
    text is outlined).
- Two pasted reference posters (the amber "We're humans" poster and the deep-teal
  "Experience Era" type-treatment board) — the primary guide to voice + type use.

---

## 2. Content fundamentals (voice & copy)

Atrium writes like **a confident friend who happens to be very good at marketing.**

- **Person:** First-person plural **"we"**, addressing the reader as **"you"**.
  *"We're the team you call when you need help yesterday."*
- **Tone:** Warm, direct, a little irreverent, results-obsessed. Celebrates the
  reader (*"you've found your people"*) and pushes back on lazy marketing
  (*"While others focus on vanity metrics, we obsess over your ROI."*).
- **Casing:**
  - The wordmark **"atrium"** is always **lowercase**.
  - Big display statements are often **bold sentence case** with a word or two
    swapped into **handwritten script** or **serif** for warmth
    (*"We're **humans**"*, *"Welcome to **atrium**"*).
  - Campaign labels and section eyebrows use **WIDE LETTER-SPACED CAPS**
    (*"MEDIA   AND   ADVERTISING"*, *"THE EXPERIENCE ERA"*).
- **Punctuation:** En-dashes for asides (*"Congratulations – you've found…"*),
  periods used confidently for rhythm and emphasis (*"Tens of thousands of us."*).
- **Emphasis device:** an **amber highlighter swipe** behind a keyword
  (*Marketing*, *better*, *Business*) — the signature "marker" effect.
- **Emoji:** **None.** Personality comes from the script font and the marker
  highlight, never from emoji.
- **Quotes / objections** are set as punchy headlines in italic
  (*"I DON'T NEED SOCIAL MEDIA"*) then answered in plain body copy.

**Example body voice:**
> "We don't just create ads; we build growth engines. While others focus on
> vanity metrics, we obsess over your ROI and connecting your brand with
> high-intent customers. Ready to see what your brand is truly capable of?"

**Do:** be human, specific, confident. **Don't:** corporate hedging, jargon
soup, exclamation spam, emoji.

---

## 3. Visual foundations

### Color
Three brand anchors + one warm accent (all sampled from the artwork):

| Role | Hex | Notes |
|------|-----|-------|
| **Deep Teal** | `#072F34` | Primary dark anchor — backgrounds, ink, the wordmark on light |
| **Mint** | `#B5F2DB` | Primary light accent — type on teal, fields, the α mark |
| **Cloud** | `#E4EEF0` | Cool brand white (logo lockups, body on dark) |
| **Amber** | `#F7A823` | Warm marigold — campaign fields + the highlighter swipe |

Two-tone is the default: **mint-on-teal** or **teal-on-mint**. Amber is the
"campaign" color — full-bleed amber poster fields, or just the marker highlight.
Imagery in the brandwork is **cool and tonal** (teal/mint duotone), occasionally
a warm amber field for contrast. See `tokens/colors.css`.

### Backgrounds & textures
The brand stays flat — **no CSS gradient hacks**. Depth and warmth come from three
real photographed surfaces in `assets/textures/` (tokens in `tokens/textures.css`):
- **Forest glow** (`--surface-atmos`) — a soft, grainy teal-green atmospheric field
  for heroes and section backgrounds. Light type on top. Class `.atr-bg-atmos`.
- **Charcoal sage** (`--surface-atmos-deep`) — a moodier, lower-key version for
  darker, quieter sections. Class `.atr-bg-atmos--deep`.
- **Silver paper grain** (`--surface-grain`) — a fine grain used two ways: as a
  light paper *surface* (`.atr-bg-grain`), or dropped as an absolutely-positioned
  *overlay* (`.atr-grain-overlay`) at ~10–16% `overlay`/`soft-light` to add tooth
  over any color field or photo. This is the same grain language as the social
  system and slides — keep it subtle.
See the **Textures** group in the Design System tab for specimens.

### Soft / Bento effect system
The evolved layout language (see **Soft / Bento effects** and **Site · Services
Bento** in the Design System tab). Large-radius cards sit on a pastel **aurora**
of mint + amber bleeding from the corners over near-white; crisp **white
sub-cards float on top** with diffuse low-opacity shadows. Reusable everywhere —
posts, web, slides.
- **Aurora fields** — `--grad-aurora` (balanced) / `--grad-aurora-warm` /
  `--grad-aurora-cool` / `--grad-aurora-deep` (dark tile), or classes
  `.atr-aurora` / `--warm` / `--cool` / `--deep`. Defined in `tokens/gradients.css`:
  iridescent multi-radial mesh built from brand hues + two pale optical halos
  (`--iris-blue`, `--iris-lilac`) — pale, low-contrast, dark type on top. `Card`
  tones `aurora|aurora-mint|aurora-amber` map onto these. Pair with
  `.atr-grain-overlay` for the photographed finish.
- **Floating cards** — `.atr-float-card` (or `Card elevation="soft|float"`):
  `--shadow-soft`, `--shadow-float`, `--shadow-inset-card` — diffuse, never harsh.
- **Radii** — `--radius-bento` (24px) for tiles, `--radius-float` (18px) for sub-cards.
- **Pills** — `Chip` variants `outline-soft`, `mint-soft`, `ink` (dark), `amber`
  for stats/tags (ROI · rank #1 · high-intent). `.atr-lift` adds the hover lift.

### Type
a **handwriting script** for accent callouts.
- **Inter Tight** — *the primary face* (bundled). All body, UI, labels, buttons
  and headlines (*"We use strategy, creative, and data…"*, *"The Data Behind the
  Work"*). Tight geometric grotesque, large x-height. `--font-sans`.
- **Instrument Serif** — editorial serif (bundled), used **italic** for the
  emphasis phrase inside a sans headline (*"grow restaurants, hotels, and food
  brands"*, *"Keynote, PowerPoint, Slides & Figma"*) and for big stat figures
  (*“$44”, “70%”, “2.7x”*). `--font-serif` / `--font-accent` (alias).

- **Nothing You Could Do** — handwriting script for accent callouts (`--font-script`).

Signature treatment: **sans headline with one italic-serif emphasis phrase**
set inline; **wide letter-spaced caps** for eyebrows/labels. See
`tokens/typography.css`.

### Space, layout & shape
- **8px grid**; generous open space — the brand breathes.
- **Stadium pills** (`--radius-pill`) for the service chips and buttons; soft
  **14px** cards; large **22px** radius for the amber hero panel.
- Pills are drawn with a clean **~1.5px stroke**, no fill, on light.
- Layout is **flat and confident** — solid color fields define hierarchy.

### Elevation, borders, motion
- **Shadows are sparse.** Elevation is communicated with **color** (a mint or
  amber field) far more than blur. A soft `--shadow-card` exists for floating UI
  only; most cards sit flat with a hairline or a color fill.
- **Borders:** hairline `--cloud-400` on light; `--teal-500` on dark; bold teal
  stroke for outlined pills.
- **Motion:** confident settle — `--ease-out` (cubic-bezier(.16,1,.3,1)),
  ~220ms. Fades and gentle rises; **no bounce, no spin.**
- **Hover:** deepen the field one step, or lift to mint. **Press:** scale `0.97`,
  no color flash. Respect `prefers-reduced-motion`.
- **Transparency / blur:** used lightly — the "Deep Teal Transparency" mark sits
  over photography; avoid heavy glassmorphism.
- **Corner radii:** pill for chips/buttons, 14–22px for cards/panels, 4px for
  inputs.

---

## 4. Iconography

Atrium's identity is **typographic, not icon-heavy** — the brand leans on the
**α (alpha) monogram** and the **atrium wordmark** rather than a UI icon set.

- **Brand marks (in `assets/logos/`):**
  - `atrium-mark.svg` — the **α monogram** (recolorable, `currentColor`).
  - `atrium-wordmark.svg` — the lowercase **atrium** wordmark (recolorable).
  - `artboard-3…10.svg` — original Illustrator exports (mark + wordmark, on
    solid fields). `atrium-works.svg` — full lockup. Use the `currentColor`
    versions for the web.
- **Emoji:** never used.
- **Unicode glyphs:** the brand's own glyph is the Greek **α** (U+03B1) — it
  literally *is* the logo. Beyond that, no decorative unicode icons.
- **UI icons (SUBSTITUTION):** the identity ships **no functional UI icon set**
  (search, menu, arrows, etc.). For product/UI surfaces this system uses
  **[Lucide](https://lucide.dev)** via CDN — a clean 1.5–2px stroke set that
  matches the brand's thin-stroke pill outlines. Loaded in the UI kit from
  `https://unpkg.com/lucide@latest`. Swap for a bespoke Atrium icon set when one
  exists. Keep stroke ~1.75px, rounded caps, to echo the pill strokes.

---

## 5. Index / manifest

**Root**
- `styles.css` — global entry (import this one file). `@import`s all tokens.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skills wrapper.

  Instrument Serif (serif, roman+italic), Nothing You Could Do (script). No CDN.
- `logos/` — `atrium-mark.svg`, `atrium-wordmark.svg`, original `artboard-*.svg`, `atrium-works.svg`.
- `images/` — `deep-teal-transparency.png`.

**`guidelines/`** — foundation specimen cards (Colors, Type, Brand, Spacing) — populate the Design System tab.

**`components/core/`** — the 9 reusable React primitives: `Button`, `Chip`,
`Logo`, `Highlight`, `Eyebrow`, `ScriptAccent`, `Card`, `Badge`, `Input`.
See each `*.prompt.md`. Imported as `window.AtriumDesignSystem_<hash>.<Name>`.

**`ui_kits/atrium-site/`** — marketing-site UI kit (hero, services, "Experience
Era" marquee, filterable work gallery, contact flow) composed from the
components. `index.html` is the interactive demo.

**`templates/landing/`** — copy-to-start landing-page template (`Landing.dc.html`)
that consuming projects can fork. Loads the system via `ds-base.js`.

**`templates/social/`** — the **Atrium Social System** (`AtriumSocial.dc.html`):
15 ready-to-fork Instagram posts & stories across 5 sets — *Words first* (type-led),
*Show the room* (photo-led), *The receipts* (proof/stats), *In the feed* (9:16
stories), *Make the call* (CTA closers). Photo slots are drag-to-fill
(`image-slot.js`); grain texture via `grain.svg`. Built entirely on the Atrium
tokens, voice and two-tone palette — fork it for a month of branded content.

---

## 6. Caveats / substitutions

