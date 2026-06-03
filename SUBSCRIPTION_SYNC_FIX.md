# Subscription Sync Issue Fix

## Problem
You have an active subscription in Polar, but the app shows "No active subscription" because the subscription data hasn't been synced to your local database.

## Root Cause
The app relies on webhook events from Polar to create subscription records in the local database. If:
- Webhooks weren't configured properly
- Webhook events were missed
- The subscription was created before webhooks were set up

Then your local database won't have the subscription record, even though it exists in Polar.

## Solution

### Option 1: Use the Sync Diagnostic Tool (Recommended)

1. Navigate to `/app/billing/sync` or click "Already have a subscription? Click here to sync" on the billing setup page
2. Click "Run Diagnostic" to check the status
3. The tool will show:
   - Whether you have a local subscription record
   - All subscriptions found in Polar for your email
4. If an active subscription is found in Polar but not locally, click "Sync This Subscription"
5. The subscription will be synced to your local database
6. Navigate back to `/app/billing` to see your active subscription

### Option 2: Manual Server Action

You can also call the sync action directly from code:

```typescript
import { syncSubscriptionFromPolarAction } from "@/app/actions/sync-subscription"

// Get the Polar subscription ID first
const result = await syncSubscriptionFromPolarAction(polarSubscriptionId)
```

## Files Created/Modified

### New Files
- `src/app/actions/sync-subscription.ts` - Server actions for diagnosing and syncing subscriptions
- `src/app/app/billing/sync/page.tsx` - UI for the sync diagnostic tool
- `src/components/ui/alert.tsx` - Alert component (if missing)

### Modified Files
- `src/components/billing/subscription-setup.tsx` - Added link to sync page

## Technical Details

### What the Sync Does

1. **Diagnosis** (`diagnoseSubscriptionAction`):
   - Checks your local database for a subscription record
   - Queries Polar API for subscriptions matching your email
   - Returns comparison of local vs Polar state

2. **Sync** (`syncSubscriptionFromPolarAction`):
   - Fetches subscription details from Polar API
   - Creates or updates subscription record in local database
   - Updates organization record with subscription status and features
   - Extracts feature flags (video, AI) from subscription metadata

### Database Tables Updated

- `subscriptions` - Creates/updates subscription record
- `organizations` - Updates subscription status and feature flags

## Webhook Configuration

To prevent this issue in the future, ensure Polar webhooks are properly configured:

1. Go to Polar dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/polar`
3. Enable these events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.active`
   - `invoice.paid`
   - `invoice.payment_failed`

## Testing

To test the sync:

```bash
# Navigate to the sync page
http://localhost:3000/app/billing/sync

# Run diagnostic
# If subscription found in Polar but not locally, sync it
```

## Future Improvements

Consider adding:
- Automatic sync on login if subscription missing
- Periodic background sync job
- Better error handling for Polar API failures
- Admin panel to sync subscriptions for all organizations
