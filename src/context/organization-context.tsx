"use client"

import { createContext, useContext, useCallback, useState, useEffect } from "react"
import type { Organization } from "@/lib/types/database"
import type { OrgRole } from "@/lib/jwt"
import { switchOrganizationAction } from "@/app/actions/auth"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

type OrganizationContextValue = {
  organization: Organization | null
  orgRole: OrgRole | undefined
  switchOrganization: (orgId: string) => Promise<void>
  setOrganization: (org: Organization | null) => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export function OrganizationProvider({
  organization: initialOrganization = null,
  children,
}: {
  organization?: Organization | null
  children: React.ReactNode
}) {
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization)
  const { user, refresh } = useAuth()
  const router = useRouter()

  // Update organization when initial prop changes
  useEffect(() => {
    setOrganization(initialOrganization)
  }, [initialOrganization])

  const switchOrganization = useCallback(
    async (orgId: string) => {
      const result = await switchOrganizationAction(orgId)
      if (result.success) {
        await refresh()
        router.push("/app")
        router.refresh()
      }
    },
    [refresh, router]
  )

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        orgRole: user?.orgRole,
        switchOrganization,
        setOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider")
  return ctx
}
