# Billing Setup Guide

This guide explains how to set up and configure billing for OpenClass using Polar.

## Overview

OpenClass uses Polar for subscription billing with the following pricing structure:

- **Base Plan**: 200 DH/month (required)
  - Core features: classes, channels, messaging, assignments, resources
- **Video Add-on**: +15 DH/month (optional)
  - Video calls and live conferences
- **AI Add-on**: +15 DH/month (optional)
  - AI-powered assistant

## Setup Steps

### 1. Create a Polar Account

1. Go to [polar.sh](https://polar.sh) and create an account
2. Create an organization for your OpenClass instance
3. Note your Organization ID from the dashboard

### 2. Get API Credentials

1. In Polar dashboard, go to Settings → API Keys
2. Create a new API key with the following permissions:
   - `subscriptions:read`
   - `subscriptions:write`
   - `customers:read`
   - `customers:write`
   - `products:read`
   - `products:write`
   - `checkouts:read`
   - `checkouts:write`
   - `invoices:read`
3. Copy the access token

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Polar Billing
POLAR_ACCESS_TOKEN=your_access_token_here
POLAR_ORGANIZATION_ID=your_org_id_here
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your_org_id_here

# App URL (for checkout redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### 4. Set Up Webhooks

1. In Polar dashboard, go to Settings → Webhooks
2. Create a new webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/polar`
   - Events to subscribe to:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.active`
     - `invoice.paid`
     - `invoice.payment_failed`
3. Save the webhook secret (optional, for signature verification)

### 5. Initialize Database Collections

The billing system uses two new Firestore collections:

- `subscriptions`: Stores subscription data
- `billingTransactions`: Stores payment history

These will be created automatically when the first subscription is created.

### 6. Update Organization Schema

The `organizations` collection has been extended with billing fields:

```typescript
{
  subscriptionId?: string
  subscriptionStatus?: "active" | "past_due" | "canceled" | "incomplete" | "trialing"
  videoFeatureEnabled?: boolean
  aiFeatureEnabled?: boolean
}
```

Existing organizations will need these fields added (they default to undefined).

## Usage

### For Organization Owners

1. Navigate to `/app/billing`
2. If no subscription exists, you'll see the setup page
3. Select desired features (video, AI)
4. Click "Continue to Payment"
5. Complete payment in Polar checkout
6. You'll be redirected back to the success page

### Managing Subscriptions

Organization owners can:

- Enable/disable video and AI features
- View billing history
- Update payment methods (via Polar customer portal)
- Cancel subscription (remains active until period end)
- Reactivate canceled subscriptions

### Feature Access Control

The billing system automatically enforces feature access:

- **Video channels**: Require active subscription with video enabled
- **AI assistant**: Requires active subscription with AI enabled
- **Base features**: Require active subscription (any status except canceled)

## API Reference

### Server Actions

#### `createSubscriptionAction(videoEnabled, aiEnabled)`
Creates a new subscription and returns checkout URL.

#### `updateSubscriptionFeaturesAction(videoEnabled, aiEnabled)`
Updates feature flags for existing subscription.

#### `cancelSubscriptionAction()`
Cancels subscription at period end.

#### `reactivateSubscriptionAction()`
Reactivates a canceled subscription.

#### `getOrganizationSubscriptionAction()`
Gets current subscription details.

#### `getBillingTransactionsAction()`
Gets billing transaction history.

#### `getCustomerPortalUrlAction()`
Gets URL to Polar customer portal.

#### `checkFeatureAccessAction(feature)`
Checks if organization has access to a feature.

### Middleware

#### `BillingMiddleware.requireActiveSubscription(orgId)`
Checks if organization has active subscription.

#### `BillingMiddleware.requireVideoAccess(orgId)`
Checks if organization has video feature enabled.

#### `BillingMiddleware.requireAIAccess(orgId)`
Checks if organization has AI feature enabled.

#### `BillingMiddleware.getSubscriptionStatus(orgId)`
Gets subscription status for display.

## Components

### `<BillingOverview />`
Main billing management interface for existing subscriptions.

### `<SubscriptionSetup />`
Initial subscription setup flow.

### `<FeatureLocked />`
Displays when user tries to access locked feature.

### `<SubscriptionStatusBadge />`
Shows subscription status in header/navigation.

## Testing

### Test Mode

Polar supports test mode for development:

1. Use test API keys from Polar dashboard
2. Use test credit cards (provided by Polar)
3. Webhooks will still fire in test mode

### Manual Testing Checklist

- [ ] Create new subscription
- [ ] Enable video feature
- [ ] Enable AI feature
- [ ] Disable features
- [ ] Cancel subscription
- [ ] Reactivate subscription
- [ ] Test video access with/without feature
- [ ] Test AI access with/without feature
- [ ] Verify webhook events are processed
- [ ] Check billing transaction records

## Troubleshooting

### Subscription not activating

1. Check webhook endpoint is accessible
2. Verify webhook events are being received
3. Check Firestore for subscription record
4. Review server logs for errors

### Feature access denied

1. Verify subscription status is "active" or "trialing"
2. Check feature flags in subscription record
3. Verify organization has subscriptionId set
4. Check billing middleware logic

### Payment failures

1. Check Polar dashboard for failed payments
2. Review `billingTransactions` collection
3. Verify webhook for `invoice.payment_failed` is processed
4. Check subscription status updated to "past_due"

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Webhook Signatures**: Implement signature verification in production
3. **Access Control**: Only organization owners can manage billing
4. **Feature Checks**: Always verify on server-side, never trust client

## Production Checklist

- [ ] Use production Polar API keys
- [ ] Set production webhook URL
- [ ] Configure webhook signature verification
- [ ] Set correct `NEXT_PUBLIC_APP_URL`
- [ ] Test all payment flows
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications (via Polar)
- [ ] Review Polar's terms of service
- [ ] Set up backup payment method collection

## Support

For issues with:
- **Polar integration**: Check [Polar documentation](https://docs.polar.sh)
- **OpenClass billing**: Review this guide and check server logs
- **Payment processing**: Contact Polar support

## Future Enhancements

Potential improvements:

- Annual billing option (with discount)
- Usage-based pricing for AI tokens
- Team/enterprise plans
- Free trial period
- Referral discounts
- Multiple payment methods
- Invoice customization
- Billing analytics dashboard
