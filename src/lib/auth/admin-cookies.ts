import { cookies } from "next/headers"

const ADMIN_ORG_OVERRIDE_COOKIE = "admin_org_override"

export async function setAdminOrgOverride(orgId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_ORG_OVERRIDE_COOKIE, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function clearAdminOrgOverride(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_ORG_OVERRIDE_COOKIE)
}

export async function getAdminOrgOverride(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_ORG_OVERRIDE_COOKIE)?.value
}
