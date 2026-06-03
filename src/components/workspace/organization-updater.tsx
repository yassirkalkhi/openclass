"use client"

import { useEffect } from "react"
import { useOrganization } from "@/context/organization-context"
import type { Organization } from "@/lib/types/database"

export function OrganizationUpdater({ organization }: { organization: Organization }) {
  const { setOrganization } = useOrganization()
  
  useEffect(() => {
    setOrganization(organization)
  }, [organization, setOrganization])

  return null
}
