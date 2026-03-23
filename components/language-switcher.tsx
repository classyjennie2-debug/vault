'use client'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
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
  const router = useRouter()
  const { i18n } = useTranslation()

  const handleLanguageChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale })
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
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
