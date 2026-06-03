"use server"

import { AuthService } from "@/lib/services/auth-service"
import { loginSchema, registerSchema } from "@/lib/validations/auth"
import { setAdminOrgOverride } from "@/lib/session"
import { redirect } from "next/navigation"
import { finalizeLogin } from "@/lib/auth/finalize-login"
import { setAuthCookie } from "@/lib/cookies"
import type { ActionResult } from "@/lib/actions/utils"

const authService = new AuthService()

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  )
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const { profile } = await authService.login(parsed.data.email, parsed.data.password)
    const { redirectPath, token } = await finalizeLogin(profile.id)
    await setAuthCookie(token)
    redirect(redirectPath)
  } catch (e) {
    if (isNextRedirectError(e)) throw e
    return { success: false, error: e instanceof Error ? e.message : "Login failed" }
  }
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    await authService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.fullName
    )
    redirect("/organizations")
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Registration failed" }
  }
}

export async function logoutAction(): Promise<void> {
  await authService.logout()
  redirect("/login")
}

export async function switchOrganizationAction(orgId: string): Promise<ActionResult> {
  const { requireSession } = await import("@/lib/session")
  const session = await requireSession()
  try {
    await authService.switchOrganization(session.id, orgId)
    if (session.platformRole === "admin") {
      await setAdminOrgOverride(orgId)
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to switch organization" }
  }
}

export async function updateProfileAction(
  data: { fullName?: string; bio?: string; status?: string }
): Promise<ActionResult> {
  const { requireSession } = await import("@/lib/session")
  const session = await requireSession()
  try {
    await authService.updateProfile(session.id, data)
    await authService.refreshToken(session.id, session.activeOrganizationId)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Update failed" }
  }
}
