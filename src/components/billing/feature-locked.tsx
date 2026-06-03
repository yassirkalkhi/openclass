"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"

interface FeatureLockedProps {
  feature: "video" | "ai"
  title?: string
  description?: string
}

export function FeatureLocked({ feature, title, description }: FeatureLockedProps) {
  const { t } = useI18n()

  const defaultTitles = {
    video: t.billing.featureLockedVideoTitle,
    ai: t.billing.featureLockedAITitle,
  }

  const defaultDescriptions = {
    video: t.billing.featureLockedVideoDesc,
    ai: t.billing.featureLockedAIDesc,
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle>{title || defaultTitles[feature]}</CardTitle>
          <CardDescription>{description || defaultDescriptions[feature]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>{t.billing.featureRequiresAddon.replace("{{feature}}", feature)}</p>
            <p className="mt-2">
              {t.billing.featureCost} <span className="font-semibold">150 DH/month</span>
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/app/billing">{t.billing.manageSubscription}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
