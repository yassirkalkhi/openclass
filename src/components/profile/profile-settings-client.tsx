"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Camera } from "lucide-react"
import { updateProfileAction, changePasswordAction } from "@/app/actions/auth"
import { useAuth } from "@/context/auth-context"
import { useI18n } from "@/lib/i18n/context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ProfileSettingsClientProps {
  initialProfile: {
    fullName: string
    email: string
    bio: string
    status: string
    avatarUrl?: string
    hasPassword: boolean
  }
}

export function ProfileSettingsClient({ initialProfile }: ProfileSettingsClientProps) {
  const { t } = useI18n()
  const { refresh: refreshAuth } = useAuth()
  const router = useRouter()

  // ── Personal info state ──────────────────────────────────────────────────
  const [fullName, setFullName] = useState(initialProfile.fullName)
  const [bio, setBio] = useState(initialProfile.bio)
  const [status, setStatus] = useState(initialProfile.status)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? "")
  const [profilePending, setProfilePending] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // ── Avatar upload state ──────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // ── Password state ───────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    setProfileError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json() as { url: string }
      setAvatarUrl(data.url)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfilePending(true)
    setProfileError(null)
    setProfileSuccess(false)

    const result = await updateProfileAction({
      fullName: fullName.trim(),
      bio: bio.trim(),
      status: status.trim(),
      avatarUrl: avatarUrl || undefined,
    })

    setProfilePending(false)
    if (result.success) {
      setProfileSuccess(true)
      await refreshAuth()
      router.refresh()
      setTimeout(() => setProfileSuccess(false), 3000)
    } else {
      setProfileError(result.error)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError(t.profile.passwordMismatch)
      return
    }
    if (newPassword.length < 8) {
      setPasswordError(t.profile.passwordTooShort)
      return
    }

    setPasswordPending(true)
    const result = await changePasswordAction({ currentPassword, newPassword })
    setPasswordPending(false)

    if (result.success) {
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } else {
      setPasswordError(result.error)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.profile.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.profile.subtitle}</p>
        </div>

        <Separator />

        {/* Personal info card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">{t.profile.personalInfo}</CardTitle>
            </div>
            <CardDescription>{t.profile.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="size-20">
                    <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
                    aria-label={t.profile.avatarChange}
                  >
                    <Camera className="size-3.5 text-muted-foreground" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    aria-label={t.profile.avatarChange}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.profile.avatar}</p>
                  <p className="text-xs text-muted-foreground">
                    {avatarUploading ? t.common.uploading : t.profile.avatarChange}
                  </p>
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.profile.fullName}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.profile.fullNamePlaceholder}
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">{t.profile.email}</Label>
                <Input
                  id="email"
                  value={initialProfile.email}
                  readOnly
                  disabled
                  autoComplete="email"
                />
                <p className="text-xs text-muted-foreground">{t.profile.emailNote}</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">{t.profile.bio}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t.profile.bioPlaceholder}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">{t.profile.status}</Label>
                <Input
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder={t.profile.statusPlaceholder}
                  maxLength={100}
                />
              </div>

              {profileError && (
                <p className="text-sm text-destructive" role="alert">
                  {profileError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={profilePending || avatarUploading}>
                  {profilePending ? t.profile.savingProfile : t.profile.saveProfile}
                </Button>
                {profileSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t.profile.profileSaved}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change password card — only for password accounts */}
        {initialProfile.hasPassword && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">{t.profile.security}</CardTitle>
              </div>
              <CardDescription>{t.profile.changePassword}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.profile.currentPassword}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.profile.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.profile.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-destructive" role="alert">
                    {passwordError}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={passwordPending}>
                    {passwordPending ? t.profile.passwordChanging : t.profile.changePasswordBtn}
                  </Button>
                  {passwordSuccess && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {t.profile.passwordChanged}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
