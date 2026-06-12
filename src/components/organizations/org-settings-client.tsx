"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Organization, OrganizationMember, Subscription } from "@/lib/types/database"
import { normalizeOrgRole } from "@/lib/permissions/normalize-roles"
import {
  updateOrganizationAction,
  regenerateOrgInviteAction,
  updateOrgMemberRoleAction,
  removeOrgMemberAction,
  deleteOrganizationAction,
} from "@/app/actions/organization"
import { getOrganizationSubscriptionAction } from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Loader2, CheckCircle2, RefreshCw, UserMinus, Shield, Building2, UserPlus, Copy, Users, CreditCard, Trash2, AlertTriangle, CheckCircle, XCircle, Clock,
} from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MemberWithProfile extends OrganizationMember {
  profile?: { fullName?: string | null; email?: string | null; avatarUrl?: string | null }
}

export function OrgSettingsClient({
  organization,
  members,
}: {
  organization: Organization
  members: MemberWithProfile[]
}) {
  const router = useRouter()
  const { t } = useI18n()

  const [name, setName] = React.useState(organization.name)
  const [profilePending, setProfilePending] = React.useState(false)
  const [profileSuccess, setProfileSuccess] = React.useState(false)
  const [inviteCode, setInviteCode] = React.useState(organization.inviteCode ?? "")
  const [invitePending, setInvitePending] = React.useState(false)
  const [inviteSuccess, setInviteSuccess] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [updatingMemberId, setUpdatingMemberId] = React.useState<string | null>(null)
  const [memberActionSuccess, setMemberActionSuccess] = React.useState<string | null>(null)
  const [subscription, setSubscription] = React.useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true)
  const [deletePending, setDeletePending] = React.useState(false)

  const ownerCount = members.filter((m) => normalizeOrgRole(m.role) === "owner").length

   React.useEffect(() => {
    async function loadSubscription() {
      try {
        const result = await getOrganizationSubscriptionAction()
        if (result.success && result.data) {
          setSubscription(result.data.subscription)
        }
      } catch (error) {
        console.error("Failed to load subscription:", error)
      } finally {
        setSubscriptionLoading(false)
      }
    }
    loadSubscription()
  }, [])

  const handleUpdateProfile = async () => {
    setProfilePending(true)
    setProfileSuccess(false)
    try {
      await updateOrganizationAction(organization.id, { name })
      setProfileSuccess(true)
      router.refresh()
      setTimeout(() => setProfileSuccess(false), 2000)
    } catch {}
    finally { setProfilePending(false) }
  }

  const handleRegenerateInvite = async () => {
    setInvitePending(true)
    setInviteSuccess(false)
    try {
      const r = await regenerateOrgInviteAction(organization.id)
      if (r.success && r.data) {
        setInviteCode(r.data)
        setInviteSuccess(true)
        router.refresh()
        setTimeout(() => setInviteSuccess(false), 2000)
      }
    } catch {}
    finally { setInvitePending(false) }
  }

  const handleCopyCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const handleRoleChange = async (memberUserId: string, newRole: string) => {
    setUpdatingMemberId(memberUserId)
    setMemberActionSuccess(null)
    try {
      await updateOrgMemberRoleAction(organization.id, memberUserId, newRole as OrganizationMember["role"])
      setMemberActionSuccess(`role-${memberUserId}`)
      router.refresh()
      setTimeout(() => setMemberActionSuccess(null), 2000)
    } catch {}
    finally { setUpdatingMemberId(null) }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    setUpdatingMemberId(memberUserId)
    setMemberActionSuccess(null)
    try {
      await removeOrgMemberAction(organization.id, memberUserId)
      setMemberActionSuccess(`remove-${memberUserId}`)
      router.refresh()
    } catch { setUpdatingMemberId(null) }
  }

  const handleDeleteOrganization = async () => {
    setDeletePending(true)
    try {
      const result = await deleteOrganizationAction(organization.id)
      if (result.success) {
        router.push("/app")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete organization:", error)
    } finally {
      setDeletePending(false)
    }
  }

  const getStatusIcon = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "trialing":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "past_due":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "canceled":
      case "incomplete":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return t.billing.active
      case "trialing":
        return t.billing.trial
      case "past_due":
        return t.billing.pastDue
      case "canceled":
        return t.billing.canceled
      case "incomplete":
        return t.billing.incomplete
      default:
        return status
    }
  }

  const getStatusBadgeColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      case "trialing":
        return "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "past_due":
        return "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      case "canceled":
      case "incomplete":
        return "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-4">

      {/* Row 1: Profile (7/10) + Invite Code (3/10) */}
      <div className="grid grid-cols-10 gap-4 items-start">

        <Card className="col-span-10 lg:col-span-7 border bg-background">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {t.organizations.profileTitle}
            </CardTitle>
            <CardDescription className="text-xs">{t.organizations.profileDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-xs font-medium text-muted-foreground">
                {t.organizations.name}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="orgName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={profilePending}
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateProfile}
                  disabled={profilePending || name === organization.name}
                  className="h-8 font-medium text-xs px-3 shadow-none shrink-0"
                >
                  {profilePending ? <Loader2 className="h-3 w-3 animate-spin" /> : t.common.saveChanges}
                </Button>
              </div>
            </div>
            {profileSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
                <CheckCircle2 className="h-3 w-3" />
                {t.organizations.profileSaved}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-10 lg:col-span-3 border bg-background">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              {t.organizations.inviteTitle}
            </CardTitle>
            <CardDescription className="text-xs">{t.organizations.inviteDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="font-mono text-xs font-semibold tracking-wider bg-muted/60 px-3 py-2 rounded-md border flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">{inviteCode || t.organizations.noActiveCode}</span>
                {inviteCode && (
                  <button
                    onClick={handleCopyCode}
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded ml-2 shrink-0"
                    title={t.organizations.copyCode}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateInvite}
                disabled={invitePending}
                className="h-8 font-medium text-xs gap-1.5 shrink-0"
              >
                {invitePending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    {t.organizations.changeCode}
                  </>
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-150">
                {t.organizations.codeCopied}
              </p>
            )}
            {inviteSuccess && !copied && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
                <CheckCircle2 className="h-3 w-3" />
                {t.organizations.newCodeGenerated}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Row 2: Members (full width) */}
      <Card className="border bg-background">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {t.organizations.membersTitle} ({members.length})
          </CardTitle>
          <CardDescription className="text-xs">{t.organizations.membersDesc}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <div className="divide-y divide-border/60">
            {members.map((m) => {
              const isWorking = updatingMemberId === m.userId
              const isActionSuccess = memberActionSuccess === `role-${m.userId}`
              const role = normalizeOrgRole(m.role)
              const isLastOwner = role === "owner" && ownerCount <= 1

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/5 transition-colors duration-150"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {m.profile?.fullName || t.members.unknownUser}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/70 truncate">
                      {m.profile?.email || t.common.noEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isActionSuccess && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.organizations.saved}
                      </span>
                    )}
                    <Select
                      value={role}
                      disabled={isWorking || (isLastOwner && role === "owner")}
                      onValueChange={(newRole) => handleRoleChange(m.userId, newRole)}
                    >
                      <SelectTrigger className="h-7 w-24 text-xs font-medium shadow-none">
                        {isWorking ? (
                          <div className="flex items-center justify-center w-full">
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner" className="text-xs">
                          <span className="flex items-center gap-1.5">
                            <Shield className="h-3 w-3" />
                            {t.organizations.owner}
                          </span>
                        </SelectItem>
                        <SelectItem value="member" className="text-xs">
                          {t.organizations.member}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isWorking || isLastOwner}
                      onClick={() => handleRemoveMember(m.userId)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      title={isLastOwner ? t.organizations.cannotRemoveLastOwner : t.organizations.removeFromOrg}
                    >
                      {isWorking ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      ) : (
                        <UserMinus className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Subscription (7/10) + Danger Zone (3/10) */}
      <div className="grid grid-cols-10 gap-4 items-start">

        <Card className="col-span-10 lg:col-span-7 border bg-background">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              {t.billing.subscriptionStatus}
            </CardTitle>
            <CardDescription className="text-xs">{t.organizations.billingDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {subscriptionLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs">{t.organizations.loadingSubscription}</span>
              </div>
            ) : subscription ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{t.organizations.subscriptionStatusLabel}</span>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeColor(subscription.status)}`}>
                    {getStatusIcon(subscription.status)}
                    {getStatusLabel(subscription.status)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      {t.billing.basePlan}
                    </div>
                    {subscription.videoFeatureEnabled && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.billing.videoModule}
                      </div>
                    )}
                    {subscription.aiFeatureEnabled && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.billing.aiModule}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{t.organizations.currentPeriod}</span>
                  <span>
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} –{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      <p className="font-semibold">{t.organizations.cancelAtPeriodEndWarning}</p>
                      <p className="mt-0.5">
                        {t.organizations.cancelAtPeriodEndDesc.replace(
                          "{{date}}",
                          new Date(subscription.currentPeriodEnd).toLocaleDateString()
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <Button onClick={() => router.push("/app/billing")} size="sm" className="h-8 font-medium text-xs">
                  {t.organizations.manageBilling}
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-muted-foreground">{t.organizations.noSubscriptionFound}</p>
                <Button onClick={() => router.push("/app/billing")} size="sm" className="h-8 font-medium text-xs">
                  {t.organizations.subscribeNow}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-10 lg:col-span-3 border bg-background border-destructive/40">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {t.organizations.dangerZone}
            </CardTitle>
            <CardDescription className="text-xs">{t.organizations.dangerZoneDesc}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 font-medium text-xs gap-1.5"
                  disabled={deletePending}
                >
                  {deletePending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3" />
                      {t.organizations.deleteOrg}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {t.organizations.deleteOrgConfirmTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 pt-2 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">
                        {t.organizations.deleteOrgConfirmQuestion.replace("{{name}}", organization.name)}
                      </p>
                      <p>{t.organizations.deleteOrgConfirmDesc}</p>
                      <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                        <li>{t.organizations.deleteOrgItemClasses}</li>
                        <li>{t.organizations.deleteOrgItemChannels}</li>
                        <li>{t.organizations.deleteOrgItemAssignments}</li>
                        <li>{t.organizations.deleteOrgItemResources}</li>
                        <li>{t.organizations.deleteOrgItemMembers}</li>
                        <li>{t.organizations.deleteOrgItemBilling}</li>
                      </ul>
                      <p className="font-semibold text-destructive pt-2">
                        {t.organizations.deleteOrgPermanent}
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteOrganization}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deletePending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.organizations.deleteForever
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
