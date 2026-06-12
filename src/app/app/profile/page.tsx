import { requireSession } from "@/lib/session"
import { ProfileSettingsClient } from "@/components/profile/profile-settings-client"
import { redirect } from "next/navigation"
import { AuthService } from "@/lib/services/auth-service"

export const dynamic = "force-dynamic"

const authService = new AuthService()

export default async function ProfilePage() {
  let session
  try {
    session = await requireSession()
  } catch {
    redirect("/login")
  }

  const profile = await authService.getProfile(session.id)
  if (!profile) redirect("/login")

  return (
    <ProfileSettingsClient
      initialProfile={{
        fullName: profile.fullName ?? "",
        email: profile.email,
        bio: profile.bio ?? "",
        status: profile.status ?? "",
        avatarUrl: profile.avatarUrl,
        hasPassword: !!profile.passwordHash,
      }}
    />
  )
}
