import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://universelabs.tech'

  const config = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    userinfo_endpoint: `${baseUrl}/api/oauth/userinfo`,
    jwks_uri: `${baseUrl}/api/jwks`,
    revocation_endpoint: `${baseUrl}/api/oauth/revoke`,
    introspection_endpoint: `${baseUrl}/api/oauth/introspect`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
    scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
    claims_supported: [
      'sub',
      'email',
      'email_verified',
      'name',
      'picture',
      'updated_at',
    ],
    code_challenge_methods_supported: ['S256', 'plain'],
    service_documentation: `${baseUrl}/docs`,
  }

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
