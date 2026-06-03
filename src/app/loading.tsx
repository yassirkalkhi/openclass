import { Loader2 } from "lucide-react"
import { cookies } from "next/headers"
import { getLocaleFromCookieHeader } from "@/lib/i18n/cookies"
import { locales } from "@/lib/i18n/locales"

export default async function Loading() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookieHeader(cookieStore.toString())
  const t = locales[locale]

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
        {t.common.loading}
      </p>
    </div>
  )
}
