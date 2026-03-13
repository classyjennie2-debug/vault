import { requireAuth } from "@/lib/auth"
import { AdminLayoutClient } from "./admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have permission to access the admin panel.</p>
          <a href="/" className="text-accent hover:underline">
            Return to home
          </a>
        </div>
      </div>
    )
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {adminUser.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {adminUser.name}
                </p>
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-sidebar-primary" />
              </div>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {adminUser.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            asChild
          >
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Lock className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Vault</span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Link>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
