"use server"

import { BillingService } from "@/lib/services/billing-service"
import { SubscriptionRepository } from "@/lib/repositories/subscription-repository"
import { BillingTransactionRepository } from "@/lib/repositories/billing-transaction-repository"
import { OrganizationRepository } from "@/lib/repositories/organization-repository"
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"
import { actionError, getActionOrgId, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { Subscription, BillingTransaction, Organization } from "@/lib/types/database"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

const billingService = new BillingService()
const subscriptionRepo = new SubscriptionRepository()
const transactionRepo = new BillingTransactionRepository()
const organizationRepo = new OrganizationRepository()

export async function getOrganizationSubscriptionAction(): Promise<
  ActionResult<{
    subscription: Subscription | null
    organization: Organization
  }>
> {
  try {
    const orgId = await getActionOrgId()
    const organization = await organizationRepo.getById(orgId)
    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    const subscription = await subscriptionRepo.getByOrganizationId(orgId)
    return { success: true, data: { subscription, organization } }
  } catch (e) {
    return actionError(e)
  }
}

export async function createSubscriptionAction(
  videoEnabled: boolean = false,
  aiEnabled: boolean = false
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    const organization = await organizationRepo.getById(orgId)
    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    // Check if user is owner
    if (organization.ownerId !== userId) {
      return { success: false, error: "Only organization owner can manage billing" }
    }

    // Check if an active/trialing subscription already exists for this organization
    const existingSubscription = await subscriptionRepo.getByOrganizationId(orgId)
    if (existingSubscription) {
      if (existingSubscription.status === "active" || existingSubscription.status === "trialing") {
        return { success: false, error: "Organization already has an active subscription" }
      }
       await subscriptionRepo.delete(existingSubscription.id)
    }

    // Get user profile for email
    const { ProfileRepository } = await import("@/lib/repositories/profile-repository")
    const profileRepo = new ProfileRepository()
    const profile = await profileRepo.getById(userId)
    if (!profile?.email) {
      return { success: false, error: "User email not found" }
    }

    // Create subscription in Polar
    const { subscriptionId, checkoutUrl } = await billingService.createSubscription(
      orgId,
      organization.name,
      profile.email,
      videoEnabled,
      aiEnabled
    )
 
    await organizationRepo.update(orgId, {
      videoFeatureEnabled: videoEnabled,
      aiFeatureEnabled: aiEnabled,
      subscriptionStatus: "incomplete", // will be updated to "active" by webhook
      updatedAt: new Date().toISOString(),
    })

    revalidatePath("/app")
    return { success: true, data: { checkoutUrl } }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateSubscriptionFeaturesAction(
  videoEnabled: boolean,
  aiEnabled: boolean
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    const organization = await organizationRepo.getById(orgId)
    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    // Check if user is owner
    if (organization.ownerId !== userId) {
      return { success: false, error: "Only organization owner can manage billing" }
    }

    const subscription = await subscriptionRepo.getByOrganizationId(orgId)
    if (!subscription) {
      return { success: false, error: "No active subscription found" }
    }

    // Update in Polar
    await billingService.updateSubscriptionFeatures(
      subscription.polarSubscriptionId,
      videoEnabled,
      aiEnabled
    )

    // Update in database
    await subscriptionRepo.updateFeatures(subscription.id, videoEnabled, aiEnabled)

    // Update organization
    await organizationRepo.update(orgId, {
      videoFeatureEnabled: videoEnabled,
      aiFeatureEnabled: aiEnabled,
      updatedAt: new Date().toISOString(),
    })

    revalidatePath("/app")
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    const organization = await organizationRepo.getById(orgId)
    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    // Check if user is owner
    if (organization.ownerId !== userId) {
      return { success: false, error: "Only organization owner can manage billing" }
    }

    const subscription = await subscriptionRepo.getByOrganizationId(orgId)
    if (!subscription) {
      return { success: false, error: "No active subscription found" }
    }

    // Cancel in Polar
    await billingService.cancelSubscription(subscription.polarSubscriptionId)

    // Update in database
    await subscriptionRepo.update(subscription.id, {
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    })

    revalidatePath("/app")
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function reactivateSubscriptionAction(): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    const organization = await organizationRepo.getById(orgId)
    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    // Check if user is owner
    if (organization.ownerId !== userId) {
      return { success: false, error: "Only organization owner can manage billing" }
    }

    const subscription = await subscriptionRepo.getByOrganizationId(orgId)
    if (!subscription) {
      return { success: false, error: "No subscription found" }
    }

    // Reactivate in Polar
    await billingService.reactivateSubscription(subscription.polarSubscriptionId)

    // Update in database
    await subscriptionRepo.update(subscription.id, {
      cancelAtPeriodEnd: false,
      status: "active",
      updatedAt: new Date().toISOString(),
    })

    revalidatePath("/app")
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function getBillingTransactionsAction(): Promise<
  ActionResult<BillingTransaction[]>
> {
  try {
    const orgId = await getActionOrgId()
    const transactions = await transactionRepo.getByOrganizationId(orgId)
    return { success: true, data: transactions }
  } catch (e) {
    return actionError(e)
  }
}

export async function getCustomerPortalUrlAction(): Promise<ActionResult<{ url: string }>> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    const organization = await organizationRepo.getById(orgId)
    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    // Check if user is owner
    if (organization.ownerId !== userId) {
      return { success: false, error: "Only organization owner can access billing portal" }
    }

    const subscription = await subscriptionRepo.getByOrganizationId(orgId)
    if (!subscription) {
      return { success: false, error: "No subscription found" }
    }

    const url = await billingService.createCustomerPortalSession(
      subscription.polarCustomerId
    )

    return { success: true, data: { url } }
  } catch (e) {
    return actionError(e)
  }
}

export async function checkAIAccessAction(): Promise<ActionResult<{ hasAccess: boolean; reason?: string }>> {
  try {
    const orgId = await getActionOrgId()
    const { hasAccess, reason } = await BillingMiddleware.requireAIAccess(orgId)
    return { success: true, data: { hasAccess, reason } }
  } catch (e) {
    return actionError(e)
  }
}

