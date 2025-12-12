# UniVerse Identity

A complete, production-ready authentication and identity provider built with Next.js, supporting both standard user authentication and OAuth2/OpenID Connect flows.

## 🌟 Features

### Core Authentication
- ✅ User signup with email verification
- ✅ Login with email/password
- ✅ Magic link authentication
- ✅ Password reset flow
- ✅ Session management with device tracking
- ✅ MFA support (stub ready for expansion)

### OAuth2 + OpenID Connect Provider
- ✅ Authorization Code flow with PKCE
- ✅ Refresh token rotation
- ✅ OpenID Connect support
- ✅ Token introspection
- ✅ Token revocation
- ✅ JWKS endpoint
- ✅ OpenID Discovery (.well-known/openid-configuration)

### Security
- ✅ RS256 JWT signing
- ✅ Argon2 password hashing
- ✅ Secure HTTP-only cookies
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ PKCE enforcement for public clients
- ✅ Refresh token rotation

### Performance
- ✅ Server-side rendering (SSR)
- ✅ Redis caching for sessions
- ✅ Optimized for 2G-5G networks
- ✅ Minimal JavaScript on auth pages
- ✅ CDN-friendly static assets

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Neon free tier)
- **Caching**: Redis (Upstash free tier)
- **Email**: Brevo API (300 emails/day free)
- **Deployment**: Vercel
- **DNS**: Cloudflare
- **ORM**: Prisma

## 📋 Prerequisites

1. Node.js 18+ and npm
2. Accounts for:
   - [Neon](https://neon.tech) - PostgreSQL database
   - [Upstash](https://upstash.com) - Redis
   - [Brevo](https://www.brevo.com) - Email service
   - [Vercel](https://vercel.com) - Deployment
   - [Cloudflare](https://cloudflare.com) - DNS

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/TheSatyam-Singh/UniVerse-Identity.git
cd UniVerse-Identity
npm install
```

### 2. Generate JWT Keys

```bash
npm run generate:keys
```

This will generate RS256 key pair and output environment variables. Save these for the next step.

### 3. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Fill in the following in `.env`:

```env
# Database (from Neon)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/universe_identity?sslmode=require"

# Redis (from Upstash)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Email (from Brevo)
BREVO_API_KEY="xkeysib-xxx"
SENDER_EMAIL="noreply@universelabs.tech"
SENDER_NAME="UniVerse Identity"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="UniVerse Identity"

# JWT Keys (from generate:keys)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ISSUER="https://universelabs.tech"
JWT_AUDIENCE="https://universelabs.tech"

# Session & Security
SESSION_SECRET="your-random-32-char-secret"
CSRF_SECRET="your-random-32-char-secret"
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your identity provider!

## 📦 Service Setup Guides

### Neon (PostgreSQL Database)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

### Upstash (Redis)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the REST URL and token
4. Add to `.env` as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Brevo (Email Service)

1. Sign up at [brevo.com](https://www.brevo.com)
2. Navigate to SMTP & API → API Keys
3. Create a new API key
4. Add to `.env` as `BREVO_API_KEY`
5. Set `SENDER_EMAIL` to your verified sender email

**Email DNS Setup** (for production):

Add these DNS records to your domain:

```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all

# DKIM Record (get from Brevo dashboard)
Type: TXT
Name: mail._domainkey
Value: [provided by Brevo]

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@universelabs.tech
```

### Cloudflare (DNS)

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain `universelabs.tech`
3. Update nameservers at your domain registrar
4. **Important**: Set Vercel DNS records to DNS-only (grey cloud icon)

Example DNS records for Vercel:

```
Type: A
Name: @
Value: 76.76.21.21
Proxy: DNS only (grey cloud)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
Proxy: DNS only (grey cloud)
```

### Vercel (Deployment)

1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add all environment variables from `.env`
4. Deploy!

**Environment Variables on Vercel**:

Make sure to add all variables from your `.env` file to Vercel's environment variables section.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run generate:keys # Generate RS256 key pair
```

### Project Structure

```
UniVerse-Identity/
├── app/                        # Next.js app directory
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   └── oauth/             # OAuth2/OIDC endpoints
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── verify/                # Email verification
│   ├── reset/                 # Password reset
│   ├── oauth/authorize/       # OAuth consent screen
│   └── .well-known/           # OIDC discovery
├── components/                # React components
│   ├── auth/                  # Auth-specific components
│   └── ui/                    # Reusable UI components
├── lib/                       # Core libraries
│   ├── auth/                  # Authentication logic
│   ├── crypto/                # Cryptography utilities
│   ├── db/                    # Database client
│   ├── email/                 # Email service
│   ├── oauth/                 # OAuth2/OIDC logic
│   └── redis/                 # Redis client
├── prisma/                    # Database schema
├── scripts/                   # Utility scripts
└── middleware.ts              # Next.js middleware
```

## 🔐 Security Features

### Password Security
- Argon2id hashing algorithm
- Configurable memory cost, time cost, parallelism
- Minimum 8 characters with strength validation

### Token Security
- RS256 JWT signing
- Short-lived access tokens (15 minutes)
- Rotating refresh tokens
- PKCE for public clients

### Session Security
- HTTP-only cookies
- Secure flag in production
- SameSite=strict for CSRF protection
- 30-day expiration with activity tracking

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Signup: 3 attempts per hour
- Email: 5 emails per hour
- API: 100 requests per minute

## 📚 OAuth2/OIDC Integration

### For Third-Party Apps

To integrate UniVerse Identity into your application:

1. **Register Your Application** (via database or admin panel)
2. **Authorization Request**:

```
GET https://universelabs.tech/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=openid profile email&
  state=RANDOM_STATE&
  code_challenge=CHALLENGE&
  code_challenge_method=S256
```

3. **Token Exchange**:

```bash
POST https://universelabs.tech/api/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "https://yourapp.com/callback",
  "client_id": "YOUR_CLIENT_ID",
  "code_verifier": "VERIFIER"
}
```

4. **Get User Info**:

```bash
GET https://universelabs.tech/api/oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

### Supported Scopes

- `openid` - Required for OIDC
- `profile` - Access to name, picture
- `email` - Access to email address
- `offline_access` - Refresh token

### Endpoints

- **Discovery**: `/.well-known/openid-configuration`
- **JWKS**: `/api/jwks`
- **Authorize**: `/oauth/authorize`
- **Token**: `/api/oauth/token`
- **UserInfo**: `/api/oauth/userinfo`
- **Revoke**: `/api/oauth/revoke`
- **Introspect**: `/api/oauth/introspect`

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Reset database (warning: deletes data)
npx prisma migrate reset
```

### Email Not Sending

1. Verify Brevo API key is correct
2. Check sender email is verified in Brevo
3. Check rate limits (300/day on free tier)
4. Review Brevo dashboard for delivery status

### Redis Connection Issues

1. Verify Upstash credentials
2. Check if Redis instance is active
3. Ensure REST API is enabled

### JWT Errors

1. Regenerate keys with `npm run generate:keys`
2. Ensure keys are properly escaped in `.env`
3. Verify keys don't have extra whitespace

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@universelabs.tech or open an issue on GitHub.

---

Built with ❤️ for UniVerse Labs