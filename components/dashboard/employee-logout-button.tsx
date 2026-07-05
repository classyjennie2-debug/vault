"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function EmployeeLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    if (typeof document !== "undefined") {
      document.cookie = "vault_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      localStorage.removeItem("employee-access")
    }

    router.push("/employee-access")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  )
}
