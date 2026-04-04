"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, HelpCircle, LogOut, ChevronDown, Moon, Sun, Globe } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { useI18n } from "@/hooks/use-i18n"

interface UserMenuProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const { t } = useI18n("dashboardmain")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<string>('en')
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({})

  const LANGUAGES: Record<string, string> = {
    en: 'English',
    es: 'Español',
    pt: 'Português',
    fr: 'Français',
    zh: '中文',
    ar: 'العربية',
    ph: 'Filipino',
  }

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    const prefersDark =
      saved === "dark" ||
      (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(prefersDark)

    // Load language
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)

    // Fetch language names
    const fetchLanguageNames = async () => {
      const names: Record<string, string> = {}
      
      for (const [code, _] of Object.entries(LANGUAGES)) {
        try {
          const response = await fetch(`/locales/${code}/common.json`)
          const data = await response.json()
          names[code] = data.language || LANGUAGES[code]
        } catch (error) {
          names[code] = LANGUAGES[code]
        }
      }
      
      setLanguageNames(names)
    }
    
    fetchLanguageNames()
  }, [])

  const handleLanguageChange = (newLanguage: string) => {
    localStorage.setItem('language', newLanguage)
    setLanguage(newLanguage)
    window.location.reload()
  }

  const toggleTheme = () => {
    if (!mounted) return
    const newDark = !isDark
    setIsDark(newDark)
    const root = document.documentElement
    if (newDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        // Clear client-side state
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("auth_data")
        sessionStorage.clear()
        
        // Redirect to home
        router.push("/")
        
        // Force page refresh to ensure clean state
        setTimeout(() => {
          window.location.href = "/"
        }, 100)
      } else {
        console.error("Logout failed")
        // Force redirect even if logout fails
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if logout fails
      window.location.href = "/"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-10 px-3 sm:px-4 bg-gradient-to-br from-secondary/5 to-secondary/0 hover:from-secondary/15 hover:to-secondary/5 hover:shadow-md shadow-sm transition-all duration-200 hover:scale-105 rounded-lg border border-secondary/10 hover:border-secondary/20 group"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <p className="text-xs font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 sm:w-56 mt-2 mx-2">
        {/* User Info */}
        <DropdownMenuLabel className="flex flex-col py-2">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>{t("settings")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={toggleTheme}>
            <div className="flex items-center gap-2 cursor-pointer">
              {isDark ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{isDark ? t("light_mode") : t("dark_mode")}</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2 h-9">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{languageNames[language] || LANGUAGES[language] || 'Language'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              {Object.entries(LANGUAGES).map(([code, _]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={language === code ? 'bg-accent' : ''}
                >
                  {languageNames[code] || LANGUAGES[code]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/support"
              className="flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span>{t("support")}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <span className="text-red-600 dark:text-red-400 font-medium">{t("sign_out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
