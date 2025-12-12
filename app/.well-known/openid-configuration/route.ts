import { NextResponse } from 'next/server'

export async function GET() {
  const issuer = process.env.OAUTH_ISSUER || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const configuration = {
    issuer,
    authorization_endpoint: `${issuer}/api/oauth/authorize`,
    token_endpoint: `${issuer}/api/oauth/token`,
    userinfo_endpoint: `${issuer}/api/oauth/userinfo`,
    jwks_uri: `${issuer}/api/oauth/jwks`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    claims_supported: [
      'sub',
      'email',
      'email_verified',
      'name',
      'iss',
      'aud',
      'exp',
      'iat',
    ],
    code_challenge_methods_supported: ['S256'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
  }

  return NextResponse.json(configuration)
}
