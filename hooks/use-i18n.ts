'use client'

import { useCallback } from 'react'
import { i18n } from 'next-i18next'

// Simple client-side translation hook for App Router
export function useI18n(namespace: string = 'common') {
  const currentLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en'
  
  const t = useCallback((key: string, defaultValue?: string) => {
    try {
      // Try to get from i18next resources
      if (i18n?.language) {
        const ns = (i18n?.getResourceBundle(i18n.language, namespace) || {}) as Record<string, any>
        if (ns[key]) return ns[key]
      }
      
      // Fallback: return key or default value
      return defaultValue || key
    } catch (error) {
      console.warn(`[i18n] Translation missing for ${namespace}.${key}`)
      return defaultValue || key
    }
  }, [namespace])

  return { t, language: i18n?.language || currentLanguage }
}
