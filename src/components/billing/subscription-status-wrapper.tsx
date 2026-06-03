import { BillingMiddleware } from "@/lib/middleware/billing-middleware"
import { SubscriptionStatusBadge } from "./subscription-status-badge"
import { getActionOrgId } from "@/lib/actions/utils"

export async function SubscriptionStatusWrapper() {
  try {
    const orgId = await getActionOrgId()
    const status = await BillingMiddleware.getSubscriptionStatus(orgId)

    return <SubscriptionStatusBadge {...status} />
  } catch (error) {
    // If there's an error (e.g., no org context), don't show the badge
    return null
  }
}
