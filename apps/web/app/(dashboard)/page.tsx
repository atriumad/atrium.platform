import { getSession } from "@/auth"

export default async function DashboardPage() {
  const session = await getSession()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1">
        Welcome, <span className="font-medium">{session?.email}</span>
      </p>
      <p className="text-sm text-gray-400 mt-1">Tenant: {session?.tenantId ?? "—"}</p>
    </div>
  )
}
