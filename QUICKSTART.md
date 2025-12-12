# UniVerse Identity - Quick Start

## First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate JWT Keys
```bash
npm run generate:keys
```
Copy the output and add to your `.env` file.

### 3. Setup Environment
```bash
cp .env.example .env
```
Edit `.env` and fill in all the required values.

### 4. Setup Database
```bash
npm run db:generate
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Creating Your First User

1. Navigate to http://localhost:3000/signup
2. Fill in the signup form
3. Check your email for verification (if using real Brevo API)
4. For development without email: manually update the database:
   ```bash
   npx prisma studio
   ```
   Find your user and set `emailVerified` to current timestamp.

## Creating an OAuth Client

To test OAuth flows, create a client in the database:

```bash
npx prisma studio
```

Create a new `OAuthClient` record:
- `clientId`: `test_client_123`
- `clientSecret`: `test_secret` (will be hashed)
- `name`: `Test App`
- `redirectUris`: `["http://localhost:3001/callback"]`
- `allowedScopes`: `["openid", "profile", "email", "offline_access"]`
- `isPublic`: `false`
- `userId`: [your user ID]

## Testing OAuth Flow

1. Visit the authorization endpoint:
```
http://localhost:3000/oauth/authorize?client_id=test_client_123&redirect_uri=http://localhost:3001/callback&response_type=code&scope=openid%20profile%20email&state=xyz123
```

2. Login if not already logged in
3. Approve the consent screen
4. You'll be redirected to the callback URL with a code
5. Exchange the code for tokens (see INTEGRATION.md)

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio

# Security
npm run generate:keys    # Generate JWT key pair

# Linting
npm run lint             # Run ESLint
```

## Environment Quick Reference

### Required for Local Development

- `DATABASE_URL` - PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` - Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis token
- `JWT_PRIVATE_KEY` - RS256 private key
- `JWT_PUBLIC_KEY` - RS256 public key
- `SESSION_SECRET` - Random string (32+ chars)
- `CSRF_SECRET` - Random string (32+ chars)

### Optional for Local Development

- `BREVO_API_KEY` - For email (or use console logging)
- `SENDER_EMAIL` - Email sender address
- `SENDER_NAME` - Email sender name

## Troubleshooting

### "Module not found" errors
```bash
npm install
npm run db:generate
```

### Database connection issues
- Check your `DATABASE_URL` is correct
- Ensure database is accessible from your location
- Try `npx prisma db pull` to test connection

### Redis connection issues
- Verify Upstash credentials in `.env`
- Check if Redis instance is active in Upstash dashboard

### Email not working in development
Email functionality requires a valid Brevo API key. For local development:
1. Sign up for a free Brevo account
2. Get an API key
3. Add to `.env`

Or modify the email functions to log to console instead.

### JWT errors
- Regenerate keys with `npm run generate:keys`
- Make sure keys are properly formatted with `\n` escape sequences
- Don't add extra quotes or spaces

## Next Steps

1. Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
2. Read [INTEGRATION.md](INTEGRATION.md) for OAuth integration
3. Customize the UI in `components/` and `app/`
4. Add your own business logic

## Support

- Documentation: README.md, DEPLOYMENT.md, INTEGRATION.md
- Issues: GitHub Issues
- Email: support@universelabs.tech
