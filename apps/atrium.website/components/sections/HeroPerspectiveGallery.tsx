import { Marquee } from '@/components/ui/Marquee'
import { cldImageUrl } from '@/lib/cloudinary'

type Props = {
  publicIds: string[]
}

const COLUMN_COUNT = 3
const DURATIONS = ['42s', '50s', '38s']
const ASPECT_RATIOS = ['4/5', '1/1', '3/4']

/** Round-robin split: item i goes to column i % columns. Exported for a
 *  focused unit test — this is the only non-trivial logic in an otherwise
 *  presentational component. */
export function splitIntoColumns(ids: string[], columns: number): string[][] {
  const result: string[][] = Array.from({ length: columns }, () => [])
  ids.forEach((id, i) => {
    const column = result[i % columns]
    if (column) column.push(id)
  })
  return result
}

export default function HeroPerspectiveGallery({ publicIds }: Props) {
  const columns = splitIntoColumns(publicIds, COLUMN_COUNT)

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
        {columns.map((columnIds, colIndex) => (
          <Marquee
            // biome-ignore lint/suspicious/noArrayIndexKey: columns are a fixed-length, stable-order derived layout, not a reorderable list
            key={colIndex}
            vertical
            repeat={2}
            reverse={colIndex % 2 === 1}
            className="flex-1"
            style={{ '--duration': DURATIONS[colIndex % DURATIONS.length] } as React.CSSProperties}
          >
            {columnIds.map((id, tileIndex) => (
              <div
                key={id}
                className="w-full overflow-hidden rounded-xl"
                style={{ aspectRatio: ASPECT_RATIOS[tileIndex % ASPECT_RATIOS.length] }}
              >
                {/* biome-ignore lint/performance/noImgElement: marquee track of remote Cloudinary assets, next/image not suitable here */}
                <img
                  src={cldImageUrl(id, { width: 500 })}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </div>
  )
}
