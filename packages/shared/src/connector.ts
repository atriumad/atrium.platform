import type { DateRange } from "./date-range"

export type ConnectorStatus = {
  connected: boolean
  lastSyncAt: Date | null
  error: string | null
}

export type SyncResult = {
  processed: number
  inserted: number
  updated: number
  errors: number
}

export type ConnectorCredentials = Record<string, string>

export interface Connector {
  verify(credentials: ConnectorCredentials): Promise<ConnectorStatus>
  sync(locationId: string, range: DateRange): Promise<SyncResult>
  handleWebhook(payload: unknown, signature: string): Promise<void>
}
