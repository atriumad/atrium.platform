export type CustomerIdentifier =
  | { readonly type: "email"; readonly value: string }
  | { readonly type: "phone"; readonly value: string }   // E.164: +1XXXXXXXXXX
  | { readonly type: "external_ref"; readonly provider: string; readonly value: string }

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

export function sameIdentifier(a: CustomerIdentifier, b: CustomerIdentifier): boolean {
  if (a.type !== b.type) return false
  if (a.type === "external_ref" && b.type === "external_ref") {
    return a.provider === b.provider && a.value === b.value
  }
  return a.value === b.value
}
