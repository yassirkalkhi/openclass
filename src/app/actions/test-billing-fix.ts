"use server"

import { getActionOrgId, actionError, type ActionResult } from "@/lib/actions/utils"
import { SubscriptionRepository } from "@/lib/repositories/subscription-repository"
import { OrganizationRepository } from "@/lib/repositories/organization-repository"
import { generateId } from "@/lib/utils"
import type { Subscription } from "@/lib/types/database"

const subscriptionRepo = new SubscriptionRepository()
const organizationRepo = new OrganizationRepository()

/**
 * DEVELOPMENT ONLY: Manually activate AI and Video features for current organization
 * This bypasses Polar and directly updates the database
 */
export async function manuallyActivateFeaturesAction(
  aiEnabled: boolean = true,
  videoEnabled: boolean = true
): Promise<ActionResult<{ message: string }>> {
  try {
    const orgId = await getActionOrgId()

    // Get or create subscription
    let subscription = await subscriptionRepo.getByOrganizationId(orgId)

    if (!subscription) {
      // Create a mock subscription for development
      const now = new Date().toISOString()
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      subscription = {
        id: generateId(),
        organizationId: orgId,
        polarSubscriptionId: `dev_${generateId()}`,
        polarCustomerId: `dev_cust_${generateId()}`,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth.toISOString(),
        cancelAtPeriodEnd: false,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        createdAt: now,
        updatedAt: now,
      }

      await subscriptionRepo.create(subscription)
    } else {
      // Update existing subscription
      await subscriptionRepo.updateFeatures(subscription.id, videoEnabled, aiEnabled)
      await subscriptionRepo.updateStatus(subscription.id, "active")
    }

    // Also update the organization record
    await organizationRepo.update(orgId, {
      subscriptionStatus: "active",
      videoFeatureEnabled: videoEnabled,
      aiFeatureEnabled: aiEnabled,
      updatedAt: new Date().toISOString(),
    })

    return {
      success: true,
      data: {
        message: `Features activated: AI=${aiEnabled}, Video=${videoEnabled}`,
      },
    }
  } catch (e) {
    return actionError(e)
  }
}

/**
 * DEVELOPMENT ONLY: Deactivate all premium features
 */
export async function manuallyDeactivateFeaturesAction(): Promise<ActionResult<{ message: string }>> {
  try {
    const orgId = await getActionOrgId()

    const subscription = await subscriptionRepo.getByOrganizationId(orgId)

    if (subscription) {
      await subscriptionRepo.updateFeatures(subscription.id, false, false)
    }

    await organizationRepo.update(orgId, {
      videoFeatureEnabled: false,
      aiFeatureEnabled: false,
      updatedAt: new Date().toISOString(),
    })

    return {
      success: true,
      data: {
        message: "All premium features deactivated",
      },
    }
  } catch (e) {
    return actionError(e)
  }
}
