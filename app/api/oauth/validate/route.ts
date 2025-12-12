import { NextRequest, NextResponse } from 'next/server'
import { validateAuthorizationRequest } from '@/lib/oauth/authorization'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      redirectUri,
      scope,
      responseType,
      codeChallenge,
      codeChallengeMethod,
    } = body

    const result = await validateAuthorizationRequest({
      clientId,
      redirectUri,
      scope,
      state: '',
      responseType,
      codeChallenge,
      codeChallengeMethod,
    })

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      client: {
        id: result.client.id,
        clientId: result.client.clientId,
        name: result.client.name,
        description: result.client.description,
        logoUrl: result.client.logoUrl,
      },
    })
  } catch (error) {
    console.error('OAuth validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}
