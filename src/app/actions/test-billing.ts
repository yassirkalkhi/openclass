"use server"

import { getActionUserId, getActionOrgId, actionError, type ActionResult } from "@/lib/actions/utils"
import { SubscriptionRepository } from "@/lib/repositories/subscription-repository"
import { OrganizationRepository } from "@/lib/repositories/organization-repository"
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"

const subscriptionRepo = new SubscriptionRepository()
const organizationRepo = new OrganizationRepository()

export async function testBillingStatusAction(): Promise<ActionResult<{
  userId: string
  orgId: string
  organization: any
  subscription: any
  aiAccess: any
  videoAccess: any
  subscriptionStatus: any
}>> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    // Get organization
    const organization = await organizationRepo.getById(orgId)

    // Get subscription
    const subscription = await subscriptionRepo.getByOrganizationId(orgId)

    // Check AI access
    const aiAccess = await BillingMiddleware.requireAIAccess(orgId)

    // Check video access
    const videoAccess = await BillingMiddleware.requireVideoAccess(orgId)

    // Get subscription status
    const subscriptionStatus = await BillingMiddleware.getSubscriptionStatus(orgId)

    return {
      success: true,
      data: {
        userId,
        orgId,
        organization,
        subscription,
        aiAccess,
        videoAccess,
        subscriptionStatus,
      },
    }
  } catch (e) {
    return actionError(e)
  }
}
