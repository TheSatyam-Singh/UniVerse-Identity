import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth/session'
import { createAuthorizationCode } from '@/lib/oauth/authorization'
import { apiRateLimit } from '@/lib/redis/client'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous'
    const { success } = await apiRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Check if user is authenticated
    const session = await getCurrentSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      clientId,
      redirectUri,
      scope,
      codeChallenge,
      codeChallengeMethod,
    } = body

    // Create authorization code
    const code = await createAuthorizationCode(
      session.userId,
      clientId,
      redirectUri,
      scope,
      codeChallenge,
      codeChallengeMethod
    )

    return NextResponse.json({ code })
  } catch (error) {
    console.error('OAuth authorize error:', error)
    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 500 }
    )
  }
}
