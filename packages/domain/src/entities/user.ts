export type UserRole = "atrium_admin" | "owner" | "manager" | "viewer"

export type User = {
  readonly id: string
  readonly tenantId: string | null   // null for atrium_admin (cross-tenant)
  readonly email: string
  readonly role: UserRole
}

export function canAccessTenant(user: User, tenantId: string): boolean {
  if (user.role === "atrium_admin") return true
  return user.tenantId === tenantId
}
