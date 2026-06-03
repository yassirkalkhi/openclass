# Billing System Go-Live Checklist

Use this checklist to ensure your billing system is ready for production.

## Pre-Launch (1-2 weeks before)

### Polar Account Setup
- [ ] Create production Polar account
- [ ] Verify business information
- [ ] Complete KYC/verification process
- [ ] Set up payout account
- [ ] Configure tax settings
- [ ] Review Polar terms of service

### API Configuration
- [ ] Generate production API keys
- [ ] Store keys securely (never in code)
- [ ] Test API connection
- [ ] Verify organization ID
- [ ] Set up API rate limits awareness

### Environment Configuration
- [ ] Set `POLAR_ACCESS_TOKEN` in production
- [ ] Set `POLAR_ORGANIZATION_ID` in production
- [ ] Set `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` in production
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Verify all environment variables are set
- [ ] Remove any test/development keys

### Webhook Setup
- [ ] Configure production webhook URL
- [ ] Subscribe to all required events:
  - [ ] subscription.created
  - [ ] subscription.updated
  - [ ] subscription.canceled
  - [ ] subscription.active
  - [ ] invoice.paid
  - [ ] invoice.payment_failed
- [ ] Test webhook delivery
- [ ] Verify webhook endpoint is publicly accessible
- [ ] Set up webhook signature verification (optional but recommended)
- [ ] Configure webhook retry settings

### Database Preparation
- [ ] Create Firestore indexes for subscriptions
- [ ] Create Firestore indexes for billingTransactions
- [ ] Set up Firestore security rules for new collections
- [ ] Backup existing database
- [ ] Test database write permissions
- [ ] Verify database read permissions

### Code Review
- [ ] Review all billing-related code
- [ ] Check error handling
- [ ] Verify access control logic
- [ ] Review webhook handler
- [ ] Check for hardcoded values
- [ ] Verify TypeScript types
- [ ] Run linter
- [ ] Fix all warnings

### Testing
- [ ] Test subscription creation flow
- [ ] Test payment processing
- [ ] Test webhook processing
- [ ] Test feature access control
- [ ] Test video feature gating
- [ ] Test AI feature gating
- [ ] Test subscription updates
- [ ] Test cancellation flow
- [ ] Test reactivation flow
- [ ] Test customer portal access
- [ ] Test with different payment methods
- [ ] Test payment failures
- [ ] Test edge cases

### UI/UX Review
- [ ] Review billing page design
- [ ] Check mobile responsiveness
- [ ] Test all buttons and links
- [ ] Verify error messages are clear
- [ ] Check loading states
- [ ] Test success/failure notifications
- [ ] Review pricing display
- [ ] Check feature descriptions
- [ ] Verify status badges
- [ ] Test feature locked screens

### Documentation
- [ ] Update user documentation
- [ ] Create billing FAQ
- [ ] Document pricing clearly
- [ ] Explain feature differences
- [ ] Document cancellation policy
- [ ] Create refund policy
- [ ] Update terms of service
- [ ] Update privacy policy

### Legal & Compliance
- [ ] Review terms of service
- [ ] Update privacy policy for billing data
- [ ] Ensure GDPR compliance
- [ ] Set up data retention policies
- [ ] Configure data export capabilities
- [ ] Review refund policy
- [ ] Check local regulations
- [ ] Consult legal counsel if needed

### Communication Plan
- [ ] Draft announcement email
- [ ] Prepare in-app notifications
- [ ] Create billing FAQ page
- [ ] Prepare support team
- [ ] Create support documentation
- [ ] Set up support email/channel
- [ ] Plan social media announcements
- [ ] Prepare press release (if applicable)

## Launch Day

### Final Checks
- [ ] Verify production environment variables
- [ ] Test webhook endpoint one more time
- [ ] Check Polar dashboard access
- [ ] Verify database backups are current
- [ ] Review monitoring dashboards
- [ ] Ensure support team is ready
- [ ] Have rollback plan ready

### Deployment
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Check application health
- [ ] Test webhook endpoint
- [ ] Create test subscription
- [ ] Verify test subscription works
- [ ] Delete test subscription

### Monitoring Setup
- [ ] Set up error tracking
- [ ] Configure webhook failure alerts
- [ ] Set up payment failure alerts
- [ ] Monitor subscription creation rate
- [ ] Track payment success rate
- [ ] Set up revenue tracking
- [ ] Configure uptime monitoring

### Communication
- [ ] Send announcement email
- [ ] Post in-app notification
- [ ] Update website/landing page
- [ ] Post on social media
- [ ] Notify support team
- [ ] Update status page

## Post-Launch (First 24 hours)

### Monitoring
- [ ] Monitor webhook processing
- [ ] Check for errors in logs
- [ ] Track subscription creation rate
- [ ] Monitor payment success rate
- [ ] Watch for support tickets
- [ ] Check user feedback
- [ ] Monitor server performance
- [ ] Track feature usage

### Quick Fixes
- [ ] Address any critical bugs immediately
- [ ] Respond to support tickets quickly
- [ ] Update documentation if needed
- [ ] Fix any UI issues
- [ ] Adjust error messages if unclear

## Post-Launch (First Week)

### Analysis
- [ ] Review subscription metrics
- [ ] Analyze payment success rate
- [ ] Check feature adoption rates
- [ ] Review support ticket themes
- [ ] Analyze user feedback
- [ ] Check for drop-off points
- [ ] Review webhook processing logs

### Optimization
- [ ] Fix any identified issues
- [ ] Improve error messages
- [ ] Update documentation based on feedback
- [ ] Optimize slow queries
- [ ] Improve UI based on feedback
- [ ] Add missing features if critical

### Communication
- [ ] Send follow-up email
- [ ] Address common questions
- [ ] Update FAQ based on questions
- [ ] Thank early adopters
- [ ] Share success metrics

## Ongoing Maintenance

### Daily
- [ ] Monitor webhook processing
- [ ] Check for payment failures
- [ ] Review error logs
- [ ] Respond to support tickets

### Weekly
- [ ] Review subscription metrics
- [ ] Analyze revenue
- [ ] Check churn rate
- [ ] Review feature adoption
- [ ] Update documentation if needed

### Monthly
- [ ] Reconcile revenue with Polar
- [ ] Review and optimize pricing
- [ ] Analyze user feedback
- [ ] Plan feature improvements
- [ ] Review security
- [ ] Update dependencies

### Quarterly
- [ ] Comprehensive security audit
- [ ] Review and update legal documents
- [ ] Analyze long-term trends
- [ ] Plan major improvements
- [ ] Review competitor pricing
- [ ] Consider new features

## Emergency Procedures

### Webhook Failures
1. Check Polar webhook logs
2. Verify endpoint is accessible
3. Check server logs for errors
4. Manually sync affected subscriptions
5. Fix underlying issue
6. Monitor for recurrence

### Payment Processing Issues
1. Check Polar dashboard
2. Verify API credentials
3. Check for Polar service issues
4. Contact Polar support if needed
5. Communicate with affected users
6. Provide alternative payment method

### Database Issues
1. Check Firestore status
2. Verify permissions
3. Check for quota limits
4. Review recent changes
5. Restore from backup if needed
6. Contact Firebase support

### Rollback Plan
1. Disable billing enforcement
2. Revert to previous deployment
3. Communicate with users
4. Fix issues in staging
5. Re-test thoroughly
6. Re-deploy when ready

## Success Criteria

The launch is successful if:
- [ ] Subscription creation works smoothly
- [ ] Payment processing is reliable (>95% success rate)
- [ ] Webhooks are processed correctly
- [ ] Feature access control works properly
- [ ] No critical bugs reported
- [ ] Support ticket volume is manageable
- [ ] User feedback is positive
- [ ] Revenue tracking is accurate

## Red Flags

Stop and investigate if:
- ❌ Payment success rate < 90%
- ❌ Webhook processing failures > 5%
- ❌ Critical bugs affecting payments
- ❌ High volume of support tickets
- ❌ Negative user feedback
- ❌ Security vulnerabilities discovered
- ❌ Legal compliance issues

## Contact Information

Keep these handy:
- **Polar Support**: support@polar.sh
- **Polar Dashboard**: https://polar.sh/dashboard
- **Firebase Support**: https://firebase.google.com/support
- **Internal DevOps**: [your contact]
- **Legal Team**: [your contact]
- **Support Team Lead**: [your contact]

## Notes

Use this space for launch-specific notes:

---

**Launch Date**: _______________

**Launched By**: _______________

**Issues Encountered**:
- 
- 
- 

**Lessons Learned**:
- 
- 
- 

**Follow-up Actions**:
- 
- 
- 

---

## Celebration! 🎉

Once everything is running smoothly:
- [ ] Celebrate with the team
- [ ] Share success metrics
- [ ] Thank everyone involved
- [ ] Plan next improvements
- [ ] Document lessons learned

Good luck with your launch!
