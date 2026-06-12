import "server-only"
import { Polar } from "@polar-sh/sdk"
import type { Subscription, BillingTransaction } from "@/lib/types/database"
import { BILLING_PLANS, calculateMonthlyTotal } from "@/lib/billing/plans"

export { BILLING_PLANS }

export interface BillingPlan {
  name: string
  priceMonthly: number
  currency: string
  features: {
    baseAccess: boolean
    videoChat: boolean
    aiCapabilities: boolean
  }
}

export class BillingService {
  private polar: Polar

  constructor() {
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured")
    }
    this.polar = new Polar({ accessToken, server : "sandbox" })
  }
 
  calculateMonthlyTotal(videoEnabled: boolean, aiEnabled: boolean): number {
    return calculateMonthlyTotal(videoEnabled, aiEnabled)
  }

  
  async createSubscription(
    organizationId: string,
    organizationName: string,
    ownerEmail: string,
    videoEnabled: boolean = false,
    aiEnabled: boolean = false
  ): Promise<{ subscriptionId: string; checkoutUrl: string }> {
    try {
      // Look up existing customer first, create only if not found
      let customer: { id: string }
      const listIterator = await this.polar.customers.list({ email: ownerEmail, limit: 1 })
      const existingItems = listIterator?.result?.items ?? []
      if (existingItems.length > 0) {
        customer = existingItems[0]
      } else {
        customer = await this.polar.customers.create({
          email: ownerEmail,
          metadata: {
            organizationId,
            organizationName,
          },
        })
      }

      // Calculate pricing
      const monthlyTotal = this.calculateMonthlyTotal(videoEnabled, aiEnabled)

      // Create product for this organization's subscription
      // Create product for this organization's subscription
      const product = await this.polar.products.create({
        recurringInterval: "month",
        name: `${organizationName} - Monthly Subscription`,
        description: `Base access (200 DH)${videoEnabled ? " + Video (150 DH)" : ""}${aiEnabled ? " + AI (150 DH)" : ""}`,
        prices: [
          {
            amountType: "fixed",
            priceAmount: monthlyTotal * 100,  
            priceCurrency: "mad",
          },
        ],
      })

      // Create checkout session
      const checkout = await this.polar.checkouts.create({
        products: [product.id],
        customerId: customer.id,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing/success`,
        metadata: {
          organizationId,
          videoEnabled: videoEnabled.toString(),
          aiEnabled: aiEnabled.toString(),
        },
      })

      return {
        subscriptionId: checkout.id,
        checkoutUrl: checkout.url,
      }
    } catch (error) {
      console.error("Failed to create subscription:", error)
      throw new Error("Failed to create subscription")
    }
  }
 
  async updateSubscriptionFeatures(
    polarSubscriptionId: string,
    videoEnabled: boolean,
    aiEnabled: boolean
  ): Promise<void> {
    // Feature flags are stored in our own database (subscriptionRepo.updateFeatures).
    // The caller handles DB persistence; nothing to update on Polar's side.
  }

 
  async cancelSubscription(polarSubscriptionId: string): Promise<void> {
    try {
      await this.polar.subscriptions.update({
        id: polarSubscriptionId,
        subscriptionUpdate: { cancelAtPeriodEnd: true },
      })
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
      throw new Error("Failed to cancel subscription")
    }
  }
 
  async reactivateSubscription(polarSubscriptionId: string): Promise<void> {
    try {
      await this.polar.subscriptions.update({
        id: polarSubscriptionId,
        subscriptionUpdate: { cancelAtPeriodEnd: false },
      })
    } catch (error) {
      console.error("Failed to reactivate subscription:", error)
      throw new Error("Failed to reactivate subscription")
    }
  }

   
  async getSubscriptionDetails(polarSubscriptionId: string) {
    try {
      return await this.polar.subscriptions.get({
        id: polarSubscriptionId,
      })
    } catch (error) {
      console.error("Failed to get subscription details:", error)
      throw new Error("Failed to get subscription details")
    }
  }

   
  async getInvoices(polarCustomerId: string) {
    try {
      return await this.polar.orders.list({
        customerId: polarCustomerId,
      })
    } catch (error) {
      console.error("Failed to get orders:", error)
      throw new Error("Failed to get invoices")
    }
  }
 
  async createCustomerPortalSession(polarCustomerId: string): Promise<string> {
    try {
      const session = await this.polar.customerSessions.create({
        customerId: polarCustomerId,
      })
      return session.customerPortalUrl
    } catch (error) {
      console.error("Failed to create customer portal session:", error)
      throw new Error("Failed to create customer portal session")
    }
  }

 
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
     // future impl
    return true
  }

 
  async checkFeatureAccess(
    organizationId: string,
    feature: "video" | "ai"
  ): Promise<boolean> {
    try {
      const { SubscriptionRepository } = await import(
        "@/lib/repositories/subscription-repository"
      )
      const subscriptionRepo = new SubscriptionRepository()
      const subscription = await subscriptionRepo.getByOrganizationId(organizationId)

      if (!subscription || subscription.status !== "active") {
        return false
      }

      if (feature === "video") {
        return subscription.videoFeatureEnabled
      } else if (feature === "ai") {
        return subscription.aiFeatureEnabled
      }

      return false
    } catch (error) {
      console.error("Failed to check feature access:", error)
      return false
    }
  }
}
