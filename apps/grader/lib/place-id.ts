export type OsmType = "node" | "way" | "relation"
export type OsmPrefix = "N" | "W" | "R"

export function toPlaceId(type: OsmType, id: number): string {
  return `osm:${type}:${id}`
}

export function parsePlaceId(placeId: string): { readonly prefix: OsmPrefix; readonly id: number } | null {
  const [, type, rawId] = placeId.trim().match(/^osm:(node|way|relation):(\d+)$/) ?? []
  const id = Number(rawId)

  if (!type || !Number.isSafeInteger(id)) return null

  return {
    prefix: type === "node" ? "N" : type === "way" ? "W" : "R",
    id,
  }
}

export function toGooglePlaceId(id: string): string {
  return `google:${id.replace(/^places\//, "")}`
}

export function parseGooglePlaceId(placeId: string): string | null {
  const [, rawId] = placeId.trim().match(/^google:(.+)$/) ?? []
  const id = rawId?.trim()
  return id && id.length > 0 ? id : null
}
