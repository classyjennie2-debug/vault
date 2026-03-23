'use client'

import { useCallback, useEffect, useState } from 'react'

type Dictionary = Record<string, string>

/**
 * Lightweight client-side translation hook that reads JSON files from /public/locales.
 * It keeps the "namespace" structure already used in the repo.
 */
export function useI18n(namespace: string = 'common') {
  const [language, setLanguage] = useState<'en' | 'es' | 'pt' | 'fr' | 'zh' | 'ar'>('en')
  const [dict, setDict] = useState<Dictionary>({})

  // Load language preference
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('language')) as typeof language | null
    setLanguage(saved || 'en')
  }, [])

  // Load translations for namespace/language
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/locales/${language}/${namespace}.json`)
        if (!res.ok) throw new Error(`Failed to load ${language}/${namespace}`)
        const json = (await res.json()) as Dictionary
        if (!cancelled) setDict(json)
      } catch (error) {
        console.warn(`[i18n] ${error}. Falling back to English for ${namespace}.`)
        try {
          const res = await fetch(`/locales/en/${namespace}.json`)
          if (res.ok) {
            const json = (await res.json()) as Dictionary
            if (!cancelled) setDict(json)
          }
        } catch (_) {
          if (!cancelled) setDict({})
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [language, namespace])

  const t = useCallback(
    (key: string, defaultValue?: string) => {
      if (dict && dict[key]) return dict[key]
      return defaultValue || key
    },
    [dict]
  )

  return { t, language }
}
