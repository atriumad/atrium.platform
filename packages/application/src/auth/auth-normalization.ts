export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function createTenantSlug(email: string, suffix: number | string): string {
  const emailLocalPart = email.split("@")[0] ?? "restaurant"
  const slugBase = emailLocalPart.toLowerCase().replace(/[^a-z0-9]/g, "-") || "restaurant"
  return `${slugBase}-${suffix}`
}
