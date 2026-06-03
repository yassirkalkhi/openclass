# OpenClass Billing System

Complete billing integration for OpenClass using Polar.

## 📋 Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Add your Polar credentials
   ```

3. **Set up Polar**
   - Create account at [polar.sh](https://polar.sh)
   - Get API credentials
   - Configure webhooks

4. **Deploy**
   ```bash
   pnpm build
   pnpm start
   ```

## 💰 Pricing

| Plan | Monthly Cost | Features |
|------|-------------|----------|
| **Base** | 200 DH | Classes, channels, messaging, assignments, resources |
| **+ Video** | +15 DH | Video calls and conferences |
| **+ AI** | +15 DH | AI-powered assistant |

**Examples:**
- Base only: **200 DH/month**
- Base + Video: **215 DH/month**
- Base + AI: **215 DH/month**
- Base + Video + AI: **230 DH/month**

## 📚 Documentation

### For Setup & Deployment
- **[BILLING_SETUP.md](./BILLING_SETUP.md)** - Complete setup guide
- **[BILLING_GO_LIVE_CHECKLIST.md](./BILLING_GO_LIVE_CHECKLIST.md)** - Pre-launch checklist

### For Migration
- **[BILLING_MIGRATION.md](./BILLING_MIGRATION.md)** - Migrate existing installations

### For Development
- **[BILLING_QUICK_REFERENCE.md](./BILLING_QUICK_REFERENCE.md)** - Developer quick reference
- **[BILLING_IMPLEMENTATION_SUMMARY.md](./BILLING_IMPLEMENTATION_SUMMARY.md)** - Technical overview

## 🏗️ Architecture

```
┌─────────────────┐
│   User (UI)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js App    │
│  - Pages        │
│  - Actions      │
│  - Components   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│  Firestore  │  │    Polar     │
│  - subs     │  │  - payments  │
│  - trans    │  │  - webhooks  │
└─────────────┘  └──────────────┘
```

## 🔑 Key Features

### ✅ Subscription Management
- Create subscriptions with Polar checkout
- Toggle video and AI features
- Cancel/reactivate subscriptions
- Self-service customer portal

### ✅ Feature Access Control
- Automatic video feature gating
- Automatic AI feature gating
- Real-time access validation
- Clear upgrade prompts

### ✅ Payment Processing
- Secure payment via Polar
- Automatic invoice generation
- Payment failure handling
- Transaction history

### ✅ Webhook Integration
- Real-time subscription updates
- Payment status tracking
- Automatic feature provisioning
- Failure notifications

## 📁 File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── billing.ts              # Server actions
│   ├── api/
│   │   └── webhooks/
│   │       └── polar/
│   │           └── route.ts        # Webhook handler
│   └── app/
│       └── billing/
│           ├── page.tsx            # Billing page
│           └── success/
│               └── page.tsx        # Success page
├── components/
│   └── billing/
│       ├── billing-overview.tsx    # Main billing UI
│       ├── subscription-setup.tsx  # Setup flow
│       ├── feature-locked.tsx      # Locked screen
│       └── subscription-status-badge.tsx
├── lib/
│   ├── services/
│   │   └── billing-service.ts      # Polar integration
│   ├── repositories/
│   │   ├── subscription-repository.ts
│   │   └── billing-transaction-repository.ts
│   ├── middleware/
│   │   └── billing-middleware.ts   # Access control
│   ├── types/
│   │   └── database.ts             # Extended types
│   └── utils/
│       └── billing-utils.ts        # Helper functions
```

## 🚀 Usage

### For Users

1. **Set Up Billing**
   - Navigate to `/app/billing`
   - Select desired features
   - Complete payment

2. **Manage Subscription**
   - View billing page
   - Toggle features
   - Update payment method
   - Cancel if needed

### For Developers

```typescript
// Check feature access
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"

const { hasAccess } = await BillingMiddleware.requireVideoAccess(orgId)

// Get subscription status
const status = await BillingMiddleware.getSubscriptionStatus(orgId)

// Create subscription
import { createSubscriptionAction } from "@/app/actions/billing"

const result = await createSubscriptionAction(videoEnabled, aiEnabled)
```

## 🔒 Security

- ✅ Server-side access control
- ✅ API keys stored securely
- ✅ Owner-only billing management
- ✅ Webhook signature verification (optional)
- ✅ HTTPS required for webhooks

## 🧪 Testing

### Test Subscription
```bash
# Use Polar test mode
# Use test credit cards from Polar docs
# Webhooks work in test mode
```

### Test Checklist
- [ ] Create subscription
- [ ] Enable/disable features
- [ ] Cancel subscription
- [ ] Process payment
- [ ] Handle payment failure
- [ ] Verify webhooks

## 📊 Monitoring

### Key Metrics
- Active subscriptions
- Monthly recurring revenue (MRR)
- Payment success rate
- Feature adoption
- Churn rate

### Alerts
- Payment failures
- Webhook errors
- High churn
- Low adoption

## 🐛 Troubleshooting

### Webhook not received
1. Check URL is publicly accessible
2. Verify in Polar dashboard
3. Check server logs
4. Test with Polar's tool

### Feature access denied
1. Check subscription status
2. Verify feature flags
3. Check organization link
4. Review middleware logic

### Payment not processing
1. Check Polar dashboard
2. Verify payment method
3. Check for service issues
4. Review transaction logs

## 🔄 Updates

### Adding New Features
1. Add feature flag to subscription
2. Update pricing in BillingService
3. Add access check in middleware
4. Update UI components
5. Update documentation

### Changing Pricing
1. Update BILLING_PLANS in BillingService
2. Update UI displays
3. Communicate to users
4. Handle existing subscriptions

## 📞 Support

### For Technical Issues
- Check documentation files
- Review server logs
- Check Polar dashboard
- Contact Polar support

### For Business Issues
- Review pricing strategy
- Analyze metrics
- Gather user feedback
- Adjust as needed

## 🎯 Roadmap

### Planned Improvements
- [ ] Annual billing option
- [ ] Usage-based AI pricing
- [ ] Team/enterprise plans
- [ ] Free trial period
- [ ] Referral program
- [ ] Multiple payment methods
- [ ] Invoice customization
- [ ] Analytics dashboard

## 📄 License

Same as OpenClass main license.

## 🤝 Contributing

When contributing to billing:
1. Test thoroughly
2. Update documentation
3. Follow security best practices
4. Consider backward compatibility
5. Update tests

## ✨ Credits

- **Payment Processing**: [Polar](https://polar.sh)
- **Database**: Firebase Firestore
- **Framework**: Next.js
- **UI Components**: shadcn/ui

## 📝 Changelog

### v1.0.0 (Initial Release)
- ✅ Subscription management
- ✅ Feature gating (video, AI)
- ✅ Payment processing
- ✅ Webhook integration
- ✅ Customer portal
- ✅ Transaction history
- ✅ Comprehensive documentation

---

**Need Help?** Check the documentation files or contact support.

**Ready to Launch?** Follow the [Go-Live Checklist](./BILLING_GO_LIVE_CHECKLIST.md).
