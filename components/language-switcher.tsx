'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<string>('en')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLanguage: string) => {
    localStorage.setItem('language', newLanguage)
    setLanguage(newLanguage)
    // Trigger page reload to update all translation hooks
    window.location.reload()
  }

  if (!mounted) {
    return null // Avoid hydration mismatch
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
