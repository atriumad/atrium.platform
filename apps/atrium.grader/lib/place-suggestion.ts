export type PlaceSuggestion = {
  readonly placeId: string
  readonly name: string
  readonly address: string
  readonly description: string
  readonly source: "google"
  readonly photoUrl?: string | null
  readonly photoAttribution?: string | null
}
