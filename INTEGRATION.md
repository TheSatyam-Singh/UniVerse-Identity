# OAuth2 Integration Guide

This guide shows you how to integrate UniVerse Identity into your applications.

## Quick Start

UniVerse Identity supports standard OAuth2 Authorization Code flow with PKCE for maximum security.

## Supported Grant Types

- `authorization_code` - For web applications
- `refresh_token` - For refreshing access tokens

## Supported Scopes

- `openid` - Required for OpenID Connect
- `profile` - Access to user's name and profile picture
- `email` - Access to user's email address
- `offline_access` - Request refresh token

## Endpoints

All endpoints are relative to `https://universelabs.tech`

- **Authorization**: `/oauth/authorize`
- **Token**: `/api/oauth/token`
- **UserInfo**: `/api/oauth/userinfo`
- **Revoke**: `/api/oauth/revoke`
- **Introspect**: `/api/oauth/introspect`
- **JWKS**: `/api/jwks`
- **Discovery**: `/.well-known/openid-configuration`

## Integration Steps

### 1. Register Your Application

Contact the administrator to register your OAuth client. You'll receive:

- `client_id` - Your application's client ID
- `client_secret` - Your application's secret (for confidential clients)
- Approved `redirect_uris` - Where users will be sent after authorization

### 2. Generate PKCE Parameters (Recommended)

```javascript
// Generate code verifier
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Generate code challenge
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Usage
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Store codeVerifier securely for the token exchange
sessionStorage.setItem('code_verifier', codeVerifier);
```

### 3. Redirect User to Authorization Endpoint

```javascript
const authUrl = new URL('https://universelabs.tech/oauth/authorize');
authUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID');
authUrl.searchParams.set('redirect_uri', 'https://yourapp.com/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('state', generateRandomState());
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

// Optional: for OIDC ID token validation
authUrl.searchParams.set('nonce', generateRandomNonce());

window.location.href = authUrl.toString();
```

### 4. Handle Callback

```javascript
// On your redirect URI (e.g., /callback)
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');

// Verify state matches what you sent
if (state !== sessionStorage.getItem('oauth_state')) {
  throw new Error('Invalid state parameter');
}

// Exchange code for tokens
const codeVerifier = sessionStorage.getItem('code_verifier');
```

### 5. Exchange Authorization Code for Tokens

```javascript
const response = await fetch('https://universelabs.tech/api/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://yourapp.com/callback',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET', // Only for confidential clients
    code_verifier: codeVerifier,
  }),
});

const tokens = await response.json();
/*
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abc123...",
  "token_type": "Bearer",
  "expires_in": 900
}
*/

// Store tokens securely
```

### 6. Get User Information

```javascript
const response = await fetch('https://universelabs.tech/api/oauth/userinfo', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const userInfo = await response.json();
/*
{
  "sub": "user_123",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://...",
  "updated_at": 1640000000
}
*/
```

### 7. Refresh Access Token

```javascript
const response = await fetch('https://universelabs.tech/api/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET', // Only for confidential clients
  }),
});

const tokens = await response.json();
/*
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "xyz789...", // New refresh token (rotation)
  "token_type": "Bearer",
  "expires_in": 900
}
*/
```

### 8. Revoke Token (Logout)

```javascript
await fetch('https://universelabs.tech/api/oauth/revoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: refreshToken,
    token_type_hint: 'refresh_token',
  }),
});
```

## Example: Complete Flow (Node.js/Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');

const app = express();

const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = 'http://localhost:3000/callback';
const OAUTH_BASE = 'https://universelabs.tech';

// Step 1: Initiate OAuth flow
app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Store in session
  req.session.oauth_state = state;
  req.session.code_verifier = codeVerifier;

  const authUrl = new URL(`${OAUTH_BASE}/oauth/authorize`);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email offline_access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// Step 2: Handle callback
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state
  if (state !== req.session.oauth_state) {
    return res.status(400).send('Invalid state');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`${OAUTH_BASE}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code_verifier: req.session.code_verifier,
      }),
    });

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`${OAUTH_BASE}/api/oauth/userinfo`, {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });

    const user = await userResponse.json();

    // Store in session
    req.session.user = user;
    req.session.tokens = tokens;

    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

// Protected route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.send(`
    <h1>Welcome, ${req.session.user.name}!</h1>
    <p>Email: ${req.session.user.email}</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout
app.get('/logout', async (req, res) => {
  if (req.session.tokens?.refresh_token) {
    await fetch(`${OAUTH_BASE}/api/oauth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: req.session.tokens.refresh_token,
        token_type_hint: 'refresh_token',
      }),
    });
  }

  req.session.destroy();
  res.redirect('/');
});

app.listen(3000);
```

## Validating JWT Tokens

You can validate access tokens and ID tokens using the public key from the JWKS endpoint:

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://universelabs.tech/api/jwks',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify token
jwt.verify(token, getKey, {
  issuer: 'https://universelabs.tech',
  audience: 'https://universelabs.tech',
}, (err, decoded) => {
  if (err) {
    console.error('Token validation failed:', err);
  } else {
    console.log('Token is valid:', decoded);
  }
});
```

## Client Types

### Public Clients (Mobile/SPA)

- Must use PKCE
- No client secret required
- Set `isPublic: true` when registering

```javascript
// No client_secret in token exchange
{
  grant_type: 'authorization_code',
  code: code,
  redirect_uri: REDIRECT_URI,
  client_id: CLIENT_ID,
  code_verifier: codeVerifier, // PKCE required
}
```

### Confidential Clients (Server-side)

- Can use client secret
- PKCE recommended but optional
- Set `isPublic: false` when registering

```javascript
// Include client_secret
{
  grant_type: 'authorization_code',
  code: code,
  redirect_uri: REDIRECT_URI,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  code_verifier: codeVerifier, // Optional but recommended
}
```

## Error Handling

OAuth errors follow RFC 6749:

```javascript
{
  "error": "invalid_grant",
  "error_description": "Authorization code has expired"
}
```

Common error codes:

- `invalid_request` - Missing parameters
- `invalid_client` - Invalid client credentials
- `invalid_grant` - Invalid/expired authorization code
- `unauthorized_client` - Client not authorized
- `unsupported_grant_type` - Grant type not supported
- `invalid_scope` - Requested scope invalid

## Best Practices

1. **Always use PKCE** - Even for confidential clients
2. **Use state parameter** - Prevent CSRF attacks
3. **Validate tokens** - Verify JWT signatures
4. **Store tokens securely** - Use secure, HTTP-only cookies
5. **Refresh tokens proactively** - Before they expire
6. **Handle token rotation** - Store new refresh token
7. **Revoke on logout** - Clean up server-side sessions

## Testing

Use the provided endpoints to test your integration:

```bash
# Test OpenID configuration
curl https://universelabs.tech/.well-known/openid-configuration

# Test JWKS
curl https://universelabs.tech/api/jwks

# Test token introspection
curl -X POST https://universelabs.tech/api/oauth/introspect \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'
```

## Support

For integration support:
- Documentation: https://universelabs.tech/docs
- Issues: GitHub Issues
- Email: support@universelabs.tech
