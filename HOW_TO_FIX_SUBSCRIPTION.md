# Quick Fix: Subscription Not Showing

## The Problem
You have an active subscription in Polar, but your app shows "No subscription found" or prompts you to create a new subscription.

## The Quick Fix (3 Steps)

### Step 1: Navigate to the Sync Tool
Go to: **http://localhost:3000/app/billing/sync**

Or from the billing page, click the link: "Already have a subscription? Click here to sync"

### Step 2: Run Diagnostic
Click the **"Run Diagnostic"** button. This will:
- Check your local database for subscription records
- Query Polar for subscriptions associated with your email
- Show you the comparison

### Step 3: Sync Your Subscription
If the diagnostic shows:
- ✗ Local Subscription: Not Found
- ✓ Polar Subscriptions: 1 or more active subscriptions

Then click the **"Sync This Subscription"** button next to the active subscription.

The sync will:
1. Create the subscription record in your local database
2. Update your organization with the correct subscription status
3. Enable the features (video/AI) based on your subscription

### Step 4: Verify
Navigate back to `/app/billing` and you should now see your active subscription!

## What This Actually Does

The sync tool:
1. Looks up your email in Polar's customer database
2. Fetches all subscriptions for your customer ID
3. Takes the active subscription and creates a matching record in your local database
4. Updates your organization to enable the features you paid for

## Why Did This Happen?

Your app uses webhooks from Polar to automatically sync subscriptions. If:
- Webhooks weren't configured when you created the subscription
- A webhook event was missed
- There was a network issue during webhook delivery

Then your local database never got the subscription data, even though Polar knows you have an active subscription.

## Preventing This in the Future

Make sure Polar webhooks are configured:
1. Polar Dashboard → Settings → Webhooks
2. Webhook URL: `https://your-domain.com/api/webhooks/polar`
3. Enable events: `subscription.*` and `invoice.*`

## Still Having Issues?

Check the browser console and server logs for errors. Common issues:
- `POLAR_ACCESS_TOKEN` not set in `.env.local`
- Wrong Polar environment (sandbox vs production)
- Network connectivity to Polar API
- Email mismatch between your account and Polar customer

## Need More Help?

See `SUBSCRIPTION_SYNC_FIX.md` for technical details and troubleshooting.
