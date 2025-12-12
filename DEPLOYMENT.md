# Deployment Guide for UniVerse Identity

This guide walks you through deploying UniVerse Identity to production.

## Prerequisites Checklist

- [ ] GitHub account with repository access
- [ ] Vercel account
- [ ] Neon (PostgreSQL) account
- [ ] Upstash (Redis) account
- [ ] Brevo (Email) account
- [ ] Cloudflare account with domain access

## Step 1: Database Setup (Neon)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click "Create Project"
3. Name: `universe-identity`
4. Region: Choose closest to your users
5. Click "Create Project"
6. Copy the connection string
7. Save as `DATABASE_URL` for later

**Connection String Format:**
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## Step 2: Redis Setup (Upstash)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Click "Create Database"
3. Name: `universe-identity`
4. Type: Regional
5. Region: Choose same as Vercel deployment region
6. Click "Create"
7. Navigate to "REST API" tab
8. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Step 3: Email Setup (Brevo)

1. Go to [app.brevo.com](https://app.brevo.com)
2. Navigate to "SMTP & API" → "API Keys"
3. Click "Generate a new API key"
4. Name: `universe-identity-production`
5. Copy the API key as `BREVO_API_KEY`

### Verify Sender Email

1. Go to "Senders, Domains & Dedicated IPs" → "Senders"
2. Add your sender email (e.g., `noreply@universelabs.tech`)
3. Verify the email address
4. Save as `SENDER_EMAIL`

### Configure Email DNS (Important!)

Add these DNS records to your domain in Cloudflare:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all
TTL: Auto
```

**DKIM Record** (Get from Brevo dashboard):
```
Type: TXT
Name: mail._domainkey
Value: [Copy from Brevo dashboard]
TTL: Auto
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@universelabs.tech
TTL: Auto
```

## Step 4: Generate JWT Keys

On your local machine:

```bash
npm run generate:keys
```

This outputs:
- `JWT_PRIVATE_KEY` - Keep this secret!
- `JWT_PUBLIC_KEY` - Can be public

**Important:** Copy both keys with the escaped newlines (`\n`). They should look like:

```
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----"
```

## Step 5: Cloudflare DNS Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select your domain `universelabs.tech`
3. Go to "DNS" → "Records"

### For Root Domain Deployment

Add these records:

```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: DNS only (grey cloud)

Type: AAAA
Name: @
IPv6 address: 2606:4700:3033::ac43:bd8d
Proxy status: DNS only (grey cloud)

Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (grey cloud)
```

### For Subdomain Deployment (auth.universelabs.tech)

```
Type: CNAME
Name: auth
Target: cname.vercel-dns.com
Proxy status: DNS only (grey cloud)
```

**Critical:** Grey cloud (DNS only) is required for Vercel to work properly!

## Step 6: Vercel Deployment

### Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Add Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```env
# Database
DATABASE_URL=postgresql://[from Neon]

# Redis
UPSTASH_REDIS_REST_URL=https://[from Upstash]
UPSTASH_REDIS_REST_TOKEN=[from Upstash]

# Email
BREVO_API_KEY=xkeysib-[from Brevo]
SENDER_EMAIL=noreply@universelabs.tech
SENDER_NAME=UniVerse Identity

# Application
NEXT_PUBLIC_APP_URL=https://universelabs.tech
NEXT_PUBLIC_APP_NAME=UniVerse Identity

# JWT (from generate:keys)
JWT_PRIVATE_KEY=[paste with \n]
JWT_PUBLIC_KEY=[paste with \n]
JWT_ISSUER=https://universelabs.tech
JWT_AUDIENCE=https://universelabs.tech

# Security (generate random 32+ char strings)
SESSION_SECRET=[random string]
CSRF_SECRET=[random string]

# Node
NODE_ENV=production
```

**Generate Random Secrets:**
```bash
# On Linux/Mac:
openssl rand -hex 32

# Or use Node:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note the deployment URL

### Add Custom Domain

1. Go to Settings → Domains
2. Add `universelabs.tech` and `www.universelabs.tech`
3. Or add `auth.universelabs.tech` for subdomain
4. Vercel will verify DNS configuration
5. Wait for SSL certificate (automatic)

## Step 7: Database Migration

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
```

Or use Vercel's built-in Postgres integration if available.

## Step 8: Testing

### Test Authentication Flow

1. Visit `https://universelabs.tech/signup`
2. Create an account
3. Check email for verification
4. Verify email
5. Login at `https://universelabs.tech/login`

### Test OAuth Flow

1. Visit `https://universelabs.tech/.well-known/openid-configuration`
2. Verify all endpoints are accessible
3. Visit `https://universelabs.tech/api/jwks`
4. Verify JWKS is returned

### Test Magic Link

1. Go to login page
2. Click "Sign in with magic link"
3. Enter email
4. Check inbox for magic link
5. Click link to login

## Step 9: Create OAuth Client (For Third-Party Apps)

You'll need to manually create OAuth clients in the database. Use Prisma Studio or SQL:

```bash
# Local development
npx prisma studio

# Or connect to production database
DATABASE_URL="[your production url]" npx prisma studio
```

Create a client with:
- `clientId`: Unique identifier
- `clientSecret`: Hashed secret
- `name`: Display name
- `redirectUris`: Array of allowed callback URLs
- `allowedScopes`: Array of allowed scopes
- `userId`: Owner's user ID

## Step 10: Monitoring

### Vercel Analytics

1. Enable in Vercel dashboard
2. Monitor response times and errors

### Database Monitoring

1. Check Neon dashboard for connection stats
2. Monitor query performance

### Email Monitoring

1. Check Brevo dashboard for delivery rates
2. Monitor bounce rates and spam reports

## Troubleshooting

### Deployment Fails

- Check build logs in Vercel
- Verify all environment variables are set
- Check TypeScript errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection limits
- Ensure SSL is enabled in connection string

### Email Not Sending

- Verify Brevo API key
- Check sender email is verified
- Review DNS records (SPF, DKIM, DMARC)
- Check Brevo dashboard for errors

### Redis Connection Issues

- Verify Upstash credentials
- Check Redis instance is active
- Verify REST API is enabled

### SSL/HTTPS Issues

- Ensure DNS records are "DNS only" in Cloudflare
- Wait for SSL certificate (can take 24-48 hours)
- Check Vercel domain settings

### OAuth Errors

- Verify redirect URIs are exact matches
- Check JWKS endpoint is accessible
- Verify JWT keys are properly formatted

## Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] JWT keys are different from development
- [ ] Session secrets are random and unique
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Email DNS records are configured
- [ ] Rate limiting is active
- [ ] Database uses SSL connections
- [ ] No sensitive data in client-side code

## Post-Deployment

1. **Monitor Logs**: Check Vercel function logs regularly
2. **Update Dependencies**: Keep packages updated
3. **Backup Database**: Set up automated backups in Neon
4. **Review Analytics**: Monitor usage and performance
5. **Security Updates**: Watch for security advisories

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Neon database logs
3. Check Brevo email delivery status
4. Open an issue on GitHub

---

**Congratulations!** 🎉 Your UniVerse Identity provider is now live!
