"use client"

import { useEffect, useState } from "react"

type EmployeeSidebarProps = {
  links: Array<{ href: string; label: string }>
}

export function EmployeeSidebar({ links }: EmployeeSidebarProps) {
  const [activeHash, setActiveHash] = useState("#overview")

  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash || "#overview")
    }

    updateHash()
    window.addEventListener("hashchange", updateHash)
    return () => window.removeEventListener("hashchange", updateHash)
  }, [])

  return (
    <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Navigation</p>
      <div className="mt-6 space-y-3">
        {links.map((link) => {
          const isActive = activeHash === link.href
          return (
            <a
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border border-primary bg-primary/10 text-primary"
                  : "border border-border/70 bg-background/80 text-foreground hover:bg-primary/10"
              }`}
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
