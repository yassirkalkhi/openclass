import type { Subscription } from "@/lib/types/database"

 
export function formatMAD(amount: number): string {
  return `${amount.toFixed(2)} DH`
}
 
export function calculateProration(
  currentAmount: number,
  newAmount: number,
  daysRemaining: number,
  totalDays: number = 30
): number {
  const dailyOldRate = currentAmount / totalDays
  const dailyNewRate = newAmount / totalDays
  const refund = dailyOldRate * daysRemaining
  const charge = dailyNewRate * daysRemaining
  return charge - refund
}

 
export function getDaysRemaining(periodEnd: string): number {
  const end = new Date(periodEnd)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

 
export function isSubscriptionActive(status: Subscription["status"]): boolean {
  return status === "active" || status === "trialing"
}

  
export function getSubscriptionStatusLabel(status: Subscription["status"]): string {
  const labels: Record<Subscription["status"], string> = {
    active: "Active",
    trialing: "Trial Period",
    past_due: "Payment Past Due",
    canceled: "Canceled",
    incomplete: "Setup Incomplete",
  }
  return labels[status] || status
}

 
export function getSubscriptionStatusColor(
  status: Subscription["status"]
): "green" | "yellow" | "red" | "gray" {
  if (status === "active" || status === "trialing") return "green"
  if (status === "past_due") return "red"
  if (status === "incomplete") return "yellow"
  return "gray"
}
 
export function getNextBillingDate(currentPeriodEnd: string): Date {
  return new Date(currentPeriodEnd)
}

 
export function formatBillingPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}
 
export function willRenew(subscription: Subscription): boolean {
  return !subscription.cancelAtPeriodEnd && isSubscriptionActive(subscription.status)
}

 
export function getSubscriptionFeatures(subscription: Subscription): string[] {
  const features = ["Base Features"]
  if (subscription.videoFeatureEnabled) features.push("Video Chatting")
  if (subscription.aiFeatureEnabled) features.push("AI Assistant")
  return features
}
 
export function calculateMonthlyCost(
  videoEnabled: boolean,
  aiEnabled: boolean,
  baseCost: number = 200,
  videoCost: number = 15,
  aiCost: number = 15
): number {
  let total = baseCost
  if (videoEnabled) total += videoCost
  if (aiEnabled) total += aiCost
  return total
}

 
export function getFeatureChangeMessage(
  currentVideo: boolean,
  newVideo: boolean,
  currentAI: boolean,
  newAI: boolean
): string {
  const changes: string[] = []
  
  if (currentVideo !== newVideo) {
    changes.push(newVideo ? "Adding Video" : "Removing Video")
  }
  
  if (currentAI !== newAI) {
    changes.push(newAI ? "Adding AI" : "Removing AI")
  }
  
  if (changes.length === 0) return "No changes"
  return changes.join(" and ")
}
 
export function validateFeatureAccess(
  subscription: Subscription | null,
  feature: "video" | "ai"
): { allowed: boolean; reason?: string } {
  if (!subscription) {
    return {
      allowed: false,
      reason: "No active subscription",
    }
  }
  
  if (!isSubscriptionActive(subscription.status)) {
    return {
      allowed: false,
      reason: `Subscription is ${subscription.status}`,
    }
  }
  
  if (feature === "video" && !subscription.videoFeatureEnabled) {
    return {
      allowed: false,
      reason: "Video feature not enabled",
    }
  }
  
  if (feature === "ai" && !subscription.aiFeatureEnabled) {
    return {
      allowed: false,
      reason: "AI feature not enabled",
    }
  }
  
  return { allowed: true }
}
 
export function getTrialDaysRemaining(subscription: Subscription): number | null {
  if (subscription.status !== "trialing") return null
  return getDaysRemaining(subscription.currentPeriodEnd)
}

 
export function needsAttention(subscription: Subscription): boolean {
  return (
    subscription.status === "past_due" ||
    subscription.status === "incomplete" ||
    subscription.cancelAtPeriodEnd
  )
}

 
export function getAttentionMessage(subscription: Subscription): string | null {
  if (subscription.status === "past_due") {
    return "Your payment is past due. Please update your payment method."
  }
  
  if (subscription.status === "incomplete") {
    return "Your subscription setup is incomplete. Please complete the payment."
  }
  
  if (subscription.cancelAtPeriodEnd) {
    const days = getDaysRemaining(subscription.currentPeriodEnd)
    return `Your subscription will be canceled in ${days} day${days !== 1 ? "s" : ""}.`
  }
  
  return null
}
