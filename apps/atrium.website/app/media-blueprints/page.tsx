import type { Metadata } from 'next'

import MediaBlueprint from '@/components/media/MediaBlueprint'
import styles from '@/components/media/MediaBlueprint.module.css'
import MediaBlueprintSection from '@/components/media/MediaBlueprintSection'
import Eyebrow from '@/components/ui/Eyebrow'
import type { MediaBlueprint as MediaBlueprintItem } from '@/lib/media-blueprints'

export const metadata: Metadata = {
  title: 'Media Blueprints — Atrium Internal',
  description: 'Internal reference gallery for Atrium media composition blueprints.',
  robots: { index: false, follow: false },
}

const processBlueprint: MediaBlueprintItem = {
  kind: 'process',
  assetType: 'illustration',
  code: 'MB-05',
  title: 'From signal to service',
  direction: 'Four functional frames move from observation through production and distribution to the final operator decision.',
  ratio: 'wide',
}

const blueprints: MediaBlueprintItem[] = [
  {
    kind: 'cinematic',
    assetType: 'photo',
    code: 'MB-01',
    title: 'The room before the rush',
    direction: 'Low, atmospheric environmental frame. Hold negative space for the service story and preserve the full dining-room scale.',
    ratio: 'wide',
  },
  {
    kind: 'collage',
    assetType: 'illustration',
    code: 'MB-02',
    title: 'A service told in fragments',
    direction: 'Mix food, hands, and room details as a tactile contact sheet. Keep the hierarchy editorial rather than scrapbook-like.',
    ratio: '4:3',
  },
  {
    kind: 'device',
    assetType: 'reel',
    code: 'MB-03',
    title: 'Channel-native vertical story',
    direction: 'Anchor the 9:16 capture in a bounded device frame, with two small fragments showing the supporting channel system.',
    ratio: '3:4',
  },
  {
    kind: 'dashboard',
    assetType: 'dashboard',
    code: 'MB-04',
    title: 'Demand made legible',
    direction: 'Show useful reporting structure: trend lines, decision cards, and an ordered data rhythm. Avoid decorative analytics chrome.',
    ratio: '16:9',
  },
  processBlueprint,
]

const usage = [
  { code: 'MB-01 · wide', use: 'Case-study hero and campaign opener' },
  { code: 'MB-02 · 4:3', use: 'Editorial proof and image-led story' },
  { code: 'MB-03 · 3:4', use: 'Social system and vertical content' },
  { code: 'MB-04 · 16:9', use: 'Reporting and performance proof' },
  { code: 'MB-05 · wide', use: 'Process, timeline, and methodology' },
]

export default function MediaBlueprintGalleryPage() {
  return (
    <div className={styles.galleryPage}>
      <header className={styles.galleryIntro}>
        <div className={styles.galleryIntroInner}>
          <Eyebrow>Internal reference · Media system</Eyebrow>
          <h1 className={styles.galleryTitle}>Five frames for a clearer story.</h1>
          <p className={styles.galleryLead}>
            A production-facing gallery for selecting the right visual grammar before photography, editing, illustration, or reporting begins.
          </p>
          <ul className={styles.referenceGrid} aria-label="Blueprint ratios and intended uses">
            {usage.map((item) => (
              <li className={styles.referenceItem} key={item.code}>
                <strong>{item.code}</strong>
                <span>{item.use}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <MediaBlueprintSection
        eyebrow="Primary compositions"
        headline={<>Lead with atmosphere, then <em>build the evidence.</em></>}
        body="Feature layouts establish a dominant image while preserving enough context for the production brief to travel with it."
        items={blueprints.slice(0, 2)}
        layout="feature"
      />

      <MediaBlueprintSection
        eyebrow="System views"
        headline={<>Make channels, reporting, and process <em>feel tangible.</em></>}
        body="The remaining frames translate invisible marketing work into compositions an operator can understand at a glance."
        items={blueprints.slice(2)}
        tone="dark"
        layout="triptych"
      />

      <div className={styles.standaloneExample}>
        <p className={styles.standaloneLabel}>Visual-only option · showBrief=false</p>
        <MediaBlueprint item={processBlueprint} showBrief={false} />
      </div>
    </div>
  )
}
