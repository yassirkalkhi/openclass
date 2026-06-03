# Billing System Quick Reference

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Base | 200 DH/month | Classes, channels, messaging, assignments, resources |
| Video Add-on | +15 DH/month | Video calls and conferences |
| AI Add-on | +15 DH/month | AI-powered assistant |

**Examples:**
- Base only: 200 DH/month
- Base + Video: 215 DH/month
- Base + AI: 215 DH/month
- Base + Video + AI: 230 DH/month

## Key Files

### Services
- `src/lib/services/billing-service.ts` - Polar API integration
- `src/lib/middleware/billing-middleware.ts` - Access control

### Repositories
- `src/lib/repositories/subscription-repository.ts` - Subscription data
- `src/lib/repositories/billing-transaction-repository.ts` - Payment history

### Actions
- `src/app/actions/billing.ts` - Server actions for billing operations

### API Routes
- `src/app/api/webhooks/polar/route.ts` - Webhook handler

### Components
- `src/components/billing/billing-overview.tsx` - Main billing UI
- `src/components/billing/subscription-setup.tsx` - Initial setup
- `src/components/billing/feature-locked.tsx` - Locked feature screen
- `src/components/billing/subscription-status-badge.tsx` - Status indicator

### Pages
- `src/app/app/billing/page.tsx` - Billing management
- `src/app/app/billing/success/page.tsx` - Payment success

## Common Tasks

### Check if org has feature access

```typescript
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"

const { hasAccess, reason } = await BillingMiddleware.requireVideoAccess(orgId)
if (!hasAccess) {
  return { error: reason }
}
```

### Get subscription status

```typescript
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"

const status = await BillingMiddleware.getSubscriptionStatus(orgId)
// Returns: { hasSubscription, isActive, videoEnabled, aiEnabled, status, daysUntilRenewal }
```

### Create subscription

```typescript
import { createSubscriptionAction } from "@/app/actions/billing"

const result = await createSubscriptionAction(videoEnabled, aiEnabled)
if (result.success) {
  window.location.href = result.data.checkoutUrl
}
```

### Update features

```typescript
import { updateSubscriptionFeaturesAction } from "@/app/actions/billing"

const result = await updateSubscriptionFeaturesAction(videoEnabled, aiEnabled)
```

### Cancel subscription

```typescript
import { cancelSubscriptionAction } from "@/app/actions/billing"

const result = await cancelSubscriptionAction()
// Cancels at period end
```

## Database Schema

### subscriptions collection

```typescript
{
  id: string
  organizationId: string
  polarSubscriptionId: string
  polarCustomerId: string
  status: "active" | "past_due" | "canceled" | "incomplete" | "trialing"
  currentPeriodStart: string (ISO date)
  currentPeriodEnd: string (ISO date)
  cancelAtPeriodEnd: boolean
  videoFeatureEnabled: boolean
  aiFeatureEnabled: boolean
  createdAt: string (ISO date)
  updatedAt: string (ISO date)
}
```

### billingTransactions collection

```typescript
{
  id: string
  organizationId: string
  subscriptionId: string
  polarInvoiceId?: string
  amount: number
  currency: string
  status: "pending" | "paid" | "failed" | "refunded"
  description: string
  createdAt: string (ISO date)
}
```

### organizations collection (new fields)

```typescript
{
  // ... existing fields
  subscriptionId?: string
  subscriptionStatus?: "active" | "past_due" | "canceled" | "incomplete" | "trialing"
  videoFeatureEnabled?: boolean
  aiFeatureEnabled?: boolean
}
```

## Webhook Events

### subscription.created
- Creates subscription record in Firestore
- Updates organization with subscription info
- Sets feature flags

### subscription.updated
- Updates subscription status
- Updates feature flags
- Syncs with organization

### subscription.canceled
- Sets status to "canceled"
- Updates organization

### subscription.active
- Sets status to "active"
- Updates period end date

### invoice.paid
- Creates transaction record
- Status: "paid"

### invoice.payment_failed
- Creates transaction record
- Status: "failed"
- Sets subscription to "past_due"

## Environment Variables

```env
# Required
POLAR_ACCESS_TOKEN=polar_xxx
POLAR_ORGANIZATION_ID=org_xxx
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_xxx
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional (for webhook verification)
POLAR_WEBHOOK_SECRET=whsec_xxx
```

## Subscription Statuses

| Status | Meaning | Access Allowed |
|--------|---------|----------------|
| active | Paid and current | ✅ Yes |
| trialing | In trial period | ✅ Yes |
| past_due | Payment failed | ❌ No |
| canceled | Canceled by user | ❌ No |
| incomplete | Setup not finished | ❌ No |

## Feature Access Logic

```typescript
// Video access requires:
1. Active subscription (status = "active" or "trialing")
2. videoFeatureEnabled = true

// AI access requires:
1. Active subscription (status = "active" or "trialing")
2. aiFeatureEnabled = true

// Base features require:
1. Active subscription (any status except "canceled")
```

## Useful Queries

### Get org subscription
```typescript
const subscription = await subscriptionRepo.getByOrganizationId(orgId)
```

### Get all active subscriptions
```typescript
const active = await subscriptionRepo.getActiveSubscriptions()
```

### Get billing history
```typescript
const transactions = await transactionRepo.getByOrganizationId(orgId)
```

### Get failed payments
```typescript
const failed = await transactionRepo.getByStatus("failed")
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No subscription found" | Org has no subscription | Create subscription |
| "Subscription is past_due" | Payment failed | Update payment method |
| "Video feature not enabled" | Feature not in plan | Upgrade subscription |
| "AI feature not enabled" | Feature not in plan | Upgrade subscription |
| "Only organization owner can manage billing" | Non-owner trying to access | Use owner account |

## Testing

### Test Cards (Polar)
- Success: Use Polar's test card numbers
- Failure: Use Polar's decline test cards
- Check Polar docs for specific numbers

### Test Webhooks
1. Use Polar's webhook testing tool
2. Or use ngrok for local testing:
   ```bash
   ngrok http 3000
   # Use ngrok URL in Polar webhook settings
   ```

### Test Scenarios
- [ ] Create subscription
- [ ] Enable video feature
- [ ] Enable AI feature
- [ ] Disable features
- [ ] Cancel subscription
- [ ] Reactivate subscription
- [ ] Payment failure
- [ ] Webhook processing

## Monitoring

### Key Metrics
- Active subscriptions count
- Monthly recurring revenue (MRR)
- Payment success rate
- Feature adoption (video/AI)
- Churn rate

### Alerts to Set Up
- Payment failures
- Webhook processing errors
- High churn rate
- Low adoption rate

## Support Scripts

### Check org billing status
```typescript
const org = await organizationRepo.getById(orgId)
const subscription = await subscriptionRepo.getByOrganizationId(orgId)
console.log({
  orgName: org.name,
  hasSubscription: !!subscription,
  status: subscription?.status,
  videoEnabled: subscription?.videoFeatureEnabled,
  aiEnabled: subscription?.aiFeatureEnabled,
})
```

### Fix stuck subscription
```typescript
// If webhook failed, manually sync:
const polarSub = await billingService.getSubscriptionDetails(polarSubscriptionId)
await subscriptionRepo.update(subscriptionId, {
  status: polarSub.status,
  currentPeriodEnd: new Date(polarSub.current_period_end * 1000).toISOString(),
})
```

## Common Issues

### Webhook not received
1. Check webhook URL is accessible
2. Verify in Polar dashboard
3. Check server logs
4. Test with Polar's testing tool

### Feature access denied
1. Check subscription status
2. Verify feature flags
3. Check organization subscriptionId
4. Review middleware logic

### Payment not processing
1. Check Polar dashboard
2. Verify customer payment method
3. Check for Polar service issues
4. Review transaction logs

## Quick Links

- [Polar Dashboard](https://polar.sh/dashboard)
- [Polar Documentation](https://docs.polar.sh)
- [Polar API Reference](https://docs.polar.sh/api)
- [Polar Webhooks](https://docs.polar.sh/webhooks)

## Contact

For billing system issues:
1. Check this reference
2. Review BILLING_SETUP.md
3. Check server logs
4. Contact Polar support if needed
