import { requireOrg, requireSession } from "@/lib/session"

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export function actionError(e: unknown): ActionResult<never> {
  return {
    success: false,
    error: e instanceof Error ? e.message : "Something went wrong",
  }
}

export async function getActionUserId(): Promise<string> {
  const session = await requireSession()
  return session.id
}

export async function getActionOrgId(): Promise<string> {
  const session = await requireOrg()
  return session.activeOrganizationId
}
