import { Loader2 } from "lucide-react"
import { cookies } from "next/headers"
import { getLocaleFromCookieHeader } from "@/lib/i18n/cookies"
import { locales } from "@/lib/i18n/locales"

export default async function AssignmentsLoading() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookieHeader(cookieStore.toString())
  const t = locales[locale]

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.assignments.title}…</p>
      </div>
    </div>
  )
}
