import "server-only"
import { SubscriptionRepository } from "@/lib/repositories/subscription-repository"
import type { Subscription } from "@/lib/types/database"

const subscriptionRepo = new SubscriptionRepository()

export class BillingMiddleware {
  /**
   * Check if organization has an active subscription
   */
  static async requireActiveSubscription(organizationId: string): Promise<{
    hasAccess: boolean
    subscription: Subscription | null
    reason?: string
  }> {
    const subscription = await subscriptionRepo.getByOrganizationId(organizationId)

    if (!subscription) {
      return {
        hasAccess: false,
        subscription: null,
        reason: "No subscription found. Please set up billing to continue.",
      }
    }

    if (subscription.status === "canceled") {
      return {
        hasAccess: false,
        subscription,
        reason: "Your subscription has been canceled. Please reactivate to continue.",
      }
    }

    if (subscription.status === "past_due") {
      return {
        hasAccess: false,
        subscription,
        reason: "Your payment is past due. Please update your payment method.",
      }
    }

    if (subscription.status === "incomplete") {
      return {
        hasAccess: false,
        subscription,
        reason: "Your subscription setup is incomplete. Please complete the payment.",
      }
    }

    return {
      hasAccess: true,
      subscription,
    }
  }

  /**
   * Check if organization has access to video feature
   */
  static async requireVideoAccess(organizationId: string): Promise<{
    hasAccess: boolean
    reason?: string
  }> {
    const { hasAccess: hasSubscription, subscription, reason } =
      await this.requireActiveSubscription(organizationId)

    if (!hasSubscription) {
      return { hasAccess: false, reason }
    }

    if (!subscription?.videoFeatureEnabled) {
      return {
        hasAccess: false,
        reason: "Video feature is not enabled. Please upgrade your subscription.",
      }
    }

    return { hasAccess: true }
  }

  /**
   * Check if organization has access to AI feature
   */
  static async requireAIAccess(organizationId: string): Promise<{
    hasAccess: boolean
    reason?: string
  }> {
    const { hasAccess: hasSubscription, subscription, reason } =
      await this.requireActiveSubscription(organizationId)

    if (!hasSubscription) {
      return { hasAccess: false, reason }
    }

    if (!subscription?.aiFeatureEnabled) {
      return {
        hasAccess: false,
        reason: "AI feature is not enabled. Please upgrade your subscription.",
      }
    }

    return { hasAccess: true }
  }

  /**
   * Get subscription status for display
   */
  static async getSubscriptionStatus(organizationId: string): Promise<{
    hasSubscription: boolean
    isActive: boolean
    videoEnabled: boolean
    aiEnabled: boolean
    status?: Subscription["status"]
    daysUntilRenewal?: number
  }> {
    const subscription = await subscriptionRepo.getByOrganizationId(organizationId)

    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        videoEnabled: false,
        aiEnabled: false,
      }
    }

    const isActive = ["active", "trialing"].includes(subscription.status)
    const daysUntilRenewal = Math.ceil(
      (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    return {
      hasSubscription: true,
      isActive,
      videoEnabled: subscription.videoFeatureEnabled,
      aiEnabled: subscription.aiFeatureEnabled,
      status: subscription.status,
      daysUntilRenewal,
    }
  }
}
