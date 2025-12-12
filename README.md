# UniVerse Identity - OAuth2 & OpenID Connect Provider

A full-featured OAuth2 and OpenID Connect (OIDC) identity provider built with Next.js 14, TypeScript, and modern authentication standards.

## 🚀 Features

### Authentication
- **Email & Password Authentication** with secure bcrypt hashing
- **Email Verification** with token-based confirmation
- **Magic Link Login** for passwordless authentication
- **Secure Session Management** with HTTPOnly cookies

### OAuth2 & OIDC
- **OAuth2 Authorization Code Flow** with PKCE support
- **OpenID Connect (OIDC)** implementation
- **RS256 JWT Tokens** for enhanced security
- **Rotating Refresh Tokens** to prevent token theft
- **JWKS Endpoint** for public key distribution
- **Discovery Endpoint** (`.well-known/openid-configuration`)
- **UserInfo Endpoint** for OIDC user claims
- **Consent Screen** for authorization approval

### Security
- **Rate Limiting** with Upstash Redis
- **PKCE (Proof Key for Code Exchange)** support
- **Secure HTTPOnly Cookies** with SameSite protection
- **Token Rotation** for refresh tokens
- **CSRF Protection** built-in

### Infrastructure
- **Neon Postgres** for database
- **Upstash Redis** for rate limiting and caching
- **Brevo (SendinBlue)** for email delivery
- **Vercel** deployment ready
- **Cloudflare DNS** compatible

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)
- Brevo API key for email
- OpenSSL for generating RSA keys

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TheSatyam-Singh/UniVerse-Identity.git
cd UniVerse-Identity
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate RSA Keys

Generate RSA key pair for JWT signing:

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem

# Display keys (copy to .env)
cat private.pem
cat public.pem
```

### 4. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Email (Brevo)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="UniVerse Identity"

# JWT Keys (paste the content from private.pem and public.pem)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your private key...
-----END PRIVATE KEY-----"

JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...your public key...
-----END PUBLIC KEY-----"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"

# Session Secret
SESSION_SECRET="generate-a-secure-random-string-here"

# OAuth2 Configuration
OAUTH_ISSUER="https://yourdomain.com"
```

### 5. Setup Database

Push the Prisma schema to your database:

```bash
npm run prisma:push
```

### 6. Create an OAuth Client (Optional)

You can create OAuth clients directly in the database or via Prisma Studio:

```bash
npm run prisma:studio
```

Create an `OAuthClient` record with:
- `clientId`: Unique identifier for your client
- `clientSecret`: Hashed secret (use bcrypt)
- `name`: Display name
- `redirectUris`: Array of allowed redirect URIs
- `ownerId`: User ID who owns this client

## 🏃 Running Locally

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-email?token=` - Verify email
- `POST /api/auth/magic-link` - Request magic link
- `POST /api/auth/magic-link/verify` - Verify magic link

### OAuth2 / OIDC

- `GET /api/oauth/authorize` - OAuth2 authorization endpoint
- `POST /api/oauth/token` - OAuth2 token endpoint
- `GET /api/oauth/userinfo` - OIDC UserInfo endpoint
- `GET /api/oauth/jwks` - JSON Web Key Set
- `GET /.well-known/openid-configuration` - OIDC Discovery

### Pages

- `/` - Landing page
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/verify-email` - Email verification page
- `/auth/magic-link` - Magic link handler
- `/dashboard` - User dashboard
- `/oauth/consent` - OAuth consent screen

## 🔒 OAuth2 Flow Example

### Authorization Code Flow with PKCE

1. **Generate Code Verifier and Challenge**
```javascript
const codeVerifier = generateRandomString(128)
const codeChallenge = base64UrlEncode(sha256(codeVerifier))
```

2. **Authorization Request**
```
GET https://yourdomain.com/api/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  scope=openid profile email&
  state=RANDOM_STATE&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

3. **User Authenticates and Consents**

4. **Receive Authorization Code**
```
https://yourapp.com/callback?code=AUTH_CODE&state=RANDOM_STATE
```

5. **Exchange Code for Tokens**
```bash
POST https://yourdomain.com/api/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE",
  "redirect_uri": "https://yourapp.com/callback",
  "code_verifier": "CODE_VERIFIER"
}
```

6. **Response**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "...",
  "id_token": "eyJhbGci..."
}
```

7. **Access UserInfo**
```bash
GET https://yourdomain.com/api/oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

8. **Refresh Access Token**
```bash
POST https://yourdomain.com/api/oauth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "REFRESH_TOKEN"
}
```

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
   - Connect your GitHub repository
   - Configure environment variables from `.env`
   - Deploy

3. **Post-deployment**
   - Update `NEXT_PUBLIC_APP_URL` and `OAUTH_ISSUER` with your production domain
   - Run database migrations via Vercel CLI or Prisma Studio

### Environment Variables on Vercel

Add all variables from your `.env` file to Vercel:
- Settings → Environment Variables
- Add each variable individually
- Redeploy after adding variables

### Cloudflare DNS

Configure your DNS to point to Vercel:
- Type: `CNAME`
- Name: `@` or `www`
- Content: `cname.vercel-dns.com`
- Proxy status: DNS only (orange cloud off)

## 🔐 Security Considerations

- **RSA Keys**: Store securely, never commit to version control
- **Client Secrets**: Hash with bcrypt before storing
- **Session Secrets**: Use cryptographically secure random strings
- **Rate Limiting**: Configure appropriate limits for your use case
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure appropriately for your OAuth clients
- **Token Expiry**: Adjust token lifetimes based on security requirements

## 📖 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Caching/Rate Limiting**: Redis (Upstash)
- **Email**: Brevo
- **Authentication**: Custom OAuth2/OIDC implementation
- **JWT**: jose (RS256)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OAuth2 RFC 6749
- OpenID Connect Core 1.0
- PKCE RFC 7636
- Next.js Team
- Vercel
- Prisma Team

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review OAuth2 and OIDC specifications

---

**Built with ❤️ for the developer community**