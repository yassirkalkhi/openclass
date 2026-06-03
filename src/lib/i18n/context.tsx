"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { type Locale, type Translations, locales, defaultLocale, isRTL } from "./locales"
import { getLocaleFromCookie, setLocaleCookie } from "./cookies"

interface I18nContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Initialize from cookie or use initial/default locale
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return getLocaleFromCookie()
    }
    return initialLocale || defaultLocale
  })

  const [translations, setTranslations] = useState<Translations>(locales[locale])
  const [rtl, setRtl] = useState<boolean>(isRTL(locale))

  // Update translations and RTL when locale changes
  useEffect(() => {
    setTranslations(locales[locale])
    setRtl(isRTL(locale))
  }, [locale])

  // Apply RTL/LTR to document
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = rtl ? "rtl" : "ltr"
      document.documentElement.lang = locale
    }
  }, [locale, rtl])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocaleCookie(newLocale)
  }, [])

  const value: I18nContextType = {
    locale,
    t: translations,
    setLocale,
    isRTL: rtl,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

/**
 * Hook to get a specific translation namespace
 */
export function useTranslation<K extends keyof Translations>(namespace: K) {
  const { t, locale, setLocale, isRTL } = useI18n()
  return {
    t: t[namespace],
    locale,
    setLocale,
    isRTL,
  }
}
