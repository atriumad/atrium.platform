export type Location = {
  readonly id: string
  readonly tenantId: string
  readonly name: string
  readonly address: string
  readonly googlePlaceId: string | null
  readonly createdAt: Date
}
