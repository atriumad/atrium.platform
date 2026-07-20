'use client'

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cldImageUrl } from '@/lib/cloudinary'

// ─── Interactive draggable masonry gallery (images only) ────────────────────
// Ported from the Framer "Limitless Pro" component, stripped to the image path:
// an infinite, drag-to-pan masonry wall. No video, no zoom, no Framer deps.
// Fills 100% of the viewport up to a 1920px max width. Swap `images` for the
// real asset list when ready.
//
// Masonry columns have uneven content height by nature (aspect ratios vary),
// so a single shared wrap boundary for the whole grid either leaves short
// columns with a gap, or crops tall columns mid-tile. Each column instead
// wraps on its own period — independent of its neighbors — which is what
// keeps the gap uniform on all sides at every seam.

export type GalleryImage = { src: string; alt?: string; width?: number; height?: number }

type Props = {
  /** Full image objects (src is any URL). */
  images?: GalleryImage[] | undefined
  /** Cloudinary public IDs — resolved to optimized URLs internally (preferred). */
  publicIds?: string[] | undefined
  gap?: number
  radius?: number
  dragSensitivity?: number
  smoothness?: number
}

// Stock fillers — replace with the real photo list later.
const STOCK: GalleryImage[] = [
  { src: 'https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg', alt: 'Gallery image 1', width: 900, height: 1200 },
  { src: 'https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg', alt: 'Gallery image 2', width: 1200, height: 900 },
  { src: 'https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg', alt: 'Gallery image 3', width: 900, height: 1125 },
  { src: 'https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg', alt: 'Gallery image 4', width: 1200, height: 900 },
  { src: 'https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg', alt: 'Gallery image 5', width: 900, height: 1200 },
]

type LayoutItem = { x: number; y: number; width: number; height: number; originalIndex: number }
type ColumnBlock = { layout: LayoutItem[]; images: GalleryImage[]; height: number }

const REPS = [-1, 0, 1] as const
const TILE_CAP_PER_COLUMN = 40

function wrapValue(min: number, max: number, value: number): number {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

export default function DragGallery({
  images,
  publicIds,
  gap = 8,
  radius = 8,
  dragSensitivity = 2.5,
  smoothness = 0.085,
}: Props) {
  // Resolve the source list once: Cloudinary IDs win, then explicit images, then stock.
  const data = useMemo<GalleryImage[]>(() => {
    if (publicIds && publicIds.length > 0) {
      return publicIds.map((id, i) => ({
        src: cldImageUrl(id, { width: 800 }),
        alt: `Gallery image ${i + 1}`,
      }))
    }
    return images && images.length > 0 ? images : STOCK
  }, [publicIds, images])
  const containerRef = useRef<HTMLDivElement>(null)
  const groupElsRef = useRef<Map<string, HTMLDivElement>>(new Map())

  const positionRef = useRef({ x: 0, y: 0 })
  const targetPositionRef = useRef({ x: 0, y: 0 })
  const totalWidthRef = useRef(0)
  const columnHeightsRef = useRef<number[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  const isDraggingRef = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const positionStart = useRef({ x: 0, y: 0 })

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [imageDims, setImageDims] = useState<Map<number, { width: number; height: number }>>(new Map())
  const [columnBlocks, setColumnBlocks] = useState<ColumnBlock[]>([])
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  // ─── Measure container ────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      setContainerSize({ width, height })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ─── Preload for natural aspect ratios ────────────────────────────────────
  useEffect(() => {
    data.forEach((image, index) => {
      if (!image.src) return
      const img = new Image()
      img.onload = () => {
        startTransition(() => {
          setImageDims((prev) => {
            const next = new Map(prev)
            next.set(index, { width: img.naturalWidth, height: img.naturalHeight })
            return next
          })
        })
      }
      img.src = image.src
    })
  }, [data])

  // Responsive tile width — bigger viewports, more columns.
  const columnWidth = useMemo(() => {
    const vw = containerSize.width
    if (vw === 0) return 240
    if (vw < 480) return Math.max(120, Math.round(vw / 2.2))
    if (vw < 768) return Math.max(160, Math.round(vw / 3))
    if (vw < 1024) return Math.max(200, Math.round(vw / 4))
    return Math.max(240, Math.round(vw / 5))
  }, [containerSize.width])

  const columns = useMemo(() => {
    const base = Math.max(2, Math.ceil(Math.sqrt(data.length)))
    if (containerSize.width === 0) return base
    const needed = Math.ceil(containerSize.width / (columnWidth + gap)) + 2
    return Math.max(base, needed)
  }, [data.length, containerSize.width, columnWidth, gap])

  // ─── Per-column masonry layout ────────────────────────────────────────────
  // Each column fills independently until it clears the target height, then
  // wraps on its own total height. No shared boundary means no column is
  // ever short (gap) or cropped (overlap) relative to the others.
  useEffect(() => {
    if (data.length === 0 || columnWidth === 0 || containerSize.height === 0) return

    const targetHeight = containerSize.height

    const blocks: ColumnBlock[] = Array.from({ length: columns }, (_unused, col) => {
      const layout: LayoutItem[] = []
      const colImages: GalleryImage[] = []
      const stagger = Math.floor((col * data.length) / columns)
      let y = 0
      let i = 0
      while (y < targetHeight && i < TILE_CAP_PER_COLUMN) {
        const idx = (i + stagger) % data.length
        const img = data[idx]
        i++
        if (!img) continue

        const dims = imageDims.get(idx)
        const aspect = dims ? dims.height / dims.width : 0.75
        const height = Math.round(columnWidth * aspect)

        colImages.push(img)
        layout.push({ x: col * (columnWidth + gap), y, width: columnWidth, height, originalIndex: idx })
        y += height + gap
      }
      return { layout, images: colImages, height: y }
    })

    setColumnBlocks(blocks)
    columnHeightsRef.current = blocks.map((b) => b.height)

    totalWidthRef.current = columns * columnWidth + (columns - 1) * gap + gap
  }, [data, columns, columnWidth, gap, containerSize.height, imageDims])

  // ─── Smooth animation loop — shared x wrap, independent per-column y wrap ──
  useEffect(() => {
    const animate = () => {
      const current = positionRef.current
      const target = targetPositionRef.current
      const dx = target.x - current.x
      const dy = target.y - current.y

      if (Math.abs(dx) >= 0.01 || Math.abs(dy) >= 0.01) {
        const next = { x: current.x + dx * smoothness, y: current.y + dy * smoothness }
        positionRef.current = next

        const tw = totalWidthRef.current
        if (tw > 0) {
          const wrappedX = wrapValue(-tw, tw, next.x)
          groupElsRef.current.forEach((el, key) => {
            const [xOffsetStr, colStr, yRepStr] = key.split('_')
            const xOffset = Number(xOffsetStr)
            const col = Number(colStr)
            const yRep = Number(yRepStr)
            const colHeight = columnHeightsRef.current[col] ?? 0
            if (colHeight <= 0) return
            const wrappedY = wrapValue(-colHeight, colHeight, next.y)
            const tx = wrappedX + xOffset * tw
            const ty = wrappedY + yRep * colHeight
            el.style.transform = `translate(${tx}px, ${ty}px)`
          })
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [smoothness])

  // ─── Mouse drag ───────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
    dragStart.current = { x: e.clientX, y: e.clientY }
    positionStart.current = { ...targetPositionRef.current }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      targetPositionRef.current = {
        x: positionStart.current.x + (e.clientX - dragStart.current.x) * dragSensitivity,
        y: positionStart.current.y + (e.clientY - dragStart.current.y) * dragSensitivity,
      }
    }
    const onUp = () => {
      isDraggingRef.current = false
      if (containerRef.current) containerRef.current.style.cursor = 'grab'
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragSensitivity])

  // ─── Touch drag ───────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    isDraggingRef.current = true
    dragStart.current = { x: t.clientX, y: t.clientY }
    positionStart.current = { ...targetPositionRef.current }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return
      const t = e.touches[0]
      if (!t) return
      e.preventDefault()
      targetPositionRef.current = {
        x: positionStart.current.x + (t.clientX - dragStart.current.x) * dragSensitivity,
        y: positionStart.current.y + (t.clientY - dragStart.current.y) * dragSensitivity,
      }
    }
    const onEnd = () => {
      isDraggingRef.current = false
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    return () => {
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [dragSensitivity])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pan surface; drag is pointer-only by design
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1920px',
        height: '100dvh',
        margin: '0 auto',
        overflow: 'hidden',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
        background: '#fff',
      }}
    >
      {REPS.map((xOffset) =>
        columnBlocks.map((block, col) =>
          REPS.map((yRep) => {
            const groupKey = `${xOffset}_${col}_${yRep}`
            return (
              <div
                key={groupKey}
                ref={(el) => {
                  if (el) groupElsRef.current.set(groupKey, el)
                  else groupElsRef.current.delete(groupKey)
                }}
                style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}
              >
                {block.layout.map((item, i) => {
                  const image = block.images[i]
                  if (!image) return null
                  const tileKey = `${groupKey}-${i}`
                  const isHovered = hoveredKey === tileKey
                  return (
                    // biome-ignore lint/a11y/noStaticElementInteractions: decorative hover-zoom only
                    <div
                      key={tileKey}
                      style={{
                        position: 'absolute',
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                        borderRadius: `${radius}px`,
                        overflow: 'hidden',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={() => setHoveredKey(tileKey)}
                      onMouseLeave={() => setHoveredKey((k) => (k === tileKey ? null : k))}
                    >
                      {/* biome-ignore lint/performance/noImgElement: infinite wall of remote assets, next/image not suitable here */}
                      <img
                        src={image.src}
                        alt={image.alt ?? `Gallery image ${item.originalIndex + 1}`}
                        draggable={false}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          pointerEvents: 'none',
                          transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )
          }),
        ),
      )}
    </div>
  )
}
