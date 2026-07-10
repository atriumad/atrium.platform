export function toGooglePlaceId(id: string): string {
  return `google:${id.replace(/^places\//, "")}`
}

export function parseGooglePlaceId(placeId: string): string | null {
  const [, rawId] = placeId.trim().match(/^google:(.+)$/) ?? []
  const id = rawId?.trim()
  return id && id.length > 0 ? id : null
}
