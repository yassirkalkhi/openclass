import { type Locale, defaultLocale } from "./locales"

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE"

/**
 * Get locale from cookie (client-side)
 */
export function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") {
    return defaultLocale
  }

  const cookies = document.cookie.split("; ")
  const localeCookie = cookies.find((c) => c.startsWith(`${LOCALE_COOKIE_NAME}=`))

  if (localeCookie) {
    const locale = localeCookie.split("=")[1] as Locale
    if (locale === "en" || locale === "fr" || locale === "ar") {
      return locale
    }
  }

  return defaultLocale
}

/**
 * Set locale cookie (client-side)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") {
    return
  }

  // Set cookie for 1 year
  const maxAge = 365 * 24 * 60 * 60
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Get locale from cookie header (server-side)
 */
export function getLocaleFromCookieHeader(cookieHeader: string | null): Locale {
  if (!cookieHeader) {
    return defaultLocale
  }

  const cookies = cookieHeader.split("; ")
  const localeCookie = cookies.find((c) => c.startsWith(`${LOCALE_COOKIE_NAME}=`))

  if (localeCookie) {
    const locale = localeCookie.split("=")[1] as Locale
    if (locale === "en" || locale === "fr" || locale === "ar") {
      return locale
    }
  }

  return defaultLocale
}
