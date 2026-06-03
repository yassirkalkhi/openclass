# Quick Fix: AI Assistant Not Working After Payment

## Problem
You can't send messages to the AI assistant even though you've set up billing/payment.

## Instant Solution (5 seconds)

1. Start your development server (if not running):
   ```bash
   npm run dev
   ```

2. Open this URL in your browser:
   ```
   http://localhost:3000/app/test-billing
   ```

3. Click the button: **"Activate AI + Video"**

4. Wait for success message

5. Go back to any class and open the AI Assistant

6. Try sending a message - it should work now! 🎉

## What Happened?

The app checks for an active subscription in two places:
- **Database subscription table** (checked by server)
- **Organization record** (checked by UI)

When you use Polar for payments, webhooks should automatically update these records. However:
- In development, webhooks might not be configured
- The webhook might have failed
- The organization fields weren't updated

The "Activate AI + Video" button:
1. Creates or updates the subscription record
2. Updates the organization's feature flags
3. Bypasses Polar completely (for development)

## Verify It's Working

After clicking the activation button, you should see:

### ✅ AI Access Check (Green)
```json
{
  "hasAccess": true
}
```

### ✅ Organization Data
```json
{
  "aiFeatureEnabled": true,
  "videoFeatureEnabled": true,
  "subscriptionStatus": "active"
}
```

## What If It Still Doesn't Work?

1. **Hard refresh** your browser (Ctrl + Shift + R or Cmd + Shift + R)
2. **Clear cookies** and log in again
3. Check the test page again to verify the status
4. Read [BILLING_TROUBLESHOOTING.md](./BILLING_TROUBLESHOOTING.md) for detailed debugging

## For Production

This manual activation is for **development only**. In production:
- Configure Polar webhooks properly
- Point webhook URL to: `https://your-domain.com/api/webhooks/polar`
- Test the webhook integration
- Monitor webhook logs

See [BILLING_TROUBLESHOOTING.md](./BILLING_TROUBLESHOOTING.md) for production setup.

## Other Options on Test Page

- **Activate AI Only** - Enable only AI assistant
- **Activate Video Only** - Enable only video chat
- **Deactivate All** - Remove all premium features
- **Refresh Test** - Check current billing status

## Need Help?

Check these files:
- [BILLING_TROUBLESHOOTING.md](./BILLING_TROUBLESHOOTING.md) - Complete troubleshooting guide
- [BILLING_SETUP.md](./BILLING_SETUP.md) - Initial setup instructions
- [BILLING_QUICK_REFERENCE.md](./BILLING_QUICK_REFERENCE.md) - API reference
