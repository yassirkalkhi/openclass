"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, LogOut, Building2, Settings, Mail } from "lucide-react"
import { OpenClassLogo } from "@/components/ui/openclass-logo"
import { HeaderAlertsMenu } from "@/components/workspace/header-alerts-menu"
import { useAuth } from "@/context/auth-context"
import { useOrganization } from "@/context/organization-context"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { SearchDialog } from "@/components/workspace/search-dialog"
import { useI18n } from "@/lib/i18n/context"

export function GlobalHeader() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const router = useRouter()
  const { t } = useI18n()
  const [searchOpen, setSearchOpen] = useState(false)

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?"

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
      <OpenClassLogo />
      <span className="text-muted-foreground text-sm">/</span>
      <Link
        href="/organizations"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Building2 className="size-3.5" />
        {organization?.name ?? t.nav.organizations}
      </Link>

      <Button
        variant="outline"
        className="relative mx-auto h-8 max-w-md flex-1 justify-start text-sm text-muted-foreground"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="mr-2 size-4" />
        {t.nav.searchPlaceholder}
      </Button>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <HeaderAlertsMenu />
      <LanguageSwitcher />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <Avatar className="size-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border shadow-xl rounded-sm">
          <DropdownMenuLabel>
            <div className="font-medium">{user?.fullName}</div>
            <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/organizations")}>
            <Building2 className="size-4" />
            {t.nav.organizations}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/app/invitations")}>
            <Mail className="size-4" />
            {t.nav.invitations}
          </DropdownMenuItem>
          {organization && (
            <DropdownMenuItem
              onClick={() => router.push(`/organizations/${organization.slug}/settings`)}
            >
              <Settings className="size-4" />
              {t.nav.settings}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={async () => { await logoutAction() }}>
            <LogOut className="size-4" />
            {t.nav.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
