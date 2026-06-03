import { getOrganizationSubscriptionAction } from "@/app/actions/billing"
import { BillingOverview } from "@/components/billing/billing-overview"
import { SubscriptionSetup } from "@/components/billing/subscription-setup"
import { redirect } from "next/navigation"

export default async function BillingPage() {
  const result = await getOrganizationSubscriptionAction()

  if (!result.success || !result.data) {
    redirect("/app")
  }

  const { subscription, organization } = result.data

  return (
    <div className="container mx-auto py-8 px-4">
      {subscription ? (
        <BillingOverview subscription={subscription} organization={organization} />
      ) : (
        <SubscriptionSetup />
      )}
    </div>
  )
}
