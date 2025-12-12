import { prisma } from '@/lib/db/prisma'
import { generateToken, verifyCodeChallenge, hashRefreshToken } from '@/lib/crypto/password'
import { generateAccessToken, generateIDToken } from '@/lib/crypto/jwt'
import { nanoid } from 'nanoid'

export const SUPPORTED_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
]

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'openid': 'Access your basic profile information',
  'profile': 'Access your full profile (name, picture)',
  'email': 'Access your email address',
  'offline_access': 'Maintain access while you\'re offline',
}

export interface AuthorizationRequest {
  clientId: string
  redirectUri: string
  scope: string
  state?: string
  responseType: string
  codeChallenge?: string
  codeChallengeMethod?: string
  nonce?: string
}

export async function validateAuthorizationRequest(
  req: AuthorizationRequest
): Promise<{ valid: boolean; error?: string; client?: any }> {
  // Validate response_type
  if (req.responseType !== 'code') {
    return { valid: false, error: 'unsupported_response_type' }
  }

  // Get client
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: req.clientId },
  })

  if (!client) {
    return { valid: false, error: 'invalid_client' }
  }

  // Validate redirect URI
  if (!client.redirectUris.includes(req.redirectUri)) {
    return { valid: false, error: 'invalid_redirect_uri' }
  }

  // Validate scopes
  const requestedScopes = req.scope.split(' ')
  const invalidScopes = requestedScopes.filter(
    (scope) => !SUPPORTED_SCOPES.includes(scope) || !client.allowedScopes.includes(scope)
  )

  if (invalidScopes.length > 0) {
    return { valid: false, error: 'invalid_scope' }
  }

  // For public clients, PKCE is required
  if (client.isPublic && !req.codeChallenge) {
    return { valid: false, error: 'pkce_required' }
  }

  // Validate PKCE method
  if (req.codeChallenge && req.codeChallengeMethod) {
    if (!['plain', 'S256'].includes(req.codeChallengeMethod)) {
      return { valid: false, error: 'invalid_code_challenge_method' }
    }
  }

  return { valid: true, client }
}

export async function createAuthorizationCode(
  userId: string,
  clientId: string,
  redirectUri: string,
  scope: string,
  codeChallenge?: string,
  codeChallengeMethod?: string
): Promise<string> {
  const code = nanoid(32)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.authorizationCode.create({
    data: {
      code,
      clientId,
      userId,
      redirectUri,
      scope,
      codeChallenge,
      codeChallengeMethod,
      expiresAt,
    },
  })

  return code
}

export async function exchangeAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<{
  accessToken: string
  idToken?: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}> {
  // Get authorization code
  const authCode = await prisma.authorizationCode.findUnique({
    where: { code },
    include: {
      client: true,
      user: true,
    },
  })

  if (!authCode) {
    throw new Error('invalid_grant')
  }

  // Validate code hasn't been used
  if (authCode.used) {
    // Revoke all tokens for this client and user (potential attack)
    await prisma.refreshToken.updateMany({
      where: {
        clientId,
        userId: authCode.userId,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    })
    throw new Error('invalid_grant')
  }

  // Validate expiration
  if (authCode.expiresAt < new Date()) {
    throw new Error('invalid_grant')
  }

  // Validate client
  if (authCode.clientId !== clientId) {
    throw new Error('invalid_client')
  }

  // Validate redirect URI
  if (authCode.redirectUri !== redirectUri) {
    throw new Error('invalid_grant')
  }

  // Verify PKCE if present
  if (authCode.codeChallenge) {
    if (!codeVerifier) {
      throw new Error('invalid_grant')
    }

    const valid = verifyCodeChallenge(
      codeVerifier,
      authCode.codeChallenge,
      authCode.codeChallengeMethod || 'plain'
    )

    if (!valid) {
      throw new Error('invalid_grant')
    }
  }

  // Mark code as used
  await prisma.authorizationCode.update({
    where: { code },
    data: { used: true },
  })

  const scopes = authCode.scope.split(' ')

  // Generate access token
  const accessToken = await generateAccessToken(
    {
      sub: authCode.user.id,
      email: authCode.user.email,
      name: authCode.user.name || undefined,
      scope: authCode.scope,
      client_id: clientId,
    },
    '15m'
  )

  // Generate ID token if openid scope is requested
  let idToken: string | undefined
  if (scopes.includes('openid')) {
    idToken = await generateIDToken(
      {
        sub: authCode.user.id,
        email: authCode.user.email,
        name: authCode.user.name || undefined,
        email_verified: !!authCode.user.emailVerified,
        picture: authCode.user.image || undefined,
        updated_at: Math.floor(authCode.user.updatedAt.getTime() / 1000),
        client_id: clientId,
      },
      undefined,
      '1h'
    )
  }

  // Generate refresh token if offline_access scope is requested
  let refreshToken: string | undefined
  if (scopes.includes('offline_access')) {
    const token = nanoid(48)
    const tokenHash = hashRefreshToken(token)

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        clientId,
        userId: authCode.userId,
        scope: authCode.scope,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    })

    refreshToken = token
  }

  return {
    accessToken,
    idToken,
    refreshToken,
    expiresIn: 900, // 15 minutes
    tokenType: 'Bearer',
  }
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}> {
  const tokenHash = hashRefreshToken(refreshToken)

  // Get refresh token from database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      client: true,
      user: true,
    },
  })

  if (!storedToken) {
    throw new Error('invalid_grant')
  }

  // Validate token
  if (storedToken.revoked) {
    throw new Error('invalid_grant')
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('invalid_grant')
  }

  if (storedToken.clientId !== clientId) {
    throw new Error('invalid_client')
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  })

  // Generate new access token
  const accessToken = await generateAccessToken(
    {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name || undefined,
      scope: storedToken.scope,
      client_id: clientId,
    },
    '15m'
  )

  // Generate new refresh token (rotation)
  const newToken = nanoid(48)
  const newTokenHash = hashRefreshToken(newToken)

  await prisma.refreshToken.create({
    data: {
      tokenHash: newTokenHash,
      clientId,
      userId: storedToken.userId,
      scope: storedToken.scope,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      parentTokenId: storedToken.id,
    },
  })

  return {
    accessToken,
    refreshToken: newToken,
    expiresIn: 900, // 15 minutes
    tokenType: 'Bearer',
  }
}

export async function revokeToken(
  token: string,
  tokenTypeHint?: 'access_token' | 'refresh_token'
): Promise<void> {
  // For refresh tokens
  if (tokenTypeHint === 'refresh_token' || !tokenTypeHint) {
    const tokenHash = hashRefreshToken(token)
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    })
  }

  // Access tokens are short-lived and stateless, so we don't store them
  // In production, you might maintain a blacklist in Redis
}

export async function introspectToken(token: string): Promise<any> {
  // Try as refresh token first
  const tokenHash = hashRefreshToken(token)
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
      client: true,
    },
  })

  if (refreshToken) {
    const active = !refreshToken.revoked && refreshToken.expiresAt > new Date()

    return {
      active,
      scope: refreshToken.scope,
      client_id: refreshToken.clientId,
      username: refreshToken.user.email,
      token_type: 'refresh_token',
      exp: Math.floor(refreshToken.expiresAt.getTime() / 1000),
      iat: Math.floor(refreshToken.createdAt.getTime() / 1000),
      sub: refreshToken.userId,
    }
  }

  // Try as access token (JWT verification)
  // This would require JWT verification which we have in jwt.ts
  // For now, return inactive for unknown tokens
  return { active: false }
}
