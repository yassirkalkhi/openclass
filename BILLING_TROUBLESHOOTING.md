# Billing & Subscription Troubleshooting Guide

## Issue: AI Assistant Not Working Despite Payment

### Problem Description
Users cannot send messages to the AI assistant even after setting up billing. The paywall screen shows "This is a premium feature" instead of allowing access.

### Root Cause Analysis

The application checks for AI feature access in two places:

1. **Server-side** (in `src/app/actions/ai.ts` and `src/app/api/ai/stream/route.ts`):
   - Uses `BillingMiddleware.requireAIAccess(orgId)` 
   - Checks the `subscriptions` table for an active subscription with `aiFeatureEnabled: true`

2. **Client-side** (in `src/components/workspace/ai-assistant-view.tsx`):
   - Checks `organization?.aiFeatureEnabled` from the organization context
   - Shows paywall if this field is `false` or `undefined`

### Why It Fails

The subscription data flow works as follows:

```
Polar Webhook → Create/Update Subscription → Update Organization Fields
```

**The organization record must have these fields set:**
- `aiFeatureEnabled: true` 
- `videoFeatureEnabled: true`
- `subscriptionStatus: "active"`

**Common reasons for failure:**

1. **Webhook not received**: The Polar webhook endpoint (`/api/webhooks/polar`) may not have been called
2. **Webhook failed**: The webhook was called but encountered an error
3. **Organization not updated**: The subscription was created but the organization fields weren't updated
4. **Development environment**: Using Polar sandbox mode without proper webhook setup

## Solution 1: Check Current Status

Navigate to: **http://localhost:3000/app/test-billing**

This diagnostic page shows:
- Current user and organization IDs
- Organization billing fields
- Subscription record (if exists)
- AI and Video access check results
- Full subscription status

## Solution 2: Manual Activation (Development Only)

If you're in development and need to bypass Polar entirely:

### Option A: Use the Test Page
1. Go to **http://localhost:3000/app/test-billing**
2. Click **"Activate AI + Video"** button
3. Verify that the status now shows access granted
4. Go back to AI assistant and try sending a message

### Option B: Run Action Directly

```typescript
import { manuallyActivateFeaturesAction } from "@/app/actions/test-billing-fix"

// Activate both AI and Video
await manuallyActivateFeaturesAction(true, true)

// Activate only AI
await manuallyActivateFeaturesAction(true, false)

// Activate only Video  
await manuallyActivateFeaturesAction(false, true)
```

## Solution 3: Fix Webhook Integration (Production)

### Check Webhook Configuration

1. **Verify Polar webhook URL** is set to:
   ```
   https://your-domain.com/api/webhooks/polar
   ```

2. **Check webhook events** are enabled for:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`

3. **Test webhook manually** using Polar dashboard's webhook testing feature

### Verify Webhook Handler

The webhook handler at `src/app/api/webhooks/polar/route.ts` should:

1. Create subscription record in database
2. Update organization fields:
   ```typescript
   await organizationRepo.update(subscription.organizationId, {
     subscriptionStatus: status,
     videoFeatureEnabled: videoEnabled,
     aiFeatureEnabled: aiEnabled,
     updatedAt: new Date().toISOString(),
   })
   ```

### Debug Webhook Failures

Check server logs for webhook errors:
```bash
# Look for webhook processing errors
grep "webhook" logs/*.log

# Check for subscription creation errors  
grep "subscription.created" logs/*.log
```

## Solution 4: Database Direct Update

If you need to manually fix a specific organization in the database:

### Using Firebase Console

1. Go to Firebase Console → Firestore Database
2. Navigate to `organizations` collection
3. Find your organization document
4. Add/Update these fields:
   - `aiFeatureEnabled: true`
   - `videoFeatureEnabled: true`
   - `subscriptionStatus: "active"`
   - `subscriptionId: "sub_xxx"` (if you have one from Polar)

5. Navigate to `subscriptions` collection
6. Create or update subscription document:
   ```json
   {
     "id": "generated_id",
     "organizationId": "your_org_id",
     "polarSubscriptionId": "sub_from_polar",
     "polarCustomerId": "cust_from_polar",
     "status": "active",
     "videoFeatureEnabled": true,
     "aiFeatureEnabled": true,
     "currentPeriodStart": "2024-01-01T00:00:00.000Z",
     "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
     "cancelAtPeriodEnd": false,
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

## Verification Steps

After applying any fix:

1. **Refresh the app** (hard refresh: Ctrl+Shift+R)
2. **Check test page**: Navigate to `/app/test-billing`
3. **Verify AI Access** shows:
   ```json
   {
     "hasAccess": true,
     "reason": undefined
   }
   ```
4. **Try AI assistant**: Go to any class → AI Assistant → Send a message
5. **Check subscription status** shows:
   ```json
   {
     "hasSubscription": true,
     "isActive": true,
     "aiEnabled": true,
     "videoEnabled": true,
     "status": "active"
   }
   ```

## Common Errors

### "No subscription found"
- **Cause**: No record in `subscriptions` table
- **Fix**: Use manual activation or create subscription via webhook

### "AI feature is not enabled"  
- **Cause**: Subscription exists but `aiFeatureEnabled: false`
- **Fix**: Update subscription features via admin action or database

### "Your subscription has been canceled"
- **Cause**: Subscription status is "canceled"
- **Fix**: Reactivate via Polar or update status in database

### Paywall still shows after activation
- **Cause**: Client-side context not refreshed
- **Fix**: Hard refresh the page or log out and back in

## Prevention

To prevent this issue in production:

1. **Test webhook integration** thoroughly before launch
2. **Monitor webhook logs** for failures
3. **Set up webhook retry** mechanism
4. **Add admin panel** for manual subscription management
5. **Create automated tests** for subscription flow
6. **Set up alerts** for webhook failures

## Development Environment Setup

For local development without Polar webhooks:

1. Use the manual activation actions
2. Create development subscriptions in database
3. Use environment variable to bypass billing checks:
   ```env
   SKIP_BILLING_CHECKS=true  # Add this if needed
   ```

## Files Modified for Troubleshooting

- `src/app/actions/test-billing.ts` - Diagnostic action
- `src/app/actions/test-billing-fix.ts` - Manual activation actions
- `src/app/app/test-billing/page.tsx` - Diagnostic UI page

## Related Documentation

- [BILLING_SETUP.md](./BILLING_SETUP.md) - Initial billing setup
- [BILLING_MIGRATION.md](./BILLING_MIGRATION.md) - Migration guide
- [BILLING_QUICK_REFERENCE.md](./BILLING_QUICK_REFERENCE.md) - API reference
