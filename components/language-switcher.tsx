'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<string>('en')
  const [mounted, setMounted] = useState(false)
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

  // Load language from localStorage and fetch language names on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
    
    // Fetch all language names from their respective common.json files
    const fetchLanguageNames = async () => {
      const names: Record<string, string> = {}
      
      for (const [code, _] of Object.entries(LANGUAGES)) {
        try {
          const response = await fetch(`/locales/${code}/common.json`)
          const data = await response.json()
          names[code] = data.language || LANGUAGES[code]
        } catch (error) {
          console.warn(`[LanguageSwitcher] Failed to fetch language name for ${code}:`, error)
          names[code] = LANGUAGES[code]
        }
      }
      
      setLanguageNames(names)
    }
    
    fetchLanguageNames()
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLanguage: string) => {
    localStorage.setItem('language', newLanguage)
    setLanguage(newLanguage)
    // Trigger page reload to update all translation hooks
    window.location.reload()
  }

  if (!mounted || Object.keys(languageNames).length === 0) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Change Language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
  )
}
