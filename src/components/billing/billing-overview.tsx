"use client"

import { useState, useTransition } from "react"
import type { Subscription, Organization } from "@/lib/types/database"
import { BILLING_PLANS, calculateMonthlyTotal } from "@/lib/billing/plans"
import {
  updateSubscriptionFeaturesAction,
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
  getCustomerPortalUrlAction,
} from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"
import { 
  CreditCard, 
  Sparkles, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ExternalLink,
  ShieldAlert
} from "lucide-react"

interface BillingOverviewProps {
  subscription: Subscription | null
  organization: Organization
}

export function BillingOverview({ subscription, organization }: BillingOverviewProps) {
  const { t } = useI18n()
  const [isPending, startTransition] = useTransition()
  
  const [videoEnabled, setVideoEnabled] = useState(subscription?.videoFeatureEnabled || false)
  const [aiEnabled, setAiEnabled] = useState(subscription?.aiFeatureEnabled || false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const calculateTotal = () => calculateMonthlyTotal(videoEnabled, aiEnabled)

  const handleUpdateFeatures = () => {
    startTransition(async () => {
      try {
        const result = await updateSubscriptionFeaturesAction(videoEnabled, aiEnabled)
        if (result.success) {
          toast.success(t.billing.updateSubscription)
        } else {
          toast.error(result.error || t.errors.generic)
        }
      } catch { 
        toast.error(t.errors.generic) 
      }
    })
  }

  const handleCancelSubscription = () => {
    startTransition(async () => {
      try {
        const result = await cancelSubscriptionAction()
        if (result.success) {
          const formattedDate = subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : ""
          toast.success(t.billing.cancelAtPeriodEnd.replace("{{date}}", formattedDate))
          setShowCancelConfirm(false)
        } else {
          toast.error(result.error || t.errors.generic)
        }
      } catch { 
        toast.error(t.errors.generic) 
      }
    })
  }

  const handleReactivateSubscription = () => {
    startTransition(async () => {
      try {
        const result = await reactivateSubscriptionAction()
        if (result.success) {
          toast.success(t.billing.reactivate)
        } else {
          toast.error(result.error || t.errors.generic)
        }
      } catch { 
        toast.error(t.errors.generic) 
      }
    })
  }

  const handleOpenCustomerPortal = async () => {
    try {
      const result = await getCustomerPortalUrlAction()
      if (!result.success) {
        toast.error(result.error || t.errors.generic)
      } else if (result.data) {
        window.open(result.data.url, "_blank", "noopener,noreferrer")
      }
    } catch { 
      toast.error(t.errors.generic) 
    }
  }

  const getStatusBadge = (status: Subscription["status"]) => {
    const variants: Record<Subscription["status"], "default" | "destructive" | "secondary"> = {
      active: "default", 
      past_due: "destructive", 
      canceled: "secondary",
      incomplete: "secondary", 
      trialing: "default",
    }
    const labels: Record<Subscription["status"], string> = {
      active: t.billing.active, 
      past_due: t.billing.pastDue,
      canceled: t.billing.canceled, 
      incomplete: t.billing.incomplete, 
      trialing: t.billing.trial,
    }
    return (
      <Badge variant={variants[status]} className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider h-5">
        {labels[status]}
      </Badge>
    )
  }

  if (!subscription) {
    return (
      <Card className="border-dashed border-2 max-w-xl mx-auto">
        <CardHeader className="text-center p-4 pb-2">
          <div className="mx-auto p-2 bg-muted rounded-full w-fit mb-1 text-muted-foreground">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <CardTitle className="text-base tracking-tight">{t.billing.noSubscription}</CardTitle>
          <CardDescription className="text-xs">{t.billing.noSubscriptionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4 pt-1">
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t.billing.contactOwner}
          </p>
        </CardContent>
      </Card>
    )
  }

  const hasChanges = videoEnabled !== subscription.videoFeatureEnabled || aiEnabled !== subscription.aiFeatureEnabled

  return (
    <div className="space-y-3.5 max-w-3xl mx-auto text-sm antialiased">
      {/* Subscription Info Card */}
      <Card className="overflow-hidden shadow-sm border-border/80">
        <CardHeader className="bg-muted/10 border-b border-border/40 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold tracking-tight">{t.billing.subscriptionStatus}</CardTitle>
              <CardDescription className="text-[11px] leading-tight">{t.billing.subscriptionDesc}</CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/5 p-2.5 rounded-xl border border-border/40">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.billing.currentPeriod}</p>
              <p className="text-xs font-medium text-foreground/90">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} &mdash;{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.billing.monthlyTotal}</p>
              <div className="flex items-baseline sm:justify-end gap-0.5">
                <span className="text-xl font-bold tracking-tight text-primary">{calculateTotal()}</span>
                <span className="text-[11px] font-medium text-muted-foreground">DH/mo</span>
              </div>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/10 border border-amber-200/40 p-2.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-normal">
                {t.billing.cancelAtPeriodEnd.replace("{{date}}", new Date(subscription.currentPeriodEnd).toLocaleDateString())}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Addons Configurator */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-semibold tracking-tight">{t.billing.features}</CardTitle>
          <CardDescription className="text-[11px] leading-tight">{t.billing.selectFeaturesDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          <div className="grid gap-2">
            {/* Base Plan Row */}
            <div className="flex items-center justify-between p-3 border border-border/40 bg-muted/20 rounded-xl">
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  <Label className="text-xs font-semibold text-foreground/90">{t.billing.basePlan}</Label>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{t.billing.basePlanDesc}</p>
                <p className="text-[11px] font-medium text-foreground/70 mt-0.5">{BILLING_PLANS.BASE.priceMonthly} DH/mo</p>
              </div>
              <Badge variant="outline" className="bg-background text-muted-foreground border-border text-[10px] px-1.5 py-0 shrink-0 h-5">
                {t.billing.basePlanRequired}
              </Badge>
            </div>

            {/* Video Feature Row */}
            <div 
              onClick={() => !isPending && setVideoEnabled(!videoEnabled)}
              className={`flex items-center justify-between p-3 border rounded-xl select-none cursor-pointer transition-all duration-100 ${
                videoEnabled ? "border-primary/30 bg-primary/[0.01]" : "border-border/50 hover:bg-muted/10"
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <Video className={`w-3.5 h-3.5 ${videoEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <Label className="text-xs font-semibold text-foreground/90 cursor-pointer">{t.billing.videoModule}</Label>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{t.billing.videoModuleDesc}</p>
                <p className="text-[11px] font-medium text-foreground/70 mt-0.5">{BILLING_PLANS.VIDEO.priceMonthly} DH/mo</p>
              </div>
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <Switch 
                  id="video-feature" 
                  checked={videoEnabled} 
                  onCheckedChange={setVideoEnabled} 
                  disabled={isPending} 
                  className="scale-90"
                />
              </div>
            </div>

            {/* AI Feature Row */}
            <div 
              onClick={() => !isPending && setAiEnabled(!aiEnabled)}
              className={`flex items-center justify-between p-3 border rounded-xl select-none cursor-pointer transition-all duration-100 ${
                aiEnabled ? "border-primary/30 bg-primary/[0.01]" : "border-border/50 hover:bg-muted/10"
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${aiEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <Label className="text-xs font-semibold text-foreground/90 cursor-pointer">{t.billing.aiModule}</Label>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{t.billing.aiModuleDesc}</p>
                <p className="text-[11px] font-medium text-foreground/70 mt-0.5">{BILLING_PLANS.AI.priceMonthly} DH/mo</p>
              </div>
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <Switch 
                  id="ai-feature" 
                  checked={aiEnabled} 
                  onCheckedChange={setAiEnabled} 
                  disabled={isPending} 
                  className="scale-90"
                />
              </div>
            </div>
          </div>

          {/* Floating Update Bar Block */}
          {hasChanges && (
            <div className="flex items-center justify-between gap-4 p-2.5 bg-primary/[0.02] border border-primary/20 rounded-xl mt-2 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">{t.billing.newMonthlyTotal}</p>
                <p className="text-sm font-bold text-foreground">{calculateTotal()} DH</p>
              </div>
              <Button 
                onClick={handleUpdateFeatures} 
                disabled={isPending}
                size="sm"
                className="h-8 text-xs px-3"
              >
                {isPending && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                {isPending ? t.billing.updating : t.billing.updateSubscription}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gateway Controls Management */}
      <Card className="shadow-sm border-border/80">
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleOpenCustomerPortal} 
            size="sm"
            className="flex-1 h-8.5 text-xs border-border/70"
          >
            <span>{t.billing.managePayment}</span>
            <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
          </Button>
          
          {subscription.cancelAtPeriodEnd ? (
            <Button 
              variant="default" 
              onClick={handleReactivateSubscription} 
              disabled={isPending} 
              size="sm"
              className="flex-1 h-8.5 text-xs"
            >
              {isPending && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              {t.billing.reactivate}
            </Button>
          ) : (
            <div className="flex-1 min-h-[34px]">
              {!showCancelConfirm ? (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowCancelConfirm(true)} 
                  disabled={isPending}
                  size="sm"
                  className="w-full h-8.5 text-xs"
                >
                  {t.billing.cancelSubscription}
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 w-full animate-in fade-in zoom-in-95 duration-100">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isPending}
                    className="flex-1 h-8 text-[11px]"
                  >
                    Keep Plan
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleCancelSubscription} 
                    disabled={isPending}
                    className="flex-1 h-8 text-[11px] font-semibold shadow-sm"
                  >
                    {isPending && <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />}
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}