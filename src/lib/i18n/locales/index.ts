import { en } from "./en"
import { fr } from "./fr"
import { ar } from "./ar"

export const locales = {
  en,
  fr,
  ar,
} as const

export type Locale = keyof typeof locales
export type Translations = typeof en

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
}

export const rtlLocales: Locale[] = ["ar"]

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}
