"use server"

import { Polar } from "@polar-sh/sdk"
import { SubscriptionRepository } from "@/lib/repositories/subscription-repository"
import { OrganizationRepository } from "@/lib/repositories/organization-repository"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import { actionError, getActionOrgId, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

const subscriptionRepo = new SubscriptionRepository()
const organizationRepo = new OrganizationRepository()
const profileRepo = new ProfileRepository()

/**
 * Diagnose subscription sync issues by checking Polar vs local database
 */
export async function diagnoseSubscriptionAction(): Promise<
  ActionResult<{
    hasLocalSubscription: boolean
    polarSubscriptions: any[]
    organizationId: string
    userEmail: string
  }>
> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()
    
    const profile = await profileRepo.getById(userId)
    if (!profile?.email) {
      return { success: false, error: "User email not found" }
    }

    // Check local subscription
    const localSubscription = await subscriptionRepo.getByOrganizationId(orgId)

    // Check Polar subscriptions
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) {
      return { success: false, error: "POLAR_ACCESS_TOKEN not configured" }
    }

    const polar = new Polar({ accessToken, server: "sandbox" })
    
    // Look up customer by email
    const listIterator = await polar.customers.list({ email: profile.email, limit: 10 })
    const customers = listIterator?.result?.items ?? []
    
    let polarSubscriptions: any[] = []
    
    // Get subscriptions for each customer
    for (const customer of customers) {
      const subsListIterator = await polar.subscriptions.list({ 
        customerId: customer.id,
        limit: 10
      })
      const subs = subsListIterator?.result?.items ?? []
      polarSubscriptions.push(...subs)
    }

    return {
      success: true,
      data: {
        hasLocalSubscription: !!localSubscription,
        polarSubscriptions: polarSubscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          customerId: sub.customerId,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          metadata: sub.metadata,
        })),
        organizationId: orgId,
        userEmail: profile.email,
      },
    }
  } catch (e) {
    return actionError(e)
  }
}

/**
 * Automatically sync the most recent active Polar subscription for the current user.
 * Called from the billing success page right after checkout completes.
 */
export async function autoSyncSubscriptionAction(): Promise<
  ActionResult<{ message: string; synced: boolean }>
> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    const profile = await profileRepo.getById(userId)
    if (!profile?.email) {
      return { success: false, error: "User email not found" }
    }

    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) {
      return { success: false, error: "POLAR_ACCESS_TOKEN not configured" }
    }

    const polar = new Polar({ accessToken, server: "sandbox" })

    // Find customers matching this email
    const listIterator = await polar.customers.list({ email: profile.email, limit: 10 })
    const customers = listIterator?.result?.items ?? []

    // Collect all subscriptions across customers, pick the most recent active one
    let latestSub: any = null
    for (const customer of customers) {
      const subsIterator = await polar.subscriptions.list({
        customerId: customer.id,
        limit: 10,
      })
      const subs = subsIterator?.result?.items ?? []
      for (const sub of subs) {
        if (sub.status === "active" || sub.status === "trialing") {
          if (!latestSub || sub.createdAt > latestSub.createdAt) {
            latestSub = sub
          }
        }
      }
    }

    if (!latestSub) {
      return {
        success: true,
        data: { message: "No active subscription found in Polar yet", synced: false },
      }
    }

    // Upsert the subscription locally
    const existingSubscription = await subscriptionRepo.getByPolarSubscriptionId(latestSub.id)
    const videoEnabled = latestSub.metadata?.videoEnabled === "true" || false
    const aiEnabled = latestSub.metadata?.aiEnabled === "true" || false

    if (existingSubscription) {
      await subscriptionRepo.update(existingSubscription.id, {
        status: latestSub.status as any,
        currentPeriodStart: new Date(latestSub.currentPeriodStart * 1000).toISOString(),
        currentPeriodEnd: new Date(latestSub.currentPeriodEnd * 1000).toISOString(),
        cancelAtPeriodEnd: latestSub.cancelAtPeriodEnd || false,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: new Date().toISOString(),
      })
      await organizationRepo.update(orgId, {
        subscriptionId: existingSubscription.id,
        subscriptionStatus: latestSub.status as any,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: new Date().toISOString(),
      })
    } else {
      const subscription = {
        id: uuidv4(),
        organizationId: orgId,
        polarSubscriptionId: latestSub.id,
        polarCustomerId: latestSub.customerId,
        status: latestSub.status as any,
        currentPeriodStart: new Date(latestSub.currentPeriodStart * 1000).toISOString(),
        currentPeriodEnd: new Date(latestSub.currentPeriodEnd * 1000).toISOString(),
        cancelAtPeriodEnd: latestSub.cancelAtPeriodEnd || false,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await subscriptionRepo.create(subscription)
      await organizationRepo.update(orgId, {
        subscriptionId: subscription.id,
        subscriptionStatus: latestSub.status as any,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: new Date().toISOString(),
      })
    }

    revalidatePath("/app", "layout")
    return {
      success: true,
      data: { message: "Subscription synced successfully", synced: true },
    }
  } catch (e) {
    return actionError(e)
  }
}

export async function syncSubscriptionFromPolarAction(
  polarSubscriptionId: string
): Promise<ActionResult<{ message: string }>> {
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

    // Get subscription from Polar
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) {
      return { success: false, error: "POLAR_ACCESS_TOKEN not configured" }
    }

    const polar = new Polar({ accessToken, server: "sandbox" })
    const polarSub = await polar.subscriptions.get({ id: polarSubscriptionId })

    if (!polarSub) {
      return { success: false, error: "Subscription not found in Polar" }
    }

    // Check if subscription already exists locally
    const existingSubscription = await subscriptionRepo.getByPolarSubscriptionId(polarSubscriptionId)

    const videoEnabled = polarSub.metadata?.videoEnabled === "true" || false
    const aiEnabled = polarSub.metadata?.aiEnabled === "true" || false

    if (existingSubscription) {
      // Update existing subscription
      await subscriptionRepo.update(existingSubscription.id, {
        status: polarSub.status as any,
        currentPeriodStart: new Date(polarSub.currentPeriodStart * 1000).toISOString(),
        currentPeriodEnd: new Date(polarSub.currentPeriodEnd * 1000).toISOString(),
        cancelAtPeriodEnd: polarSub.cancelAtPeriodEnd || false,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: new Date().toISOString(),
      })

      // Update organization
      await organizationRepo.update(orgId, {
        subscriptionId: existingSubscription.id,
        subscriptionStatus: polarSub.status as any,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: new Date().toISOString(),
      })

      revalidatePath("/app")
      return { 
        success: true, 
        data: { message: "Subscription updated successfully" } 
      }
    } else {
      // Create new subscription record
      const subscription = {
        id: uuidv4(),
        organizationId: orgId,
        polarSubscriptionId: polarSub.id,
        polarCustomerId: polarSub.customerId,
        status: polarSub.status as any,
        currentPeriodStart: new Date(polarSub.currentPeriodStart * 1000).toISOString(),
        currentPeriodEnd: new Date(polarSub.currentPeriodEnd * 1000).toISOString(),
        cancelAtPeriodEnd: polarSub.cancelAtPeriodEnd || false,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await subscriptionRepo.create(subscription)

      // Update organization
      await organizationRepo.update(orgId, {
        subscriptionId: subscription.id,
        subscriptionStatus: polarSub.status as any,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: new Date().toISOString(),
      })

      revalidatePath("/app")
      return { 
        success: true, 
        data: { message: "Subscription synced successfully" } 
      }
    }
  } catch (e) {
    return actionError(e)
  }
}
