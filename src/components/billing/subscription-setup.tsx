"use client"

import { useState } from "react"
import { createSubscriptionAction } from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BILLING_PLANS, calculateMonthlyTotal } from "@/lib/billing/plans"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"

export function SubscriptionSetup() {
  const { t } = useI18n()
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const calculateTotal = () => calculateMonthlyTotal(videoEnabled, aiEnabled)

  const handleCreateSubscription = async () => {
    setIsCreating(true)
    try {
      const result = await createSubscriptionAction(videoEnabled, aiEnabled)
      if (result.success && result.data) {
        window.location.href = result.data.checkoutUrl
      } else {
        toast.error((!result.success && result.error) || t.errors.generic)
        setIsCreating(false)
      }
    } catch {
      toast.error(t.errors.generic)
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t.billing.setupSubscription}</h1>
        <p className="text-muted-foreground">{t.billing.setupDesc}</p>
        <div className="pt-2">
          <Link 
            href="/app/billing/sync" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Already have a subscription? Click here to sync
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.billing.selectFeatures}</CardTitle>
          <CardDescription>{t.billing.selectFeaturesDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Base Plan */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{t.billing.basePlan}</Label>
                  <span className="text-lg font-bold">{BILLING_PLANS.BASE.priceMonthly} DH/month</span>
                </div>
                <p className="text-sm text-muted-foreground">{t.billing.basePlanDesc}</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                  <li>• {t.billing.basePlanFeatures.unlimited}</li>
                  <li>• {t.billing.basePlanFeatures.messaging}</li>
                  <li>• {t.billing.basePlanFeatures.assignments}</li>
                  <li>• {t.billing.basePlanFeatures.resources}</li>
                  <li>• {t.billing.basePlanFeatures.members}</li>
                </ul>
              </div>
            </div>

            {/* Video Add-on */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1 flex-1">
                <Label htmlFor="video-setup" className="text-base font-medium">{t.billing.videoModule}</Label>
                <p className="text-sm text-muted-foreground">{t.billing.videoModuleDesc}</p>
                <p className="text-sm font-medium mt-2">+{BILLING_PLANS.VIDEO.priceMonthly} DH/month</p>
              </div>
              <Switch
                id="video-setup"
                checked={videoEnabled}
                onCheckedChange={setVideoEnabled}
                disabled={isCreating}
              />
            </div>

            {/* AI Add-on */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1 flex-1">
                <Label htmlFor="ai-setup" className="text-base font-medium">{t.billing.aiModule}</Label>
                <p className="text-sm text-muted-foreground">{t.billing.aiModuleDesc}</p>
                <p className="text-sm font-medium mt-2">+{BILLING_PLANS.AI.priceMonthly} DH/month</p>
              </div>
              <Switch
                id="ai-setup"
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Total + CTA */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">{t.billing.monthlyTotal}</p>
                <p className="text-3xl font-bold">{calculateTotal()} DH</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{t.billing.billedMonthly}</p>
                <p>{t.billing.cancelAnytime}</p>
              </div>
            </div>

            <Button
              onClick={handleCreateSubscription}
              disabled={isCreating}
              size="lg"
              className="w-full"
            >
              {isCreating ? t.billing.processing : t.billing.continueToPayment}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {t.billing.redirectNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>{t.billing.faq}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">{t.billing.faqChangePlan}</p>
            <p className="text-muted-foreground">{t.billing.faqChangePlanAnswer}</p>
          </div>
          <div>
            <p className="font-medium">{t.billing.faqPayment}</p>
            <p className="text-muted-foreground">{t.billing.faqPaymentAnswer}</p>
          </div>
          <div>
            <p className="font-medium">{t.billing.faqCancel}</p>
            <p className="text-muted-foreground">{t.billing.faqCancelAnswer}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
