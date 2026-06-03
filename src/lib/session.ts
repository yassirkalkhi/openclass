"use server"

import { getAuthCookie } from "./cookies"
import { verifyToken, type OrgRole } from "./jwt"
import { getAdminOrgOverride, setAdminOrgOverride, clearAdminOrgOverride } from "./auth/admin-cookies"

export { setAdminOrgOverride, clearAdminOrgOverride }

export type SessionUser = {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  platformRole?: "admin"
  activeOrganizationId?: string
  orgRole?: OrgRole
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const token = await getAuthCookie()
    if (!token) return null

    const payload = await verifyToken(token)
    return {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl,
      platformRole: payload.platformRole,
      activeOrganizationId: payload.activeOrganizationId,
      orgRole: payload.orgRole,
    }
  } catch (error) {
    console.error("[getSession] Failed to verify token:", error)
    return null
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireOrg(): Promise<SessionUser & { activeOrganizationId: string }> {
  const session = await requireSession()
  const orgId = await getEffectiveOrgId(session)
  if (!orgId) {
    throw new Error("No active organization")
  }
  return { ...session, activeOrganizationId: orgId }
}

export async function getEffectiveOrgId(session: SessionUser): Promise<string | null> {
  if (session.platformRole === "admin") {
    const override = await getAdminOrgOverride()
    return override ?? session.activeOrganizationId ?? null
  }
  return session.activeOrganizationId ?? null
}
