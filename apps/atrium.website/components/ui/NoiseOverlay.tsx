'use client'

import { useEffect, useRef } from 'react'

const SIZE = 512
const FRAME_COUNT = 4
const FPS = 15

export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = SIZE
    canvas.height = SIZE

    // Pre-bake frames — no per-frame computation
    const frames: ImageData[] = Array.from({ length: FRAME_COUNT }, () => {
      const frame = ctx.createImageData(SIZE, SIZE)
      const d = frame.data
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0
        d[i] = v
        d[i + 1] = v
        d[i + 2] = v
        d[i + 3] = 255
      }
      return frame
    })

    let idx = 0
    let last = 0
    let animId: number
    const step = 1000 / FPS

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick)
      if (now - last < step) return
      last = now
      const frame = frames[idx % FRAME_COUNT]
      idx += 1
      if (frame) ctx.putImageData(frame, 0, 0)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
      style={{
        opacity: 0.04,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
