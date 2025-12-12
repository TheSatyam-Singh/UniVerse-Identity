# Deployment Checklist

Use this checklist to ensure a smooth deployment of UniVerse Identity.

## Pre-Deployment

### Security
- [ ] Generate RSA keys using `npm run setup:keys`
- [ ] Ensure `.env` file is not committed to Git
- [ ] Store RSA keys securely (password manager, secrets manager)
- [ ] Review all security settings in code
- [ ] Verify HTTPS is enforced in production

### Database
- [ ] Create Neon Postgres database
- [ ] Copy connection string to `.env`
- [ ] Run `npm run prisma:push` to create tables
- [ ] Verify database connection works

### External Services
- [ ] Set up Upstash Redis account (optional but recommended)
- [ ] Set up Brevo account for email
- [ ] Get API keys for all services
- [ ] Test email sending locally

### Code
- [ ] Run `npm run build` locally to verify build works
- [ ] Test authentication flows locally
- [ ] Create test OAuth client
- [ ] Verify all environment variables are set

## Vercel Deployment

### Initial Setup
- [ ] Push code to GitHub
- [ ] Import repository to Vercel
- [ ] Configure build settings (defaults should work)

### Environment Variables
Add all these variables in Vercel dashboard:

#### Database
- [ ] `DATABASE_URL` - Neon Postgres connection string

#### Redis (Optional)
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

#### Email (Optional)
- [ ] `BREVO_API_KEY`
- [ ] `BREVO_SENDER_EMAIL`
- [ ] `BREVO_SENDER_NAME`

#### JWT & Security
- [ ] `JWT_PRIVATE_KEY` - Copy from `.env.generated`
- [ ] `JWT_PUBLIC_KEY` - Copy from `.env.generated`
- [ ] `SESSION_SECRET` - Copy from `.env.generated`

#### App URLs (Update after first deployment)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel domain
- [ ] `APP_URL` - Same as above
- [ ] `OAUTH_ISSUER` - Same as above

### Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for deployment to complete
- [ ] Copy your Vercel domain

### Post-Deployment
- [ ] Update URL environment variables with Vercel domain
- [ ] Redeploy to apply new URLs
- [ ] Test signup/login flow
- [ ] Test email verification
- [ ] Test OAuth2 flow

## DNS Configuration (Optional)

### Cloudflare Setup
- [ ] Add domain to Cloudflare
- [ ] Set up DNS records:
  - Type: CNAME
  - Name: @ (or subdomain)
  - Content: `cname.vercel-dns.com`
  - Proxy status: DNS only (orange cloud off)
- [ ] Add domain in Vercel dashboard
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Update environment variables with custom domain
- [ ] Redeploy

## Testing in Production

### Authentication
- [ ] Sign up with new account
- [ ] Verify email received
- [ ] Click verification link
- [ ] Log in with credentials
- [ ] Test magic link login
- [ ] Test logout

### OAuth2/OIDC
- [ ] Create OAuth client via Prisma Studio
- [ ] Test authorization endpoint
- [ ] Test consent screen
- [ ] Test token exchange
- [ ] Test refresh token flow
- [ ] Test userinfo endpoint
- [ ] Verify JWKS endpoint
- [ ] Check `.well-known/openid-configuration`

### Security
- [ ] Verify HTTPS is working
- [ ] Check HTTPOnly cookies are set
- [ ] Test rate limiting (if configured)
- [ ] Verify CORS settings
- [ ] Check for sensitive data in logs

## Monitoring

### Setup Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor database performance
- [ ] Track API usage

### Regular Maintenance
- [ ] Monitor error logs
- [ ] Review failed login attempts
- [ ] Check database size
- [ ] Update dependencies regularly
- [ ] Rotate JWT keys periodically (if needed)
- [ ] Review and update OAuth clients

## Troubleshooting

### Common Issues

**Build Fails**
- Check all environment variables are set
- Verify Prisma schema is valid
- Run `npm run build` locally first

**Database Connection Error**
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure IP is whitelisted (if applicable)

**Email Not Sending**
- Verify Brevo API key is valid
- Check sender email is verified in Brevo
- Review email logs in Brevo dashboard

**OAuth Flow Issues**
- Verify redirect URIs match exactly
- Check client secret is hashed correctly
- Ensure PKCE code verifier/challenge match

**Rate Limiting Not Working**
- Verify Upstash Redis credentials
- Check Redis connection
- Review rate limit configuration

## Production Checklist

Before going live with real users:
- [ ] Security audit completed
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] SSL certificate active
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Support channels ready
- [ ] Documentation for users
- [ ] Load testing completed
- [ ] Disaster recovery plan

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Spec](https://openid.net/connect/)

---

**Last Updated**: December 2024
