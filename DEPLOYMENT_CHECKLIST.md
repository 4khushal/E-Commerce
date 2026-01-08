# Production Deployment Checklist

Use this checklist to ensure everything is configured correctly before going live.

## Pre-Deployment

### Environment Variables
- [ ] Frontend `.env` file created with production values
- [ ] Backend `server/.env` file created with production values
- [ ] All `VITE_*` variables set in Vercel
- [ ] All backend variables set in hosting platform
- [ ] No development/test keys in production

### Supabase
- [ ] Production Supabase project created
- [ ] Database schema applied (`supabase-schema.sql`)
- [ ] RLS policies applied (all fix-*.sql files)
- [ ] Storage bucket created for product images
- [ ] Storage policies configured
- [ ] Test connection from production frontend

### Stripe
- [ ] Stripe account switched to Live mode
- [ ] Production API keys obtained
- [ ] Webhook endpoint configured
- [ ] Webhook events selected:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
- [ ] Webhook secret copied to backend `.env`
- [ ] Test payment with Stripe test card

### Security
- [ ] CORS configured correctly
- [ ] Security headers enabled
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] API keys not exposed in client code
- [ ] Rate limiting configured (if applicable)
- [ ] Error messages don't expose sensitive info

## Deployment

### Frontend (Vercel)
- [ ] User dashboard deployed to Vercel
- [ ] Admin dashboard deployed to Vercel (separate project)
- [ ] Environment variables added in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] Build successful without errors
- [ ] Both dashboards accessible

### Backend (Railway/Render/Heroku)
- [ ] Backend server deployed
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] Health endpoint working: `/health`
- [ ] API endpoints accessible
- [ ] CORS allows frontend URLs

## Post-Deployment Testing

### User Dashboard
- [ ] Homepage loads
- [ ] Products display correctly
- [ ] User can register/login
- [ ] Cart functionality works
- [ ] Checkout flow works
- [ ] Payment processing works
- [ ] Order confirmation displays
- [ ] Profile page works
- [ ] Orders page shows orders

### Admin Dashboard
- [ ] Admin login works
- [ ] Products management works
- [ ] Orders management works
- [ ] Order details display correctly
- [ ] Product images load
- [ ] Status updates work
- [ ] SMS notifications work (if configured)

### Backend API
- [ ] Health check: `GET /health`
- [ ] Stripe checkout: `POST /api/create-checkout-session`
- [ ] Session retrieval: `GET /api/checkout-session/:id`
- [ ] Webhook endpoint: `POST /api/stripe-webhook`
- [ ] SMS endpoint: `POST /api/send-sms` (if configured)

### Integration Tests
- [ ] Complete purchase flow end-to-end
- [ ] Order appears in admin dashboard
- [ ] Customer receives confirmation
- [ ] Payment appears in Stripe dashboard
- [ ] Order data saved correctly in Supabase

## Monitoring Setup

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring set up
- [ ] Stripe webhook monitoring enabled
- [ ] Supabase dashboard monitoring
- [ ] Vercel analytics enabled

## Documentation

- [ ] Production URLs documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Support contacts documented

## Final Checks

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] No console errors in server logs
- [ ] Performance is acceptable
- [ ] Images load correctly
- [ ] Mobile responsive
- [ ] Cross-browser tested

## Go Live

- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate active
- [ ] All team members notified
- [ ] Backup plan ready
- [ ] Support channels ready

---

**Remember**: Test thoroughly in a staging environment before deploying to production!
