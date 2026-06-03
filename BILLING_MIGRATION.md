# Billing System Migration Guide

This guide helps you migrate your existing OpenClass installation to include the billing system.

## Overview

The billing system adds:
- Two new Firestore collections: `subscriptions` and `billingTransactions`
- New fields to the `organizations` collection
- Billing enforcement for video and AI features

## Migration Steps

### Step 1: Update Environment Variables

Add the following to your `.env.local`:

```env
# Polar Billing
POLAR_ACCESS_TOKEN=your_access_token_here
POLAR_ORGANIZATION_ID=your_org_id_here
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your_org_id_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 2: Update Organization Documents

Existing organizations need new billing fields. You can either:

**Option A: Manual Update (Recommended for small deployments)**

For each organization in Firestore, add these fields:

```javascript
{
  subscriptionId: null,
  subscriptionStatus: null,
  videoFeatureEnabled: false,
  aiFeatureEnabled: false
}
```

**Option B: Migration Script**

Create and run this migration script:

```typescript
// scripts/migrate-organizations.ts
import { db } from "@/lib/firebase/firebase-admin"

async function migrateOrganizations() {
  const orgsRef = db.collection("organizations")
  const snapshot = await orgsRef.get()
  
  const batch = db.batch()
  let count = 0
  
  snapshot.docs.forEach((doc) => {
    const data = doc.data()
    
    // Only update if fields don't exist
    if (!data.hasOwnProperty('subscriptionId')) {
      batch.update(doc.ref, {
        subscriptionId: null,
        subscriptionStatus: null,
        videoFeatureEnabled: false,
        aiFeatureEnabled: false,
        updatedAt: new Date().toISOString()
      })
      count++
    }
  })
  
  if (count > 0) {
    await batch.commit()
    console.log(`✅ Migrated ${count} organizations`)
  } else {
    console.log("✅ No organizations need migration")
  }
}

migrateOrganizations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  })
```

Run with:
```bash
npx tsx scripts/migrate-organizations.ts
```

### Step 3: Create Firestore Indexes (Optional)

For better query performance, create these indexes:

**subscriptions collection:**
- `organizationId` (Ascending)
- `polarSubscriptionId` (Ascending)
- `status` (Ascending)

**billingTransactions collection:**
- `organizationId` (Ascending) + `createdAt` (Descending)
- `subscriptionId` (Ascending) + `createdAt` (Descending)
- `status` (Ascending)

You can create these in the Firebase Console or they'll be auto-created when queries run.

### Step 4: Set Up Polar Webhooks

1. Go to your Polar dashboard
2. Navigate to Settings → Webhooks
3. Add webhook endpoint: `https://your-domain.com/api/webhooks/polar`
4. Subscribe to these events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.active`
   - `invoice.paid`
   - `invoice.payment_failed`

### Step 5: Handle Existing Organizations

You have several options for existing organizations:

**Option A: Grace Period**
- Allow existing orgs to continue without billing for X days
- Send notification emails about upcoming billing requirement
- Implement a grace period check in billing middleware

**Option B: Grandfather Existing Orgs**
- Create free subscriptions for existing organizations
- Use a special "legacy" plan in Polar
- Mark these orgs with a special flag

**Option C: Immediate Enforcement**
- Require all orgs to set up billing immediately
- Show billing setup page on next login
- Block feature access until subscription is active

### Step 6: Test the Integration

1. Create a test organization
2. Set up a subscription with test payment
3. Verify webhook events are received
4. Test video feature access
5. Test AI feature access
6. Test subscription updates
7. Test cancellation flow

## Rollback Plan

If you need to rollback the billing system:

### 1. Disable Billing Checks

Comment out billing middleware checks in:
- `src/app/actions/video-room.ts`
- `src/app/actions/ai.ts`

### 2. Remove Billing UI

Remove or hide:
- Billing menu items
- Subscription status badges
- Feature locked screens

### 3. Keep Data

Don't delete the `subscriptions` or `billingTransactions` collections - you may need them later.

## Gradual Rollout Strategy

For large deployments, consider a gradual rollout:

### Phase 1: Soft Launch (Week 1)
- Deploy billing system
- Make it optional (no enforcement)
- Allow orgs to voluntarily set up billing
- Monitor for issues

### Phase 2: Notification (Week 2-3)
- Send emails to all org owners
- Show in-app notifications about upcoming requirement
- Provide clear timeline

### Phase 3: Grace Period (Week 4-5)
- Start showing warnings for orgs without billing
- Allow continued access but with reminders
- Provide support for setup issues

### Phase 4: Enforcement (Week 6+)
- Enable full billing enforcement
- Block feature access for non-paying orgs
- Provide clear upgrade paths

## Monitoring

After migration, monitor:

1. **Subscription Creation Rate**
   - Track how many orgs set up billing
   - Identify drop-off points

2. **Payment Failures**
   - Monitor `invoice.payment_failed` webhooks
   - Set up alerts for high failure rates

3. **Feature Access Denials**
   - Log when users hit billing walls
   - Track which features are most affected

4. **Support Tickets**
   - Monitor billing-related support requests
   - Update documentation based on common issues

## Common Issues

### Issue: Webhooks not received

**Solution:**
- Verify webhook URL is publicly accessible
- Check Polar webhook logs
- Ensure no firewall blocking
- Test with Polar's webhook testing tool

### Issue: Subscription not activating

**Solution:**
- Check webhook endpoint logs
- Verify Firestore write permissions
- Check for errors in webhook handler
- Manually verify subscription in Polar dashboard

### Issue: Feature access denied despite active subscription

**Solution:**
- Check subscription status in Firestore
- Verify feature flags are set correctly
- Check organization has correct subscriptionId
- Review billing middleware logic

### Issue: Payment method update not working

**Solution:**
- Verify customer portal URL generation
- Check Polar customer session creation
- Ensure customer ID is correct
- Test with different browsers

## Support Checklist

Prepare your support team with:

- [ ] Access to Polar dashboard
- [ ] Firestore read access for debugging
- [ ] Documentation on subscription statuses
- [ ] Scripts to check org billing status
- [ ] Process for manual subscription fixes
- [ ] Escalation path for payment issues

## Post-Migration Tasks

After successful migration:

1. **Update Documentation**
   - Add billing info to user docs
   - Update onboarding guides
   - Create billing FAQ

2. **Set Up Monitoring**
   - Configure alerts for failed payments
   - Track subscription metrics
   - Monitor revenue

3. **Plan for Scale**
   - Review Polar rate limits
   - Plan for high-volume scenarios
   - Consider caching subscription status

4. **Compliance**
   - Review data privacy implications
   - Update terms of service
   - Ensure GDPR compliance for billing data

## Emergency Contacts

Keep these handy:
- Polar support: support@polar.sh
- Your Polar account manager (if applicable)
- Internal DevOps team
- Database administrator

## Useful Queries

### Check organizations without subscriptions
```typescript
const orgs = await db.collection('organizations')
  .where('subscriptionId', '==', null)
  .get()
```

### Find failed payments
```typescript
const failed = await db.collection('billingTransactions')
  .where('status', '==', 'failed')
  .get()
```

### List active subscriptions
```typescript
const active = await db.collection('subscriptions')
  .where('status', '==', 'active')
  .get()
```

## Timeline Example

**Week 1: Preparation**
- Set up Polar account
- Configure webhooks
- Test in staging

**Week 2: Soft Launch**
- Deploy to production
- No enforcement
- Monitor for issues

**Week 3: Communication**
- Email all org owners
- In-app notifications
- Update documentation

**Week 4-5: Grace Period**
- Show warnings
- Provide support
- Track adoption

**Week 6: Full Enforcement**
- Enable billing checks
- Monitor closely
- Provide quick support

## Success Metrics

Track these to measure migration success:

- **Adoption Rate**: % of orgs with active subscriptions
- **Payment Success Rate**: % of successful payments
- **Support Ticket Volume**: Billing-related tickets
- **Feature Usage**: Video/AI usage before and after
- **Revenue**: Monthly recurring revenue
- **Churn Rate**: Subscription cancellations

## Conclusion

This migration adds significant value by:
- Enabling sustainable revenue
- Providing clear feature tiers
- Improving resource allocation
- Supporting business growth

Take it slow, monitor closely, and provide excellent support during the transition.
