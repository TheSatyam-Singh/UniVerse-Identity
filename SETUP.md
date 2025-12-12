# Quick Setup Guide

This guide will help you get UniVerse Identity up and running quickly.

## Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (we recommend [Neon](https://neon.tech))
- An Upstash Redis instance (optional but recommended)
- A Brevo account for email (optional but recommended)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Security Keys

Run the key generation script:

```bash
npm run setup:keys
```

This will generate:
- RSA private/public key pair for JWT signing
- Session secret for cookie encryption

The keys will be displayed in the terminal and saved to `.env.generated`.

### 3. Set Up Your Database

Get a PostgreSQL connection string from [Neon](https://neon.tech) (free tier available).

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your values:

```env
# Database - Get from Neon
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require"

# Redis - Get from Upstash (optional)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Email - Get from Brevo (optional)
BREVO_API_KEY="your-api-key"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="UniVerse Identity"

# Copy JWT keys from .env.generated
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# Copy session secret from .env.generated
SESSION_SECRET="your-generated-secret"

# OAuth2 Issuer
OAUTH_ISSUER="http://localhost:3000"
```

⚠️ **Important**: Delete `.env.generated` after copying the keys to `.env`

### 5. Initialize Database

Push the Prisma schema to your database:

```bash
npm run prisma:push
```

### 6. Create an OAuth Client (Optional)

If you want to test OAuth2 flows, you'll need to create a client. You can use Prisma Studio:

```bash
npm run prisma:studio
```

Then create an `OAuthClient` record with:
- `clientId`: A unique identifier (e.g., "my-app")
- `clientSecret`: A hashed password (use bcrypt or the app's hash function)
- `name`: Display name (e.g., "My Application")
- `redirectUris`: Array of allowed redirect URIs (e.g., `["http://localhost:3001/callback"]`)
- `ownerId`: A user ID (create a user first)

### 7. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Testing the Application

### Create an Account

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter your details
4. Check your email for verification (if Brevo is configured)
5. Verify your email address

### Test OAuth2 Flow

1. Create an OAuth client as described in step 6
2. Navigate to:
   ```
   http://localhost:3000/api/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=openid profile email
   ```
3. Log in and approve the consent screen
4. You'll be redirected with an authorization code
5. Exchange the code for tokens at `/api/oauth/token`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add all environment variables from your `.env` file
5. Deploy!

### 3. Update URLs

After deployment, update these variables in Vercel:
- `NEXT_PUBLIC_APP_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)
- `APP_URL`: Same as above
- `OAUTH_ISSUER`: Same as above

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the OAuth2/OIDC flows in the README
- Check Prisma schema at `prisma/schema.prisma`
- Examine API routes in `app/api/`

## Security Notes

- Never commit your `.env` file
- Keep your RSA keys secure
- Use HTTPS in production
- Configure rate limiting properly
- Review security settings before going live

Happy coding! 🚀
