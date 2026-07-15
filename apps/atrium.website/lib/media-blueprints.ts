export type BlueprintKind = 'cinematic' | 'collage' | 'device' | 'dashboard' | 'process'
export type BlueprintAssetType = 'photo' | 'video' | 'reel' | 'dashboard' | 'illustration'
export type BlueprintRatio = '16:9' | '4:3' | '3:4' | '1:1' | '9:16' | 'wide'

type BlueprintBase = {
  kind: BlueprintKind
  assetType: BlueprintAssetType
  code: string
  title: string
  direction: string
  ratio: BlueprintRatio
  className?: string
}

export type PlannedMediaBlueprint = BlueprintBase & {
  src?: never
  alt?: never
  poster?: never
}

export type RealMediaBlueprint = BlueprintBase & {
  src: string
  alt: string
  poster?: string
}

export type MediaBlueprint = PlannedMediaBlueprint | RealMediaBlueprint

export function isRealMedia(item: MediaBlueprint): item is RealMediaBlueprint {
  return typeof item.src === 'string' && item.src.length > 0
}

export function blueprintLabel(item: MediaBlueprint) {
  return `${item.code} · ${item.ratio}`
}
