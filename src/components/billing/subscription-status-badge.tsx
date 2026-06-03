"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"

interface SubscriptionStatusBadgeProps {
  hasSubscription: boolean
  isActive: boolean
  videoEnabled: boolean
  aiEnabled: boolean
  status?: "active" | "past_due" | "canceled" | "incomplete" | "trialing"
  daysUntilRenewal?: number
}

export function SubscriptionStatusBadge({
  hasSubscription,
  isActive,
  videoEnabled,
  aiEnabled,
  status,
  daysUntilRenewal,
}: SubscriptionStatusBadgeProps) {
  const { t } = useI18n()

  if (!hasSubscription) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            {t.billing.noSubscriptionBadge}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{t.billing.subscriptionRequired}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 text-sm text-muted-foreground">{t.billing.setupBillingDesc}</div>
          <DropdownMenuItem asChild>
            <Link href="/app/billing">{t.billing.setupBilling}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const getStatusColor = () => {
    if (status === "active" || status === "trialing") return "text-green-600"
    if (status === "past_due") return "text-red-600"
    if (status === "canceled") return "text-gray-600"
    return "text-yellow-600"
  }

  const getStatusIcon = () => {
    if (status === "active" || status === "trialing")
      return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status === "past_due" || status === "canceled")
      return <AlertCircle className="w-4 h-4 text-red-600" />
    return <CreditCard className="w-4 h-4" />
  }

  const statusLabels: Record<string, string> = {
    active: t.billing.active,
    trialing: t.billing.trial,
    past_due: t.billing.pastDue,
    canceled: t.billing.canceled,
    incomplete: t.billing.incomplete,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {getStatusIcon()}
          <span className={getStatusColor()}>{status ? statusLabels[status] : ""}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t.billing.subscriptionDetails}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.billing.status}:</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {status?.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          {daysUntilRenewal !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.billing.renewsIn}</span>
              <span className="font-medium">{daysUntilRenewal} {t.billing.days}</span>
            </div>
          )}
          <div className="pt-2 border-t">
            <p className="text-muted-foreground mb-1">{t.billing.features}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${videoEnabled ? "bg-green-500" : "bg-gray-300"}`} />
                <span>{t.billing.videoChatting}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${aiEnabled ? "bg-green-500" : "bg-gray-300"}`} />
                <span>{t.billing.aiCapabilities}</span>
              </div>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/billing">{t.billing.manageBilling}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
