import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createAccessToken, createIdToken, generateSecureToken, verifyCodeChallenge, verifyPassword } from '@/lib/crypto'
import { oauthRateLimiter } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (skip if not configured)
    if (oauthRateLimiter) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const { success } = await oauthRateLimiter.limit(ip)
      
      if (!success) {
        return NextResponse.json(
          { error: 'too_many_requests' },
          { status: 429 }
        )
      }
    }

    const body = await req.json()
    const { grant_type, client_id, client_secret, code, redirect_uri, refresh_token, code_verifier } = body

    if (!grant_type || !client_id) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate client
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: client_id },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'invalid_client' },
        { status: 401 }
      )
    }

    // Verify client secret
    if (!verifyPassword(client_secret || '', client.clientSecret)) {
      return NextResponse.json(
        { error: 'invalid_client' },
        { status: 401 }
      )
    }

    if (grant_type === 'authorization_code') {
      if (!code || !redirect_uri) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Missing code or redirect_uri' },
          { status: 400 }
        )
      }

      // Find and validate authorization code
      const authCode = await prisma.oAuthAuthCode.findUnique({
        where: { code },
        include: { user: true },
      })

      if (!authCode || authCode.clientId !== client_id) {
        return NextResponse.json(
          { error: 'invalid_grant' },
          { status: 400 }
        )
      }

      if (authCode.used) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Authorization code already used' },
          { status: 400 }
        )
      }

      if (authCode.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Authorization code expired' },
          { status: 400 }
        )
      }

      if (authCode.redirectUri !== redirect_uri) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Redirect URI mismatch' },
          { status: 400 }
        )
      }

      // Verify PKCE if code_challenge was provided
      if (authCode.codeChallenge) {
        if (!code_verifier) {
          return NextResponse.json(
            { error: 'invalid_request', error_description: 'code_verifier required' },
            { status: 400 }
          )
        }

        if (!verifyCodeChallenge(code_verifier, authCode.codeChallenge)) {
          return NextResponse.json(
            { error: 'invalid_grant', error_description: 'Invalid code_verifier' },
            { status: 400 }
          )
        }
      }

      // Mark code as used
      await prisma.oAuthAuthCode.update({
        where: { id: authCode.id },
        data: { used: true },
      })

      // Generate tokens
      const accessToken = await createAccessToken(authCode.user.id, authCode.scope)
      const idToken = await createIdToken(
        authCode.user.id,
        authCode.user.email,
        authCode.user.name,
        client_id
      )

      // Create refresh token
      const refreshTokenValue = generateSecureToken()
      await prisma.refreshToken.create({
        data: {
          userId: authCode.user.id,
          token: refreshTokenValue,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes
        refresh_token: refreshTokenValue,
        id_token: idToken,
        scope: authCode.scope,
      })
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Missing refresh_token' },
          { status: 400 }
        )
      }

      // Find and validate refresh token
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refresh_token },
        include: { user: true },
      })

      if (!storedToken) {
        return NextResponse.json(
          { error: 'invalid_grant' },
          { status: 400 }
        )
      }

      if (storedToken.used) {
        // Token reuse detected - invalidate all tokens for this user
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { used: true },
        })
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Token reuse detected' },
          { status: 400 }
        )
      }

      if (storedToken.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Refresh token expired' },
          { status: 400 }
        )
      }

      // Mark old token as used
      const newRefreshTokenValue = generateSecureToken()
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          used: true,
          usedAt: new Date(),
          replacedBy: newRefreshTokenValue,
        },
      })

      // Create new refresh token (rotation)
      await prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          token: newRefreshTokenValue,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      // Generate new access token
      const accessToken = await createAccessToken(storedToken.user.id, 'openid profile email')
      const idToken = await createIdToken(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.name,
        client_id
      )

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes
        refresh_token: newRefreshTokenValue,
        id_token: idToken,
      })
    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('OAuth token error:', error)
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    )
  }
}
