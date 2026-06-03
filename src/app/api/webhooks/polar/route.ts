import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { SubscriptionRepository } from "@/lib/repositories/subscription-repository"
import { BillingTransactionRepository } from "@/lib/repositories/billing-transaction-repository"
import { OrganizationRepository } from "@/lib/repositories/organization-repository"
import { v4 as uuidv4 } from "uuid"

const subscriptionRepo = new SubscriptionRepository()
const transactionRepo = new BillingTransactionRepository()
const organizationRepo = new OrganizationRepository()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body.type

    console.log("Polar webhook received:", event)

    switch (event) {
      case "subscription.created":
        await handleSubscriptionCreated(body.data)
        break

      case "subscription.updated":
        await handleSubscriptionUpdated(body.data)
        break

      case "subscription.canceled":
        await handleSubscriptionCanceled(body.data)
        break

      case "subscription.active":
        await handleSubscriptionActive(body.data)
        break

      case "invoice.paid":
        await handleInvoicePaid(body.data)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(body.data)
        break

      default:
        console.log("Unhandled webhook event:", event)
    }

    revalidatePath("/app", "layout")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(data: any) {
  const { id, customer, metadata, status, current_period_start, current_period_end } = data

  const organizationId = metadata.organizationId
  const videoEnabled = metadata.videoEnabled === "true"
  const aiEnabled = metadata.aiEnabled === "true"

  if (!organizationId) {
    console.error("No organizationId in subscription metadata")
    return
  }

  // Create subscription record
  const subscription = {
    id: uuidv4(),
    organizationId,
    polarSubscriptionId: id,
    polarCustomerId: customer.id,
    status: status as any,
    currentPeriodStart: new Date(current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    videoFeatureEnabled: videoEnabled,
    aiFeatureEnabled: aiEnabled,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await subscriptionRepo.create(subscription)

  // Update organization
  await organizationRepo.update(organizationId, {
    subscriptionId: subscription.id,
    subscriptionStatus: status,
    videoFeatureEnabled: videoEnabled,
    aiFeatureEnabled: aiEnabled,
    updatedAt: new Date().toISOString(),
  })

  console.log("Subscription created:", subscription.id)
}

async function handleSubscriptionUpdated(data: any) {
  const { id, status, metadata, current_period_end, cancel_at_period_end } = data

  const subscription = await subscriptionRepo.getByPolarSubscriptionId(id)
  if (!subscription) {
    console.error("Subscription not found:", id)
    return
  }

  // Use metadata from the event if present; otherwise keep the existing DB values
  const videoEnabled =
    metadata?.videoEnabled !== undefined
      ? metadata.videoEnabled === "true"
      : subscription.videoFeatureEnabled
  const aiEnabled =
    metadata?.aiEnabled !== undefined
      ? metadata.aiEnabled === "true"
      : subscription.aiFeatureEnabled

  await subscriptionRepo.update(subscription.id, {
    status: status as any,
    currentPeriodEnd: new Date(current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: cancel_at_period_end || false,
    videoFeatureEnabled: videoEnabled,
    aiFeatureEnabled: aiEnabled,
    updatedAt: new Date().toISOString(),
  })

  // Update organization
  await organizationRepo.update(subscription.organizationId, {
    subscriptionStatus: status,
    videoFeatureEnabled: videoEnabled,
    aiFeatureEnabled: aiEnabled,
    updatedAt: new Date().toISOString(),
  })

  console.log("Subscription updated:", subscription.id)
}

async function handleSubscriptionCanceled(data: any) {
  const { id } = data

  const subscription = await subscriptionRepo.getByPolarSubscriptionId(id)
  if (!subscription) {
    console.error("Subscription not found:", id)
    return
  }

  await subscriptionRepo.updateStatus(subscription.id, "canceled")

  // Update organization
  await organizationRepo.update(subscription.organizationId, {
    subscriptionStatus: "canceled",
    updatedAt: new Date().toISOString(),
  })

  console.log("Subscription canceled:", subscription.id)
}

async function handleSubscriptionActive(data: any) {
  const { id, current_period_end } = data

  const subscription = await subscriptionRepo.getByPolarSubscriptionId(id)
  if (!subscription) {
    console.error("Subscription not found:", id)
    return
  }

  await subscriptionRepo.updateStatus(
    subscription.id,
    "active",
    new Date(current_period_end * 1000).toISOString()
  )

  // Update organization — preserve existing feature flags
  await organizationRepo.update(subscription.organizationId, {
    subscriptionStatus: "active",
    videoFeatureEnabled: subscription.videoFeatureEnabled,
    aiFeatureEnabled: subscription.aiFeatureEnabled,
    updatedAt: new Date().toISOString(),
  })

  console.log("Subscription activated:", subscription.id)
}

async function handleInvoicePaid(data: any) {
  const { id, subscription_id, amount, currency } = data

  const subscription = await subscriptionRepo.getByPolarSubscriptionId(subscription_id)
  if (!subscription) {
    console.error("Subscription not found for invoice:", subscription_id)
    return
  }

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    organizationId: subscription.organizationId,
    subscriptionId: subscription.id,
    polarInvoiceId: id,
    amount: amount / 100, // Convert from cents
    currency,
    status: "paid" as const,
    description: "Monthly subscription payment",
    createdAt: new Date().toISOString(),
  }

  await transactionRepo.create(transaction)

  console.log("Invoice paid:", transaction.id)
}

async function handleInvoicePaymentFailed(data: any) {
  const { id, subscription_id, amount, currency } = data

  const subscription = await subscriptionRepo.getByPolarSubscriptionId(subscription_id)
  if (!subscription) {
    console.error("Subscription not found for invoice:", subscription_id)
    return
  }

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    organizationId: subscription.organizationId,
    subscriptionId: subscription.id,
    polarInvoiceId: id,
    amount: amount / 100, // Convert from cents
    currency,
    status: "failed" as const,
    description: "Monthly subscription payment failed",
    createdAt: new Date().toISOString(),
  }

  await transactionRepo.create(transaction)

  // Update subscription status
  await subscriptionRepo.updateStatus(subscription.id, "past_due")

  // Update organization
  await organizationRepo.update(subscription.organizationId, {
    subscriptionStatus: "past_due",
    updatedAt: new Date().toISOString(),
  })

  console.log("Invoice payment failed:", transaction.id)
}
