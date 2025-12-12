import { NextRequest, NextResponse } from 'next/server'
import { revokeToken } from '@/lib/oauth/authorization'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, token_type_hint } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    await revokeToken(token, token_type_hint)

    // RFC 7009 specifies that the response should be 200 OK
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Token revocation error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
