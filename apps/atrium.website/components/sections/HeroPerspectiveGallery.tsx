import LazyVideo from '@/components/media/LazyVideo'
import { Marquee } from '@/components/ui/Marquee'
import { cldImageUrl, cldVideoPoster, cldVideoUrl } from '@/lib/cloudinary'
import type { HeroTile } from '@/lib/work'

type Props = {
  tiles: HeroTile[]
}

const COLUMN_COUNT = 3
const DURATIONS = ['42s', '50s', '38s']
const ASPECT_RATIOS = ['4/5', '1/1', '3/4']
/** Reels are shot 9:16 and keep that shape. Forcing one into the photo ratios
 *  would crop it to a slot it was never framed for, and the difference in shape
 *  is what tells a viewer the moving tiles are reels. */
const REEL_ASPECT_RATIO = '9/16'

/** Round-robin split: item i goes to column i % columns. Exported for a
 *  focused unit test — this is the only non-trivial logic in an otherwise
 *  presentational component. */
export function splitIntoColumns<T>(items: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => [])
  items.forEach((item, i) => {
    const column = result[i % columns]
    if (column) column.push(item)
  })
  return result
}

export default function HeroPerspectiveGallery({ tiles }: Props) {
  const columns = splitIntoColumns(tiles, COLUMN_COUNT)

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
      }}
    >
      <div
        className="absolute inset-x-0 flex p-4"
        style={{ top: '-15%', height: '130%', transform: 'perspective(1600px) rotateY(-12deg) scale(1.05)' }}
      >
        {columns.map((columnTiles, colIndex) => (
          <Marquee
            // biome-ignore lint/suspicious/noArrayIndexKey: columns are a fixed-length, stable-order derived layout, not a reorderable list
            key={colIndex}
            vertical
            repeat={2}
            reverse={colIndex % 2 === 1}
            className="flex-1"
            style={{ '--duration': DURATIONS[colIndex % DURATIONS.length] } as React.CSSProperties}
          >
            {columnTiles.map((tile, tileIndex) => (
              <div
                key={tile.src}
                className="w-full overflow-hidden rounded-xl"
                style={{
                  aspectRatio:
                    tile.kind === 'video'
                      ? REEL_ASPECT_RATIO
                      : ASPECT_RATIOS[tileIndex % ASPECT_RATIOS.length],
                }}
              >
                {tile.kind === 'video' ? (
                  // Decoration behind the hero copy: muted, looping, no controls
                  // and hidden from assistive tech. Three columns of these run
                  // at once and each is duplicated for the wrap, so nothing is
                  // fetched until a tile is actually near the viewport — the
                  // poster holds the slot until then.
                  <LazyVideo
                    className="h-full w-full object-cover"
                    poster={cldVideoPoster(tile.src) || undefined}
                    src={cldVideoUrl(tile.src, { width: 500 })}
                  />
                ) : (
                  // biome-ignore lint/performance/noImgElement: marquee track of remote CDN assets, next/image not suitable here
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    src={cldImageUrl(tile.src, { width: 500 })}
                  />
                )}
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </div>
  )
}
