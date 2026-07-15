export type BlueprintKind = 'cinematic' | 'collage' | 'device' | 'dashboard' | 'process'
export type BlueprintAssetType = 'photo' | 'video' | 'reel' | 'dashboard' | 'illustration'
export type BlueprintRatio = '16:9' | '4:3' | '3:4' | '1:1' | '9:16' | 'wide'

type BlueprintBase = {
  kind: BlueprintKind
  code: string
  title: string
  direction: string
  ratio: BlueprintRatio
  className?: string
}

type BlueprintVideoAssetType = Extract<BlueprintAssetType, 'video' | 'reel'>
type BlueprintStaticAssetType = Exclude<BlueprintAssetType, BlueprintVideoAssetType>

export type PlannedMediaBlueprint = BlueprintBase & {
  assetType: BlueprintAssetType
  src?: never
  alt?: never
  poster?: never
  audio?: never
  captionsSrc?: never
  captionsLanguage?: never
  captionsLabel?: never
}

export type RealStaticMediaBlueprint = BlueprintBase & {
  assetType: BlueprintStaticAssetType
  src: string
  alt: string
  poster?: string
  audio?: never
  captionsSrc?: never
  captionsLanguage?: never
  captionsLabel?: never
}

export type RealSilentVideoBlueprint = BlueprintBase & {
  assetType: BlueprintVideoAssetType
  src: string
  alt: string
  poster?: string
  audio: 'silent'
  captionsSrc?: never
  captionsLanguage?: never
  captionsLabel?: never
}

export type RealSpeechVideoBlueprint = BlueprintBase & {
  assetType: BlueprintVideoAssetType
  src: string
  alt: string
  poster?: string
  audio: 'speech'
  captionsSrc: string
  captionsLanguage?: string
  captionsLabel?: string
}

export type RealMediaBlueprint =
  | RealStaticMediaBlueprint
  | RealSilentVideoBlueprint
  | RealSpeechVideoBlueprint

export type MediaBlueprint = PlannedMediaBlueprint | RealMediaBlueprint

export function isRealMedia(item: MediaBlueprint): item is RealMediaBlueprint {
  const hasRequiredMedia =
    typeof item.src === 'string' &&
    item.src.trim().length > 0 &&
    typeof item.alt === 'string' &&
    item.alt.trim().length > 0

  if (!hasRequiredMedia) return false

  if (item.assetType === 'video' || item.assetType === 'reel') {
    return (
      item.audio === 'silent' ||
      (item.audio === 'speech' &&
        typeof item.captionsSrc === 'string' &&
        item.captionsSrc.trim().length > 0)
    )
  }

  return true
}

export function blueprintLabel(item: MediaBlueprint) {
  return `${item.code} · ${item.ratio}`
}
