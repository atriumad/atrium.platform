'use client'
import dynamic from 'next/dynamic'
import type { SceneVariant } from './HeroScene'

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

export default function SceneWrapper({ variant }: { variant?: SceneVariant }) {
  return <HeroScene {...(variant !== undefined ? { variant } : {})} />
}
