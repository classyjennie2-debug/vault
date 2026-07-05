'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface LanguageSelectProps {
  variant?: 'dropdown' | 'select'
  showLabel?: boolean
}

const LANGUAGES: Record<string, { code: string; nativeName: string }> = {
  en: { code: 'en', nativeName: 'English' },
  es: { code: 'es', nativeName: 'Español' },
  pt: { code: 'pt', nativeName: 'Português' },
  fr: { code: 'fr', nativeName: 'Français' },
  zh: { code: 'zh', nativeName: '中文' },
  ar: { code: 'ar', nativeName: 'العربية' },
  ph: { code: 'ph', nativeName: 'Filipino' },
}

export function LanguageSelect({ variant = 'dropdown', showLabel = false }: LanguageSelectProps) {
  const [language, setLanguage] = useState<string>('en')
  const [mounted, setMounted] = useState(false)
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({})

  // Load language from localStorage and fetch all language names
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
          names[code] = data.language || LANGUAGES[code].nativeName
        } catch (error) {
          names[code] = LANGUAGES[code].nativeName
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
    return variant === 'dropdown' ? (
      <Button variant="ghost" size="sm" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    ) : (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (variant === 'select') {
    return (
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LANGUAGES).map(([code, _]) => (
            <SelectItem key={code} value={code}>
              {languageNames[code] || LANGUAGES[code].nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Dropdown variant for menu integration
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>{languageNames[language] || LANGUAGES[language]?.nativeName || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(LANGUAGES).map(([code, _]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={language === code ? 'bg-accent' : ''}
          >
            {languageNames[code] || LANGUAGES[code].nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
