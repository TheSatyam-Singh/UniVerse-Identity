import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { generateSecureToken } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
      approved,
    } = await req.json()

    if (!approved) {
      return NextResponse.json(
        { error: 'access_denied' },
        { status: 403 }
      )
    }

    // Validate client
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: client_id },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid client' },
        { status: 400 }
      )
    }

    // Validate redirect URI
    if (!client.redirectUris.includes(redirect_uri)) {
      return NextResponse.json(
        { error: 'Invalid redirect_uri' },
        { status: 400 }
      )
    }

    // Save consent
    await prisma.oAuthConsent.upsert({
      where: {
        userId_clientId: {
          userId: user.id,
          clientId: client_id,
        },
      },
      update: {
        scope,
      },
      create: {
        userId: user.id,
        clientId: client_id,
        scope,
      },
    })

    // Generate authorization code
    const code = generateSecureToken()
    await prisma.oAuthAuthCode.create({
      data: {
        code,
        clientId: client_id,
        userId: user.id,
        redirectUri: redirect_uri,
        scope,
        codeChallenge: code_challenge,
        codeChallengeMethod: code_challenge_method,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    })

    return NextResponse.json({ code })
  } catch (error) {
    console.error('Consent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
