"use client"

import { useI18n } from "@/lib/i18n/context"
import { type Locale, localeNames } from "@/lib/i18n/locales"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    // Reload page to apply RTL/LTR changes properly
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(localeNames) as Locale[]).map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {localeNames[loc]}
            {locale === loc && <span className="ml-2">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
