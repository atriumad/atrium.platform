import { redirect } from "next/navigation"
import { getSession } from "@/auth"
import SignOutButton from "@/lib/sign-out-button"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-lg">Atrium</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
