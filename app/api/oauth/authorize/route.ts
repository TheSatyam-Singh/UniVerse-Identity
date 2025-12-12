import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { generateSecureToken } from '@/lib/crypto'
import { oauthRateLimiter } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    // Rate limiting (skip if not configured)
    if (oauthRateLimiter) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const { success } = await oauthRateLimiter.limit(ip)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        )
      }
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('client_id')
    const redirectUri = searchParams.get('redirect_uri')
    const responseType = searchParams.get('response_type')
    const scope = searchParams.get('scope') || 'openid profile email'
    const state = searchParams.get('state')
    const codeChallenge = searchParams.get('code_challenge')
    const codeChallengeMethod = searchParams.get('code_challenge_method')

    // Validate required parameters
    if (!clientId || !redirectUri || !responseType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (responseType !== 'code') {
      return NextResponse.json(
        { error: 'Unsupported response_type. Only "code" is supported.' },
        { status: 400 }
      )
    }

    // Validate client
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid client_id' },
        { status: 400 }
      )
    }

    // Validate redirect URI
    if (!client.redirectUris.includes(redirectUri)) {
      return NextResponse.json(
        { error: 'Invalid redirect_uri' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()

    if (!user) {
      // Store OAuth params and redirect to login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('return_to', req.url)
      return redirect(loginUrl.toString())
    }

    // Check for existing consent
    const existingConsent = await prisma.oAuthConsent.findUnique({
      where: {
        userId_clientId: {
          userId: user.id,
          clientId,
        },
      },
    })

    // If no consent or scope changed, show consent screen
    if (!existingConsent || existingConsent.scope !== scope) {
      const consentUrl = new URL('/oauth/consent', req.url)
      consentUrl.searchParams.set('client_id', clientId)
      consentUrl.searchParams.set('redirect_uri', redirectUri)
      consentUrl.searchParams.set('scope', scope)
      consentUrl.searchParams.set('state', state || '')
      if (codeChallenge) consentUrl.searchParams.set('code_challenge', codeChallenge)
      if (codeChallengeMethod) consentUrl.searchParams.set('code_challenge_method', codeChallengeMethod)
      return redirect(consentUrl.toString())
    }

    // Generate authorization code
    const code = generateSecureToken()
    await prisma.oAuthAuthCode.create({
      data: {
        code,
        clientId,
        userId: user.id,
        redirectUri,
        scope,
        codeChallenge,
        codeChallengeMethod,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    })

    // Redirect back to client with code
    const callbackUrl = new URL(redirectUri)
    callbackUrl.searchParams.set('code', code)
    if (state) callbackUrl.searchParams.set('state', state)

    return redirect(callbackUrl.toString())
  } catch (error) {
    console.error('OAuth authorize error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
